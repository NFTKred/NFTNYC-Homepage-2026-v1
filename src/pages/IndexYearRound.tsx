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
              <b>September 1-3</b>: three days, 12 tracks, hundreds of
              speakers. <b>Four products launched at NFT.NYC 2026</b> keep
              the stage open, 365 days a year.
            </>
          }
          meta="Times Square, New York City · Every day"
          srOnlyDescription="NFT.NYC 365 is the stage NFT.NYC became after the 2026 edition: live 365 days a year. The 2026 edition ran September 1-3 in Times Square, New York. Four products launched at the event keep the community experience open every day."
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
 * "Launched at NFT.NYC 2026" - four product cards in a responsive grid.
 * Kept as an internal component rather than a shared one because the copy
 * is specific to this page and reusing it elsewhere would mean either
 * duplicating the strings (current approach for the pre-event homepage,
 * which is archived) or threading props through for every field.
 */
interface LaunchCard {
  name: string;
  tagline: string;
  proof: React.ReactNode;
  body: React.ReactNode;
  href: string;
  accent: string;
}

const LAUNCHES: LaunchCard[] = [
  {
    name: "Collect.Kred",
    tagline: "On-chain art you can collect from anywhere.",
    proof: <><b>Over 3,000 artworks</b> submitted</>,
    body: (
      <>
        Collect.Kred, launched by NFT.NYC and supported by Kred technology,
        opened months before NFT.NYC 2026 and has not slowed down. Artists
        submit, collectors collect, and every collect rewards the artist.
      </>
    ),
    href: "https://Collect.Kred",
    accent: "#06B6D4",
  },
  {
    name: "R3ORDR.Kred",
    tagline: "Remix as a medium.",
    proof: <>Founding artist <b>Dario De Siena</b></>,
    body: (
      <>
        R3ORDR.Kred is the hub of the R3ORDR collection and the Remix Trial
        founded by artist Dario De Siena. 2026 proved out the Trial, and
        R3ORDR.Kred stays open for remix submissions.
      </>
    ),
    href: "https://R3ORDR.Kred",
    accent: "#EC4899",
  },
  {
    name: "HotGarage.Kred",
    tagline: "The Hot Wheels NFT revival.",
    proof: <>Racing, Chop Shop and performance parts, live</>,
    body: (
      <>
        HotGarage.Kred launched at NFT.NYC 2026 with racing, Chop Shop and
        performance parts: three new ways to play with a Hot Wheels digital
        collectible. A dormant collection is back on the grid.
      </>
    ),
    href: "https://HotGarage.Kred",
    accent: "#F59E0B",
  },
  {
    name: "Empire.Kred Gen2",
    tagline: "Where tokenization meets the market.",
    proof: <>Founders, Backers and Gen2 Shares, on-chain</>,
    body: (
      <>
        Empire.Kred Gen2, the economic simulation, took the stage at NFT.NYC
        2026. Founders issue Gen2 Shares, Backers buy in, and the Backer
        Share rewards a Founder in XP and in Kredits once Listed.
      </>
    ),
    href: "https://Empire.Kred",
    accent: "#8B5CF6",
  },
];

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
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1.25rem",
          }}
        >
          {LAUNCHES.map((card) => (
            <a
              key={card.name}
              href={card.href}
              target="_blank"
              rel="noopener noreferrer"
              className="scroll-fade-up"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
                padding: "1.5rem",
                background: "var(--color-surface)",
                border: "1px solid var(--card-border)",
                borderRadius: "1rem",
                textDecoration: "none",
                color: "inherit",
                position: "relative",
                overflow: "hidden",
                transition: "border-color 200ms ease, transform 200ms ease, box-shadow 200ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = card.accent;
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px -14px ${card.accent}66`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Accent bar at the top of each card */}
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "3px",
                  background: card.accent,
                  opacity: 0.85,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.1rem, 0.95rem + 0.4vw, 1.35rem)",
                  fontWeight: 700,
                  color: "var(--color-text)",
                  letterSpacing: "-0.01em",
                  lineHeight: 1.1,
                }}
              >
                {card.name}
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
              <div
                aria-hidden="true"
                style={{
                  marginTop: "auto",
                  fontFamily: "var(--font-body)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: card.accent,
                  letterSpacing: "0.01em",
                }}
              >
                Visit {card.name} &rarr;
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
