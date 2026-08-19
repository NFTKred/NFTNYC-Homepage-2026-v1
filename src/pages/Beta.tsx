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
import WhyNYC from "@/components/WhyNYC";
import PastEvents from "@/components/PastEvents";
import SatelliteEvents from "@/components/SatelliteEvents";
import NewsletterCapture from "@/components/NewsletterCapture";
import FAQ from "@/components/FAQ";
import SiteFooter from "@/components/SiteFooter";
import LiveGalleryHero from "@/components/beta/LiveGalleryHero";

/**
 * /beta - hero redesign preview.
 *
 * Same shell as / (Index.tsx) - every section below the hero renders the
 * exact same component the live homepage does. Only the hero swaps.
 * Kept as a full duplicate on purpose: the live Index.tsx must not be
 * touched by this preview, and the two pages diverge here so evaluators
 * can see the new hero in the real content context.
 *
 * When we're ready to promote /beta to /, delete Index.tsx's hero markup,
 * import LiveGalleryHero there, and remove this file. Route in App.tsx.
 */
export default function Beta() {
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

  const btnBase: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1rem 2rem",
    borderRadius: "9999px",
    fontFamily: "var(--font-body)",
    fontWeight: 600,
    fontSize: "var(--text-base)",
    textDecoration: "none",
    cursor: "pointer",
    minHeight: "44px",
    border: "none",
    transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
  };

  return (
    <div data-theme={theme} style={{ background: "var(--color-bg)", minHeight: "100dvh" }}>
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} stage={stage} />

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
        {/* ======== HERO (BETA - LIVE GALLERY GROUND) ======== */}
        <LiveGalleryHero />

        {/* ======== TOKENIZATION LAYER STATEMENT ========
            Sits above the diagram so the sentence is what the visitor
            reads before they see it visualised in NeuralMesh below. */}
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
            {stage >= 1 && (
              <div className="flex gap-4 justify-center flex-wrap">
                <a
                  href="https://sessionize.com/nft-nyc-2026/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ ...btnBase, background: "var(--color-primary)", color: "#fff" }}
                >
                  Speak at NFT.NYC 2026
                </a>
                <a
                  href="mailto:sponsors@nft.nyc?subject=NFT.NYC%202026%20Sponsorship%20Inquiry"
                  style={{
                    ...btnBase,
                    background: "transparent",
                    color: "var(--color-text)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  Become a Sponsor
                </a>
              </div>
            )}
            <div style={{ marginTop: "1.25rem", display: "flex", justifyContent: "center" }}>
              <a
                href="/program"
                style={{
                  ...btnBase,
                  background: "transparent",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                }}
              >
                View the Program
              </a>
            </div>
          </div>
        </section>

        <div className="flex justify-center w-full">
          <NeuralMesh />
        </div>

        <StatsBar />

        <NotableSpeakers />

        {/* ======== OUR NORTH STAR ======== */}
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

        <WhyNYC stage={stage} />

        <NewsletterCapture />

        {stage >= 1 && <SpeakersSection />}
        <EcosystemSection />
        <BrandQuotes />
        <WhyNFTs />
        <AttendeeTestimonials />
        <MediaCoverage />
        <PastEvents />
        {stage >= 1 && <SatelliteEvents />}
        <FAQ />

        <SiteFooter stage={stage} />
      </main>
    </div>
  );
}
