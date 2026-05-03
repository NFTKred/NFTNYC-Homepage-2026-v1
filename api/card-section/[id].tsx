// Vercel Edge function — returns a PNG screenshot of the existing
// /card/<id> React page (which renders the "Latest on <Vertical>"
// section with the resource as the top card + 2 neighbors).
//
// Microlink is the primary because its `fullPage: true` mode reliably
// captures the entire 3-card column at full height (~2400px). thum.io
// is the fallback — its crop param is unreliable when rate-limited
// (returns a 1080×1200 truncation showing only the top 1.5 cards).
// Result is cached at the Vercel edge for 30 minutes so repeat opens
// of the same email don't burn through provider quotas.
//
// Route: /api/card-section/<resourceId>

export const config = {
  runtime: 'edge',
};

const TARGET_BASE = 'https://www.nft.nyc/card';
// Minimum acceptable PNG height — anything shorter means we got a
// truncated render and should fall back. The /card React page renders
// at roughly 2200–2600px tall depending on neighbor card content; 1500
// is a generous floor that catches truncations like thum.io's 1200px
// default viewport-cap.
const MIN_HEIGHT_PX = 1500;

// Read the height from a PNG file's IHDR chunk. PNG signature is 8 bytes,
// then a 4-byte length, 4-byte type ("IHDR"), then 4 bytes width, 4 bytes
// height. We check height at offset 20.
function pngHeight(bytes: Uint8Array): number {
  if (bytes.length < 24) return 0;
  // Verify PNG signature
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4E || bytes[3] !== 0x47) return 0;
  return (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
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
    const t = setTimeout(() => ctrl.abort(), 22_000);
    const meta = await fetch(`https://api.microlink.io/?${params.toString()}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!meta.ok) return { ok: false, reason: `microlink meta ${meta.status}` };
    const json = await meta.json();
    const shotUrl: string | undefined = json?.data?.screenshot?.url;
    if (!shotUrl) return { ok: false, reason: 'microlink no screenshot url' };
    const ctrl2 = new AbortController();
    const t2 = setTimeout(() => ctrl2.abort(), 8_000);
    const img = await fetch(shotUrl, { signal: ctrl2.signal });
    clearTimeout(t2);
    if (!img.ok) return { ok: false, reason: `microlink img ${img.status}` };
    const buf = new Uint8Array(await img.arrayBuffer());
    if (buf.length < 40_000) return { ok: false, reason: `microlink tiny (${buf.length}b)` };
    const h = pngHeight(buf);
    if (h && h < MIN_HEIGHT_PX) return { ok: false, reason: `microlink truncated (${h}px tall)` };
    return { ok: true, bytes: buf };
  } catch (e) {
    return { ok: false, reason: `microlink err ${(e as Error).message}` };
  }
}

async function fetchFromThumio(resourceId: string): Promise<{ ok: true; bytes: Uint8Array } | { ok: false; reason: string }> {
  const target = `${TARGET_BASE}/${resourceId}`;
  // Pass the URL directly without encodeURI — thum.io's path parser doesn't
  // handle percent-encoded URLs well. crop/2600 attempts a 2600px-tall
  // capture (often respected, sometimes silently truncated when throttled).
  const apiUrl = `https://image.thum.io/get/width/1080/crop/2600/png/viewportWidth/1080/noanimate/wait/12/noCache/${target}`;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 18_000);
    const res = await fetch(apiUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return { ok: false, reason: `thumio ${res.status}` };
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.length < 40_000) return { ok: false, reason: `thumio tiny (${buf.length}b)` };
    const h = pngHeight(buf);
    if (h && h < MIN_HEIGHT_PX) return { ok: false, reason: `thumio truncated (${h}px tall)` };
    return { ok: true, bytes: buf };
  } catch (e) {
    return { ok: false, reason: `thumio err ${(e as Error).message}` };
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

    // Microlink first because fullPage is reliable. thum.io fallback if
    // microlink quota is hit or it errors.
    let result = await fetchFromMicrolink(id);
    let provider = 'microlink';
    if (!result.ok) {
      console.warn(`microlink failed for ${id}: ${result.reason}; trying thum.io`);
      const second = await fetchFromThumio(id);
      if (!second.ok) {
        console.error(`both providers failed for ${id}: ${result.reason} | ${second.reason}`);
        return new Response(`Failed to render: ${result.reason} | ${second.reason}`, { status: 502 });
      }
      result = second;
      provider = 'thumio';
    }

    return new Response(result.bytes as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800',
        'X-Provider': provider,
      },
    });
  } catch (err) {
    console.error('card-section error:', err);
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }
}
