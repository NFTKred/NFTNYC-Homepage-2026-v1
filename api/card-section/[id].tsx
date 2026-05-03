// Vercel Edge function — returns a PNG screenshot of the existing
// /card/<id> React page (which renders the "Latest on <Vertical>"
// section with the resource as the top card + 2 neighbors).
//
// We use thum.io as the primary screenshot service, with Microlink as
// a fallback. The result is cached at Vercel's edge for 30 minutes so
// repeat opens of the same email don't burn through provider quotas —
// only the first viewer triggers an upstream render.
//
// Route: /api/card-section/<resourceId>

export const config = {
  runtime: 'edge',
};

const TARGET_BASE = 'https://www.nft.nyc/card';

async function fetchFromThumio(resourceId: string): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; reason: string }> {
  const target = `${TARGET_BASE}/${resourceId}`;
  // wait=15 gives the React page time to fetch its data and render the
  // hero image plus 2 neighbor cards before thum.io snaps the shot.
  const apiUrl = `https://image.thum.io/get/width/1080/png/viewportWidth/1080/noanimate/wait/15/noCache/${encodeURI(target)}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25_000);
    const res = await fetch(apiUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { ok: false, reason: `thumio ${res.status}` };
    const buf = new Uint8Array(await res.arrayBuffer());
    // thum.io occasionally returns a tiny placeholder when it's throttling;
    // require ≥40 KB so those don't get cached as the result.
    if (buf.length < 40_000) return { ok: false, reason: `thumio tiny (${buf.length}b)` };
    return { ok: true, bytes: buf };
  } catch (e) {
    return { ok: false, reason: `thumio err ${(e as Error).message}` };
  }
}

async function fetchFromMicrolink(resourceId: string): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; reason: string }> {
  const target = `${TARGET_BASE}/${resourceId}`;
  const params = new URLSearchParams({
    url: target,
    screenshot: 'true',
    meta: 'false',
    'viewport.width': '1080',
    'viewport.height': '1600',
    'viewport.deviceScaleFactor': '2',
    waitUntil: 'networkidle0',
    wait: '8000',
    type: 'png',
    fullPage: 'true',
  });
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 25_000);
    const meta = await fetch(`https://api.microlink.io/?${params.toString()}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!meta.ok) return { ok: false, reason: `microlink meta ${meta.status}` };
    const json = await meta.json();
    const shotUrl: string | undefined = json?.data?.screenshot?.url;
    if (!shotUrl) return { ok: false, reason: 'microlink no screenshot url' };
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 15_000);
    const img = await fetch(shotUrl, { signal: ctrl2.signal });
    clearTimeout(t2);
    if (!img.ok) return { ok: false, reason: `microlink img ${img.status}` };
    const buf = new Uint8Array(await img.arrayBuffer());
    if (buf.length < 40_000) return { ok: false, reason: `microlink tiny (${buf.length}b)` };
    return { ok: true, bytes: buf };
  } catch (e) {
    return { ok: false, reason: `microlink err ${(e as Error).message}` };
  }
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
      return new Response('Invalid resource id', { status: 400 });
    }

    // Try thum.io first (faster), fall back to Microlink on any failure.
    let result = await fetchFromThumio(id);
    let provider = 'thumio';
    if (!result.ok) {
      console.warn(`thum.io failed for ${id}: ${result.reason}; trying microlink`);
      const second = await fetchFromMicrolink(id);
      if (!second.ok) {
        console.error(`both providers failed for ${id}: ${result.reason} | ${second.reason}`);
        return new Response(`Failed to render: ${result.reason} | ${second.reason}`, { status: 502 });
      }
      result = second;
      provider = 'microlink';
    }

    return new Response(result.bytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        // Cache at Vercel's edge for 30 minutes. Repeat opens of the same
        // email by the recipient hit the edge cache and never re-hit the
        // upstream screenshot provider — keeps thum.io / Microlink quotas
        // safe even for popular emails. The admin's ?v=<timestamp> URL
        // suffix invalidates this cache automatically when a new draft is
        // copied so freshly-edited resources show up right away.
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'X-Provider': provider,
      },
    });
  } catch (err) {
    console.error('card-section error:', err);
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }
}
