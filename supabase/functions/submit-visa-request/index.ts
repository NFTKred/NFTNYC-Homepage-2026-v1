/**
 * submit-visa-request — receives a visa support letter request from the
 * public /visa page:
 *   1. Inserts a row into visa_requests (status='pending').
 *   2. Emails team@nft.nyc so an admin can review + approve in /admin.
 *
 * Required environment secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — auto-injected in Edge Functions
 *   RESEND_API_KEY                            — Resend API key
 *   TEAM_ALERT_EMAIL                          — defaults to 'team@nft.nyc'
 *   ALERT_FROM_EMAIL                          — defaults to 'team@nft.nyc'
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Payload {
  full_name?: string;
  passport_number?: string;
  passport_issuing_country?: string;
  date_of_birth?: string;
  nationality?: string;
  job_title?: string;
  email?: string;
  phone?: string;
  ticket_order_number?: string;
  notes?: string;
}

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const REQUIRED_FIELDS: (keyof Payload)[] = [
  "full_name",
  "passport_number",
  "passport_issuing_country",
  "date_of_birth",
  "nationality",
  "job_title",
  "email",
  "phone",
];

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

  const missing = REQUIRED_FIELDS.filter(k => !String(body[k] ?? "").trim());
  if (missing.length) {
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const insertPayload = {
    full_name: body.full_name!.trim(),
    passport_number: body.passport_number!.trim(),
    passport_issuing_country: body.passport_issuing_country!.trim(),
    date_of_birth: body.date_of_birth!.trim(),
    nationality: body.nationality!.trim(),
    job_title: body.job_title!.trim(),
    email: body.email!.trim().toLowerCase(),
    phone: body.phone!.trim(),
    ticket_order_number: body.ticket_order_number?.trim() || null,
    notes: body.notes?.trim() || null,
  };

  const { data: row, error } = await supabase
    .from("visa_requests")
    .insert(insertPayload)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("visa_requests insert failed:", error);
    return new Response(
      JSON.stringify({ error: "Could not record your request — please try again or email team@nft.nyc." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  // Fire notification to team@nft.nyc. Non-fatal if it fails — the row is
  // recorded either way, and the admin queue will still show it.
  if (RESEND_API_KEY) {
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
        <div style="background: linear-gradient(135deg, #06B6D4, #8B5CF6); color: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
          <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; opacity: 0.9; margin-bottom: 6px;">VISA REQUEST</div>
          <div style="font-size: 20px; font-weight: 700; line-height: 1.3;">${escape(insertPayload.full_name)}</div>
          <div style="font-size: 14px; margin-top: 4px; opacity: 0.95;">${escape(insertPayload.nationality)} · ${escape(insertPayload.job_title)}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr><td style="padding: 6px 0; color: #666; width: 180px;">Passport number</td><td style="padding: 6px 0; font-weight: 600;">${escape(insertPayload.passport_number)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Passport issuing country</td><td style="padding: 6px 0;">${escape(insertPayload.passport_issuing_country)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Date of birth</td><td style="padding: 6px 0;">${escape(insertPayload.date_of_birth)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Nationality</td><td style="padding: 6px 0;">${escape(insertPayload.nationality)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Job title</td><td style="padding: 6px 0;">${escape(insertPayload.job_title)}</td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escape(insertPayload.email)}">${escape(insertPayload.email)}</a></td></tr>
          <tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escape(insertPayload.phone)}</td></tr>
          ${insertPayload.ticket_order_number ? `<tr><td style="padding: 6px 0; color: #666;">Ticket order #</td><td style="padding: 6px 0;">${escape(insertPayload.ticket_order_number)}</td></tr>` : ""}
        </table>

        ${insertPayload.notes ? `
          <div style="margin-top: 16px;">
            <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px;">Notes from requester</div>
            <div style="background: #fafafa; border-left: 3px solid #06B6D4; padding: 10px 14px; font-size: 14px; white-space: pre-wrap;">${escape(insertPayload.notes)}</div>
          </div>
        ` : ""}

        <p style="margin-top: 24px;">
          <a href="https://www.nft.nyc/admin?tab=visa" style="display: inline-block; background: #111; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Review in admin →</a>
        </p>

        <p style="margin-top: 16px; font-size: 12px; color: #999;">Submitted via nft.nyc/visa · Request ID ${row.id}</p>
      </div>
    `.trim();

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Visa Support <${ALERT_FROM_EMAIL}>`,
          to: [TEAM_ALERT_EMAIL],
          reply_to: insertPayload.email,
          subject: `Visa letter request — ${insertPayload.full_name} (${insertPayload.nationality})`,
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
