/**
 * submit-visa-request — receives a visa letter request from /visa,
 * fills in the NFT.NYC letter-of-invitation template as a PDF, and
 * emails it to team@nft.nyc for manual review + forwarding to the
 * requester.
 *
 * Required environment secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  — auto-injected in Edge Functions
 *   RESEND_API_KEY                            — Resend API key
 *   TEAM_ALERT_EMAIL                          — defaults to 'team@nft.nyc'
 *   ALERT_FROM_EMAIL                          — defaults to 'team@nft.nyc'
 *
 * Assets (stored once in the private 'internal-assets' bucket):
 *   signature.png — Cameron's signature, embedded in the generated PDF.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

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

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function todayLongUS(): string {
  return new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

async function generateLetterPdf(row: Required<Omit<Payload, "ticket_order_number" | "notes">>, signaturePng: Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);   // US Letter
  const { width, height } = page.getSize();

  const font     = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const black    = rgb(0, 0, 0);

  const margin = 54;
  let cursor = height - margin;

  page.drawText(todayLongUS(), { x: margin, y: cursor, size: 11, font, color: black });
  const rightX = 380;
  page.drawText("NFT.NYC",                        { x: rightX, y: cursor, size: 11, font: fontBold, color: black });
  page.drawText("Hotel Edison",                   { x: rightX, y: cursor - 14, size: 10, font, color: black });
  page.drawText("228 W 47th St, New York, NY",    { x: rightX, y: cursor - 26, size: 10, font, color: black });
  page.drawText("10036, United States",           { x: rightX, y: cursor - 38, size: 10, font, color: black });
  page.drawText("(+1) 212-840-5000",              { x: rightX, y: cursor - 50, size: 10, font, color: black });
  page.drawText("cameronbale@nft.nyc",            { x: rightX, y: cursor - 62, size: 10, font, color: black });

  page.drawText("To,",                { x: margin, y: cursor - 20, size: 11, font, color: black });
  page.drawText("The Visa Officer",   { x: margin, y: cursor - 34, size: 11, font, color: black });

  cursor = height - margin - 130;
  page.drawText("Re: Letter of Invitation", { x: width / 2 - 70, y: cursor, size: 12, font: fontBold, color: black });
  cursor -= 30;

  const bodyLines = [
    "NFT.NYC is an American technology conference held at the Edison Ballroom,",
    "228 W 47th Street, New York, NY 10036, United States.",
    "",
    "NFT.NYC hosts speakers and attendees to present and network with other",
    "members of the Non-Fungible Token (NFT) blockchain community.",
    "",
    `${row.full_name} will be an important attendee at this year's event and`,
    "conference, held September 1-3, 2026.",
    "",
    "All expenses including accommodation pertaining to travel and time in the",
    `US will be borne by ${row.full_name}.`,
    "",
    "Following are their details:",
  ];
  for (const line of bodyLines) {
    page.drawText(line, { x: margin, y: cursor, size: 11, font, color: black });
    cursor -= 14;
  }

  const rows: Array<[string, string]> = [
    ["1. Name:",                     row.full_name],
    ["2. Passport Number:",          row.passport_number],
    ["3. Passport Issuing Country:", row.passport_issuing_country],
    ["4. Date of Birth:",            row.date_of_birth],
    ["5. Nationality:",              row.nationality],
    ["6. Job Title:",                row.job_title],
    ["7. Email:",                    row.email],
    ["8. Phone:",                    row.phone],
  ];
  cursor -= 6;
  for (const [label, value] of rows) {
    page.drawText(label, { x: margin + 18, y: cursor, size: 11, font, color: black });
    page.drawText(value,  { x: margin + 190, y: cursor, size: 11, font, color: black });
    cursor -= 14;
  }
  cursor -= 12;

  page.drawText("Should you require any further clarification, please do not hesitate to", { x: margin, y: cursor, size: 11, font, color: black });
  cursor -= 14;
  page.drawText("contact the undersigned at +1 438 883 4389.", { x: margin, y: cursor, size: 11, font, color: black });

  cursor -= 34;
  page.drawText("Yours sincerely,", { x: margin, y: cursor, size: 11, font, color: black });

  cursor -= 60;
  const sigImage = await pdf.embedPng(signaturePng);
  const sigWidth = 140;
  const sigHeight = sigImage.height * (sigWidth / sigImage.width);
  page.drawImage(sigImage, { x: margin, y: cursor, width: sigWidth, height: sigHeight });

  cursor -= 8;
  page.drawText("Cameron Bale",             { x: margin, y: cursor, size: 11, font: fontBold, color: black });
  page.drawText("Co-founder and Producer",  { x: margin, y: cursor - 14, size: 11, font, color: black });

  return await pdf.save();
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

  const missing = REQUIRED_FIELDS.filter(k => !String(body[k] ?? "").trim());
  if (missing.length) {
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const clean = {
    full_name: body.full_name!.trim(),
    passport_number: body.passport_number!.trim(),
    passport_issuing_country: body.passport_issuing_country!.trim(),
    date_of_birth: body.date_of_birth!.trim(),
    nationality: body.nationality!.trim(),
    job_title: body.job_title!.trim(),
    email: body.email!.trim().toLowerCase(),
    phone: body.phone!.trim(),
  };
  const ticketOrder = body.ticket_order_number?.trim() ?? "";
  const notes = body.notes?.trim() ?? "";

  // Load Cameron's signature from private storage.
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: sigBlob, error: sigErr } = await supabase
    .storage.from("internal-assets").download("signature.png");
  if (sigErr || !sigBlob) {
    console.error("Signature download failed:", sigErr);
    return new Response(
      JSON.stringify({ error: "Server misconfiguration — signature asset missing." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  const signaturePng = new Uint8Array(await sigBlob.arrayBuffer());

  // Generate the PDF.
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateLetterPdf(clean, signaturePng);
  } catch (err) {
    console.error("PDF generation failed:", err);
    return new Response(
      JSON.stringify({ error: "Could not generate the letter — please try again." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const base64 = btoa(String.fromCharCode(...pdfBytes));
  const safeName = clean.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `NFT-NYC-2026-Letter-of-Invitation-${safeName}.pdf`;

  const emailHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111;">
      <div style="background: linear-gradient(135deg, #06B6D4, #8B5CF6); color: #fff; border-radius: 8px; padding: 16px 20px; margin-bottom: 16px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.25em; opacity: 0.9; margin-bottom: 6px;">VISA REQUEST</div>
        <div style="font-size: 20px; font-weight: 700; line-height: 1.3;">${escape(clean.full_name)}</div>
        <div style="font-size: 14px; margin-top: 4px; opacity: 0.95;">${escape(clean.nationality)} · ${escape(clean.job_title)}</div>
      </div>

      <p style="font-size: 14px; margin-bottom: 16px;">Draft letter is attached. Review and, if approved, forward to <a href="mailto:${escape(clean.email)}">${escape(clean.email)}</a>.</p>

      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 6px 0; color: #666; width: 180px;">Passport number</td><td style="padding: 6px 0; font-weight: 600;">${escape(clean.passport_number)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Passport issuing country</td><td style="padding: 6px 0;">${escape(clean.passport_issuing_country)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Date of birth</td><td style="padding: 6px 0;">${escape(clean.date_of_birth)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Nationality</td><td style="padding: 6px 0;">${escape(clean.nationality)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Job title</td><td style="padding: 6px 0;">${escape(clean.job_title)}</td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escape(clean.email)}">${escape(clean.email)}</a></td></tr>
        <tr><td style="padding: 6px 0; color: #666;">Phone</td><td style="padding: 6px 0;">${escape(clean.phone)}</td></tr>
        ${ticketOrder ? `<tr><td style="padding: 6px 0; color: #666;">Ticket order #</td><td style="padding: 6px 0;">${escape(ticketOrder)}</td></tr>` : ""}
      </table>

      ${notes ? `
        <div style="margin-top: 16px;">
          <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; margin-bottom: 4px;">Notes from requester</div>
          <div style="background: #fafafa; border-left: 3px solid #06B6D4; padding: 10px 14px; font-size: 14px; white-space: pre-wrap;">${escape(notes)}</div>
        </div>
      ` : ""}

      <p style="margin-top: 24px; font-size: 12px; color: #999;">Submitted via nft.nyc/visa</p>
    </div>
  `.trim();

  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: `NFT.NYC Visa Support <${ALERT_FROM_EMAIL}>`,
        to: [TEAM_ALERT_EMAIL],
        reply_to: clean.email,
        subject: `Visa letter — ${clean.full_name} (${clean.nationality})`,
        html: emailHtml,
        attachments: [{ filename, content: base64 }],
      }),
    });
    if (!resp.ok) {
      const errText = await resp.text();
      console.error("Resend error:", resp.status, errText);
      return new Response(
        JSON.stringify({ error: "We couldn't deliver the request — please email team@nft.nyc directly." }),
        { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } }
      );
    }
  } catch (err) {
    console.error("Resend fetch failed:", err);
    return new Response(
      JSON.stringify({ error: "We couldn't deliver the request — please email team@nft.nyc directly." }),
      { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { headers: { ...corsHeaders, "content-type": "application/json" } }
  );
});
