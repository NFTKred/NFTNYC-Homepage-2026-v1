import { supabase } from '@/lib/supabase';

const BUCKET = 'resource-card-screenshots';
// Capture width. The preview route has no header/footer/nav, so the page
// IS just the "Latest on X" header + the speaker's card + 2 neighbor
// cards — exactly what we want in the image.
const CARD_WIDTH = 960;
// thum.io fires the capture after `wait` seconds. Large hero images (e.g.
// PRNewswire's 2694×1414 Monaco logo, Algorand's OG banner) sometimes take
// 8–12s to load. 15s is conservative but reliable; the alternative is
// producing screenshots missing the hero image, which defeats the purpose.
const THUMIO_WAIT_SECONDS = 15;
// Minimum expected bytes for a valid capture. thum.io's known failure modes:
//  (a) empty/near-empty PNG when the headless browser gives up before the
//      page renders (tiny file, ~few KB);
//  (b) a ~22KB "Image not authorized. Please sign-up for a paid account"
//      placeholder when it decides to throttle the caller.
// 40 KB rejects both without cutting off legitimate captures (smallest real
// captures we've seen are ~450 KB).
const MIN_BLOB_BYTES = 40_000;
// Supabase storage bucket limit is 5 MiB. Stay comfortably under that — at
// scale=2 a retina PNG can easily be 6–10 MB, so we output JPEG instead.
// JPEG at 0.85 typically yields ~200–800 KB for these cards with no
// perceptible quality loss in email clients.
const MAX_BLOB_BYTES = 4_500_000;
const JPEG_QUALITY_HIGH = 0.85;
const JPEG_QUALITY_FALLBACK = 0.65;
const MAX_RETRIES = 2;

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

/**
 * Build the public URL of the /card/:resourceId preview route on the
 * production origin. Baking in prod means thum.io can reach the page
 * even when the admin is running locally or on a Lovable preview URL
 * (which would require a cookie).
 */
function cardPreviewUrl(resourceId: string): string {
  return `https://www.nft.nyc/card/${resourceId}`;
}

/**
 * Primary provider — capture the card preview in an invisible iframe inside
 * the caller's browser tab, then convert the DOM to a PNG via html2canvas.
 *
 * Upside: no external service, no rate limits, pixel-perfect since it's
 * literally our own rendered page.
 *
 * Downside: needs the admin tab to be open (but resource saves happen from
 * admin so this is always true), and third-party hero images must be CORS-
 * enabled for html2canvas to include them in the canvas.
 *
 * Many publisher CDNs (CoinDesk's Sanity CDN, Rolling Stone, etc.) do NOT
 * send Access-Control-Allow-Origin, which would cause html2canvas to silently
 * drop those images and produce a card with only the title visible. To work
 * around this, we route every cross-origin <img> through a free public CORS-
 * adding proxy (images.weserv.nl) before capture. Same-origin images and
 * data URLs are left alone.
 *
 * After capture, if a majority of <img> elements failed to load (naturalWidth
 * === 0), we throw so the fallback chain (thum.io, Microlink) takes over
 * instead of saving an image-less card.
 */
const WESERV_PROXY = 'https://images.weserv.nl';

/**
 * Rewrite cross-origin <img> srcs in the iframe document to go through a
 * CORS-friendly proxy. Returns the list of imgs that were rewritten so the
 * caller can re-await their loads.
 *
 * Also pre-crops the proxied image to match the rendered container's
 * dimensions, so html2canvas — which has known shortcomings around
 * `object-fit: cover` — doesn't end up stretching small portraits
 * (e.g. 403×454 headshots) to fill the 1.91:1 wide hero area.
 */
