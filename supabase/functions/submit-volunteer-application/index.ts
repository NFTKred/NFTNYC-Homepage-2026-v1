/**
 * submit-volunteer-application — receives a NFT.NYC 2026 volunteer signup.
 *
 * The client uploads the photo ID and intro video directly to their private
 * Supabase Storage buckets BEFORE calling this function, then posts a JSON
 * payload with the resulting storage keys plus the rest of the form data.
 * This function inserts the row, generates a permanent public URL for
 * the video (bucket is public) and a 30-day signed URL for the photo ID
 * (bucket is private, PII), and emails team@nft.nyc with the details +
 * review links.
 *
 * Required environment secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   RESEND_API_KEY                          — Resend API key
 *   TEAM_ALERT_EMAIL                        — defaults to 'team@nft.nyc'
 *   ALERT_FROM_EMAIL                        — defaults to 'team@nft.nyc'
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
};

interface Payload {
  firstname?: string;
  lastname?: string;
  email?: string;
  twitter_handle?: string;
  linkedin_url?: string;
  phone?: string;
  photo_id_path?: string;
  video_path?: string;
  wants_to_volunteer?: boolean;
  agree_conduct?: boolean;
  understands_ticket_terms?: boolean;
}

const REQUIRED_TEXT: (keyof Payload)[] = [
  "firstname", "lastname", "email", "phone", "photo_id_path", "video_path",
];

function escape(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const TEAM_ALERT_EMAIL = Deno.env.get("TEAM_ALERT_EMAIL") ?? "team@nft.nyc";
  const ALERT_FROM_EMAIL = Deno.env.get("ALERT_FROM_EMAIL") ?? "team@nft.nyc";

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const missing = REQUIRED_TEXT.filter(k => !String(body[k] ?? "").trim());
  if (missing.length) {
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  if (body.wants_to_volunteer !== true) {
    return new Response(
      JSON.stringify({ error: "Please confirm you would like to volunteer." }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  if (body.agree_conduct !== true || body.understands_ticket_terms !== true) {
    return new Response(
      JSON.stringify({ error: "Both acknowledgements must be accepted." }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const clean = {
    firstname:  body.firstname!.trim(),
    lastname:   body.lastname!.trim(),
    email:      body.email!.trim().toLowerCase(),
    twitter_handle: body.twitter_handle?.trim() || null,
    linkedin_url:   body.linkedin_url?.trim() || null,
    phone:      body.phone!.trim(),
    photo_id_path: body.photo_id_path!.trim(),
    video_path:    body.video_path!.trim(),
    wants_to_volunteer:       true,
    agree_conduct:            true,
    understands_ticket_terms: true,
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: row, error: insertErr } = await supabase
    .from("volunteer_applications")
    .insert(clean)
    .select("id, created_at")
    .single();
  if (insertErr || !row) {
    console.error("volunteer_applications insert failed:", insertErr);
    return new Response(
      JSON.stringify({ error: "Could not save your application — please try again or email team@nft.nyc." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  // Photo ID → 30-day SIGNED URL (private bucket, sensitive PII).
  // Video → permanent PUBLIC URL (public bucket, no expiry — volunteers
  // were told videos may be reused on NFT.NYC social accounts).
  const { data: photoSigned } = await supabase
    .storage.from("volunteer-photo-ids")
    .createSignedUrl(clean.photo_id_path, 60 * 60 * 24 * 30);
  const { data: videoPub } = supabase
    .storage.from("volunteer-videos")
    .getPublicUrl(clean.video_path);
  const photoUrl = photoSigned?.signedUrl ?? null;
  const videoUrl = videoPub?.publicUrl ?? null;

  // Notify team@nft.nyc. Non-fatal — row is saved either way.
  if (RESEND_API_KEY) {
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #06B6D4, #8B5CF6); color: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; opacity: 0.9; margin-bottom: 6px;">VOLUNTEER APPLICATION</div>
          <div style="font-size: 20px; font-weight: 700; line-height: 1.3;">${escape(clean.firstname)} ${escape(clean.lastname)}</div>
          <div style="font-size: 14px; margin-top: 4px; opacity: 0.95;">Sept 1–3, 2026 volunteer signup</div>
        </div>

        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 20px 0 8px;">Contact</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #666; width: 180px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escape(clean.email)}">${escape(clean.email)}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escape(clean.phone)}</td></tr>
          ${clean.twitter_handle ? `<tr><td style="padding: 6px 0; color: #666;">X / Twitter</td><td style="padding: 6px 0;">${escape(clean.twitter_handle)}</td></tr>` : ""}
          ${clean.linkedin_url ? `<tr><td style="padding: 6px 0; color: #666;">LinkedIn</td><td style="padding: 6px 0;"><a href="${escape(clean.linkedin_url)}" target="_blank" rel="noopener">${escape(clean.linkedin_url)}</a></td></tr>` : ""}
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 24px 0 8px;">Submitted files</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 8px 0; color: #666; width: 180px;">Photo ID</td>
              <td style="padding: 8px 0;">${photoUrl ? `<a href="${escape(photoUrl)}" target="_blank" rel="noopener" style="font-weight:600;">View photo ID</a> <span style="color:#999">(30-day signed link)</span>` : "<em>signed URL unavailable</em>"}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Intro video</td>
              <td style="padding: 8px 0;">${videoUrl ? `<a href="${escape(videoUrl)}" target="_blank" rel="noopener" style="font-weight:600;">View intro video</a> <span style="color:#999">(permanent link)</span>` : "<em>public URL unavailable</em>"}</td></tr>
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 24px 0 8px;">Consents recorded</h3>
        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #444; line-height: 1.7;">
          <li>Wants to volunteer Sept 1–3, 2026</li>
          <li>Agreed to conduct/professionalism statement</li>
          <li>Understood the ticket-in-exchange-for-service terms</li>
        </ul>

        <p style="margin-top: 24px; font-size: 12px; color: #999;">Submitted via nft.nyc/volunteer &middot; Application ID ${row.id}</p>
      </div>
    `.trim();

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Volunteers <${ALERT_FROM_EMAIL}>`,
          to: [TEAM_ALERT_EMAIL],
          reply_to: clean.email,
          subject: `Volunteer application — ${clean.firstname} ${clean.lastname}`,
          html: emailHtml,
        }),
      });
      if (!resp.ok) console.error("Resend notify error:", resp.status, await resp.text());
    } catch (err) {
      console.error("Resend notify failed:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set — skipping team notification");
  }

  return new Response(
    JSON.stringify({ ok: true, id: row.id }),
    { headers: { ...corsHeaders, "content-type": "application/json" } }
  );
});
