/**
 * submit-sprint-submission — receives a Sprint close-out submission from
 * /sprint1, upserts it into sprint_submissions (builders may resubmit before
 * close), and emails the details to contact@peoplebrowsr.com.
 *
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected),
 *      RESEND_API_KEY, VIBESPRINT_ALERT_EMAIL, ALERT_FROM_EMAIL
 *
 * Deliberately NOT collected: MCP link, API evidence, demo video.
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

/** Sprint 1 hard close: Fri 14 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_CLOSE_UTC = Date.UTC(2026, 7, 14, 20, 0, 0);
/** Sprint 1 opens: Wed 12 Aug 2026, 4:00pm ET (20:00 UTC). */
const SPRINT1_OPEN_UTC = Date.UTC(2026, 7, 12, 20, 0, 0);

function parseUrl(raw: string): URL | null {
  const s = (raw || "").trim();
  if (!s) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(s) ? s : `https://${s}`);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

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

  const sprint = String(body.sprint ?? "sprint1").trim() || "sprint1";
  const email = String(body.email ?? "").trim();
  const teamMembers = String(body.team_members ?? "").trim().slice(0, 2000) || null;

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return json({ error: "A valid email is required." }, 400);
  }

  const appName = String(body.app_name ?? body.app_url ?? "").trim();
  if (!appName) return json({ error: "App name is required." }, 400);

  const projectUrl = parseUrl(String(body.project_url ?? ""));
  if (!projectUrl) return json({ error: "Project link must be a valid URL." }, 400);

  const now = Date.now();
  if (sprint === "sprint1") {
    if (now < SPRINT1_OPEN_UTC) {
      return json({ error: "Submissions open Wednesday 12 August, 4:00pm ET." }, 400);
    }
    if (now > SPRINT1_CLOSE_UTC) {
      return json({ error: "Submissions closed Friday 14 August, 4:00pm ET." }, 400);
    }
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);
  const record = {
    sprint,
    email,
    app_url: appName,
    project_url: projectUrl.toString(),
    team_members: teamMembers,
    user_agent: req.headers.get("user-agent") ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("sprint_submissions")
    .select("id")
    .eq("sprint", sprint)
    .ilike("email", email)
    .maybeSingle();

  let row: { id: string } | null = null;
  let dbError: string | null = null;

  if (existing?.id) {
    const { data, error } = await supabase
      .from("sprint_submissions")
      .update(record)
      .eq("id", existing.id)
      .select("id")
      .single();
    row = data ?? null;
    dbError = error?.message ?? null;
  } else {
    const { data, error } = await supabase
      .from("sprint_submissions")
      .insert(record)
      .select("id")
      .single();
    row = data ?? null;
    dbError = error?.message ?? null;
  }

  if (dbError || !row) {
    console.error("sprint_submissions write failed:", dbError);
    return json({ error: `Could not save submission: ${dbError ?? "unknown error"}` }, 500);
  }

  if (RESEND_API_KEY) {
    const html = `
      <h2>${escape(sprint)} submission ${existing ? "(updated)" : "(new)"}</h2>
      <table cellpadding="6" style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td><b>Email</b></td><td>${escape(email)}</td></tr>
        <tr><td><b>App name</b></td><td>${escape(record.app_url)}</td></tr>
        <tr><td><b>Project link</b></td><td><a href="${escape(record.project_url)}">${escape(record.project_url)}</a></td></tr>
        <tr><td><b>Team members</b></td><td>${escape(teamMembers ?? "—")}</td></tr>
        <tr><td><b>Submitted</b></td><td>${escape(record.updated_at)}</td></tr>
      </table>`;
    try {
      const resp = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: `NFT.NYC Flash Sprints <${ALERT_FROM_EMAIL}>`,
          to: [ALERT_EMAIL],
          reply_to: email,
          subject: `${sprint} submission ${existing ? "updated" : "received"} — ${email}`,
          html,
        }),
      });
      if (!resp.ok) console.error("Resend failed:", resp.status, await resp.text());
    } catch (err) {
      console.error("Resend error:", err);
    }
  } else {
    console.warn("RESEND_API_KEY not set — skipping submission notification");
  }

  return json({ ok: true, id: row.id, updated: Boolean(existing) });
});