function proxyCrossOriginImages(doc: Document, ourOrigin: string): HTMLImageElement[] {
  const imgs = Array.from(doc.querySelectorAll('img'));
  const rewritten: HTMLImageElement[] = [];
  for (const img of imgs) {
    const src = img.src;
    if (!src) continue;
    if (src.startsWith('data:')) continue;
    if (src.startsWith(ourOrigin)) continue;
    if (src.startsWith(WESERV_PROXY)) continue;
    // weserv.nl expects the upstream URL without a scheme.
    const stripped = src.replace(/^https?:\/\//, '');
    // Measure the on-page rendered size of this img (in CSS px) so weserv
    // returns an already-cropped, already-sized image. Request 2x for retina.
    // Falls back to a sane default if measurements aren't available yet.
    const rect = img.getBoundingClientRect();
    const cssW = Math.round(rect.width) || 960;
    const cssH = Math.round(rect.height) || 502;
    const targetW = cssW * 2;
    const targetH = cssH * 2;
    const params = new URLSearchParams({
      url: stripped,
      w: String(targetW),
      h: String(targetH),
      fit: 'cover',
      a: 'attention', // smart-crop: focus on the salient region (faces, etc.)
    });
    img.crossOrigin = 'anonymous';
    img.src = `${WESERV_PROXY}/?${params.toString()}`;
    rewritten.push(img);
  }
  return rewritten;
}

function awaitImageLoads(imgs: HTMLImageElement[]): Promise<void[]> {
  return Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.onload = () => res();
            img.onerror = () => res();
          })
    )
  );
}
async function fetchFromHtml2Canvas(resourceId: string): Promise<Blob> {
  // Dynamic import keeps the ~48KB html2canvas bundle out of the initial
  // page load — only the admin tab pays the cost, and only when it captures.
  const { default: html2canvas } = await import('html2canvas');

  return new Promise((resolve, reject) => {
    const iframe = document.createElement('iframe');
    iframe.setAttribute('aria-hidden', 'true');
    iframe.style.cssText =
      'position:fixed;left:-9999px;top:0;width:1000px;height:1800px;border:none;pointer-events:none;';
    // Same-origin path — card route lives on the same host as /admin, so
    // we can reach into the iframe's document after load.
    iframe.src = `/card/${resourceId}?capture=${Date.now()}`;

    let settled = false;
    const timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      iframe.remove();
      reject(new Error('html2canvas iframe load timeout (30s)'));
    }, 30_000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      iframe.remove();
    };

    iframe.onload = async () => {
      try {
        const doc = iframe.contentDocument;
        if (!doc) throw new Error('no contentDocument (sandbox issue?)');

        // First wait — let the page finish its initial load so React Query
        // has populated the cards and the original <img src> values are set.
        const initialImgs = Array.from(doc.querySelectorAll('img'));
        await awaitImageLoads(initialImgs);

        // Reroute cross-origin images through a CORS-adding proxy. Without
        // this, publisher CDNs that don't send CORS headers (Sanity, Rolling
        // Stone, etc.) cause html2canvas to silently drop them, producing a
        // card with only the title visible.
        const ourOrigin = iframe.contentWindow?.location.origin ?? window.location.origin;
        const rewritten = proxyCrossOriginImages(doc, ourOrigin);
        if (rewritten.length > 0) {
          await awaitImageLoads(rewritten);
        }

        // Validate: if a majority of imgs failed to load (naturalWidth === 0),
        // bail so the fallback providers can have a turn. This catches both
        // CORS proxy failures and broken image URLs.
        const allImgs = Array.from(doc.querySelectorAll('img'));
        if (allImgs.length > 0) {
          const failed = allImgs.filter((img) => img.naturalWidth === 0).length;
          if (failed / allImgs.length > 0.5) {
            throw new Error(
              `${failed}/${allImgs.length} images failed to load — falling back to server-side capture`,
            );
          }
        }

        // Small extra delay for web fonts + any CSS transitions on the card.
        await new Promise((r) => setTimeout(r, 400));

        const target = doc.querySelector<HTMLElement>('[data-card-preview]');
        if (!target) throw new Error('[data-card-preview] element not found in iframe');

        const canvas = await html2canvas(target, {
          useCORS: true,       // fetch cross-origin images with CORS
          allowTaint: false,   // reject tainted canvases (we'd rather fall back)
          backgroundColor: '#0a0a14',
          scale: 2,            // retina-quality output
          width: 960,
          height: target.scrollHeight,
          // The iframe is not part of the parent DOM tree; tell html2canvas
          // to use the iframe's own window/document so layout measurements
          // are correct.
          windowWidth: 960,
          windowHeight: target.scrollHeight,
        });

        // Output JPEG (not PNG) so the file fits under the 5 MiB Supabase
        // bucket cap. Quality 0.85 is visually indistinguishable from PNG
        // for these cards but ~5–10x smaller. If 0.85 is still over budget
        // (e.g. very tall card with lots of detail), retry at 0.65.
        let blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY_HIGH);
        if (blob && blob.size > MAX_BLOB_BYTES) {
          console.warn(
            `[cardScreenshot] ${blob.size} bytes at q=${JPEG_QUALITY_HIGH} exceeds cap, retrying at q=${JPEG_QUALITY_FALLBACK}`,
          );
          blob = await canvasToBlob(canvas, 'image/jpeg', JPEG_QUALITY_FALLBACK);
        }
        if (settled) return;
        settled = true;
        cleanup();
        if (!blob) return reject(new Error('canvas.toBlob returned null'));
        if (blob.size < MIN_BLOB_BYTES) {
          return reject(new Error(`html2canvas blob too small (${blob.size} bytes)`));
        }
        if (blob.size > MAX_BLOB_BYTES) {
          return reject(
            new Error(
              `html2canvas blob too large (${blob.size} bytes) even at q=${JPEG_QUALITY_FALLBACK}`,
            ),
          );
        }
        resolve(blob);
      } catch (e) {
        if (settled) return;
        settled = true;
        cleanup();
        reject(e as Error);
      }
    };

    document.body.appendChild(iframe);
  });
}

