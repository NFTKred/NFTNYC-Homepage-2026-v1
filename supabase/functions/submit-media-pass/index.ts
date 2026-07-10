/**
 * submit-media-pass — receives a Media Pass application from /media,
 * uploads the logo (if any) to private storage, inserts a row into
 * media_pass_applications, and emails team@nft.nyc with the details.
 *
 * Required environment secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — auto-injected in Edge Functions
 *   RESEND_API_KEY                            — Resend API key
 *   TEAM_ALERT_EMAIL                          — defaults to 'team@nft.nyc'
 *   ALERT_FROM_EMAIL                          — defaults to 'team@nft.nyc'
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { decodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
};

// Logo delivered as a data URL from the browser (base64). Kept small — the
// bucket cap is 5 MB and browsers already reject huge uploads before hitting
// this function.
interface Payload {
  email?: string;
  firstname?: string;
  lastname?: string;
  jobtitle?: string;
  phone?: string;
  company?: string;
  website?: string;
  company_twitter_handle?: string;
  company_community_size?: string | number;
  company_recent_update?: string;
  share_a_link_to_recent_nft_related_coverage?: string;
  how_to_cover_nft_nyc_2023_and_publish_location?: string;
  media_organization_type?: string;
  nft_nyc_media_passes_requested?: string | number;
  commitment_to_credit_nft_nyc?: boolean;
  company_logo_data_url?: string;      // "data:image/png;base64,..."
  company_logo_filename?: string;
}

const REQUIRED: (keyof Payload)[] = [
  "email", "firstname", "lastname", "phone",
  "company", "website", "company_twitter_handle",
  "company_community_size", "company_recent_update",
  "share_a_link_to_recent_nft_related_coverage",
  "how_to_cover_nft_nyc_2023_and_publish_location",
  "media_organization_type", "nft_nyc_media_passes_requested",
];

const MEDIA_TYPE_LABEL: Record<string, string> = {
  blog: "Blog or Online Publication",
  documentary: "Documentary",
  podcast: "Podcast",
  news: "Televised News",
  youtube: "YouTube Channel",
};

function escape(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extForMime(mime: string): string {
  if (mime.includes("png")) return "png";
  if (mime.includes("svg")) return "svg";
  if (mime.includes("webp")) return "webp";
  return "jpg";
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

  const missing = REQUIRED.filter(k => !String(body[k] ?? "").trim());
  if (missing.length) {
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  if (body.commitment_to_credit_nft_nyc !== true) {
    return new Response(
      JSON.stringify({ error: "You must agree to credit NFT.NYC in your coverage." }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const media_type = String(body.media_organization_type ?? "").trim();
  if (!MEDIA_TYPE_LABEL[media_type]) {
    return new Response(
      JSON.stringify({ error: "Invalid media type" }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const passesRequested = Number(body.nft_nyc_media_passes_requested);
  if (![1, 2].includes(passesRequested)) {
    return new Response(
      JSON.stringify({ error: "Passes requested must be 1 or 2" }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const communitySize = Number(body.company_community_size);
  if (!Number.isFinite(communitySize) || communitySize < 0) {
    return new Response(
      JSON.stringify({ error: "Community size must be a non-negative number" }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const clean = {
    email:     body.email!.trim().toLowerCase(),
    firstname: body.firstname!.trim(),
    lastname:  body.lastname!.trim(),
    jobtitle:  body.jobtitle?.trim() || null,
    phone:     body.phone!.trim(),
    company:   body.company!.trim(),
    website:   body.website!.trim(),
    company_twitter_handle: body.company_twitter_handle!.trim(),
    company_community_size: communitySize,
    company_recent_update:  body.company_recent_update!.trim(),
    share_a_link_to_recent_nft_related_coverage: body.share_a_link_to_recent_nft_related_coverage!.trim(),
    how_to_cover_nft_nyc_2023_and_publish_location: body.how_to_cover_nft_nyc_2023_and_publish_location!.trim(),
    media_organization_type: media_type,
    nft_nyc_media_passes_requested: passesRequested,
    commitment_to_credit_nft_nyc: true,
  };

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Insert first so we have a row id to key the logo storage path off.
  const { data: row, error: insertErr } = await supabase
    .from("media_pass_applications")
    .insert(clean)
    .select("id, created_at")
    .single();
  if (insertErr || !row) {
    console.error("media_pass_applications insert failed:", insertErr);
    return new Response(
      JSON.stringify({ error: "Could not save your application — please try again or email team@nft.nyc." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  // Upload logo (optional).
  let logoPath: string | null = null;
  let logoSignedUrl: string | null = null;
  if (body.company_logo_data_url && body.company_logo_data_url.startsWith("data:")) {
    try {
      const match = body.company_logo_data_url.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        const mime = match[1];
        const bytes = decodeBase64(match[2]);
        const ext = extForMime(mime);
        logoPath = `${row.id}/logo.${ext}`;
        const { error: upErr } = await supabase
          .storage.from("media-pass-logos")
          .upload(logoPath, bytes, { contentType: mime, upsert: true });
        if (upErr) {
          console.error("Logo upload failed (non-fatal):", upErr);
          logoPath = null;
        } else {
          const { data: signed } = await supabase
            .storage.from("media-pass-logos")
            .createSignedUrl(logoPath, 60 * 60 * 24 * 30);   // 30 days
          logoSignedUrl = signed?.signedUrl ?? null;
          await supabase.from("media_pass_applications")
            .update({ company_logo_path: logoPath })
            .eq("id", row.id);
        }
      }
    } catch (err) {
      console.error("Logo processing failed (non-fatal):", err);
    }
  }

  // Fire notification to team@nft.nyc. Non-fatal — the row is saved either way.
  if (RESEND_API_KEY) {
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 640px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #06B6D4, #8B5CF6); color: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; opacity: 0.9; margin-bottom: 6px;">MEDIA PASS APPLICATION</div>
          <div style="font-size: 20px; font-weight: 700; line-height: 1.3;">${escape(clean.company)}</div>
          <div style="font-size: 14px; margin-top: 4px; opacity: 0.95;">${escape(MEDIA_TYPE_LABEL[media_type])} &middot; ${escape(clean.firstname)} ${escape(clean.lastname)}${clean.jobtitle ? `, ${escape(clean.jobtitle)}` : ""}</div>
        </div>

        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 20px 0 8px;">Contact</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #666; width: 180px;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escape(clean.email)}">${escape(clean.email)}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escape(clean.phone)}</td></tr>
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 24px 0 8px;">Organization</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #666; width: 180px;">Website</td><td style="padding: 6px 0;"><a href="${escape(clean.website)}" target="_blank" rel="noopener">${escape(clean.website)}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #666;">X / Twitter</td><td style="padding: 6px 0;">${escape(clean.company_twitter_handle)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Community size</td><td style="padding: 6px 0; font-weight: 600;">${clean.company_community_size.toLocaleString("en-US")}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Passes requested</td><td style="padding: 6px 0; font-weight: 600;">${clean.nft_nyc_media_passes_requested}</td></tr>
          ${logoSignedUrl ? `<tr><td style="padding: 6px 0; color: #666;">Logo</td><td style="padding: 6px 0;"><a href="${escape(logoSignedUrl)}" target="_blank" rel="noopener">View logo</a> <span style="color:#999">(link expires in 30 days)</span></td></tr>` : ""}
        </table>

        <h3 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.15em; color: #666; margin: 24px 0 8px;">Coverage</h3>
        <div style="background: #fafafa; border-left: 3px solid #06B6D4; padding: 12px 16px; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Recent non-NFT coverage</div>
          <a href="${escape(clean.company_recent_update)}" target="_blank" rel="noopener" style="font-size:14px; word-break:break-all;">${escape(clean.company_recent_update)}</a>
        </div>
        <div style="background: #fafafa; border-left: 3px solid #8B5CF6; padding: 12px 16px; margin-bottom: 12px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">Recent NFT coverage</div>
          <a href="${escape(clean.share_a_link_to_recent_nft_related_coverage)}" target="_blank" rel="noopener" style="font-size:14px; word-break:break-all;">${escape(clean.share_a_link_to_recent_nft_related_coverage)}</a>
        </div>
        <div style="background: #fafafa; border-left: 3px solid #EC4899; padding: 12px 16px;">
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">How they plan to cover NFT.NYC + where it will publish</div>
          <div style="font-size:14px; white-space: pre-wrap;">${escape(clean.how_to_cover_nft_nyc_2023_and_publish_location)}</div>
        </div>

        <p style="margin-top: 20px; font-size: 12px; color: #999;">Submitted via nft.nyc/media &middot; Application ID ${row.id}</p>
      </div>
    `.trim();

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Media Pass <${ALERT_FROM_EMAIL}>`,
          to: [TEAM_ALERT_EMAIL],
          reply_to: clean.email,
          subject: `Media Pass application — ${clean.company} (${MEDIA_TYPE_LABEL[media_type]})`,
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
