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
// count=150 is generous - we ask for a lot so the mosaic always has
// enough unique art to fill an 8x9 grid on tall viewports without
// repeating any piece more than once in the visible area.
const FEED_URL =
  "https://api.nftplatform.tech/nft/messages/?token=734d4bf5-e766-46a9-be21-94035c1343d6&count=150&page=1&grab=collect.nft.nyc&actions=send,claim,buy,like,sell,mint,collect,gift,post,comment&onehub=true&nsfw=false&crossfeed=auto&channel=collect.nft.nyc&onsale=true";

/** Number of tiles the mosaic renders. 72 gives up to 8 rows on the 9-col
 *  desktop grid, 12 rows on the 6-col tablet, and 18 rows on the 4-col
 *  mobile - enough to cover a 90vh hero on any reasonable viewport
 *  (including 4K at 1440px tall). If the feed returns fewer unique
 *  images than this, the source list is cycled so every cell is filled. */
const TILE_COUNT = 72;

/** The rotator swaps 2 tiles per tick, at a randomised delay between
 *  min and max. Randomised so the motion doesn't feel mechanical. */
const ROTATE_MIN_MS = 2000;
const ROTATE_MAX_MS = 6000;

/** Every SPOTLIGHT_[MIN|MAX]_MS a random tile lights up for SPOTLIGHT_HOLD_MS,
 *  as if someone just collected it. Reads as "a human, not a script". */
const SPOTLIGHT_MIN_MS = 9500;
const SPOTLIGHT_MAX_MS = 14000;
const SPOTLIGHT_HOLD_MS = 1500;

/** A tile carries two image slots and a marker for which is currently
 *  visible. On swap, the new URL goes into the inactive slot and the
 *  active marker flips - so the CSS opacity transition on .lgh-tile-img
 *  produces a proper crossfade between the outgoing and incoming art
 *  rather than an instant swap. */
interface TileSlot {
  a: string;
  b: string;
  active: "a" | "b";
}

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

/** Depth plane for each grid slot. Deterministic prime-mix over the
 *  slot index so the pattern is stable across renders / rotator ticks.
 *  Hidden slots leave visible gaps that break up the tessellated grid. */
const DEPTHS: Array<"near" | "mid" | "far" | "hidden"> = Array.from(
  { length: TILE_COUNT },
  (_, i) => {
    const h = (i * 17 + i * i * 3) % 31;
    if (h < 4) return "hidden"; // ~13%
    if (h < 12) return "far";   // ~26%
    if (h < 22) return "mid";   // ~32%
    return "near";              // ~29%
  },
);

/** Indices of the slots that actually render a tile - the fetch loop
 *  fills these first with unique images and only wraps if the feed
 *  returns fewer uniques than there are visible slots. */
const VISIBLE_INDICES: number[] = DEPTHS
  .map((d, i) => (d !== "hidden" ? i : -1))
  .filter((i) => i >= 0);

/** Horizontal offset per slot - breaks the tessellated-column look. */
const OFFSETS: string[] = Array.from({ length: TILE_COUNT }, (_, i) => {
  const h = (i * 13 + i * i * 5 + 7) % 17;
  if (h < 2) return "-32%";
  if (h < 4) return "34%";
  if (h < 5) return "-18%";
  if (h < 6) return "20%";
  if (h < 7) return "-10%";
  return "0px";
});

