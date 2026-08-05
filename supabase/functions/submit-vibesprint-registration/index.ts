/**
 * submit-vibesprint-registration — receives a /vibesprint season registration,
 * stores it in vibesprint_registrations and emails the details to
 * contact@peoplebrowsr.com.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected),
 *      RESEND_API_KEY, VIBESPRINT_ALERT_EMAIL, ALERT_FROM_EMAIL
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
};

interface Payload {
  name?: string;
  email?: string;
  segment?: string;
  domain?: string;
  agreed_tos?: boolean;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });

function escape(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const ALERT_EMAIL = Deno.env.get("VIBESPRINT_ALERT_EMAIL") ?? "contact@peoplebrowsr.com";
  const ALERT_FROM_EMAIL = Deno.env.get("ALERT_FROM_EMAIL") ?? "team@nft.nyc";

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const name = String(body.name ?? "").trim().slice(0, 120);
  const email = String(body.email ?? "").trim().toLowerCase().slice(0, 255);
  const segment = String(body.segment ?? "").trim().slice(0, 120);
  const domain = String(body.domain ?? "").trim().replace(/\.kred$/i, "").slice(0, 80);

  if (!name || !email || !segment || !domain) {
    return json({ error: "Missing required fields: name, email, segment, domain" }, 422);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email address" }, 422);
  if (!/^[a-z0-9-]+$/i.test(domain)) {
    return json({ error: "Domain can only contain letters, numbers and hyphens" }, 422);
  }
  if (body.agreed_tos !== true) return json({ error: "Please accept the Terms of Service" }, 422);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: row, error: insertErr } = await supabase
    .from("vibesprint_registrations")
    .insert({
      name,
      email,
      segment,
      domain,
      build_tool: "Lovable",
      agreed_tos: true,
      user_agent: req.headers.get("user-agent"),
    })
    .select("id, created_at")
    .single();

  if (insertErr || !row) {
    console.error("vibesprint_registrations insert failed:", insertErr);
    return json({ error: "Could not save your registration — please try again or email team@nft.nyc." }, 500);
  }

  if (RESEND_API_KEY) {
    const html = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#111;">
        <div style="background:#F15621;color:#fff;border-radius:8px;padding:16px 20px;margin-bottom:16px;">
          <div style="font-size:11px;font-weight:700;letter-spacing:.25em;opacity:.9;margin-bottom:6px;">VIBESPRINT REGISTRATION</div>
          <div style="font-size:20px;font-weight:700;">${escape(name)}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <tr><td style="padding:6px 0;color:#666;width:180px;">Email</td><td style="padding:6px 0;"><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Segment</td><td style="padding:6px 0;">${escape(segment)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Kred domain requested</td><td style="padding:6px 0;"><b>${escape(domain)}.Kred</b></td></tr>
          <tr><td style="padding:6px 0;color:#666;">Build tool</td><td style="padding:6px 0;">Lovable</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Accepted ToS</td><td style="padding:6px 0;">Yes</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Submitted</td><td style="padding:6px 0;">${escape(row.created_at)}</td></tr>
        </table>
        <p style="margin-top:24px;font-size:12px;color:#999;">Submitted via nft.nyc/vibesprint &middot; Registration ID ${escape(row.id)}</p>
      </div>
    `.trim();

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC VibeSprint <${ALERT_FROM_EMAIL}>`,
          to: [ALERT_EMAIL],
          reply_to: email,
          subject: `VibeSprint registration — ${name} (${domain}.Kred)`,
          html,
        }),
      });
      if (!resp.ok) console.error("Resend notify error:", resp.status, await resp.text());
    } catch (err) {
      console.error("Resend notify failed:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set — skipping registration notification");
  }

  return json({ ok: true, id: row.id });
});
