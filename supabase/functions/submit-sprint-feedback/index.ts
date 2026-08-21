/**
 * submit-sprint-feedback — receives the /sprintfeedback survey, stores it in
 * sprint_feedback and emails the answers to contact@peoplebrowsr.com.
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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "content-type": "application/json" },
  });

const escape = (s: unknown) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const text = (v: unknown, max = 2000) => {
  const s = String(v ?? "").trim();
  return s ? s.slice(0, max) : null;
};

const rating = (v: unknown, min: number, max: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  return i >= min && i <= max ? i : null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const ALERT_EMAIL = Deno.env.get("VIBESPRINT_ALERT_EMAIL") ?? "contact@peoplebrowsr.com";
  const ALERT_FROM_EMAIL = Deno.env.get("ALERT_FROM_EMAIL") ?? "team@nft.nyc";

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const email = text(body.email, 255);
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "Please enter a valid email address." }, 400);
  }

  const overall = rating(body.overall_rating, 1, 5);
  if (overall === null) return json({ error: "An overall rating is required." }, 400);

  const submitted = text(body.submitted_project, 120);
  if (!submitted) return json({ error: "Please tell us whether you submitted a project." }, 400);

  const blockers = Array.isArray(body.blockers)
    ? (body.blockers as unknown[]).map((b) => String(b).slice(0, 200)).slice(0, 20)
    : [];

  const record = {
    sprint: text(body.sprint, 40) ?? "sprint1",
    email,
    overall_rating: overall,
    submitted_project: submitted,
    blockers,
    blockers_other: text(body.blockers_other),
    kit_clarity: rating(body.kit_clarity, 1, 5),
    kit_comments: text(body.kit_comments),
    support_session: text(body.support_session, 200),
    api_rating: rating(body.api_rating, 1, 5),
    api_friction: text(body.api_friction),
    example_apps: text(body.example_apps, 200),
    next_sprint_nps: rating(body.next_sprint_nps, 0, 10),
    user_agent: req.headers.get("user-agent") ?? null,
  };

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const { data: row, error } = await supabase
    .from("sprint_feedback")
    .insert(record)
    .select("id")
    .single();

  if (error || !row) {
    console.error("sprint_feedback write failed:", error);
    return json({ error: `Could not save feedback: ${error?.message ?? "unknown error"}` }, 500);
  }

  if (RESEND_API_KEY) {
    const rows: Array<[string, unknown]> = [
      ["Sprint", record.sprint],
      ["Email", record.email ?? "(anonymous)"],
      ["Overall experience (1-5)", record.overall_rating],
      ["Submitted a project", record.submitted_project],
      ["Blockers", record.blockers.length ? record.blockers.join(", ") : "—"],
      ["Blockers (other)", record.blockers_other ?? "—"],
      ["Kit clarity (1-5)", record.kit_clarity ?? "—"],
      ["Kit comments", record.kit_comments ?? "—"],
      ["Support session", record.support_session ?? "—"],
      ["Domains.Kred API & docs (1-5)", record.api_rating ?? "—"],
      ["API friction", record.api_friction ?? "—"],
      ["Example apps", record.example_apps ?? "—"],
      ["Likely to join next sprint (0-10)", record.next_sprint_nps ?? "—"],
    ];
    const html = `
      <h2>Sprint feedback received</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;">
        ${rows
          .map(([k, v]) => `<tr><td><b>${escape(k)}</b></td><td>${escape(v)}</td></tr>`)
          .join("")}
      </table>`;
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Flash Sprints <${ALERT_FROM_EMAIL}>`,
          to: [ALERT_EMAIL],
          ...(record.email ? { reply_to: record.email } : {}),
          subject: `Sprint feedback — ${record.email ?? "anonymous"}`,
          html,
        }),
      });
      if (!resp.ok) console.error("Resend failed:", resp.status, await resp.text());
    } catch (err) {
      console.error("Resend error:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set — skipping feedback notification");
  }

  return json({ ok: true, id: row.id });
});
