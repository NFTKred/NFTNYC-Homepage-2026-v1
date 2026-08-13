/**
 * submit-vibesprint-registration — receives a /vibesprint season registration,
 * stores it in vibesprint_registrations, attempts the free .kred domain
 * registration via api.domains.kred, emails the internal team, and sends the
 * registrant a confirmation email with an .ics of the two live support
 * sessions attached.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected),
 *      RESEND_API_KEY, VIBESPRINT_ALERT_EMAIL, ALERT_FROM_EMAIL,
 *      KRED_DOMAINS_ADMIN_TOKEN, KRED_DOMAINS_USER_TOKEN
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { ensureDnsZone } from "../_shared/dns.ts";

/* ============================================================
   Live Support session data + calendar helpers.
   Kept in sync with src/pages/VibeSprint.tsx SUPPORT_SESSIONS.
   ============================================================ */

interface SupportSession {
  title: string;
  description: string;
  location: string;
  /** In UTC. Sprint 1 sessions run 4:00pm-9:00pm ET; ET is EDT (UTC-4)
   *  in August 2026, so 20:00-01:00 UTC (end lands on the next day). */
  startUtc: Date;
  endUtc: Date;
  /** Human-friendly display strings for the email body. */
  displayDate: string;
  displayTime: string;
}

const SUPPORT_SESSIONS: SupportSession[] = [
  {
    title: "Kred Flash Sprint 1 - Live Engineer Support (Mon)",
    description:
      "Live Google Meet support with the Kred Flash Sprint 1 lead engineer. Bring your specific error and work through it live. The Meet link arrives with your Sprint 1 kit. More: https://nft.nyc/vibesprint",
    location: "Online - Google Meet (link in Sprint 1 kit)",
    startUtc: new Date(Date.UTC(2026, 7, 17, 20, 0, 0)),
    endUtc: new Date(Date.UTC(2026, 7, 18, 1, 0, 0)),
    displayDate: "Mon 17 Aug 2026",
    displayTime: "4:00 - 9:00pm ET",
  },
  {
    title: "Kred Flash Sprint 1 - Live Engineer Support (Tue)",
    description:
      "Live Google Meet support with the Kred Flash Sprint 1 lead engineer. Bring your specific error and work through it live. The Meet link arrives with your Sprint 1 kit. More: https://nft.nyc/vibesprint",
    location: "Online - Google Meet (link in Sprint 1 kit)",
    startUtc: new Date(Date.UTC(2026, 7, 18, 20, 0, 0)),
    endUtc: new Date(Date.UTC(2026, 7, 19, 1, 0, 0)),
    displayDate: "Tue 18 Aug 2026",
    displayTime: "4:00 - 9:00pm ET",
  },
];

const pad2 = (n: number) => String(n).padStart(2, "0");

