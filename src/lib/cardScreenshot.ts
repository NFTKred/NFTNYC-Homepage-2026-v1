import { supabase } from '@/lib/supabase';

/**
 * Card screenshot pipeline — server-side via the regen-card-screenshot edge
 * function (which uses thum.io as primary and Microlink as fallback).
 *
 * Previously this module ran html2canvas client-side in an invisible iframe.
 * That was unreliable: silent failures when the admin tab wasn't focused,
 * CORS-tainted canvases for some publisher CDNs, and an object-fit bug that
 * stretched portrait headshots. The server-side pipeline is slower per
 * capture (~10-30s vs ~5s) but always works regardless of the admin's
 * browser state.
 *
 * Public API kept stable so existing callers (scheduleCardScreenshot,
 * generateCardScreenshot, generateCardScreenshotsBatch) continue to work.
 */

async function invokeRegen(resourceId: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('regen-card-screenshot', {
    body: { resourceId },
  });
  if (error) {
    let detail = error.message || 'Unknown error';
    try {
      const ctx: any = (error as any).context;
      if (ctx && typeof ctx.text === 'function') {
        const body = await ctx.text();
        if (body) detail = body;
      }
    } catch { /* ignore */ }
    throw new Error(`regen-card-screenshot failed: ${detail}`);
  }
  if (data?.error) {
    throw new Error(`regen-card-screenshot returned error: ${data.error} ${JSON.stringify(data.details ?? {})}`);
  }
  if (!data?.url) {
    throw new Error('regen-card-screenshot returned no url');
  }
  return data.url as string;
}

/**
 * Generate a card screenshot for the given resource and persist the public
 * URL to the `resources` row. Returns the new URL. Awaitable.
 */
export async function generateCardScreenshot(resourceId: string): Promise<string> {
  return invokeRegen(resourceId);
}

/**
 * Fire-and-forget wrapper around `generateCardScreenshot`. Used after
 * resource saves and pending → approved transitions so card previews
 * regenerate automatically without blocking the user. Errors are logged
 * but never bubble up — a stale screenshot is annoying but shouldn't
 * fail the save flow.
 *
 * Per-resource debouncing: rapid repeat calls for the same id let the
 * in-flight one finish, then queue exactly one fresh regen on top so
 * the latest state is captured.
 */
const pendingRegens = new Map<string, Promise<string>>();

export function scheduleCardScreenshot(resourceId: string): void {
  const existing = pendingRegens.get(resourceId);
  const run = (): Promise<string> => {
    const p = invokeRegen(resourceId).finally(() => {
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
 * Generate card screenshots for many resources sequentially. Fronts a progress
 * callback so the admin can render a `Capturing X/Y…` status. Sequential so
 * the upstream providers (thum.io / Microlink) don't get hit with a burst.
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
      await invokeRegen(id);
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
