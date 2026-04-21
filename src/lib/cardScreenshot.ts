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
const MAX_RETRIES = 2;

/**
 * Build the public URL of the /card/:resourceId preview route on the
 * production origin. Baking in prod means thum.io can reach the page
 * even when the admin is running locally or on a Lovable preview URL
 * (which would require a cookie).
 */
function cardPreviewUrl(resourceId: string): string {
  return `https://www.nft.nyc/card/${resourceId}`;
}

/** Primary screenshot provider — thum.io, free and usually reliable. */
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
 * Screenshot the card preview page and return the raw PNG bytes. Tries
 * thum.io first; falls back to Microlink if thum.io is throttling (returns
 * its "Image not authorized" placeholder) or otherwise fails.
 */
async function fetchCardScreenshot(resourceId: string): Promise<Blob> {
  try {
    return await fetchFromThumio(resourceId);
  } catch (thumioErr) {
    try {
      return await fetchFromMicrolink(resourceId);
    } catch (microlinkErr) {
      throw new Error(
        `Both providers failed. thum.io: ${(thumioErr as Error).message}. ` +
        `microlink: ${(microlinkErr as Error).message}`
      );
    }
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
  const path = `${resourceId}.png`;

  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: 'image/png', upsert: true });
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
