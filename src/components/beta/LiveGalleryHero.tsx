import { useEffect, useMemo, useRef, useState } from "react";
import "@/styles/beta-hero.css";

/**
 * Beta hero - Concept C "Live gallery ground".
 *
 * Full-bleed hero whose background is a mosaic of currently-collected NFTs
 * from collect.nft.nyc. Foreground: LIVE pill with a specific count,
 * wordmark, strapline, and two coequal CTAs - "Register to attend" (opens
 * the global ticketing modal, same event Index.tsx dispatches) and
 * "Start collecting" (goes to collect.nft.nyc).
 *
 * Data source: same OneHub NFT platform endpoint SeeWhatsOnTheMap uses.
 * On fetch failure the hero falls back to a fixed gradient-tile palette
 * so the composition still reads correctly.
 */

// Same endpoint the live https://collect.nft.nyc/activity page uses, and
// what SeeWhatsOnTheMap already talks to. Kept in sync deliberately -
// changing one without the other risks a divergent story below the fold.
const FEED_URL =
  "https://api.nftplatform.tech/nft/messages/?token=734d4bf5-e766-46a9-be21-94035c1343d6&count=40&page=1&grab=collect.nft.nyc&actions=send,claim,buy,like,sell,mint,collect,gift,post,comment&onehub=true&nsfw=false&crossfeed=auto&channel=collect.nft.nyc&onsale=true";

/** Number of tiles in the mosaic. 36 fills a 9x4 grid on wide viewports
 *  and a 6x6 on mid; feels like "a lot going on" without hammering the
 *  CDN. Fewer than this and the grid looks sparse; more and load time
 *  becomes noticeable. */
const TILE_COUNT = 36;

/** How often the rotator swaps one tile for a fresh one (ms). Slow enough
 *  that the eye can catch each change; fast enough to feel alive. */
const ROTATE_INTERVAL_MS = 3200;

interface RawNft {
  face?: string | null;
  meta?: { preview?: string | null } | null;
}
interface RawMessage {
  id?: string;
  action?: string;
  nft?: RawNft | number | null;
  data?: { nft?: RawNft | number | null; batch?: RawNft | null } | null;
}
const asObj = (v: unknown): RawNft =>
  v && typeof v === "object" ? (v as RawNft) : {};

const firstNonEmpty = (
  ...vals: Array<string | null | undefined>
): string | null => {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v;
  }
  return null;
};

/** OneHub CDN can resize JPEGs on the fly. Small thumbs are all we need. */
function optimizeImageUrl(url: string): string {
  if (/\.jpe?g$/i.test(url)) {
    return `${url}?format=webp&width=200`;
  }
  return url;
}

function extractImages(raw: RawMessage[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const m of raw) {
    const dataNft = asObj(m.data?.nft);
    const batch = asObj(m.data?.batch);
    const img = firstNonEmpty(
      dataNft.meta?.preview,
      batch.meta?.preview,
      dataNft.face,
      batch.face,
    );
    if (img && !seen.has(img)) {
      seen.add(img);
      out.push(optimizeImageUrl(img));
    }
  }
  return out;
}

/** Actions that count as "a collection happened" for the live count. */
const COLLECT_ACTIONS = new Set(["buy", "claim", "collect", "mint", "gift"]);

function countCollections(raw: RawMessage[]): number {
  return raw.reduce(
    (n, m) => n + (COLLECT_ACTIONS.has((m.action ?? "").toLowerCase()) ? 1 : 0),
    0,
  );
}

/** Tiles fall back to a set of gradient classes if the API is down. */
function fallbackTiles(count: number): string[] {
  const palette = 12;
  return Array.from({ length: count }, (_, i) => `lgh-tf-${(i % palette) + 1}`);
}