export default function LiveGalleryHero() {
  const [tiles, setTiles] = useState<TileSlot[] | null>(null);
  const [spotlightIndex, setSpotlightIndex] = useState<number | null>(null);
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
          // Fill visible slots with UNIQUE images first. Hidden slots
          // get empty strings and never render an img. Only if the
          // feed returns fewer uniques than there are visible slots
          // do we start cycling - and even then only for the tail.
          //
          // Slot B (the crossfade partner) is offset by half so the
          // very first rotator swap already has something distinct
          // to fade to; if there aren't enough uniques to fill both
          // A and B without any repeats, we let B cycle but tolerate
          // the visible-only-A pattern which is what the user sees.
          const filled: TileSlot[] = Array.from(
            { length: TILE_COUNT },
            () => ({ a: "", b: "", active: "a" as const }),
          );
          const visibleCount = VISIBLE_INDICES.length;
          const bOffset = Math.max(1, Math.floor(imgs.length / 2));
          VISIBLE_INDICES.forEach((slotIdx, k) => {
            filled[slotIdx] = {
              a: imgs[k % imgs.length],
              b: imgs[(k + bOffset) % imgs.length],
              active: "a" as const,
            };
          });
          setTiles(filled);
          // Any images beyond the visible-slot count go into the
          // rotation pool as fresh material for later swaps.
          rotationPool.current =
            imgs.length > visibleCount ? imgs.slice(visibleCount) : [];
          rotationCursor.current = 0;
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

  const usingFallback = tiles === null;

  // Rotator: at a randomised interval, swap TWO random tiles at once.
  // Each swap writes the incoming URL into the inactive slot and flips
  // the active marker, so the CSS opacity transition produces a
  // crossfade rather than a hard cut. Recursive setTimeout so each
  // tick's delay is randomised individually - avoids the clockwork feel
  // of a fixed setInterval.
  useEffect(() => {
    if (!tiles) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let timeoutId = 0;

    const tick = () => {
      if (cancelled) return;
      setTiles((prev) => {
        if (!prev || VISIBLE_INDICES.length < 2) return prev;
        const copy = prev.slice();
        const pool = rotationPool.current;
        const pickVisible = () =>
          VISIBLE_INDICES[Math.floor(Math.random() * VISIBLE_INDICES.length)];
        const i1 = pickVisible();
        let i2 = pickVisible();
        if (i2 === i1) {
          const at = VISIBLE_INDICES.indexOf(i1);
          i2 = VISIBLE_INDICES[(at + 1) % VISIBLE_INDICES.length];
        }
        if (pool.length >= 2) {
          // Fresh material available - rotate two new images in from
          // the pool and push the outgoing ones back so they can return
          // in a later tick.
          const swapWithPool = (idx: number) => {
            const t = copy[idx];
            const outgoing = t.active === "a" ? t.a : t.b;
            const incoming = pool[rotationCursor.current % pool.length];
            rotationCursor.current += 1;
            pool.push(outgoing);
            copy[idx] = {
              ...t,
              [t.active === "a" ? "b" : "a"]: incoming,
              active: t.active === "a" ? "b" : "a",
            };
          };
          swapWithPool(i1);
          swapWithPool(i2);
        } else {
          // Pool empty - EXCHANGE the two tiles' currently-visible
          // images so nothing duplicates. Tile A takes what tile B
          // was showing, and vice versa. Then any remaining outgoing
          // images go into the pool for future ticks.
          const t1 = copy[i1];
          const t2 = copy[i2];
          const img1 = t1.active === "a" ? t1.a : t1.b;
          const img2 = t2.active === "a" ? t2.a : t2.b;
          copy[i1] = {
            ...t1,
            [t1.active === "a" ? "b" : "a"]: img2,
            active: t1.active === "a" ? "b" : "a",
          };
          copy[i2] = {
            ...t2,
            [t2.active === "a" ? "b" : "a"]: img1,
            active: t2.active === "a" ? "b" : "a",
          };
        }
        return copy;
      });
      const delay = ROTATE_MIN_MS + Math.random() * (ROTATE_MAX_MS - ROTATE_MIN_MS);
      timeoutId = window.setTimeout(tick, delay);
    };

    timeoutId = window.setTimeout(tick, ROTATE_MIN_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [tiles]);

  // Spotlight: on a slower cadence than the rotator, pick a random
  // tile and pop it forward for SPOTLIGHT_HOLD_MS. The tile scales
  // up 8%, drops the atmospheric blur, brightens, and gains an orange
  // halo matching the Register CTA - reads as "a human just collected
  // that piece." Only one tile spotlit at a time.
  useEffect(() => {
    if (!tiles) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let scheduleId = 0;
    let clearId = 0;

    const schedule = () => {
      if (cancelled) return;
      const delay = SPOTLIGHT_MIN_MS + Math.random() * (SPOTLIGHT_MAX_MS - SPOTLIGHT_MIN_MS);
      scheduleId = window.setTimeout(() => {
        if (cancelled) return;
        // Only spotlight a visible slot - hidden slots have no art to
        // pop forward, so lighting them up is a wasted animation cycle.
        setSpotlightIndex(
          VISIBLE_INDICES[Math.floor(Math.random() * VISIBLE_INDICES.length)],
        );
        clearId = window.setTimeout(() => {
          if (cancelled) return;
          setSpotlightIndex(null);
          schedule();
        }, SPOTLIGHT_HOLD_MS);
      }, delay);
    };

    schedule();
    return () => {
      cancelled = true;
      window.clearTimeout(scheduleId);
      window.clearTimeout(clearId);
    };
  }, [tiles]);

  const fallback = useMemo(
    () => (usingFallback ? fallbackTiles(TILE_COUNT) : []),
    [usingFallback],
  );

  // DEPTHS and OFFSETS are computed once at module scope - see above.

  // The live-count number that used to sit here was misleading - it
  // was the number of collect-actions in the last N-message API window
  // framed as "today", which was only accurate when the feed happened
  // to move at a specific pace. Kept collectCount in state so any
  // future variant can lean on it; the current pill copy is static.
  void collectCount;

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
        {usingFallback
          ? fallback.map((cls, i) => (
              <div
                key={i}
                data-depth={DEPTHS[i]}
                style={{ ["--tile-offset-x" as string]: OFFSETS[i] } as React.CSSProperties}
                className={`lgh-tile ${cls}${spotlightIndex === i ? " lgh-tile-spotlight" : ""}`}
              >
                <div className="lgh-tile-fallback" />
              </div>
            ))
          : (tiles ?? []).map((tile, i) => (
              <div
                key={i}
                data-depth={DEPTHS[i]}
                style={{ ["--tile-offset-x" as string]: OFFSETS[i] } as React.CSSProperties}
                className={`lgh-tile${spotlightIndex === i ? " lgh-tile-spotlight" : ""}`}
              >
                {tile.a && (
                  <img
                    src={tile.a}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={`lgh-tile-img${tile.active === "a" ? " active" : ""}`}
                  />
                )}
                {tile.b && (
                  <img
                    src={tile.b}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className={`lgh-tile-img${tile.active === "b" ? " active" : ""}`}
                  />
                )}
              </div>
            ))}
      </div>

      <div className="lgh-scrim" aria-hidden="true" />
      <div className="lgh-grain" aria-hidden="true" />

      <div className="lgh-body">
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
          <b>live on-chain NOW</b>. Register to attend, or start collecting
          Times Square Art from our global community of Artists now.
        </p>

        <p className="lgh-meta">Times Square, New York City · 1-3 Sep 2026</p>

        <div className="lgh-ctas">
          <a
            className="lgh-cta lgh-cta-primary"
            href="https://collect.nft.nyc"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start collecting
          </a>
          <button
            type="button"
            className="lgh-cta lgh-cta-ghost"
            onClick={openTicketing}
          >
            Register to attend
          </button>
        </div>

        <span className="lgh-live">
          <span className="lgh-live-label">Live</span>
          <span className="lgh-live-body">
            Thousands of Collectors from around the world
          </span>
        </span>
      </div>
    </section>
  );
}
