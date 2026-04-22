/**
 * fetch-og-image
 *
 * Given a URL, fetch the HTML server-side (with a real browser User-Agent so
 * antibot layers don't trip) and extract its og:image / twitter:image /
 * best-guess hero image. Replaces the Microlink metadata API, which fails on
 * antibot-protected publishers (TheBlock, CoinDesk, Bloomberg, etc.) unless
 * you pay for their PRO plan.
 *
 * Input: POST { url: string }
 * Output: { image: string | null, source: 'og' | 'twitter' | 'fallback' | null }
 */
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Spoof a real browser. News sites and CDNs routinely 403 generic fetch UAs.
const BROWSER_HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
};

function extractMeta(html: string, attr: 'property' | 'name', value: string): string | null {
  // Both orders: <meta property="og:image" content="…"> and content-first.
  const patterns = [
    new RegExp(`<meta[^>]*${attr}=["']${value}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${value}["']`, 'i'),
  ];
  for (const p of patterns) {
    const m = html.match(p);
    if (m && m[1]) return m[1].trim();
  }
  return null;
}

function resolveUrl(maybeRelative: string, base: string): string {
  try {
    return new URL(maybeRelative, base).toString();
  } catch {
    return maybeRelative;
  }
}

async function fetchImageForUrl(url: string): Promise<{ image: string | null; source: 'og' | 'twitter' | 'fallback' | null }> {
  let html: string;
  try {
    const res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' });
    if (!res.ok) return { image: null, source: null };
    html = await res.text();
  } catch {
    return { image: null, source: null };
  }

  // Decode HTML entities that appear in meta content values (&amp; → &, etc.)
  const decode = (s: string) =>
    s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  // Try meta tags in priority order
  const ogImage = extractMeta(html, 'property', 'og:image');
  if (ogImage) return { image: resolveUrl(decode(ogImage), url), source: 'og' };

  const twitterImage = extractMeta(html, 'name', 'twitter:image')
    || extractMeta(html, 'property', 'twitter:image');
  if (twitterImage) return { image: resolveUrl(decode(twitterImage), url), source: 'twitter' };

  // Fallback: first sizable image in the article (very rough — a link tag
  // like <link rel="image_src" href="…"> comes up sometimes)
  const linkImageSrc = html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
  if (linkImageSrc && linkImageSrc[1]) {
    return { image: resolveUrl(decode(linkImageSrc[1]), url), source: 'fallback' };
  }

  return { image: null, source: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing url' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Try the URL as-is first; if it yields nothing, fall back to the root
    // domain (some sites serve a brand image on / but article pages render
    // only via JS, so HTML-scraping the article returns no og:image).
    let result = await fetchImageForUrl(url);
    if (!result.image) {
      try {
        const rootUrl = new URL(url).origin;
        if (rootUrl !== url && rootUrl + '/' !== url) {
          const rootResult = await fetchImageForUrl(rootUrl);
          if (rootResult.image) result = rootResult;
        }
      } catch { /* invalid URL */ }
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
