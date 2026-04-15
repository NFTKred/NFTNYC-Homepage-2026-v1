/**
 * partnership-inquiry — receives sponsor/package inquiries from the /sponsor
 * page's PackageInquiryModal and:
 *   1. Emails team@nft.nyc via Resend with the full submission.
 *   2. Logs the contact into the CRM (via the add-contact Edge Function on
 *      the other Supabase project) so there's a tracked record.
 *
 * Required environment secrets:
 *   RESEND_API_KEY            — Resend API key (https://resend.com)
 *   TEAM_ALERT_EMAIL          — defaults to 'team@nft.nyc'
 *   ALERT_FROM_EMAIL          — defaults to 'partnerships@nft.nyc' (must be
 *                               a verified sender domain in Resend)
 *   ADD_CONTACT_URL           — same as the subscribe function
 *   ADD_CONTACT_SECRET        — same as the subscribe function
 *   PARTNERSHIP_LIST_ID       — Twenty.com list ID for "Partnership Inquiries"
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

interface Addon {
  name: string;
  price: string;
}

interface BasePackage {
  name: string;
  price: string;
  tier?: string;
  context: "community" | "packages";
  trackName?: string;
}

interface Payload {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  notes?: string;
  basePackage?: BasePackage;
  addons?: Addon[];
}

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const TEAM_ALERT_EMAIL = Deno.env.get("TEAM_ALERT_EMAIL") ?? "team@nft.nyc";
  const ALERT_FROM_EMAIL = Deno.env.get("ALERT_FROM_EMAIL") ?? "partnerships@nft.nyc";
  const ADD_CONTACT_URL = Deno.env.get("ADD_CONTACT_URL");
  const ADD_CONTACT_SECRET = Deno.env.get("ADD_CONTACT_SECRET");
  const PARTNERSHIP_LIST_ID = Deno.env.get("PARTNERSHIP_LIST_ID");

  if (!RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    return new Response(
      JSON.stringify({ error: "Server misconfiguration — email service not available." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const { name, email, company, phone, notes, basePackage, addons } = body;

  if (!name || !email || !company || !basePackage) {
    return new Response(
      JSON.stringify({ error: "Missing required fields (name, email, company, package)." }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const addonList = (addons ?? [])
    .map(a => `<li><strong>${escape(a.name)}</strong> — ${escape(a.price)}</li>`)
    .join("");

  const tabLabel =
    basePackage.context === "community" ? "Community-Focused Packages" : "Build Your Perfect Package";

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <h2 style="margin: 0 0 16px; font-size: 20px;">New Partnership Inquiry</h2>
      <div style="background: #f5f5f7; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px;">${escape(tabLabel)}${basePackage.trackName ? " · " + escape(basePackage.trackName) : ""}</div>
        <div style="font-size: 18px; font-weight: 700;">${escape(basePackage.name)}</div>
        <div style="font-size: 16px; color: #14b8a6; margin-top: 4px;">${escape(basePackage.price)}${basePackage.tier ? ` · ${escape(basePackage.tier)}` : ""}</div>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 6px 0; color: #666; width: 110px;">Name</td><td style="padding: 6px 0; font-weight: 600;">${escape(name)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Company</td><td style="padding: 6px 0; font-weight: 600;">${escape(company)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escape(email)}">${escape(email)}</a></td></tr>
        ${phone ? `<tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escape(phone)}</td></tr>` : ""}
      </table>

      ${notes ? `
        <div style="margin-top: 16px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px;">Notes</div>
          <div style="background: #fafafa; border-left: 3px solid #14b8a6; padding: 10px 14px; font-size: 14px; white-space: pre-wrap;">${escape(notes)}</div>
        </div>
      ` : ""}

      ${addonList ? `
        <div style="margin-top: 16px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 8px;">Interested in these add-ons</div>
          <ul style="margin: 0; padding-left: 20px;">${addonList}</ul>
        </div>
      ` : ""}

      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        Submitted via nft.nyc/sponsor — reply directly to contact the submitter.
      </p>
    </div>
  `.trim();

  const emailSubject = `New Partnership Inquiry: ${basePackage.name}`;

  // Send email via Resend
  let emailOk = false;
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `NFT.NYC Partnerships <${ALERT_FROM_EMAIL}>`,
        to: [TEAM_ALERT_EMAIL],
        reply_to: email,
        subject: emailSubject,
        html: emailHtml,
      }),
    });
    emailOk = resp.ok;
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend error:", resp.status, errText);
    }
  } catch (err) {
    console.error("Resend fetch failed:", err);
  }

  // Also log to CRM (fire-and-forget — we don't block success on this)
  if (ADD_CONTACT_URL && ADD_CONTACT_SECRET && PARTNERSHIP_LIST_ID) {
    const [firstName, ...lastParts] = name.trim().split(/\s+/);
    const lastName = lastParts.join(" ") || name;
    const addonSummary = (addons ?? []).map(a => a.name).join(", ");

    try {
      await fetch(ADD_CONTACT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": ADD_CONTACT_SECRET,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          companyName: company,
          listId: PARTNERSHIP_LIST_ID,
          // Note: the CRM doesn't have package fields, so we surface them in
          // the email. The CRM entry just records that this person inquired.
        }),
      });
      // If the notes include package info we want in the CRM, we rely on the
      // email for detail. Package + addon context lives in the email body.
      void addonSummary;
    } catch (err) {
      console.error("CRM log failed (non-fatal):", err);
    }
  }

  if (!emailOk) {
    return new Response(
      JSON.stringify({ error: "We couldn't deliver the inquiry — please email team@nft.nyc directly." }),
      { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { ...corsHeaders, "content-type": "application/json" } }
  );
});
