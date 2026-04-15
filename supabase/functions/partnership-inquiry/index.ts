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
 *   SPONSOR_PIPELINE_URL      — sponsor pipeline endpoint on the sister
 *                               project (inbound-sponsor-lead). If unset the
 *                               pipeline integration is simply skipped.
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

/**
 * Parse a human-formatted price string like "$75,000", "$2,500", or
 * "$5,000 or $25,000" into a number. For ranges we take the LOWER bound
 * (conservative sum). Returns 0 when no number can be extracted.
 */
function parsePrice(raw: string | undefined): number {
  if (!raw) return 0;
  // Grab the first digit sequence with optional commas.
  const match = raw.replace(/,/g, "").match(/\$?\s*(\d+(?:\.\d+)?)/);
  if (!match) return 0;
  const n = Number(match[1]);
  return Number.isFinite(n) ? n : 0;
}

function formatUSD(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

/**
 * Map the total opportunity value to the sponsor pipeline's tiered
 * package_id enum (platinum / gold / silver / bronze). The pipeline also
 * accepts the real package_name + amount as free-text context, but still
 * requires a tier slot for its kanban stage column.
 *   ≥ $100,000 → platinum
 *   $50,000 – $99,999 → gold
 *   $15,000 – $49,999 → silver
 *   < $15,000 → bronze
 */
function tierFor(amount: number): "platinum" | "gold" | "silver" | "bronze" {
  if (amount >= 100_000) return "platinum";
  if (amount >= 50_000) return "gold";
  if (amount >= 15_000) return "silver";
  return "bronze";
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

  // Total opportunity value = base package + all selected add-ons (lower
  // bound when a price is a range like "$5,000 or $25,000").
  const baseValue = parsePrice(basePackage.price);
  const addonsValue = (addons ?? []).reduce((sum, a) => sum + parsePrice(a.price), 0);
  const totalValue = baseValue + addonsValue;
  const totalFormatted = formatUSD(totalValue);

  // Subject: ALERT: $X,XXX Sponsor Opportunity - <Name> from <Company>
  const emailSubject = `ALERT: ${totalFormatted} Sponsor Opportunity - ${name} from ${company}`;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <div style="background: linear-gradient(135deg, #f97316, #ef4444); color: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; opacity: 0.9; margin-bottom: 6px;">ALERT</div>
        <div style="font-size: 20px; font-weight: 700; line-height: 1.3;">${escape(totalFormatted)} Sponsor Opportunity</div>
        <div style="font-size: 14px; margin-top: 4px; opacity: 0.95;">${escape(name)} from ${escape(company)}</div>
      </div>

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
        <tr><td style="padding: 6px 0; color: #666;">Total Opportunity</td><td style="padding: 6px 0; font-weight: 700; color: #0f766e;">${escape(totalFormatted)}</td></tr>
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

  const SPONSOR_PIPELINE_URL = Deno.env.get("SPONSOR_PIPELINE_URL");

  // Fire the CRM log, sponsor-pipeline push, and the submitter confirmation
  // email in parallel. All three are non-blocking — if any fails the inquiry
  // still succeeds for the user and the team alert email above remains the
  // source of truth.
  const sideEffects: Promise<unknown>[] = [];

  // ── Confirmation email to the submitter ─────────────────────────────────
  // Sends a warm acknowledgement and invites them to book a meeting with the
  // partnerships team via the /book Calendly vanity link. The reply-to is
  // set to team@nft.nyc so a reply lands with the partnerships team, not
  // the sending mailbox.
  const firstNameOnly = name.trim().split(/\s+/)[0] || name;
  const confirmSubject = `We received your NFT.NYC 2026 partnership inquiry`;
  const confirmHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.55;">
      <p style="font-size: 16px; margin: 0 0 16px;">Hi ${escape(firstNameOnly)},</p>

      <p style="font-size: 15px; margin: 0 0 16px;">
        Thanks for your interest in partnering with NFT.NYC 2026 — we've received your expression of interest and the partnerships team will be in touch shortly to work through the details.
      </p>

      <div style="background: #f5f5f7; border-radius: 8px; padding: 16px 20px; margin: 20px 0;">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 6px;">${escape(tabLabel)}${basePackage.trackName ? " · " + escape(basePackage.trackName) : ""}</div>
        <div style="font-size: 17px; font-weight: 700; color: #111;">${escape(basePackage.name)}</div>
        <div style="font-size: 15px; color: #14b8a6; margin-top: 4px;">${escape(basePackage.price)}</div>
        ${addonList ? `
          <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid #e5e5ea;">
            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 6px;">With these add-ons</div>
            <ul style="margin: 0; padding-left: 20px; font-size: 14px;">${addonList}</ul>
          </div>
        ` : ""}
      </div>

      <p style="font-size: 15px; margin: 0 0 16px;">
        Grab a slot directly on the NFT.NYC partnerships team calendar:
      </p>

      <p style="margin: 20px 0;">
        <a href="https://www.nft.nyc/book" style="display: inline-block; background: linear-gradient(135deg, #f97316, #ef4444); color: #fff; text-decoration: none; font-weight: 600; padding: 12px 28px; border-radius: 9999px; font-size: 15px;">Schedule a meeting →</a>
      </p>

      <p style="font-size: 15px; margin: 24px 0 4px;">Looking forward to building something great together.</p>
      <p style="font-size: 15px; margin: 0 0 4px; font-weight: 600;">The NFT.NYC Partnerships Team</p>
      <p style="font-size: 13px; color: #666; margin: 0;">Times Square, New York City &nbsp;|&nbsp; 1–3 September 2026</p>

      <p style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e5ea; font-size: 11px; color: #999;">
        This is an automated acknowledgement. If you didn't submit this, just ignore this email.
      </p>
    </div>
  `.trim();

  sideEffects.push(
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `NFT.NYC Partnerships <${ALERT_FROM_EMAIL}>`,
        to: [email],
        reply_to: TEAM_ALERT_EMAIL,
        subject: confirmSubject,
        html: confirmHtml,
      }),
    }).then(async res => {
      if (!res.ok) {
        const errText = await res.text();
        console.error("Confirmation email error:", res.status, errText);
      }
    }).catch(err => { console.error("Confirmation email fetch failed (non-fatal):", err); })
  );

  if (ADD_CONTACT_URL && ADD_CONTACT_SECRET && PARTNERSHIP_LIST_ID) {
    const [firstName, ...lastParts] = name.trim().split(/\s+/);
    const lastName = lastParts.join(" ") || name;
    sideEffects.push(
      fetch(ADD_CONTACT_URL, {
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
      }).catch(err => { console.error("CRM log failed (non-fatal):", err); })
    );
  }

  if (SPONSOR_PIPELINE_URL) {
    // Push to the sister project's sponsor pipeline at the inbound hot-lead
    // stage. `package_id` is a tier bucket they require; the real details
    // flow through in `package_name`, `amount`, `addons`, `notes`, `source`.
    //
    // NOTE: the pipeline renders `addons` as a string in its kanban notes,
    // so we flatten the structured list here to a human-readable form. We
    // keep it readable at-a-glance ("Name — Price, Name — Price").
    const addonsPretty = (addons ?? [])
      .map(a => `${a.name} — ${a.price}`)
      .join(", ");

    sideEffects.push(
      fetch(SPONSOR_PIPELINE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          company_name: company,
          package_id: tierFor(totalValue),
          package_name: basePackage.name,
          amount: totalValue,
          addons: addonsPretty,
          notes: [
            notes,
            phone ? `Phone: ${phone}` : "",
            basePackage.trackName ? `Track: ${basePackage.trackName}` : "",
            `Tab: ${tabLabel}`,
            `Base package: ${basePackage.name} (${basePackage.price})`,
            addonsPretty ? `Add-ons: ${addonsPretty}` : "",
          ].filter(Boolean).join("\n"),
          source: "nft.nyc/sponsor",
        }),
      }).then(async res => {
        if (!res.ok) {
          const errText = await res.text();
          console.error("Sponsor pipeline error:", res.status, errText);
        }
      }).catch(err => { console.error("Sponsor pipeline fetch failed (non-fatal):", err); })
    );
  }

  // Kick off side effects without blocking the response on their completion.
  // They execute in parallel with the email send above.
  if (sideEffects.length) {
    await Promise.allSettled(sideEffects);
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
