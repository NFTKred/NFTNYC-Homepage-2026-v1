import { useEffect, useRef } from 'react';

/**
 * "Join the Times Square Challenge" — animated map section recreated from
 * the OneHub.NFT.NYC #rewards block. Pulsing decorative pins, a featured
 * marker tile that cycles through TS Challenge missions every 6s, and a
 * coral CTA pointing visitors at the first mission (Times Square Billboard
 * Art) on onehub.nft.nyc.
 *
 * All CSS is scoped via .swotm-* class prefixes so it can't collide with
 * other components on the page. Brand colors match the project palette
 * (--primary-rgb is brand coral #f06347).
 */

const STORAGE_BASE = 'https://wspfuwokgyfyjbdlqoag.supabase.co/storage/v1/object/public/map-assets';

interface Feature {
  label: string;
  image?: string;
  video?: string;
}

// Cycling featured tile content — labels mapped to the 12 TS Challenge
// missions (or platform surfaces where there's no 1:1 mission). The
// "Mission #N ·" prefix anchors the visual to the article's framing.
const FEATURES: Feature[] = [
  { label: 'Mission #1 · Collect TS Art', image: 'https://imgcdn2-bd3.kxcdn.com/web/files/5c37fdb82f586d11f45a84b8/NFTNYC2025_Showcase_Animation_2132385581765501553.jpg?width=568&format=webp' },
  { label: 'Mission #2 · Send Gifts',     image: STORAGE_BASE + '/relay-giftstudio-v1.jpg' },
  { label: 'Mission #5 · Submit Art',     image: 'https://imgcdn2-bd3.kxcdn.com/web/files/5c37fdb82f586d11f45a84b8/NFTNYC2025_TS_BB_Showcase_2020359081765501856.jpg?width=568&format=webp' },
  { label: 'Mission #6 · Claim Passport', image: STORAGE_BASE + '/mapmarker-domainmarket-v1.png' },
  { label: 'Mission #9 · Race in NYC',    video: STORAGE_BASE + '/hotgarage-ts-musclecar-v1.mp4' },
  { label: 'Leaderboard',                 image: 'https://imgcdn2-bd3.kxcdn.com/web/files/5c37fdb82f586d11f45a84b8/NFTNYC2025_TS_BB_Showcase_992032624851765501812.jpg?width=568&format=webp' },
  { label: 'Community Hub',               image: 'https://f005.backblazeb2.com/file/PB-HubSpot/files/chmln-crm-ts.png' },
];

const DECOR: { x: number; y: number }[] = [
  { x: 12, y: 18 }, { x: 72, y: 8 },  { x: 88, y: 32 }, { x: 25, y: 55 },
  { x: 65, y: 70 }, { x: 90, y: 78 }, { x: 10, y: 82 }, { x: 78, y: 52 },
];

const INTERVAL_MS = 6000;
const GAP_MS = 1000;

export default function SeeWhatsOnTheMap() {
  const tileRef = useRef<HTMLDivElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const labelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const tile = tileRef.current;
    const tileMedia = mediaRef.current;
    const tileLabel = labelRef.current;
    if (!tile || !tileMedia || !tileLabel) return;

    let index = 0;
    let mounted = true;

    function renderFeature(i: number) {
      const f = FEATURES[i];
      if (!tileLabel || !tileMedia) return;
      tileLabel.textContent = f.label;
      tileMedia.innerHTML = '';
      let el: HTMLElement | null = null;
      if (f.video) {
        const v = document.createElement('video');
        v.src = f.video;
        v.autoplay = true;
        v.loop = true;
        v.muted = true;
        (v as HTMLVideoElement).playsInline = true;
        v.setAttribute('playsinline', '');
        el = v;
      } else if (f.image) {
        const img = document.createElement('img');
        img.src = f.image;
        img.alt = f.label;
        img.loading = 'lazy';
        el = img;
      }
      if (el) tileMedia.appendChild(el);
    }

    // Initial render + fade in
    renderFeature(index);
    const raf = requestAnimationFrame(() => {
      if (!mounted || !tile) return;
      tile.classList.add('is-visible');
    });

    const interval = window.setInterval(() => {
      if (!mounted || !tile) return;
      tile.classList.remove('is-visible');
      window.setTimeout(() => {
        if (!mounted || !tile) return;
        index = (index + 1) % FEATURES.length;
        renderFeature(index);
        tile.classList.add('is-visible');
      }, GAP_MS);
    }, INTERVAL_MS);

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      window.clearInterval(interval);
    };
  }, []);

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
          Join the <span className="accent">Times Square Challenge</span>
        </h2>
        <p className="swotm-subtitle">
          12 Missions. 6 industries. One map. See how tokenization is reshaping Art, Collectibles, Certifications, Gameplay, Identity, and DeFi — and earn T-XP for every Mission you complete.
        </p>

        {/* Featured map marker — in document flow between the subtitle and
            the CTA row so its position stays consistent regardless of
            section height / viewport. The tile pops up above the pin via
            the .swotm-tile bottom: 100% rule. */}
        <div className="swotm-feature-wrap">
          <div className="swotm-feature">
            <div className="swotm-tile" ref={tileRef}>
              <div className="media" ref={mediaRef}></div>
              <div className="label" ref={labelRef}></div>
              <div className="arrow"></div>
            </div>
            <div className="swotm-pin">
              <span className="pulse" />
              <span className="dot" />
            </div>
          </div>
        </div>

        <div className="swotm-cta-row">
          <a className="swotm-cta swotm-cta-secondary" href="/ts-challenge">
            Learn More
          </a>
          <a
            className="swotm-cta"
            href="https://onehub.nft.nyc/category/Times-Square-Billboard-Art"
            target="_blank"
            rel="noopener noreferrer"
          >
            Complete your first Mission
          </a>
        </div>

        {/* Meet Relay card — moved here from WhyNYC so it sits below the
            primary CTAs in this section. */}
        <div className="swotm-relay">
          <img
            src="/relay-rat.png"
            alt="Relay the Rat"
            className="swotm-relay-img"
          />
          <div className="swotm-relay-body">
            <p className="swotm-relay-title">Meet your guide, Relay</p>
            <p className="swotm-relay-desc">
              Born and raised in Times Square, Relay is your local guide to NFT.NYC. Ask Relay anything about past events, what to expect in 2026, or how to get involved.
            </p>
            <button
              type="button"
              className="swotm-relay-btn"
              onClick={() => {
                const btn = document.getElementById('relay-chat-btn') as HTMLElement | null;
                if (btn) btn.click();
              }}
            >
              Ask Relay
            </button>
          </div>
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

