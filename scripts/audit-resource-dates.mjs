#!/usr/bin/env node
/**
 * Resource-date auditor.
 *
 * Pulls every approved resource from Supabase, fetches each URL, parses the
 * true publication date from HTML metadata, and reports any mismatch vs. the
 * date stored in the `resources` table.
 *
 * Writes two artifacts:
 *   1. scripts/output/date-audit.csv      — every resource with stored vs.
 *                                           detected date + confidence + URL
 *   2. scripts/output/date-audit.sql      — generated UPDATE statements for
 *                                           rows where detection is confident
 *                                           and the stored date differs by
 *                                           more than 14 days
 *
 * By default the script only queries resources. It never writes to Supabase.
 *
 * Usage:
 *   node scripts/audit-resource-dates.mjs                 # all verticals
 *   node scripts/audit-resource-dates.mjs culture         # one vertical
 *   node scripts/audit-resource-dates.mjs culture ai defi # multiple
 *
 * Detection sources (in priority order):
 *   1. <meta property="article:published_time" content="...">  (Open Graph)
 *   2. <meta name="date" content="...">                        (simple)
 *   3. <meta itemprop="datePublished" content="...">           (microdata)
 *   4. JSON-LD @type=Article/NewsArticle `datePublished` field
 *   5. <time datetime="..."> element (first occurrence)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname);
const OUT_DIR = join(__dirname, "output");
if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

// ─── Load Supabase credentials ─────────────────────────────────────────────
const envText = readFileSync(join(ROOT, ".env.local"), "utf8");
const env = Object.fromEntries(
  envText.split("\n")
    .filter(l => l && !l.startsWith("#") && l.includes("="))
    .map(l => {
      const idx = l.indexOf("=");
      return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
    })
);
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("✗ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
  process.exit(1);
}

// ─── Fetch resources from Supabase ─────────────────────────────────────────
async function fetchResources(verticals) {
  const params = new URLSearchParams();
  params.set("select", "id,vertical_id,title,url,date,source,type,status");
  params.set("status", "eq.approved");
  if (verticals?.length) {
    params.set("vertical_id", `in.(${verticals.join(",")})`);
  }
  params.set("order", "vertical_id.asc,date.desc");
  params.set("limit", "1000");

  const res = await fetch(`${SUPABASE_URL}/rest/v1/resources?${params}`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase fetch failed: ${res.status} ${await res.text()}`);
  }
  return await res.json();
}

// ─── Parse publication date from HTML ─────────────────────────────────────
function normalizeDate(raw) {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  // Discard values from the future (Dec 31 today = 2026-04-23).
  const today = new Date();
  today.setDate(today.getDate() + 1); // 1 day buffer for timezone
  if (d > today) return null;
  // Discard dates before the web existed in any meaningful way.
  if (d < new Date("1995-01-01")) return null;
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function extractDate(html) {
  const tries = [];

  // 1. <meta property="article:published_time">
  const og = html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i)
          || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']article:published_time["']/i);
  if (og) tries.push({ source: "og:article:published_time", raw: og[1] });

  // 2. <meta name="date">
  const metaDate = html.match(/<meta[^>]+name=["']date["'][^>]+content=["']([^"']+)["']/i)
                 || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']date["']/i);
  if (metaDate) tries.push({ source: "meta[name=date]", raw: metaDate[1] });

  // 3. <meta itemprop="datePublished">
  const itemprop = html.match(/<meta[^>]+itemprop=["']datePublished["'][^>]+content=["']([^"']+)["']/i)
                 || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+itemprop=["']datePublished["']/i);
  if (itemprop) tries.push({ source: "itemprop:datePublished", raw: itemprop[1] });

  // 4. JSON-LD
  const ldRe = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let ldMatch;
  while ((ldMatch = ldRe.exec(html)) !== null) {
    try {
      const json = JSON.parse(ldMatch[1].trim());
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item && typeof item === "object" && item.datePublished) {
          tries.push({ source: "json-ld:datePublished", raw: item.datePublished });
        }
        // Some sites wrap in @graph
        if (item && Array.isArray(item["@graph"])) {
          for (const g of item["@graph"]) {
            if (g?.datePublished) tries.push({ source: "json-ld:@graph.datePublished", raw: g.datePublished });
          }
        }
      }
    } catch {
      // ignore malformed JSON-LD
    }
  }

  // 5. First <time datetime="...">
  const t = html.match(/<time[^>]+datetime=["']([^"']+)["']/i);
  if (t) tries.push({ source: "time[datetime]", raw: t[1] });

  // 6. Twitter card publish date
  const twd = html.match(/<meta[^>]+name=["']twitter:data1["'][^>]+content=["']([^"']+)["']/i);
  if (twd) tries.push({ source: "twitter:data1", raw: twd[1] });

  // Normalize and pick the first valid
  for (const t of tries) {
    const iso = normalizeDate(t.raw);
    if (iso) return { date: iso, source: t.source, raw: t.raw };
  }
  return null;
}

// ─── Fetch + parse a single URL with timeout ──────────────────────────────
async function fetchUrlDate(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; NFTNYC-DateAudit/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });
    if (!res.ok) return { error: `HTTP ${res.status}` };
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return { error: `non-html (${ct})` };
    }
    const html = await res.text();
    const found = extractDate(html);
    if (!found) return { error: "no date found" };
    return found;
  } catch (err) {
    return { error: err.name === "AbortError" ? "timeout" : String(err) };
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Main ────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const verticals = args.length ? args : null;

console.log(`→ Fetching resources${verticals ? " for " + verticals.join(", ") : " (all verticals)"}…`);
const resources = await fetchResources(verticals);
console.log(`  ${resources.length} resources`);

const DELTA_THRESHOLD_DAYS = 14; // only flag when stored date is off by this much

const csvRows = ["vertical_id,id,source,title,stored_date,detected_date,delta_days,detection_source,url"];
const sqlLines = [
  "-- Generated by scripts/audit-resource-dates.mjs",
  `-- Run: date ${new Date().toISOString()}`,
  "-- Review each statement before applying. Comments show detection source + delta.",
  "",
];

let audited = 0, fixed = 0, errors = 0, exact = 0;

for (const r of resources) {
  audited++;
  const storedIso = (r.date ?? "").slice(0, 10);
  process.stdout.write(`  [${audited}/${resources.length}] ${r.vertical_id.padEnd(6)} ${r.title.slice(0, 60).padEnd(60)} `);
  const result = await fetchUrlDate(r.url);
  if (result.error) {
    errors++;
    console.log(`✗ ${result.error}`);
    csvRows.push(quoteCsv([r.vertical_id, r.id, r.source, r.title, storedIso, "", "", "error: " + result.error, r.url]));
    continue;
  }
  const { date: detected, source: detectSrc } = result;
  if (!storedIso) {
    console.log(`+ ${detected} (was empty)`);
  } else if (detected === storedIso) {
    exact++;
    console.log(`✓ ${storedIso}`);
    csvRows.push(quoteCsv([r.vertical_id, r.id, r.source, r.title, storedIso, detected, "0", detectSrc, r.url]));
    continue;
  }
  const delta = Math.round((new Date(storedIso || detected) - new Date(detected)) / 86400000);
  csvRows.push(quoteCsv([r.vertical_id, r.id, r.source, r.title, storedIso, detected, String(delta), detectSrc, r.url]));

  if (Math.abs(delta) >= DELTA_THRESHOLD_DAYS || !storedIso) {
    fixed++;
    sqlLines.push(
      `-- ${r.vertical_id}  delta=${delta}d  source=${detectSrc}  title=${JSON.stringify(r.title)}`,
      `UPDATE resources SET date = '${detected}' WHERE id = '${r.id}';`
    );
    console.log(`⚠ was ${storedIso || "(empty)"}  →  ${detected}  (Δ${delta}d)`);
  } else {
    console.log(`~ ${storedIso} → ${detected}  (Δ${delta}d, below threshold)`);
  }
}

writeFileSync(join(OUT_DIR, "date-audit.csv"), csvRows.join("\n"));
writeFileSync(join(OUT_DIR, "date-audit.sql"), sqlLines.join("\n"));

console.log(`\n────────────────────────────────────────`);
console.log(`  Audited:       ${audited}`);
console.log(`  Exact match:   ${exact}`);
console.log(`  Errors:        ${errors}`);
console.log(`  To update:     ${fixed}  (delta ≥ ${DELTA_THRESHOLD_DAYS} days)`);
console.log(`\nOutputs:`);
console.log(`  ${join(OUT_DIR, "date-audit.csv").replace(ROOT + "/", "")}`);
console.log(`  ${join(OUT_DIR, "date-audit.sql").replace(ROOT + "/", "")}`);

function quoteCsv(arr) {
  return arr.map(v => {
    const s = String(v ?? "");
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  }).join(",");
}
