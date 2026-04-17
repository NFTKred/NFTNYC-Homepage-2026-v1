import { supabase } from '@/lib/supabase';

const BUCKET = 'resource-card-screenshots';
const CARD_WIDTH = 960;
const CARD_HEIGHT = 720;

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
 * Ask Microlink to screenshot the card preview page, then return the
 * rendered image bytes (png).
 *
 * Microlink responds with JSON that includes a screenshot URL — we follow
 * that redirect and grab the bytes so we can re-host them permanently in
 * Supabase storage (Microlink URLs expire).
 */
async function fetchMicrolinkScreenshot(resourceId: string): Promise<Blob> {
  const targetUrl = cardPreviewUrl(resourceId);
  const apiUrl = new URL('https://api.microlink.io/');
  apiUrl.searchParams.set('url', targetUrl);
  apiUrl.searchParams.set('screenshot', 'true');
  apiUrl.searchParams.set('meta', 'false');
  apiUrl.searchParams.set('embed', 'screenshot.url');
  apiUrl.searchParams.set('viewport.width', String(CARD_WIDTH));
  apiUrl.searchParams.set('viewport.height', String(CARD_HEIGHT));
  apiUrl.searchParams.set('viewport.deviceScaleFactor', '2');
  apiUrl.searchParams.set('waitUntil', 'networkidle0');
  apiUrl.searchParams.set('element', '[data-card-preview]');
  apiUrl.searchParams.set('type', 'png');
  apiUrl.searchParams.set('background', '%230a0a14');

  const res = await fetch(apiUrl.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Microlink screenshot failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.startsWith('image/')) {
    return await res.blob();
  }
  // Some Microlink endpoints return JSON with a nested screenshot URL.
  const payload = await res.json();
  const imageUrl = payload?.data?.screenshot?.url ?? payload?.data?.url ?? null;
  if (!imageUrl) {
    throw new Error('Microlink response did not include a screenshot URL');
  }
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) throw new Error(`Failed to fetch screenshot image: HTTP ${imageRes.status}`);
  return await imageRes.blob();
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
  const blob = await fetchMicrolinkScreenshot(resourceId);
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