/* Featured marker container — sits in document flow between the subtitle
   and the CTA row. The tile (the popup card with the rotating image +
   label) absolute-positions itself above the pin via .swotm-tile's
   bottom: 100% rule, so we reserve enough top margin here to give the
   tile room to render without being clipped by the subtitle above. */
.swotm-feature-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  margin: 240px auto 50px;   /* top reserves space for the popup tile */
}
.swotm-feature {
  position: relative;
  z-index: 20;
}
.swotm-pin {
  position: relative;
  width: 36px; height: 36px;
}
.swotm-pin .pulse {
  position: absolute;
  width: 36px; height: 36px;
  left: 0; top: 0;
  border-radius: 9999px;
  background: rgba(var(--swotm-primary-rgb)/0.30);
  animation: swotm-pulse 2.2s ease-in-out infinite;
}
.swotm-pin .dot {
  position: absolute;
  width: 14px; height: 14px;
  left: 11px; top: 11px;
  border-radius: 9999px;
  background: rgb(var(--swotm-primary-rgb));
  box-shadow: 0 4px 12px rgba(var(--swotm-primary-rgb)/0.40);
}

/* Tile that pops up above the pin */
.swotm-tile {
  position: absolute;
  left: 50%;
  bottom: 100%;
  margin-bottom: 12px;
  width: min(21vw, 150px);
  display: flex; flex-direction: column; align-items: center;
  transform: translateX(-50%) translateY(8px) scale(0.95);
  opacity: 0;
  transition: opacity 500ms ease, transform 500ms ease;
  pointer-events: none;
}
.swotm-tile.is-visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}
.swotm-tile .media {
  width: 100%;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  border-radius: 12px;
  border: 2px solid rgba(var(--swotm-primary-rgb)/0.60);
  background: var(--swotm-bg);
  box-shadow: 0 10px 30px rgba(var(--swotm-primary-rgb)/0.20);
}
.swotm-tile .media img,
.swotm-tile .media video {
  width: 100%; height: 100%;
  object-fit: cover;
  display: block;
}
.swotm-tile .label {
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  background: rgba(var(--swotm-primary-rgb)/0.90);
  color: #fff;
  font-size: 10px; font-weight: 600;
  white-space: nowrap;
}
.swotm-tile .arrow {
  width: 0; height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 10px solid rgba(var(--swotm-primary-rgb)/0.60);
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

/* Meet Relay card — moved here from WhyNYC. Sits below the CTA row. */
.swotm-relay {
  position: relative;
  z-index: 10;
  margin: 2rem auto 0;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 1rem;
  padding: 1.25rem 1.5rem;
  max-width: 480px;
  text-align: left;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
.swotm-relay-img {
  width: 100px;
  height: 100px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.4));
}
.swotm-relay-body { flex: 1; }
.swotm-relay-title {
  font-family: var(--font-display, "Monument Extended", sans-serif);
  font-size: var(--text-sm, 0.875rem);
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  margin: 0 0 0.35rem;
}
.swotm-relay-desc {
  font-family: var(--font-body, sans-serif);
  font-size: var(--text-xs, 0.75rem);
  color: rgba(255,255,255,0.7);
  line-height: 1.5;
  margin: 0 0 0.75rem;
}
.swotm-relay-btn {
  display: inline-flex; align-items: center; justify-content: center;
  padding: 0.45rem 1.25rem;
  border-radius: 9999px;
  font-family: var(--font-body, sans-serif);
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  background: #fff;
  color: #000;
  border: none;
  transition: transform 180ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 180ms cubic-bezier(0.16, 1, 0.3, 1);
}
.swotm-relay-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(255,255,255,0.2);
}

@keyframes swotm-pulse {
  0%, 100% { opacity: 1;   transform: scale(1);   }
  50%      { opacity: 0.5; transform: scale(1.15); }
}
`;
