import { useEffect, useMemo, useState } from "react";
import useScrollReveal from "@/hooks/useScrollReveal";
import SiteHeader from "@/components/SiteHeader";
import NeuralMesh from "@/components/NeuralMesh";
import StatsBar from "@/components/StatsBar";
import NotableSpeakers from "@/components/NotableSpeakers";
import SpeakersSection from "@/components/SpeakersSection";
import EcosystemSection from "@/components/EcosystemSection";
import BrandQuotes from "@/components/BrandQuotes";
import WhyNFTs from "@/components/WhyNFTs";
import AttendeeTestimonials from "@/components/AttendeeTestimonials";
import MediaCoverage from "@/components/MediaCoverage";
import PastEvents from "@/components/PastEvents";
import NewsletterCapture from "@/components/NewsletterCapture";
import FAQ from "@/components/FAQ";
import SiteFooter from "@/components/SiteFooter";
import LiveGalleryHero from "@/components/LiveGalleryHero";

/**
 * Homepage (/year-round) - the post-event, year-round NFT.NYC landing page.
 *
 * Preview-only until promoted to /. Lives alongside src/pages/Index.tsx
 * (current pre-event page, unchanged) and src/pages/IndexEventTemplate.tsx
 * (archive of the pre-event page, kept for the next edition).
 *
 * Differences from the pre-event homepage:
 *   - Hero reframed around the ongoing stage, not the event date. The
 *     LiveGalleryHero still carries the gallery backdrop (collect.nft.nyc
 *     is live year-round), but every string on top of it is new.
 *   - SiteHeader runs with hideBanner + hideCountdown so no event-date
 *     urgency sits above the hero.
 *   - New "NFT.NYC 2026" recap section sets the past tense once, so
 *     every section that follows can stay in the present.
 *   - New "Launched at NFT.NYC 2026" section carries the four product
 *     launches: Collect.Kred, R3ORDR.Kred, HotGarage.Kred and
 *     Empire.Kred Gen2.
 *   - WhyNYC (persuading a visitor to travel) and SatelliteEvents (the
 *     2026 side-event calendar) are removed.
 *   - NotableSpeakers eyebrow + heading shift to past tense.
 */
