import { useEffect, useRef, useState } from 'react';

/**
 * "Join the Times Square Challenge" — live activity feed section.
 *
 * The previous version of this component cycled through a hard-coded
 * list of "featured" mission tiles. It has been replaced with a real
 * activity feed sourced from the OneHub NFT platform API — each row
 * is a genuine event (buy / sell / claim / mint / like / send) that
 * happened on collect.nft.nyc, tagged `tsbillboard`.
 *
 * All CSS is scoped via .swotm-* class prefixes so it can't collide
 * with other components on the page. Brand colors match the project
 * palette (--primary-rgb is brand coral #f06347).
 */

const FEED_URL =
  'https://api.nftplatform.tech/nft/messages/?page=1&count=40&grab=collect.nft.nyc&channel=collect.nft.nyc&actions=send,claim,buy,like,sell,mint,ending_soon,collect,gift,post,comment&onehub=true&nsfw=false&crossfeed=auto&sort=-created&tags=tsbillboard&token=734d4bf5-e766-46a9-be21-94035c1343d6';

const DECOR: { x: number; y: number }[] = [
  { x: 12, y: 18 }, { x: 72, y: 8 },  { x: 88, y: 32 }, { x: 25, y: 55 },
  { x: 65, y: 70 }, { x: 90, y: 78 }, { x: 10, y: 82 }, { x: 78, y: 52 },
];

// Colour swatches per action so the feed reads at a glance. The
// dot next to each item uses the matching colour.
const ACTION_COLORS: Record<string, string> = {
  buy: '#10B981',
  sell: '#F59E0B',
  claim: '#3B82F6',
  mint: '#8B5CF6',
  gift: '#EC4899',
  send: '#EC4899',
  collect: '#06B6D4',
  like: '#F06347',
  post: '#94A3B8',
  comment: '#94A3B8',
  ending_soon: '#EF4444',
};

interface FeedItem {
  id: string;
  action: string;
  ago: string;
  text: string;
  image: string | null;
  contributor: string | null;
  color: string;
}

interface RawMessage {
  id?: string;
  action?: string;
  ago?: string;
  ftext?: string;
  // `nft` is sometimes a full object and sometimes just a numeric id.
  nft?: RawNft | number | null;
  data?: { nft?: RawNft | null; batch?: RawNft | null } | null;
}

interface RawNft {
  face?: string | null;
  meta?: { preview?: string | null } | null;
  contributor_details?: { name?: string | null } | null;
}

const asObj = (v: unknown): RawNft =>
  v && typeof v === 'object' ? (v as RawNft) : {};

function optimizeImageUrl(url: string | null): string | null {
  if (!url) return null;
  // The OneHub CDN can serve JPEG sources as WebP and resize them on the fly.
  if (/\.jpe?g$/i.test(url)) {
    return `${url}?format=webp&width=200`;
  }
  return url;
}

function normalizeMessages(raw: RawMessage[]): FeedItem[] {
  return raw
    .filter((m) => m && (m.ftext || m.action))
    .map((m, idx) => {
      const nft = asObj(m.nft);
      const dataNft = asObj(m.data?.nft);
      const batch = asObj(m.data?.batch);
      const image = optimizeImageUrl(
        dataNft.meta?.preview ??
          batch.meta?.preview ??
          dataNft.face ??
          batch.face ??
          null
      );
      const action = (m.action ?? 'post').toLowerCase();
      return {
        id: m.id ?? `feed-${idx}`,
        action,
        ago: m.ago ?? '',
        text: m.ftext ?? '',
        image,
        contributor:
          dataNft.contributor_details?.name ?? batch.contributor_details?.name ?? null,
        color: ACTION_COLORS[action] ?? '#F06347',
      };
    });
}

