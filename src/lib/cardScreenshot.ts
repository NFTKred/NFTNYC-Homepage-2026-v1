import { supabase } from '@/lib/supabase';

const BUCKET = 'resource-card-screenshots';
// thum.io captures the full page at this width. The preview route has no
// header/footer/nav, so the page IS just the "Latest on X" header + the
// speaker's card + 2 neighbor cards — exactly what we want in the image.
const CARD_WIDTH = 960;
// thum.io fires the capture after `wait` seconds. Large hero images (e.g.
// PRNewswire's 2694×1414 Monaco logo, Algorand's OG banner) sometimes take
// 8–12s to load. 15s is conservative but reliable; the alternative is
// producing screenshots missing the hero image, which defeats the purpose.
const THUMIO_WAIT_SECONDS = 15;
// If thum.io returns a blob smaller than this, the capture is almost
// certainly a rendering failure (blank/partial page). Retry at this point.
const MIN_BLOB_BYTES = 20_000;
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

/**
 * Ask thum.io to screenshot the card preview page and return the raw
 * png bytes. thum.io is free, has no hard rate limit, and handles our
 * dark-themed preview route cleanly.
 *
 * Retries with a cache-buster when thum.io returns a suspiciously small
 * blob (its occasional failure mode is an empty/near-empty PNG when the
 * headless browser gives up before the page fully renders).
 */
async function fetchCardScreenshot(resourceId: string): Promise<Blob> {
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
        lastError = new Error(`Screenshot failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
        continue;
      }
      const blob = await res.blob();
      if (blob.size < MIN_BLOB_BYTES) {
        lastError = new Error(`Screenshot too small (${blob.size} bytes) — likely a rendering failure`);
        continue;
      }
      return blob;
    } catch (e) {
      lastError = e as Error;
    }
  }

  throw lastError ?? new Error('Screenshot failed for unknown reasons');
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