export default function IndexYearRound() {
  const stage = useMemo(() => {
    try {
      return Number(localStorage.getItem("nftnyc-stage") ?? 0);
    } catch {
      return 0;
    }
  }, []);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const isOptOut = useMemo(
    () => new URLSearchParams(window.location.search).get("optout") === "true",
    [],
  );
  const [showOptOut, setShowOptOut] = useState(true);
  useEffect(() => {
    if (isOptOut) {
      const timer = setTimeout(() => setShowOptOut(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOptOut]);
  useScrollReveal();

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div data-theme={theme} style={{ background: "var(--color-bg)", minHeight: "100dvh" }}>
      <SiteHeader
        theme={theme}
        onToggleTheme={toggleTheme}
        stage={stage}
        hideBanner
        hideCountdown
      />

      {isOptOut && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 200,
            background: "linear-gradient(135deg, #10B981, #3B82F6)",
            color: "#fff",
            textAlign: "center",
            padding: "0.75rem 1.5rem",
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-base)",
            fontWeight: 600,
            letterSpacing: "0.02em",
            opacity: showOptOut ? 1 : 0,
            transition: "opacity 0.5s ease-out",
            pointerEvents: showOptOut ? "auto" : "none",
          }}
        >
          You've successfully opted out
        </div>
      )}

      <main id="main">
        {/* ======== HERO (YEAR-ROUND) ======== */}
        <LiveGalleryHero
          eyebrow="Nine editions. One stage. Every day."
          year="365"
          strap={
            <>
              The ninth edition of NFT.NYC closed in Times Square on{" "}
              <b>September 3, 2026</b>: three days, 12 tracks, hundreds of
              speakers. <b>Four products launched at NFT.NYC 2026</b> keep
              the stage open, 365 days a year.
            </>
          }
          meta="Times Square, New York City · Every day"
          srOnlyDescription="NFT.NYC 365 is the stage NFT.NYC became after the 2026 edition: live 365 days a year. The 2026 edition closed on September 3, 2026 in Times Square, New York. Four products launched at the event keep the community experience open every day."
          primary={{ label: "Start collecting", href: "https://Collect.Kred" }}
          secondary={{ label: "See the 2026 recap", href: "#launched-at-2026" }}
          liveLabel="Thousands of Collectors from around the world"
        />

        {/* ======== LAUNCHED AT NFT.NYC 2026 ========
            Four cards. Order: Collect first (biggest cumulative number),
            then R3ORDR, HotGarage, Empire.Kred. Each card leads with one
            specific proof point. */}
        <LaunchedAt2026 />

        {/* ======== TOKENIZATION LAYER STATEMENT ========
            Kept verbatim from the pre-event homepage - the sentence is
            evergreen and still reads correctly. */}
        <section
          id="about"
          style={{
            padding: "clamp(3rem, 8vw, 8rem) 1.5rem",
            background: "#0a0a0f",
          }}
        >
          <div className="max-w-[960px] mx-auto text-center">
            <h2
              className="scroll-fade-up"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-xl)",
                fontWeight: 500,
                color: "var(--color-text)",
                letterSpacing: "-0.01em",
                lineHeight: 1.4,
                maxWidth: "50ch",
                marginInline: "auto",
                marginBottom: "2.5rem",
              }}
            >
              NFTs are the{" "}
              <span
                className="rainbow-glow"
                data-text="tokenization layer"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "liquidGradient 12s ease-in-out infinite",
                }}
              >
                tokenization layer
              </span>{" "}
              for virtual assets - from AI agent identity to gaming economies,
              from community ownership to{" "}
              <span
                className="rainbow-glow"
                data-text="digital culture"
                style={{
                  background:
                    "linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)",
                  backgroundSize: "300% 300%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  animation: "liquidGradient 12s ease-in-out infinite",
                  animationDelay: "-4s",
                }}
              >
                digital culture
              </span>
              .
            </h2>
          </div>
        </section>

        <div className="flex justify-center w-full">
          <NeuralMesh />
        </div>

        <StatsBar />

        {/* Speakers reframed in past tense - same component, two prop
            overrides (eyebrow and heading). */}
        <NotableSpeakers
          eyebrow="Voices at NFT.NYC 2026"
          heading="Who took the stage"
        />

        {/* ======== OUR NORTH STAR (evergreen) ======== */}
        <section
          id="north-star"
          style={{
            padding: "clamp(3rem, 8vw, 8rem) 1.5rem",
            background: "var(--color-surface)",
            borderTop: "1px solid var(--card-border)",
            borderBottom: "1px solid var(--card-border)",
          }}
        >
          <div className="max-w-[960px] mx-auto text-center">
            <div
              className="flex flex-col items-center scroll-fade-up"
              style={{ marginBottom: "1.5rem" }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-lg)",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                }}
              >
                Our North Star
              </h3>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: "1rem",
                textAlign: "left",
              }}
            >
              {[
                { icon: "🎤", title: "Community Voice", desc: "A stage for the NFT community to share the most relevant ideas." },
                { icon: "🤝", title: "Community Connection", desc: "Bring people together who are working on like projects." },
                { icon: "📣", title: "Proselytize NFTs", desc: "Educate the global community about the value of NFTs." },
                { icon: "⚡", title: "Create Engagement", desc: "Use NFTs to create engagement that delivers our first 3 values." },
              ].map((v) => (
                <div
                  key={v.title}
                  className="scroll-fade-scale"
                  style={{
                    background: "var(--color-surface)",
                    border: "1px solid var(--card-border)",
                    borderRadius: "0.75rem",
                    padding: "1.5rem",
                    boxShadow: "var(--shadow-sm)",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <span style={{ fontSize: "1.5rem", display: "block", marginBottom: "0.75rem" }}>
                    {v.icon}
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-sm)",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      textTransform: "uppercase",
                      letterSpacing: "-0.01em",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {v.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <NewsletterCapture />

        {stage >= 1 && <SpeakersSection />}
        <EcosystemSection />
        <BrandQuotes />
        <WhyNFTs />
        <AttendeeTestimonials />
        <MediaCoverage />
        <PastEvents />
        {/* SatelliteEvents removed - the 2026 side-event calendar is not
            maintained year-round. */}
        <FAQ />

        <SiteFooter stage={stage} />
      </main>
    </div>
  );
}

/**
 * "Launched at NFT.NYC 2026" - four product cards laid out as two rows
 * of two on desktop, each with a 16:9 media header. Each card's media
 * is one of three types:
 *   - image: a single JPG/PNG background with an optional wordmark overlay
 *   - video: an autoplay, loop, muted <video> that sits in the media area
 *   - rotating: a slide-show of images that cross-fade on a timer
 */
type CardMedia =
  | { kind: "image"; src: string; alt: string; wordmark?: string }
  | { kind: "video"; src: string; poster?: string }
  | { kind: "rotating"; srcs: string[]; alt: string; intervalMs?: number };

/**
 * Featured row beside each card body. A card either features a single
 * individual (single circle avatar: photo if `src`, else accent circle
 * with `initials`) or a group (a stack of overlapping circles: one per
 * entry in `stack`). Setting `stack` overrides `src` and `initials`.
 * Swap in real photos by dropping JPGs into /public/launches/ and setting
 * `src` on either the person or a stack entry.
 */
interface StackedAvatar {
  src?: string;
  initials?: string;
  tone?: string;
}

interface FeaturedPerson {
  name: string;
  role: string;
  src?: string;
  initials?: string;
  stack?: StackedAvatar[];
}

interface LaunchCard {
  name: string;
  tagline: string;
  proof: React.ReactNode;
  body: React.ReactNode;
  href: string;
  accent: string;
  media: CardMedia;
  featured: FeaturedPerson;
  cta: string;
  /** Path to the product's own favicon (a PNG in /public/launches/favicons).
   *  Sits beside the name as the product's logo mark. */
  mark: string;
}

const LAUNCHES: LaunchCard[] = [
  {
    name: "Collect.Kred",
    tagline: "On-chain art you can collect from anywhere.",
    proof: <><b>Over 3,000 artworks</b> submitted</>,
    body: (
      <>
        Collect.Kred, launched by NFT.NYC and supported by Kred technology,
        opened in the months leading up to NFT.NYC 2026 with a mission of
        helping digital creators find new collectors. Artists submit,
        collectors collect, fans remix, and every piece collected rewards
        the artist.
      </>
    ),
    href: "https://Collect.Kred",
    cta: "Collect now",
    accent: "#06B6D4",
    mark: "/launches/favicons/collect.png",
    media: {
      kind: "image",
      src: "/launches/collect-kred-hero.jpg",
      alt: "Collect.Kred - a community of artists and collectors on-chain",
    },
    featured: {
      name: "100+ Featured Artists",
      role: "Already USDC Approved",
      stack: [
        { src: "/launches/collect-artists/yuzapata.webp" },
        { src: "/launches/collect-artists/junrott.webp" },
        { src: "/launches/collect-artists/luetas.jpg" },
        { src: "/launches/collect-artists/thorium.webp" },
        { src: "/launches/collect-artists/lia.webp" },
      ],
    },
  },
  {
    name: "Remix.Kred",
    tagline: "Remix as a medium.",
    proof: <>Open to every artist</>,
    body: (
      <>
        Remix.Kred opens remix as a medium to every artist. R3ORDR, founded
        by Dario De Siena, was the trial collection that proved the model at
        NFT.NYC 2026. Remix.Kred brings that model to everyone.
      </>
    ),
    href: "https://Remix.Kred",
    cta: "Remix now",
    accent: "#EC4899",
    mark: "/launches/favicons/remix.svg",
    media: {
      kind: "video",
      src: "/launches/r3ordr-loop.mp4",
    },
    featured: {
      name: "Dario De Siena",
      role: "Founding artist, R3ORDR",
      src: "/launches/dario-desiena.jpeg",
    },
  },
  {
    name: "HotGarage.Kred",
    tagline: "Reviving dormant collections.",
    proof: <>Racing, Chop Shop and performance parts, live</>,
    body: (
      <>
        HotGarage.Kred, the unofficial digital garage for Hot Wheels
        Collectibles owners, opened in the months before NFT.NYC 2026.
        Over 549,000 Collectibles moved to owner wallets after the Mattel
        shutdown. Owners race on six tracks, fit Performance Parts and
        build new cars in the Custom Workshop, and every car stays in
        its owner's wallet.
      </>
    ),
    href: "https://HotGarage.Kred",
    cta: "Open your garage",
    accent: "#F59E0B",
    mark: "/launches/favicons/hotgarage.png",
    media: {
      kind: "rotating",
      // Race highlight images pulled from the HotGarage.Kred activity feed.
      // Updated manually; the feed has new moments regularly.
      srcs: [
        "/launches/hotgarage-races/race-moment-516.jpg",
        "/launches/hotgarage-races/race-moment-514.jpg",
        "/launches/hotgarage-races/race-moment-513.jpg",
        "/launches/hotgarage-races/race-moment-512.jpg",
        "/launches/hotgarage-races/race-moment-511.jpg",
        "/launches/hotgarage-races/race-moment-510.jpg",
      ],
      alt: "HotGarage.Kred - a race highlight from the activity feed",
      intervalMs: 3500,
    },
    featured: {
      name: "Naozo NZ",
      role: "Featured Driver",
      src: "/launches/naozo-nz.webp",
    },
  },
  {
    name: "Empire.Kred Gen 2",
    tagline: "Where tokenization meets the market.",
    proof: <>Founders, Backers and Gen 2 Shares, on-chain</>,
    body: (
      <>
        Empire.Kred returned to the stage at NFT.NYC 2026 to introduce
        Gen 2. Founders issue Gen 2 Shares, Backers buy in, and the Backer
        Share rewards a Founder in XP and in Kredits once Listed.
      </>
    ),
    href: "https://Empire.Kred",
    cta: "Ring the bell",
    accent: "#8B5CF6",
    mark: "/launches/favicons/empire.png",
    media: {
      kind: "image",
      src: "/launches/empire-kred-hero.jpg",
      alt: "Empire.Kred - the social Share simulation",
    },
    featured: {
      name: "Lynn O'Connell",
      role: "Presented during NFT.NYC 2019",
      src: "/launches/lynn-oconnell.jpg",
    },
  },
];

/**
 * Renders the 16:9 media header of a launch card. Image kind paints a
 * single <img> and optionally overlays a wordmark badge over the centre.
 * Video kind renders an autoplay, loop, muted inline <video>. Rotating
 * kind cross-fades between images on a timer with reduced-motion fallback.
 */
function LaunchCardMedia({ media, accent }: { media: CardMedia; accent: string }) {
  const [rotatingIndex, setRotatingIndex] = useState(0);

  // Rotator effect only runs when media kind is "rotating". Reduced-motion
  // viewers see the first frame only; everyone else sees a gentle crossfade
  // every intervalMs.
  useEffect(() => {
    if (media.kind !== "rotating") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const delay = media.intervalMs ?? 3500;
    const id = window.setInterval(() => {
      setRotatingIndex((i) => (i + 1) % media.srcs.length);
    }, delay);
    return () => window.clearInterval(id);
  }, [media]);

  return (
    <div
      aria-hidden={media.kind === "video" ? "true" : undefined}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "16 / 9",
        overflow: "hidden",
        borderRadius: "0.5rem",
        background: "#0a0a0f",
      }}
    >
      {media.kind === "image" && (
        <>
          <img
            src={media.src}
            alt={media.alt}
            loading="lazy"
            decoding="async"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
          {media.wordmark && (
            <>
              {/* Scrim behind the wordmark so the text reads on any image */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0.0) 100%)",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.5rem, 3vw, 2.75rem)",
                  fontWeight: 700,
                  color: "#F0F0F5",
                  letterSpacing: "-0.015em",
                  textShadow: "0 2px 12px rgba(0,0,0,0.8)",
                }}
              >
                {media.wordmark}
              </span>
            </>
          )}
        </>
      )}

      {media.kind === "video" && (
        <video
          src={media.src}
          poster={media.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      {media.kind === "rotating" && (
        // Stack every frame absolutely in the same box; only the active
        // index has opacity 1, everyone else fades out.
        <>
          {media.srcs.map((src, i) => (
            <img
              key={src}
              src={src}
              alt={i === 0 ? media.alt : ""}
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                opacity: i === rotatingIndex ? 1 : 0,
                transition: "opacity 900ms ease",
              }}
            />
          ))}
        </>
      )}

      {/* Thin accent line along the bottom of the media area so the card
          still carries its brand colour even when the top is a solid
          image or video. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "2px",
          background: accent,
          opacity: 0.85,
        }}
      />
    </div>
  );
}

/**
 * Small row that shows the featured individual beside their name and role.
 * When `src` is set, the avatar is that photo; otherwise it is a solid
 * brand-accent circle with initials (or empty, for an anonymous placeholder).
 */
function FeaturedAvatar({ person, accent }: { person: FeaturedPerson; accent: string }) {
  const singleAvatar = (
    <div
      aria-hidden="true"
      style={{
        width: "36px",
        height: "36px",
        borderRadius: "9999px",
        background: person.src
          ? `url(${person.src}) center/cover no-repeat`
          : `linear-gradient(135deg, ${accent}cc, ${accent}55)`,
        border: `1px solid ${accent}66`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-display)",
        fontSize: "13px",
        fontWeight: 700,
        color: "#fff",
        letterSpacing: "0.02em",
        flex: "0 0 36px",
      }}
    >
      {!person.src && person.initials}
    </div>
  );

  // Stacked avatars overlap left-to-right. Each sits 14px right of the
  // previous one and above it in z-order, so the newest avatar in the
  // array lands at the back and the first sits in front.
  const stackAvatars = person.stack && (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        // Width is the first circle plus one 14px step per extra circle.
        width: `${36 + Math.max(0, person.stack.length - 1) * 14}px`,
        height: "36px",
        flex: "0 0 auto",
      }}
    >
      {person.stack.map((entry, i) => {
        const tone = entry.tone ?? accent;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${i * 14}px`,
              width: "28px",
              height: "28px",
              borderRadius: "9999px",
              background: entry.src
                ? `url(${entry.src}) center/cover no-repeat`
                : `linear-gradient(135deg, ${tone}dd, ${tone}66)`,
              border: `2px solid var(--color-surface)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontSize: "11px",
              fontWeight: 700,
              color: "#fff",
              zIndex: person.stack!.length - i,
              boxShadow: "0 1px 2px rgba(0,0,0,0.25)",
            }}
          >
            {!entry.src && entry.initials}
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
      {person.stack ? stackAvatars : singleAvatar}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--color-text)",
          }}
        >
          {person.name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "12px",
            color: "var(--color-text-muted)",
          }}
        >
          {person.role}
        </span>
      </div>
    </div>
  );
}