export default function LiveGalleryHero() {
  const [images, setImages] = useState<string[] | null>(null);
  const [freshIndex, setFreshIndex] = useState<number | null>(null);
  const [collectCount, setCollectCount] = useState<number | null>(null);
  const rotationPool = useRef<string[]>([]);
  const rotationCursor = useRef(0);

  // Fetch the live feed once on mount. Silent failure - the hero still
  // renders with the gradient-tile fallback if the API is unavailable.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(FEED_URL, {
          headers: { Accept: "application/json" },
        });
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: RawMessage[] };
        if (cancelled) return;
        const msgs = data.messages ?? [];
        const imgs = extractImages(msgs);
        if (imgs.length >= 6) {
          // Take TILE_COUNT for the initial mosaic; hold the rest (if any)
          // in the rotation pool so the rotator has fresh material to swap in.
          setImages(imgs.slice(0, TILE_COUNT));
          rotationPool.current = imgs.slice(TILE_COUNT);
        }
        setCollectCount(countCollections(msgs));
      } catch {
        // Silent; falls through to the gradient tiles.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Rotator: every ROTATE_INTERVAL_MS, swap one random visible tile for
  // one from the rotation pool. If the pool is exhausted, cycle back
  // through it. Never runs when the visible set is fallback tiles.
  useEffect(() => {
    if (!images) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (rotationPool.current.length === 0) return;

    const id = window.setInterval(() => {
      setImages((prev) => {
        if (!prev) return prev;
        const idx = Math.floor(Math.random() * prev.length);
        const pool = rotationPool.current;
        const next = pool[rotationCursor.current % pool.length];
        rotationCursor.current += 1;
        // Move the outgoing image into the pool tail so it can return later.
        pool.push(prev[idx]);
        const copy = prev.slice();
        copy[idx] = next;
        setFreshIndex(idx);
        window.setTimeout(() => setFreshIndex(null), 900);
        return copy;
      });
    }, ROTATE_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [images]);

  const tiles = useMemo(
    () => images ?? fallbackTiles(TILE_COUNT),
    [images],
  );
  const usingFallback = images === null;

  // Live-count label. Prefer the specific number when we have one; use a
  // discreet placeholder otherwise so the pill doesn't render as "undefined".
  const liveLabel = useMemo(() => {
    if (collectCount && collectCount > 0) {
      return `Live · ${collectCount} collected today · from around the world`;
    }
    return "Live · Times Square is on-chain right now";
  }, [collectCount]);

  const openTicketing = () => {
    window.dispatchEvent(new CustomEvent("nftnyc:open-ticketing"));
  };

  return (
    <section
      id="hero"
      className="lgh"
      aria-label="NFT.NYC 2026 - attend in person or collect from anywhere"
    >
      <div className="lgh-gallery" aria-hidden="true">
        {tiles.map((t, i) => {
          const isFresh = freshIndex === i;
          const cls = usingFallback
            ? `lgh-tile lgh-tf ${t}${isFresh ? " lgh-tile-fresh" : ""}`
            : `lgh-tile${isFresh ? " lgh-tile-fresh" : ""}`;
          return (
            <div key={`${i}-${t}`} className={cls}>
              {usingFallback ? (
                <div className={`lgh-tile-fallback`} />
              ) : (
                <img src={t} alt="" loading="lazy" decoding="async" />
              )}
            </div>
          );
        })}
      </div>

      <div className="lgh-scrim" aria-hidden="true" />

      <span className="lgh-beta" aria-hidden="true">Beta preview</span>

      <div className="lgh-body">
        <span className="lgh-live">{liveLabel}</span>

        <p className="lgh-eyebrow">The 9th NFT industry event</p>

        <h1 className="lgh-wordmark">
          NFT<span className="lgh-dot">.</span>NYC{" "}
          <span className="lgh-year">2026</span>
        </h1>

        <p className="lgh-sr-only">
          NFT.NYC 2026 runs 1-3 September in Times Square, New York. It also
          streams on-chain worldwide through collect.nft.nyc, where anyone
          can collect the art from Times Square screens from anywhere.
        </p>

        <p className="lgh-strap">
          <b>1-3 September</b> in Times Square, New York - and{" "}
          <b>streaming on-chain everywhere</b>. Register free to attend, or
          start collecting from Times Square right now.
        </p>

        <p className="lgh-meta">Times Square, New York City · 1-3 Sep 2026</p>

        <div className="lgh-ctas">
          <button
            type="button"
            className="lgh-cta lgh-cta-primary"
            onClick={openTicketing}
          >
            Register to attend
          </button>
          <a
            className="lgh-cta lgh-cta-ghost"
            href="https://collect.nft.nyc"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start collecting
          </a>
        </div>
      </div>
    </section>
  );
}
