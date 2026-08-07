/**
 * submit-vibesprint-registration — receives a /vibesprint season registration,
 * stores it in vibesprint_registrations, attempts the free .kred domain
 * registration via api.domains.kred, and emails the details to
 * contact@peoplebrowsr.com.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected),
 *      RESEND_API_KEY, VIBESPRINT_ALERT_EMAIL, ALERT_FROM_EMAIL,
 *      KRED_DOMAINS_ADMIN_TOKEN, KRED_DOMAINS_USER_TOKEN
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, apikey, x-client-info, content-type",
};

const KRED_API_BASE = "https://api.domains.kred";

interface Payload {
  name?: string;
  email?: string;
  segment?: string;
  domain?: string;
  build_tool?: string;
  agreed_tos?: boolean;
  phone?: string;
  address1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  profile_link?: string;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });

function escape(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function splitName(full: string) {
  const parts = (full || "").trim().split(/\s+/);
  if (parts.length <= 1) return { first: parts[0] ?? "", last: parts[0] ?? "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function normalizePhone(raw: string) {
  const trimmed = (raw || "").trim();
  if (/^\+\d{1,3}\.\d{4,}$/.test(trimmed)) return trimmed;
  const digits = trimmed.replace(/[^\d+]/g, "");
  const hasPlus = digits.startsWith("+");
  const num = digits.replace(/\+/g, "");
  if (num.length < 7) return trimmed;
  if (hasPlus) {
    const ccLen = num.startsWith("1") ? 1 : 2;
    return `+${num.slice(0, ccLen)}.${num.slice(ccLen)}`;
  }
  return `+1.${num}`;
}

function normalizeCountry(raw: string) {
  const s = (raw || "").trim();
  if (s.length === 2) return s.toUpperCase();
  const map: Record<string, string> = {
    "united states": "US", usa: "US", us: "US", america: "US",
    "united kingdom": "GB", uk: "GB", "great britain": "GB", england: "GB",
    canada: "CA", australia: "AU", "new zealand": "NZ",
    germany: "DE", france: "FR", spain: "ES", italy: "IT",
    netherlands: "NL", ireland: "IE", japan: "JP", china: "CN",
    india: "IN", brazil: "BR", mexico: "MX",
  };
  return map[s.toLowerCase()] || s.toUpperCase().slice(0, 2);
}

/** Registers <domain>.kred with the registrar. Returns an error string on failure. */
async function registerKredDomain(fqdn: string, reg: {
  fullName: string; email: string; phone: string; address1: string;
  city: string; state: string; postalCode: string; country: string;
}): Promise<{ ok: true; registration: unknown } | { ok: false; error: string }> {
  const adminToken = Deno.env.get("KRED_DOMAINS_ADMIN_TOKEN");
  const userToken = Deno.env.get("KRED_DOMAINS_USER_TOKEN") || adminToken;
  if (!adminToken || !userToken) {
    return { ok: false, error: "KRED_DOMAINS_ADMIN_TOKEN is not configured" };
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${userToken}`,
    "Content-Type": "application/json",
    "X-Admin-Token": adminToken,
  };

  const { first, last } = splitName(reg.fullName);
  const contactRes = await fetch(`${KRED_API_BASE}/contacts`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      first_name: first,
      last_name: last,
      street: reg.address1,
      city: reg.city,
      state: reg.state || reg.city,
      postal_code: reg.postalCode,
      country: normalizeCountry(reg.country),
      phone: normalizePhone(reg.phone),
      email: reg.email,
    }),
  });
  if (!contactRes.ok) {
    const details = await contactRes.text();
    console.error(`[kred] contact failed [${contactRes.status}]: ${details}`);
    return { ok: false, error: `Contact create failed (${contactRes.status}): ${details.slice(0, 400)}` };
  }
  const contact = await contactRes.json();
  const registrantId = contact?.id || contact?.contact_id;
  if (!registrantId) return { ok: false, error: "Contact response missing id" };

  const registerRes = await fetch(`${KRED_API_BASE}/domains/${encodeURIComponent(fqdn)}/register`, {
    method: "POST",
    headers,
    body: JSON.stringify({ registrant: registrantId, years: 1, auto_renew: false }),
  });
  if (!registerRes.ok) {
    const details = await registerRes.text();
    console.error(`[kred] register failed [${registerRes.status}]: ${details}`);
    return { ok: false, error: `Domain register failed (${registerRes.status}): ${details.slice(0, 400)}` };
  }
  return { ok: true, registration: await registerRes.json() };
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

  const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

  const name = str(body.name, 120);
  const email = str(body.email, 255).toLowerCase();
  const segment = str(body.segment, 120);
  const domain = str(body.domain, 80).replace(/\.kred$/i, "");
  const buildTool = str(body.build_tool, 120) || "Lovable";
  const phone = str(body.phone, 40);
  const address1 = str(body.address1, 200);
  const city = str(body.city, 100);
  const state = str(body.state, 100);
  const postalCode = str(body.postal_code, 20);
  const country = str(body.country, 60);
  const profileLink = str(body.profile_link, 300);

  if (!name || !email || !segment || !domain) {
    return json({ error: "Missing required fields: name, email, segment, domain" }, 422);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Invalid email address" }, 422);
  if (!/^[a-z0-9-]+$/i.test(domain)) {
    return json({ error: "Domain can only contain letters, numbers and hyphens" }, 422);
  }
  if (body.agreed_tos !== true) return json({ error: "Please accept the Terms of Service" }, 422);

  const missingContact = [
    ["phone", phone], ["address1", address1], ["city", city],
    ["postal_code", postalCode], ["country", country],
  ].filter(([, v]) => !v).map(([k]) => k);
  if (missingContact.length) {
    return json({ error: `Missing domain registration details: ${missingContact.join(", ")}` }, 422);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: row, error: insertErr } = await supabase
    .from("vibesprint_registrations")
    .insert({
      name,
      email,
      segment,
      domain,
      build_tool: buildTool,
      agreed_tos: true,
      phone,
      address1,
      city,
      state,
      postal_code: postalCode,
      country,
      profile_link: profileLink || null,
      registration_status: "pending",
      user_agent: req.headers.get("user-agent"),
    })
    .select("id, created_at")
    .single();

  if (insertErr || !row) {
    console.error("vibesprint_registrations insert failed:", insertErr);
    return json({ error: "Could not save your registration — please try again or email team@nft.nyc." }, 500);
  }

  // Claim the .kred domain for the registrant.
  const fqdn = `${domain.toLowerCase()}.kred`;
  let domainStatus = "pending";
  let domainError: string | null = null;
  try {
    const result = await registerKredDomain(fqdn, {
      fullName: name, email, phone, address1, city, state, postalCode, country,
    });
    if (result.ok) {
      domainStatus = "registered";
    } else {
      domainStatus = "failed";
      domainError = result.error;
    }
  } catch (err) {
    domainStatus = "failed";
    domainError = err instanceof Error ? err.message : String(err);
    console.error("kred registration threw:", err);
  }

  await supabase
    .from("vibesprint_registrations")
    .update({
      registration_status: domainStatus,
      registration_error: domainError,
      registered_at: domainStatus === "registered" ? new Date().toISOString() : null,
    })
    .eq("id", row.id);

  if (RESEND_API_KEY) {
    const domainLine =
      domainStatus === "registered"
        ? `<span style="color:#0a0;">Registered</span>`
        : `<span style="color:#c00;">${escape(domainStatus)}${domainError ? ` — ${escape(domainError)}` : ""}</span>`;

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
          <tr><td style="padding:6px 0;color:#666;">Domain registration</td><td style="padding:6px 0;">${domainLine}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Build platform</td><td style="padding:6px 0;">${escape(buildTool)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${escape(phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Address</td><td style="padding:6px 0;">${escape(address1)}, ${escape(city)}${state ? `, ${escape(state)}` : ""} ${escape(postalCode)}, ${escape(country)}</td></tr>
          ${profileLink ? `<tr><td style="padding:6px 0;color:#666;">Profile link</td><td style="padding:6px 0;">${escape(profileLink)}</td></tr>` : ""}
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
          subject: `VibeSprint registration — ${name} (${domain}.Kred · ${domainStatus})`,
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

  return json({ ok: true, id: row.id, domain: fqdn, domain_status: domainStatus });
});