/** Secondary provider — thum.io, free but quota-limited on the free tier. */
async function fetchFromThumio(resourceId: string): Promise<Blob> {
  const targetUrl = cardPreviewUrl(resourceId);
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // `noCache` + a changing query param forces a fresh render each retry.
    const cacheBust = attempt === 0 ? '' : `?retry=${Date.now()}`;
    const apiUrl =
      `https://image.thum.io/get/width/${CARD_WIDTH}/png/viewportWidth/${CARD_WIDTH}` +
      `/noanimate/wait/${THUMIO_WAIT_SECONDS}/noCache/${targetUrl}${cacheBust}`;

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) {
        lastError = new Error(`thum.io HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
        continue;
      }
      const blob = await res.blob();
      if (blob.size < MIN_BLOB_BYTES) {
        lastError = new Error(`thum.io returned ${blob.size}-byte blob (likely throttle/render failure)`);
        continue;
      }
      return blob;
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError ?? new Error('thum.io failed for unknown reasons');
}

/** Fallback provider — Microlink. Slower but different infra, so when thum.io
 *  hits its quota or can't render our page, Microlink usually works. */
async function fetchFromMicrolink(resourceId: string): Promise<Blob> {
  const targetUrl = cardPreviewUrl(resourceId);
  const apiUrl =
    'https://api.microlink.io/?' +
    new URLSearchParams({
      url: targetUrl,
      screenshot: 'true',
      meta: 'false',
      embed: 'screenshot.url',
      'viewport.width': String(CARD_WIDTH),
      'viewport.height': '1600',
      'viewport.deviceScaleFactor': '2',
      waitUntil: 'networkidle0',
      element: '[data-card-preview]',
      type: 'png',
    }).toString();

  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Microlink HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const blob = await res.blob();
  if (blob.size < MIN_BLOB_BYTES) throw new Error(`Microlink returned ${blob.size}-byte blob`);
  return blob;
}

/**
 * Three-tier capture pipeline:
 *
 *   1. html2canvas (client-side, no rate limits, no external service) — the
 *      reliable primary. Requires the admin tab to be open (always true
 *      when we're regen'ing after a resource save from admin).
 *   2. thum.io — secondary. Free tier has a daily quota; when exceeded it
 *      returns a ~22KB "Image not authorized" placeholder.
 *   3. Microlink — tertiary. Free tier allows ~50 req/day; 429 after that.
 *
 * Any provider that throws drops through to the next. The combined message
 * preserves all three errors so you can tell from the console which layer
 * failed.
 */
async function fetchCardScreenshot(resourceId: string): Promise<Blob> {
  let h2cErr: Error | null = null;
  let thumioErr: Error | null = null;

  try {
    return await fetchFromHtml2Canvas(resourceId);
  } catch (e) {
    h2cErr = e as Error;
    console.warn(`[cardScreenshot] html2canvas failed for ${resourceId}, falling back to thum.io:`, h2cErr.message);
  }

  try {
    return await fetchFromThumio(resourceId);
  } catch (e) {
    thumioErr = e as Error;
    console.warn(`[cardScreenshot] thum.io failed for ${resourceId}, falling back to Microlink:`, thumioErr.message);
  }

  try {
    return await fetchFromMicrolink(resourceId);
  } catch (mlErr) {
    throw new Error(
      `All three providers failed. ` +
      `html2canvas: ${h2cErr?.message}. ` +
      `thum.io: ${thumioErr?.message}. ` +
      `microlink: ${(mlErr as Error).message}`
    );
  }
}

/**
 * Generate a card screenshot for the given resource, upload it to Supabase
 * storage, and persist the public URL on the resource row. Returns the
 * stored public URL.
 *
 * Overwrites any existing screenshot at the same storage path so repeated
 * calls are idempotent and always return a URL that reflects the current
 * state of the page.
 */
export async function generateCardScreenshot(resourceId: string): Promise<string> {
  const blob = await fetchCardScreenshot(resourceId);
  // Match the file extension to the actual blob type. html2canvas now produces
  // JPEG (smaller, fits the 5 MiB bucket cap); thum.io and Microlink produce
  // PNG. Naming the file after the real type keeps the storage URL truthful
  // and avoids any browser mime-sniffing edge cases.
  const ext = blob.type === 'image/jpeg' ? 'jpg' : 'png';
  const contentType = blob.type === 'image/jpeg' ? 'image/jpeg' : 'image/png';
  const path = `${resourceId}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType, upsert: true });
  if (uploadErr) throw new Error(`Storage upload failed: ${uploadErr.message}`);

  const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Cache-buster so downstream email clients don't serve a stale copy when
  // the resource is regenerated.
  const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;

  const { error: updateErr } = await supabase
    .from('resources')
    .update({ card_screenshot: publicUrl })
    .eq('id', resourceId);
  if (updateErr) throw new Error(`Failed to save card_screenshot URL: ${updateErr.message}`);

  return publicUrl;
}