export default function SeeWhatsOnTheMap() {
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(FEED_URL, { headers: { Accept: 'application/json' } });
        if (!res.ok) return;
        const data = (await res.json()) as { messages?: RawMessage[] };
        if (cancelled) return;
        const items = normalizeMessages(data.messages ?? []);
        setFeed(items.length ? items : null);
      } catch {
        // Silent — the section still renders the map, title, CTA, etc.
        // without the feed if the API is unavailable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Hover / focus: pause the marquee, hand the wrap over to the user
  // for manual scrolling. On leave we reset scrollTop and let the CSS
  // animation take over again. The transform baseline is captured at
  // hover-time so scrollTop starts wherever the marquee was paused
  // rather than snapping back to the top.
  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track || !feed) return;

    let baseline = 0;

    const onEnter = () => {
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      baseline = -m.m42;
      // Only clear the specific longhands we set - using the `animation`
      // shorthand would also reset animation-duration to 0s, which is why
      // the marquee failed to resume on mouseleave the first time round.
      track.style.animationName = 'none';
      track.style.transform = 'none';
      wrap.scrollTop = baseline > 0 ? baseline : 0;
    };
    const onLeave = () => {
      // Resume the marquee from the scroll position the user left it at,
      // not from translateY(0). Achieved by seeding a negative
      // animation-delay so the animation "starts" mid-cycle at exactly
      // the translateY the user was viewing. The animation keyframe goes
      // 0 -> -50%, where 50% == half the duplicated track height (one
      // loop), so we map (scrollTop mod loopHeight) -> fraction of
      // duration.
      const scrollY = wrap.scrollTop;
      const durationSec =
        parseFloat(getComputedStyle(track).animationDuration) || 30;
      const loopHeight = track.scrollHeight / 2;
      const delay =
        loopHeight > 0
          ? -((scrollY % loopHeight) / loopHeight) * durationSec
          : 0;
      wrap.scrollTop = 0;
      track.style.animationName = '';
      track.style.transform = '';
      track.style.animationDelay = `${delay}s`;
    };

    wrap.addEventListener('mouseenter', onEnter);
    wrap.addEventListener('mouseleave', onLeave);
    wrap.addEventListener('focusin', onEnter);
    wrap.addEventListener('focusout', onLeave);
    return () => {
      wrap.removeEventListener('mouseenter', onEnter);
      wrap.removeEventListener('mouseleave', onLeave);
      wrap.removeEventListener('focusin', onEnter);
      wrap.removeEventListener('focusout', onLeave);
    };
  }, [feed]);

  // Duplicate the list so the marquee scroll can loop seamlessly.
  const loop = feed ? [...feed, ...feed] : [];
  const durationSec = feed ? Math.max(feed.length * 3.5, 30) : 0;

  return (
    <section className="swotm-section" id="see-whats-on-the-map" aria-labelledby="swotm-heading">
      <style>{SWOTM_CSS}</style>

      {/* Animated map background */}
      <div className="swotm-map-bg" aria-hidden="true">
        <img
          className="swotm-map-img"
          src="https://wspfuwokgyfyjbdlqoag.supabase.co/storage/v1/object/public/map-assets/ts-map-bw-v1.jpg"
          alt=""
        />
        <div className="swotm-map-overlay"></div>

        {/* Decorative pulsing pins */}
        <div id="swotm-decor-layer">
          {DECOR.map((m, i) => (
            <div
              key={i}
              className="swotm-decor"
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
            >
              <span
                className="pulse"
                style={{ animationDuration: `${2 + i * 0.3}s` }}
              />
              <span className="dot" />
            </div>
          ))}
        </div>
      </div>

      {/* Foreground content */}
      <div className="swotm-content">
        <h2 className="swotm-title" id="swotm-heading">
          <span className="accent">Start Collecting</span>
        </h2>
        <p className="swotm-subtitle">
          Collect: Times Square showcases how tokenization is reshaping Art, Collectibles, Certifications, Gameplay, Identity, and DeFi.
        </p>
        <p className="swotm-subtitle">
          Start by collecting Times Square Art from our global community of Artists - and earn T-XP for your activity.
        </p>

        {/* Live activity feed — real events from onehub.nft.nyc tagged
            `tsbillboard`. Replaces the old cycling map-marker tile. When
            the API is unreachable the block hides itself and the section
            still reads cleanly. */}
        {feed && feed.length > 0 && (
          <div
            className="swotm-feed-wrap"
            ref={wrapRef}
            aria-label="Live TS Challenge activity"
          >
            <div
              className="swotm-feed-track"
              ref={trackRef}
              style={{ animationDuration: `${durationSec}s` }}
            >
              {loop.map((item, i) => (
                <a
                  key={`${item.id}-${i}`}
                  className="swotm-feed-item"
                  href="https://onehub.nft.nyc/activity"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ '--dot': item.color } as React.CSSProperties}
                >
                  {item.image ? (
                    <img
                      className="swotm-feed-thumb"
                      src={item.image}
                      alt=""
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.visibility = 'hidden';
                      }}
                    />
                  ) : (
                    <span className="swotm-feed-thumb swotm-feed-thumb-empty" aria-hidden="true" />
                  )}
                  <span className="swotm-feed-body">
                    <span className="swotm-feed-text">{item.text}</span>
                    <span className="swotm-feed-meta">
                      <span className="swotm-feed-action">{item.action.replace(/_/g, ' ')}</span>
                      {item.ago && <span className="swotm-feed-ago">· {item.ago}</span>}
                      {item.contributor && (
                        <span className="swotm-feed-contrib">· {item.contributor}</span>
                      )}
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="swotm-cta-row">
          <a className="swotm-cta swotm-cta-secondary" href="/ts-challenge">
            Learn More
          </a>
          <a
            className="swotm-cta"
            href="https://onehub.nft.nyc/activity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Start Collecting
          </a>
        </div>
      </div>
    </section>
  );
}