function LaunchedAt2026() {
  return (
    <section
      id="launched-at-2026"
      style={{
        padding: "clamp(3rem, 8vw, 6rem) 1.5rem",
        background: "var(--color-bg)",
      }}
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center" style={{ marginBottom: "3rem" }}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-xs)",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--color-text-faint)",
              marginBottom: "0.75rem",
            }}
          >
            September 2026
          </p>
          <h2
            className="scroll-fade-up"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 1rem + 2.5vw, 3rem)",
              fontWeight: 700,
              color: "var(--color-text)",
              letterSpacing: "-0.02em",
              textTransform: "uppercase",
            }}
          >
            Launched at NFT.NYC 2026
          </h2>
          <p
            className="scroll-fade-up"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-base)",
              color: "var(--color-text-muted)",
              lineHeight: 1.55,
              maxWidth: "58ch",
              marginInline: "auto",
              marginTop: "0.9rem",
            }}
          >
            Four products stepped onto the stage at NFT.NYC 2026. All four
            are still open.
          </p>
        </div>
        <div
          className="launches-grid"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {LAUNCHES.map((card) => (
            <article
              key={card.name}
              className="launch-card scroll-fade-up"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 5fr) minmax(0, 7fr)",
                gap: "1.5rem",
                padding: "1rem",
                background: "var(--color-surface)",
                border: "1px solid var(--card-border)",
                borderRadius: "1rem",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 200ms ease, box-shadow 200ms ease",
                // CSS variable so the hover state below can read the card's
                // accent without needing a per-card inline style for every
                // interactive child.
                ["--card-accent" as never]: card.accent,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = card.accent;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px -14px ${card.accent}66`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Media column: 16:9 image / video / rotating slides */}
              <LaunchCardMedia media={card.media} accent={card.accent} />

              {/* Content column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                  padding: "0.25rem 0.25rem 0",
                }}
              >
                {/* Brand lockup: the product's own favicon sits beside the
                    name so each title reads as a product mark and not just
                    heading text. */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.55rem",
                  }}
                >
                  <img
                    src={card.mark}
                    alt=""
                    aria-hidden="true"
                    width={22}
                    height={22}
                    loading="lazy"
                    decoding="async"
                    style={{
                      display: "block",
                      width: "22px",
                      height: "22px",
                      flex: "0 0 22px",
                      objectFit: "contain",
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "clamp(1.1rem, 0.95rem + 0.4vw, 1.4rem)",
                      fontWeight: 700,
                      color: "var(--color-text)",
                      letterSpacing: "-0.015em",
                      lineHeight: 1.1,
                    }}
                  >
                    {card.name}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: card.accent,
                    fontWeight: 600,
                    letterSpacing: "0.01em",
                  }}
                >
                  {card.tagline}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--color-text-faint)",
                  }}
                >
                  {card.proof}
                </div>
                <FeaturedAvatar person={card.featured} accent={card.accent} />
                <div
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "var(--color-text-muted)",
                    lineHeight: 1.55,
                  }}
                >
                  {card.body}
                </div>
                <a
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="launch-cta"
                  style={{
                    marginTop: "auto",
                    alignSelf: "flex-start",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.6rem 1.1rem",
                    borderRadius: "9999px",
                    background: card.accent,
                    color: "#0a0a0f",
                    fontFamily: "var(--font-body)",
                    fontSize: "13px",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    textDecoration: "none",
                    boxShadow: `0 6px 18px -8px ${card.accent}aa`,
                    transition: "transform 150ms ease, box-shadow 150ms ease, filter 150ms ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
                    (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 24px -8px ${card.accent}cc`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.filter = "none";
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 6px 18px -8px ${card.accent}aa`;
                  }}
                >
                  {card.cta}
                  <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
      {/* Each card lays out media-left, content-right on desktop; at
          narrow widths media stacks above content. Kept as a <style>
          block so a media query can drive the article's own grid. */}
      <style>{`
        @media (max-width: 720px) {
          .launch-card {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
