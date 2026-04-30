#!/usr/bin/env node
/**
 * Generates the "12 hours left" Speak countdown video assets.
 *
 *   For each format (landscape 1200×630, square 1080×1080):
 *     1. Renders the speak countdown card via /og-render/?slug=speak&countdown=1
 *     2. Captures one PNG per frame at 30fps for 15 seconds (450 frames),
 *        pinning the timer to an exact second per frame via the page's
 *        window.setCountdown() setter — fully deterministic.
 *     3. Stitches frames into an MP4 via ffmpeg (H.264, yuv420p, ~5 Mbps).
 *     4. Saves the first frame as a static PNG fallback.
 *
 * Output:
 *   public/og-videos/speak-countdown.mp4               (1200×630)
 *   public/og-videos/speak-countdown-square.mp4        (1080×1080)
 *   public/og-videos/speak-countdown.png               (12:00:00 still, landscape)
 *   public/og-videos/speak-countdown-square.png        (12:00:00 still, square)
 *
 * Run:    node scripts/generate-og-video.mjs
 *
 * Requires: puppeteer (already a devDep) and ffmpeg on PATH.
 */

import puppeteer from "puppeteer";
import { spawn } from "child_process";
import { createServer } from "http";
import { createReadStream, existsSync, statSync, mkdirSync, rmSync, copyFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join, extname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname);
const PUBLIC_DIR = join(ROOT, "public");
const OUT_DIR = join(PUBLIC_DIR, "og-videos");
const TMP_DIR = join(ROOT, ".tmp-og-frames");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const FPS = 30;
const DURATION_SECONDS = 15;
const FRAME_COUNT = FPS * DURATION_SECONDS; // 450 frames
const COUNTDOWN_START_SECONDS = 12 * 3600;  // 12:00:00

const VARIANTS = [
  { format: "landscape", width: 1200, height: 630, mp4: "speak-countdown.mp4", still: "speak-countdown.png" },
  { format: "square",    width: 1080, height: 1080, mp4: "speak-countdown-square.mp4", still: "speak-countdown-square.png" },
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
  ".mp4":  "video/mp4",
};

function startServer(port = 4902) {
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

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "inherit"] });
    proc.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    proc.on("error", reject);
  });
}

async function renderVariant(browser, baseUrl, variant) {
  const { format, width, height, mp4, still } = variant;
  console.log(`\n→ ${format.padEnd(10)} ${width}×${height}`);

  // Per-variant frames directory.
  const framesDir = join(TMP_DIR, format);
  if (existsSync(framesDir)) rmSync(framesDir, { recursive: true });
  mkdirSync(framesDir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });

  const target = `${baseUrl}/og-render/?slug=speak&type=page&format=${format}&countdown=1`;
  await page.goto(target, { waitUntil: "networkidle0" });
  await page.waitForSelector("html[data-ready='1']", { timeout: 10_000 });
  // Brief settle for fonts.
  await new Promise(r => setTimeout(r, 250));

  // Capture deterministic frames. Pin the timer to an exact remaining
  // value per frame, screenshot, advance.
  console.log(`  capturing ${FRAME_COUNT} frames…`);
  const t0 = Date.now();
  for (let i = 0; i < FRAME_COUNT; i++) {
    const remaining = COUNTDOWN_START_SECONDS - i / FPS;
    await page.evaluate((r) => window.setCountdown(r), remaining);
    const padded = String(i).padStart(4, "0");
    await page.screenshot({
      path: join(framesDir, `${padded}.png`),
      omitBackground: false,
    });
    if (i % 60 === 0) {
      process.stdout.write(`    frame ${i}/${FRAME_COUNT}\r`);
    }
  }
  const dt = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`  captured in ${dt}s`);

  // Save the first frame as the static PNG fallback.
  const stillSrc = join(framesDir, "0000.png");
  const stillDst = join(OUT_DIR, still);
  copyFileSync(stillSrc, stillDst);
  console.log(`  ✓ still   → public/og-videos/${still}`);

  // Encode MP4 with ffmpeg. yuv420p + even-dimensions ensures broad
  // platform compatibility (X, IG, LinkedIn, Discord, mobile Safari).
  const mp4Out = join(OUT_DIR, mp4);
  if (existsSync(mp4Out)) rmSync(mp4Out);
  await runFfmpeg([
    "-loglevel", "error",
    "-framerate", String(FPS),
    "-i", join(framesDir, "%04d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "slow",
    "-crf", "20",
    "-movflags", "+faststart",
    mp4Out,
  ]);
  console.log(`  ✓ mp4     → public/og-videos/${mp4}`);

  await page.close();
}

async function main() {
  console.log("→ starting static server");
  const { server, url: baseUrl } = await startServer();

  console.log("→ launching chromium");
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const v of VARIANTS) {
      await renderVariant(browser, baseUrl, v);
    }
  } finally {
    await browser.close();
    server.close();
    if (existsSync(TMP_DIR)) rmSync(TMP_DIR, { recursive: true });
  }
  console.log("\n✔ all assets rendered to public/og-videos/");
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