const SWOTM_CSS = `
.swotm-section {
  --swotm-primary-rgb: 240 99 71;
  --swotm-bg: var(--color-bg, #0a0a0f);
  position: relative;
  overflow: hidden;
  /* Pulled up so the top of the section overlaps the previous section
     (WhyNYC's Times Square hero photo). Padding-top is increased to
     compensate so visible content stays in roughly the same place. */
  margin-top: -160px;
  padding: 11rem 1rem 4rem;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(var(--swotm-primary-rgb)/0.10), transparent 60%),
    var(--swotm-bg);
  color: var(--color-text, #fff);
  font-family: var(--font-body, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Inter, sans-serif);
  /* Fade the top edge to transparency so the Times Square photo behind
     bleeds into the map background instead of showing a hard seam. */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 22%);
  mask-image: linear-gradient(to bottom, transparent 0%, #000 22%);
}
@media (min-width: 768px) {
  .swotm-section { padding: 13rem 1.5rem 6rem; margin-top: -180px; }
}

/* Animated map background */
.swotm-map-bg {
  position: absolute; inset: 0;
  pointer-events: none;
  overflow: hidden;
}
.swotm-map-bg img.swotm-map-img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  opacity: 0.6;
}
.swotm-map-bg .swotm-map-overlay {
  position: absolute; inset: 0;
  background: rgba(10,10,15,0.6);
}

/* Decorative pulsing pins */
.swotm-decor {
  position: absolute;
  transform: translate(-50%, -50%);
}
.swotm-decor .pulse {
  position: absolute;
  width: 24px; height: 24px;
  left: -12px; top: -12px;
  border-radius: 9999px;
  background: rgba(var(--swotm-primary-rgb)/0.20);
  animation: swotm-pulse 2.4s ease-in-out infinite;
}
.swotm-decor .dot {
  position: absolute;
  width: 8px; height: 8px;
  left: -4px; top: -4px;
  border-radius: 9999px;
  background: rgb(var(--swotm-primary-rgb));
  opacity: 0.7;
}

/* Live activity feed — vertically auto-scrolling list of real events
   from onehub.nft.nyc. Reuses the global @keyframes feedScrollUp from
   src/index.css. The mask-image fades the top/bottom edges so items
   appear to enter / leave rather than pop in / out. Duplicate item
   set is rendered inline so the marquee can loop seamlessly at 50%. */
.swotm-feed-wrap {
  position: relative;
  width: min(720px, 100%);
  height: 480px;
  margin: 2.25rem auto 2.75rem;
  overflow-x: hidden;
  overflow-y: hidden;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.25) transparent;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent);
}
.swotm-feed-wrap:hover,
.swotm-feed-wrap:focus-within {
  overflow-y: auto;
  cursor: grab;
}
.swotm-feed-wrap::-webkit-scrollbar { width: 6px; }
.swotm-feed-wrap::-webkit-scrollbar-track { background: transparent; }
.swotm-feed-wrap::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.25);
  border-radius: 3px;
}
.swotm-feed-track {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: feedScrollUp linear infinite;
  will-change: transform;
}
.swotm-feed-wrap:hover .swotm-feed-track,
.swotm-feed-wrap:focus-within .swotm-feed-track {
  animation-play-state: paused;
}
.swotm-feed-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.92);
  text-decoration: none;
  transition: border-color 200ms ease, background 200ms ease, transform 200ms ease;
  flex-shrink: 0;
  text-align: left;
}
.swotm-feed-item:hover {
  border-color: rgba(var(--swotm-primary-rgb)/0.55);
  background: rgba(255,255,255,0.07);
}
.swotm-feed-thumb {
  width: 160px; height: 160px;
  object-fit: contain;
  flex-shrink: 0;
  position: relative;
}
.swotm-feed-thumb-empty {
  display: block;
}
.swotm-feed-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.swotm-feed-text {
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.swotm-feed-meta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: rgba(255,255,255,0.55);
  font-weight: 500;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.swotm-feed-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 700;
  color: var(--dot, rgb(var(--swotm-primary-rgb)));
  font-size: 10px;
}
.swotm-feed-action::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 9999px;
  background: var(--dot, rgb(var(--swotm-primary-rgb)));
  animation: feedDotPulse 3s ease-in-out infinite;
}
.swotm-feed-ago,
.swotm-feed-contrib {
  color: rgba(255,255,255,0.55);
}
.swotm-feed-contrib {
  overflow: hidden;
  text-overflow: ellipsis;
}
@media (max-width: 480px) {
  .swotm-feed-wrap { height: 420px; }
  .swotm-feed-thumb { width: 120px; height: 120px; }
}
@media (prefers-reduced-motion: reduce) {
  .swotm-feed-track { animation: none; }
}

/* Foreground content (title + button) */
.swotm-content {
  position: relative; z-index: 10;
  max-width: 1200px;
  margin: 0 auto;
  display: flex; flex-direction: column; align-items: center;
  text-align: center;
}
.swotm-title {
  font-family: var(--font-display, "Monument Extended", "Bebas Neue", Impact, sans-serif);
  font-weight: 700;
  font-size: clamp(1.125rem, 2.2vw, 1.625rem);
  letter-spacing: 0.04em;
  margin: 0 0 0.75rem;
  text-transform: uppercase;
  line-height: 1.1;
}
.swotm-title .accent { color: rgb(var(--swotm-primary-rgb)); }
.swotm-subtitle {
  font-size: clamp(1rem, 1.4vw, 1.125rem);
  color: rgb(149, 149, 176);
  max-width: 640px;
  margin: 0;
  line-height: 1.55;
}
.swotm-subtitle + .swotm-subtitle { margin-top: 0.9rem; }
.swotm-cta-row {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative; z-index: 10;
}
.swotm-cta {
  display: inline-flex; align-items: center; gap: 8px;
  height: 56px;
  padding: 0 2.5rem;
  border-radius: 9999px;
  background: rgb(var(--swotm-primary-rgb));
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.03em;
  text-decoration: none;
  box-shadow: 0 20px 40px rgba(0,0,0,0.45), 0 0 0 1px rgba(var(--swotm-primary-rgb)/0.4);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease, border-color 0.3s ease;
  white-space: nowrap;
}
.swotm-cta:hover {
  transform: scale(1.05);
  box-shadow: 0 24px 48px rgba(var(--swotm-primary-rgb)/0.30), 0 0 0 1px rgba(var(--swotm-primary-rgb)/0.5);
}
/* Secondary outlined CTA — pairs to the left of the primary CTA. */
.swotm-cta.swotm-cta-secondary {
  background: transparent;
  color: rgba(255,255,255,0.9);
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.25);
  box-shadow: none;
}
.swotm-cta.swotm-cta-secondary:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.4);
  box-shadow: none;
}

@keyframes swotm-pulse {
  0%, 100% { opacity: 1;   transform: scale(1);   }
  50%      { opacity: 0.5; transform: scale(1.15); }
}
`;