/** iCalendar UTC timestamp: YYYYMMDDTHHMMSSZ. */
function toIcsDate(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}` +
    `T${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}Z`
  );
}

function googleCalendarUrl(s: SupportSession): string {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", s.title);
  url.searchParams.set("dates", `${toIcsDate(s.startUtc)}/${toIcsDate(s.endUtc)}`);
  url.searchParams.set("details", s.description);
  url.searchParams.set("location", s.location);
  return url.toString();
}

function outlookCalendarUrl(s: SupportSession): string {
  const url = new URL("https://outlook.live.com/calendar/0/deeplink/compose");
  url.searchParams.set("path", "/calendar/action/compose");
  url.searchParams.set("rru", "addevent");
  url.searchParams.set("subject", s.title);
  url.searchParams.set("startdt", s.startUtc.toISOString());
  url.searchParams.set("enddt", s.endUtc.toISOString());
  url.searchParams.set("body", s.description);
  url.searchParams.set("location", s.location);
  return url.toString();
}

/** Build a single .ics text carrying both sessions. Works with Apple
 *  Calendar, Outlook desktop, and imports into Google / Outlook web. */
function buildIcs(sessions: SupportSession[]): string {
  const stamp = toIcsDate(new Date(Date.UTC(2026, 7, 12, 0, 0, 0))); // stable DTSTAMP so re-imports are idempotent
  const events = sessions.map((s, i) => {
    const uid = `vibesprint-support-${i + 1}-${s.startUtc.getTime()}@nft.nyc`;
    const desc = s.description.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,");
    return [
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toIcsDate(s.startUtc)}`,
      `DTEND:${toIcsDate(s.endUtc)}`,
      `SUMMARY:${s.title.replace(/,/g, "\\,")}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${s.location.replace(/,/g, "\\,")}`,
      "URL:https://nft.nyc/vibesprint",
      "END:VEVENT",
    ].join("\r\n");
  });
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NFT.NYC//VibeSprint//EN",
    "METHOD:PUBLISH",
    "CALSCALE:GREGORIAN",
    ...events,
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** Base64-encode a UTF-8 string for the Resend attachment payload. */
function base64Encode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function buildRegistrantEmailHtml(name: string, fqdn: string): string {
  const firstName = (name.trim().split(/\s+/)[0] || "there");
  const rows = SUPPORT_SESSIONS.map((s) => {
    const g = googleCalendarUrl(s);
    const o = outlookCalendarUrl(s);
    return `
      <tr>
        <td style="padding:16px 0;border-top:1px solid #eee;">
          <div style="font-family:'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#666;margin-bottom:4px;">${escape(s.displayDate)}</div>
          <div style="font-size:16px;font-weight:600;color:#111;margin-bottom:10px;">${escape(s.displayTime)}</div>
          <div>
            <a href="${g}" style="display:inline-block;margin-right:8px;padding:6px 14px;border:1px solid #F15621;color:#F15621;border-radius:999px;text-decoration:none;font-family:'SF Mono',Menlo,monospace;font-size:12px;">Add to Google</a>
            <a href="${o}" style="display:inline-block;padding:6px 14px;border:1px solid #F15621;color:#F15621;border-radius:999px;text-decoration:none;font-family:'SF Mono',Menlo,monospace;font-size:12px;">Add to Outlook</a>
          </div>
        </td>
      </tr>`;
  }).join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;color:#111;padding:24px 20px;">
      <div style="background:#F15621;color:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:.25em;opacity:.9;margin-bottom:6px;">KRED FLASH SPRINT 1</div>
        <div style="font-size:22px;font-weight:700;margin-bottom:4px;">You are in, ${escape(firstName)}.</div>
        <div style="font-size:14px;opacity:.95;">Your Sprint 1 kit will land in your inbox before Mon 17 Aug.</div>
      </div>

      <p style="font-size:15px;line-height:1.5;color:#222;margin:0 0 16px;">
        Your <b>${escape(fqdn)}</b> domain is reserved. You will shortly receive a separate email from
        <b>noreply@emailverification.info</b> asking you to verify your email address - please complete that step so the registrar can finalise the domain in your name.
      </p>

      <div style="border:1px solid #eee;border-radius:12px;padding:18px 20px;background:#fafafa;margin:20px 0;">
        <div style="font-family:'SF Mono',Menlo,monospace;font-size:11px;letter-spacing:.22em;text-transform:uppercase;color:#666;margin-bottom:4px;">Live Engineer Support</div>
        <div style="font-size:16px;font-weight:600;color:#111;margin-bottom:8px;">Two evenings on Google Meet</div>
        <div style="font-size:13px;line-height:1.5;color:#444;">
          The lead engineer for Sprint 1 will be live on Google Meet both evenings. Bring your specific error, work through it live, and ship.
          The Meet link arrives with your Sprint 1 kit.
        </div>
        <table style="width:100%;border-collapse:collapse;margin-top:10px;">${rows}</table>
        <div style="border-top:1px solid #eee;padding-top:14px;margin-top:6px;font-size:12px;color:#666;">
          Prefer to import both at once? A <b>vibesprint-sprint1-support-sessions.ics</b> file is attached to this email - open it on any device to add both sessions to Apple Calendar, Outlook desktop, or Google.
        </div>
      </div>

      <p style="font-size:13px;line-height:1.5;color:#555;margin:16px 0 0;">
        Questions? Reply to this email and it will reach the NFT.NYC team directly.<br/>
        <a href="https://nft.nyc/vibesprint" style="color:#F15621;">nft.nyc/vibesprint</a>
      </p>
    </div>
  `.trim();
}

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
  profile_links?: string[];
  action?: string;
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

/** Redacted fingerprint so we can confirm WHICH token is in the env without leaking it. */
function fingerprint(token: string | undefined) {
  if (!token) return "missing";
  return `len=${token.length} head=${token.slice(0, 4)}… tail=…${token.slice(-4)}`;
}

/** Trim + hard length caps matching the Domains API contact schema. */
function clean(v: unknown, max: number) {
  return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

/** Registers <domain>.kred with the registrar. Returns an error string on failure. */
async function provisionUserId(email: string): Promise<{ id: string | null; error: string | null }> {
  const secret = Deno.env.get("PB_PROVISION_SECRET");
  if (!secret) return { id: null, error: "PB_PROVISION_SECRET is not configured" };
  try {
    const form = new URLSearchParams({ email, secret });
    const res = await fetch("https://claim.peoplebrowsr.com/provision_user/dotceo", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });
    const text = await res.text();
    console.log("[provision] response", { status: res.status, body: text.slice(0, 500) });
    if (!res.ok) return { id: null, error: `Provision user failed (${res.status}): ${text.slice(0, 200)}` };
    let data: Record<string, any> = {};
    try { data = JSON.parse(text); } catch { /* non-JSON */ }
    const id =
      data?.user_id ?? data?.id ?? data?.data?.user_id ?? data?.data?.id ??
      data?.user?.id ?? (/^[\w.-]+$/.test(text.trim()) ? text.trim() : null);
    if (!id) return { id: null, error: "Provision response missing user_id" };
    return { id: String(id), error: null };
  } catch (err) {
    return { id: null, error: err instanceof Error ? err.message : String(err) };
  }
}

async function registerKredDomain(fqdn: string, reg: {
  fullName: string; email: string; phone: string; address1: string;
  city: string; state: string; postalCode: string; country: string;
  profileLinks: string[]; onBehalfOf?: string | null;
}): Promise<{ ok: true; registration: unknown; dns: unknown } | { ok: false; error: string }> {
  const adminToken = Deno.env.get("KRED_DOMAINS_ADMIN_TOKEN");
  const userToken = Deno.env.get("KRED_DOMAINS_USER_TOKEN") || adminToken;
  if (!adminToken || !userToken) {
    return { ok: false, error: "KRED_DOMAINS_ADMIN_TOKEN is not configured" };
  }

  console.log("[kred] tokens", {
    admin: fingerprint(adminToken),
    user: fingerprint(userToken),
    same: adminToken === userToken,
  });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${userToken}`,
    "Content-Type": "application/json",
    "X-Admin-Token": adminToken,
  };
  if (reg.onBehalfOf) headers["X-On-Behalf-Of"] = reg.onBehalfOf;

  const { first, last } = splitName(reg.fullName);
  const contactPayload = {
    first_name: clean(first, 64),
    last_name: clean(last, 64),
    street: clean(reg.address1, 128),
    city: clean(reg.city, 64),
    state: clean(reg.state || reg.city, 64),
    postal_code: clean(reg.postalCode, 16),
    country: normalizeCountry(reg.country),
    phone: normalizePhone(reg.phone),
    email: clean(reg.email, 128).toLowerCase(),
  };

  console.log("[kred] POST /contacts", {
    url: `${KRED_API_BASE}/contacts`,
    headers: { Authorization: "Bearer ***", "X-Admin-Token": "***", "Content-Type": "application/json" },
    body: contactPayload,
  });

  const contactRes = await fetch(`${KRED_API_BASE}/contacts`, {
    method: "POST",
    headers,
    body: JSON.stringify(contactPayload),
  });
  if (!contactRes.ok) {
    const details = await contactRes.text();
    console.error(`[kred] contact failed [${contactRes.status}]: ${details}`, {
      sentPayload: contactPayload,
      adminToken: fingerprint(adminToken),
    });
    return { ok: false, error: `Contact create failed (${contactRes.status}): ${details.slice(0, 400)}` };
  }
  const contact = await contactRes.json();
  console.log("[kred] contact created", contact);
  const registrantId = contact?.id || contact?.contact_id;
  if (!registrantId) return { ok: false, error: "Contact response missing id" };

  const registerBody = {
    registrant: registrantId,
    years: 1,
    auto_renew: false,
    // Seeds the Kredentials page build for this domain.
    profile_links: reg.profileLinks,
    kredentials: { links: reg.profileLinks, email: reg.email, name: reg.fullName },
  };
  console.log("[kred] POST /domains/register", { fqdn, body: registerBody });
  const registerRes = await fetch(`${KRED_API_BASE}/domains/${encodeURIComponent(fqdn)}/register`, {
    method: "POST",
    headers,
    body: JSON.stringify(registerBody),
  });
  if (!registerRes.ok) {
    const details = await registerRes.text();
    console.error(`[kred] register failed [${registerRes.status}]: ${details}`);
    return { ok: false, error: `Domain register failed (${registerRes.status}): ${details.slice(0, 400)}` };
  }
  const registration = await registerRes.json();
  console.log("[kred] domain registered", registration);

  // Registration only delegates the domain — create the hosted zone with
  // apex + www A records so the Kredentials page actually resolves.
  let dns: unknown = null;
  try {
    dns = await ensureDnsZone(fqdn, userToken, adminToken);
    console.log("[kred] dns provisioned", JSON.stringify(dns));
  } catch (dnsErr) {
    console.error("[kred] dns provisioning failed", dnsErr);
    dns = { error: dnsErr instanceof Error ? dnsErr.message : String(dnsErr) };
  }

  return { ok: true, registration, dns };
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

  // ── Availability check (no persistence, used by the form while typing) ──
  if (body.action === "check_domain") {
    const candidate = str(body.domain, 80).replace(/\.kred$/i, "").toLowerCase();
    if (!/^[a-z0-9-]{1,63}$/.test(candidate)) {
      return json({ available: false, error: "Domain can only contain letters, numbers and hyphens" });
    }
    const adminToken = Deno.env.get("KRED_DOMAINS_ADMIN_TOKEN");
    const userToken = Deno.env.get("KRED_DOMAINS_USER_TOKEN") || adminToken;
    if (!adminToken) return json({ available: null, error: "Availability check unavailable" });
    try {
      const res = await fetch(`${KRED_API_BASE}/domains/${candidate}.kred/check`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
          "X-Admin-Token": adminToken,
        },
        body: "{}",
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch { /* non-JSON */ }
      if (!res.ok) {
        console.error(`[kred] check failed [${res.status}]: ${text.slice(0, 300)}`);
        return json({ available: null, error: `Check failed (${res.status})` });
      }
      const available =
        typeof data.available === "boolean"
          ? data.available
          : typeof data.is_available === "boolean"
            ? data.is_available
            : String(data.status ?? "").toLowerCase() === "available";
      return json({ available, domain: `${candidate}.kred`, premium: data.premium ?? null });
    } catch (err) {
      console.error("[kred] check threw:", err);
      return json({ available: null, error: "Check failed" });
    }
  }

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
  const profileLinks = (Array.isArray(body.profile_links) ? body.profile_links : [])
    .map((l) => str(l, 300))
    .filter(Boolean)
    .slice(0, 10);
  const profileLink = (profileLinks.join("\n") || str(body.profile_link, 300)).slice(0, 2000);

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
    return json({
      error: "Could not save your registration — please try again or email team@nft.nyc.",
      details: insertErr?.message ?? null,
    }, 500);
  }

  // Claim the .kred domain for the registrant.
  const fqdn = `${domain.toLowerCase()}.kred`;
  let domainStatus = "pending";
  let domainError: string | null = null;

  // Resolve (or create) the sprinter's PeopleBrowsr user id for X-On-Behalf-Of.
  const provisioned = await provisionUserId(email);
  const kredUserId = provisioned.id;
  if (provisioned.error) {
    console.error("[provision] failed:", provisioned.error);
    domainError = `Provision user: ${provisioned.error}`;
  }
  if (kredUserId) {
    await supabase.from("vibesprint_registrations").update({ kred_user_id: kredUserId }).eq("id", row.id);
  }

  try {
    const result = await registerKredDomain(fqdn, {
      fullName: name, email, phone, address1, city, state, postalCode, country,
      profileLinks: profileLinks.length ? profileLinks : (profileLink ? [profileLink] : []),
      onBehalfOf: kredUserId,
    });
    if (result.ok) {
      domainStatus = "registered";
    } else {
      domainStatus = "failed";
      domainError = [domainError, result.error].filter(Boolean).join(" | ");
    }
  } catch (err) {
    domainStatus = "failed";
    domainError = [domainError, err instanceof Error ? err.message : String(err)].filter(Boolean).join(" | ");
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
          <tr><td style="padding:6px 0;color:#666;">Kred user ID</td><td style="padding:6px 0;">${escape(kredUserId ?? "—")}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Domain registration</td><td style="padding:6px 0;">${domainLine}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Build platform</td><td style="padding:6px 0;">${escape(buildTool)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Phone</td><td style="padding:6px 0;">${escape(phone)}</td></tr>
          <tr><td style="padding:6px 0;color:#666;">Address</td><td style="padding:6px 0;">${escape(address1)}, ${escape(city)}${state ? `, ${escape(state)}` : ""} ${escape(postalCode)}, ${escape(country)}</td></tr>
          ${profileLink ? `<tr><td style="padding:6px 0;color:#666;">Profile links</td><td style="padding:6px 0;">${escape(profileLink).replace(/\n/g, "<br />")}</td></tr>` : ""}
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

    // Registrant confirmation email — separate Resend call so a failure
    // here doesn't affect the internal notification above, and vice versa.
    try {
      const icsText = buildIcs(SUPPORT_SESSIONS);
      const registrantResp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Kred Flash Sprints <${ALERT_FROM_EMAIL}>`,
          to: [email],
          reply_to: ALERT_EMAIL,
          subject: `You are in — Kred Flash Sprint 1 (${domain}.Kred)`,
          html: buildRegistrantEmailHtml(name, `${domain}.Kred`),
          attachments: [{
            filename: "vibesprint-sprint1-support-sessions.ics",
            content: base64Encode(icsText),
            content_type: "text/calendar; charset=utf-8; method=PUBLISH",
          }],
        }),
      });
      if (!registrantResp.ok) {
        console.error("Resend registrant confirmation error:", registrantResp.status, await registrantResp.text());
      }
    } catch (err) {
      console.error("Resend registrant confirmation failed:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set — skipping registration notification");
  }

  return json({ ok: true, id: row.id, domain: fqdn, domain_status: domainStatus });
});