/**
 * Fire-and-forget wrapper around `generateCardScreenshot`. Used after
 * resource mutations so saving a resource automatically refreshes its
 * embedded card preview — the user doesn't have to remember to click the
 * camera button. Errors are logged to the console but don't bubble up:
 * a stale card screenshot is annoying but shouldn't block the save flow.
 *
 * Debounces per-resource: multiple rapid calls for the same id coalesce
 * into a single regeneration (the last one wins), so back-to-back edits
 * don't stack up into a queue of redundant captures.
 */
const pendingRegens = new Map<string, Promise<string>>();

export function scheduleCardScreenshot(resourceId: string): void {
  // Coalesce: if a regen is already in flight for this id, let it finish;
  // when it does, kick off a fresh one so the latest resource state is
  // captured (the in-flight one might have pulled pre-edit data).
  const existing = pendingRegens.get(resourceId);
  const run = (): Promise<string> => {
    const p = generateCardScreenshot(resourceId).finally(() => {
      // Only clear if nothing else queued on top
      if (pendingRegens.get(resourceId) === p) pendingRegens.delete(resourceId);
    });
    pendingRegens.set(resourceId, p);
    return p;
  };

  if (existing) {
    existing
      .catch(() => {})
      .then(() => run())
      .catch((e: unknown) => console.warn(`[scheduleCardScreenshot] ${resourceId}:`, e));
  } else {
    run().catch((e: unknown) => console.warn(`[scheduleCardScreenshot] ${resourceId}:`, e));
  }
}

/**
 * Generate card screenshots for many resources, sequentially so thum.io
 * isn't hit with a burst. Yields progress via the optional callback.
 */
export async function generateCardScreenshotsBatch(
  resourceIds: string[],
  onProgress?: (done: number, total: number, currentId: string, error?: Error) => void,
): Promise<{ ok: string[]; failed: Array<{ id: string; error: string }> }> {
  const ok: string[] = [];
  const failed: Array<{ id: string; error: string }> = [];
  for (let i = 0; i < resourceIds.length; i++) {
    const id = resourceIds[i];
    try {
      await generateCardScreenshot(id);
      ok.push(id);
      onProgress?.(i + 1, resourceIds.length, id);
    } catch (e) {
      const err = e as Error;
      failed.push({ id, error: err.message });
      onProgress?.(i + 1, resourceIds.length, id, err);
    }
  }
  return { ok, failed };
}
