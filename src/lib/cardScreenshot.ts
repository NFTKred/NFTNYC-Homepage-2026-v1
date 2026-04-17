import { supabase } from '@/lib/supabase';

const BUCKET = 'resource-card-screenshots';
// thum.io captures the full page at this width. The preview route has no
// header/footer/nav, so the page IS just the "Latest on X" header + the
// speaker's card + 2 neighbor cards — exactly what we want in the image.
const CARD_WIDTH = 960;

/**
 * Build the public URL of the /card/:resourceId preview route on the
 * current origin. Production URL is baked in so Microlink can hit it even
 * when the admin is running locally or on a preview deployment.
 */
function cardPreviewUrl(resourceId: string): string {
  // Always point at production so Microlink can render the authenticated
  // preview without hitting a Lovable preview URL that requires a cookie.
  return `https://www.nft.nyc/card/${resourceId}`;
}

/**
 * Ask thum.io to screenshot the card preview page and return the raw
 * png bytes. thum.io is free, has no hard rate limit, and handles our
 * dark-themed preview route cleanly.
 */
async function fetchCardScreenshot(resourceId: string): Promise<Blob> {
  const targetUrl = cardPreviewUrl(resourceId);
  const apiUrl = `https://image.thum.io/get/width/${CARD_WIDTH}/png/viewportWidth/${CARD_WIDTH}/noanimate/${targetUrl}`;

  const res = await fetch(apiUrl);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Screenshot failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const blob = await res.blob();
  if (blob.size < 20_000) {
    throw new Error(`Screenshot too small (${blob.size} bytes) — probably a rendering failure`);
  }
  return blob;
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
 * Generate card screenshots for many resources, sequentially to respect
 * Microlink rate limits. Yields progress via the optional callback.
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
