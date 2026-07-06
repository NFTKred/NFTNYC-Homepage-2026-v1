/**
 * approve-visa-request — admin-triggered. Generates the visa support PDF,
 * uploads it to Storage (private bucket 'visa-letters'), emails it to the
 * requester with team@nft.nyc CC'd, and marks the row approved.
 *
 * Requires the caller to be an authenticated admin — verified by passing
 * the user's JWT in the Authorization header. The function uses the JWT to
 * check auth; DB writes and Storage ops use the service role.
 *
 * Required environment secrets:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — auto-injected
 *   RESEND_API_KEY                          — Resend API key
 *   TEAM_ALERT_EMAIL                        — defaults to 'team@nft.nyc'
 *   ALERT_FROM_EMAIL                        — defaults to 'team@nft.nyc'
 *
 * Assets (stored once in the private 'internal-assets' bucket):
 *   signature.png — Cameron's signature (extracted from the template PDF)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface Payload {
  request_id?: string;
}

function escape(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function todayLongUS(): string {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

async function generateLetterPdf(row: {
  full_name: string;
  passport_number: string;
  passport_issuing_country: string;
  date_of_birth: string;
  nationality: string;
  job_title: string;
  email: string;
  phone: string;
}, signaturePng: Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);   // US Letter
  const { width, height } = page.getSize();

  const font     = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const black    = rgb(0, 0, 0);

  const margin = 54;
  let cursor = height - margin;

  const draw = (text: string, opts: { x?: number; size?: number; bold?: boolean; color?: ReturnType<typeof rgb> } = {}) => {
    page.drawText(text, {
      x: opts.x ?? margin,
      y: cursor,
      size: opts.size ?? 11,
      font: opts.bold ? fontBold : font,
      color: opts.color ?? black,
    });
  };

  // Header row: date on the left, NFT.NYC block on the right.
  draw(todayLongUS(), { size: 11 });
  const rightX = 380;
  page.drawText("NFT.NYC", { x: rightX, y: cursor, size: 11, font: fontBold, color: black });
  cursor -= 14;
  page.drawText("Hotel Edison", { x: rightX, y: cursor, size: 10, font, color: black });
  cursor -= 12;
  page.drawText("228 W 47th St, New York, NY 10036", { x: rightX, y: cursor, size: 10, font, color: black });
  cursor -= 12;
  page.drawText("United States", { x: rightX, y: cursor, size: 10, font, color: black });
  cursor -= 12;
  page.drawText("(+1) 212-840-5000", { x: rightX, y: cursor, size: 10, font, color: black });
  cursor -= 12;
  page.drawText("cameronbale@nft.nyc", { x: rightX, y: cursor, size: 10, font, color: black });

  // "To, The Visa Officer" on the left — draw independently so we don't
  // interfere with the right-column cursor advance above.
  page.drawText("To,", { x: margin, y: height - margin - 20, size: 11, font, color: black });
  page.drawText("The Visa Officer", { x: margin, y: height - margin - 34, size: 11, font, color: black });

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
    `All expenses including accommodation pertaining to travel and time in the`,
    `US will be borne by ${row.full_name}.`,
    "",
    "Following are their details:",
  ];
  for (const line of bodyLines) {
    page.drawText(line, { x: margin, y: cursor, size: 11, font, color: black });
    cursor -= 14;
  }

  // 8 detail rows.
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

  // Signature image
  cursor -= 60;
  const sigImage = await pdf.embedPng(signaturePng);
  const sigWidth = 140;
  const sigHeight = sigImage.height * (sigWidth / sigImage.width);
  page.drawImage(sigImage, { x: margin, y: cursor, width: sigWidth, height: sigHeight });

  cursor -= 8;
  page.drawText("Cameron Bale", { x: margin, y: cursor, size: 11, font: fontBold, color: black });
  cursor -= 14;
  page.drawText("Co-founder and Producer", { x: margin, y: cursor, size: 11, font, color: black });

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

  // Verify caller is authenticated.
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace(/^Bearer\s+/i, "");
  if (!jwt) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const authClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const { data: userRes, error: userErr } = await authClient.auth.getUser(jwt);
  if (userErr || !userRes?.user) {
    return new Response(
      JSON.stringify({ error: "Not authenticated" }),
      { status: 401, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  const reviewerEmail = userRes.user.email ?? "admin";

  let body: Payload;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON" }),
      { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  if (!body.request_id) {
    return new Response(
      JSON.stringify({ error: "Missing request_id" }),
      { status: 422, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  // Load the request row.
  const { data: row, error: loadErr } = await supabase
    .from("visa_requests")
    .select("*")
    .eq("id", body.request_id)
    .single();
  if (loadErr || !row) {
    return new Response(
      JSON.stringify({ error: "Request not found" }),
      { status: 404, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  if (row.status !== "pending") {
    return new Response(
      JSON.stringify({ error: `Request is already ${row.status}` }),
      { status: 409, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  // Load the signature from the private internal-assets bucket.
  const { data: sigBlob, error: sigErr } = await supabase
    .storage.from("internal-assets").download("signature.png");
  if (sigErr || !sigBlob) {
    console.error("Signature download failed:", sigErr);
    return new Response(
      JSON.stringify({ error: "Signature asset missing — upload signature.png to internal-assets bucket." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }
  const signaturePng = new Uint8Array(await sigBlob.arrayBuffer());

  // Generate the PDF.
  let pdfBytes: Uint8Array;
  try {
    pdfBytes = await generateLetterPdf(row, signaturePng);
  } catch (err) {
    console.error("PDF generation failed:", err);
    return new Response(
      JSON.stringify({ error: "PDF generation failed — see edge function logs." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  // Upload to the visa-letters private bucket.
  const safeName = row.full_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const letterPath = `${row.id}/nft-nyc-2026-visa-letter-${safeName}.pdf`;
  const { error: uploadErr } = await supabase
    .storage.from("visa-letters")
    .upload(letterPath, pdfBytes, { contentType: "application/pdf", upsert: true });
  if (uploadErr) {
    console.error("Letter upload failed:", uploadErr);
    return new Response(
      JSON.stringify({ error: "Could not save the letter — try again." }),
      { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } }
    );
  }

  // Email the letter as an attachment. Both requester and team@nft.nyc.
  let emailOk = true;
  if (RESEND_API_KEY) {
    const base64 = btoa(String.fromCharCode(...pdfBytes));
    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; color: #111; line-height: 1.55;">
        <p style="font-size: 15px;">Hi ${escape(row.full_name.split(/\s+/)[0])},</p>
        <p style="font-size: 15px;">
          Please find your NFT.NYC 2026 letter of invitation attached. We look forward to seeing you in Times Square this September.
        </p>
        <p style="font-size: 15px;">
          If your consulate needs any additional documentation, reply to this email and our team will assist.
        </p>
        <p style="font-size: 15px; margin-top: 24px;">Warm regards,<br/>The NFT.NYC Team</p>
        <p style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e5e5ea; font-size: 11px; color: #999;">
          NFT.NYC 2026 · September 1–3 · Edison Ballroom, Times Square
        </p>
      </div>
    `.trim();

    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Visa Support <${ALERT_FROM_EMAIL}>`,
          to: [row.email],
          cc: [TEAM_ALERT_EMAIL],
          reply_to: TEAM_ALERT_EMAIL,
          subject: "Your NFT.NYC 2026 letter of invitation",
          html: emailHtml,
          attachments: [
            { filename: `NFT-NYC-2026-Letter-of-Invitation-${safeName}.pdf`, content: base64 },
          ],
        }),
      });
      emailOk = resp.ok;
      if (!resp.ok) console.error("Resend letter email error:", resp.status, await resp.text());
    } catch (err) {
      console.error("Resend letter fetch failed:", err);
      emailOk = false;
    }
  } else {
    emailOk = false;
    console.warn("RESEND_API_KEY not set — letter generated but not emailed");
  }

  // Mark the row approved, even if email failed. The admin can retry email.
  const { error: updateErr } = await supabase
    .from("visa_requests")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: reviewerEmail,
      letter_path: letterPath,
      letter_sent_at: emailOk ? new Date().toISOString() : null,
    })
    .eq("id", row.id);
  if (updateErr) {
    console.error("visa_requests update failed:", updateErr);
    // Still return the letter path so the admin knows it was generated.
  }

  return new Response(
    JSON.stringify({ ok: true, letter_path: letterPath, email_sent: emailOk }),
    { headers: { ...corsHeaders, "content-type": "application/json" } }
  );
});
