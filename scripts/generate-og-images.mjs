#!/usr/bin/env node
/**
 * Generates social preview PNGs for every vertical in two formats:
 *   - Landscape 1200×630 (OG, Twitter/X, LinkedIn, Facebook, Discord unfurls)
 *   - Square 1080×1080 (Instagram feed)
 *
 * Renders by opening `public/og-render/index.html?slug=<id>&format=<landscape|square>`
 * against a local static server, waits for fonts/images to load, and screenshots the
 * root card element at exact pixel dimensions.
 *
 * Output lands in public/og/<slug>.png and public/og/<slug>-square.png — both
 * committed so they're served at nft.nyc/og/<slug>.png etc.
 */

import puppeteer from "puppeteer";
import { createServer } from "http";
import { createReadStream, existsSync, statSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname);
const PUBLIC_DIR = join(ROOT, "public");
const OUT_DIR = join(PUBLIC_DIR, "og");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const SLUGS = [
  "ai", "gaming", "infra", "social", "creator", "defi",
  "rwa", "brands", "culture", "domains", "desci", "marketplaces",
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".svg":  "image/svg+xml",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".woff": "font/woff",
  ".woff2":"font/woff2",
  ".ttf":  "font/ttf",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

// Minimal static server that serves files out of /public.
function startServer(port = 4901) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(req.url.split("?")[0]);
    let filePath = join(PUBLIC_DIR, urlPath);
    if (existsSync(filePath) && statSync(filePath).isDirectory()) {
      filePath = join(filePath, "index.html");
    }
    if (!existsSync(filePath)) {
      res.statusCode = 404;
      return res.end("Not found: " + urlPath);
    }
    const ext = extname(filePath).toLowerCase();
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    res.setHeader("Cache-Control", "no-cache");
    createReadStream(filePath).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, () => resolve({ server, url: `http://localhost:${port}` }));
  });
}

async function screenshotOne(browser, baseUrl, slug, format) {
  const { width, height } = format === "square"
    ? { width: 1080, height: 1080 }
    : { width: 1200, height: 630 };

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  const target = `${baseUrl}/og-render/?slug=${slug}&format=${format}`;
  await page.goto(target, { waitUntil: "networkidle0" });
  // The render page flips data-ready="1" when fonts + logo have loaded.
  await page.waitForSelector("html[data-ready='1']", { timeout: 10_000 });
  // Small extra buffer for font antialiasing
  await new Promise(r => setTimeout(r, 150));

  const el = await page.$(".og");
  if (!el) throw new Error(`No .og element found for ${slug} ${format}`);
  const filename = format === "square" ? `${slug}-square.png` : `${slug}.png`;
  const outPath = join(OUT_DIR, filename);
  await el.screenshot({ path: outPath, omitBackground: false });
  await page.close();
  return outPath;
}

async function main() {
  console.log("→ starting static server");
  const { server, url: baseUrl } = await startServer();
  console.log(`  serving public/ at ${baseUrl}`);

  console.log("→ launching chromium");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    let count = 0;
    for (const slug of SLUGS) {
      for (const format of ["landscape", "square"]) {
        process.stdout.write(`  [${++count}/${SLUGS.length * 2}] ${slug} (${format}) ... `);
        const out = await screenshotOne(browser, baseUrl, slug, format);
        console.log("✓ " + out.replace(ROOT + "/", ""));
      }
    }
  } finally {
    await browser.close();
    server.close();
  }
  console.log("✔ all images rendered to public/og/");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
