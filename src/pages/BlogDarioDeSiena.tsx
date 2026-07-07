import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "Speaker Spotlight: Dario De Siena, the Artist Rebuilding the Picture",
  description:
    "The Swiss-based painter and NFT creator behind R3ORDR joins NFT.NYC Co-founder Jodee Rich for a fireside chat at NFT.NYC 2026 on breaking, rebuilding, and treating art as a living system.",
  url: "https://www.nft.nyc/blog/dario-de-siena",
  mainEntityOfPage: "https://www.nft.nyc/blog/dario-de-siena",
  image: "https://www.nft.nyc/blog/dario-de-siena/speaker-card.png",
  author: { "@type": "Organization", name: "NFT.NYC", url: "https://www.nft.nyc" },
  publisher: {
    "@type": "Organization",
    name: "NFT.NYC",
    logo: { "@type": "ImageObject", url: "https://www.nft.nyc/favicon.jpg" },
  },
  datePublished: "2026-07-07",
  dateModified: "2026-07-07",
  inLanguage: "en",
};

const IMG = "/blog/dario-de-siena";

const openTicketing = () => window.dispatchEvent(new CustomEvent("nftnyc:open-ticketing"));

function Figure({ src, alt, caption, maxWidth }: { src: string; alt: string; caption?: string; maxWidth?: number }) {
  return (
    <figure style={{ margin: "32px 0", ...(maxWidth ? { maxWidth, marginLeft: "auto", marginRight: "auto" } : {}) }}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
          borderRadius: 16,
          border: "1px solid var(--color-border)",
        }}
      />
      {caption && (
        <figcaption style={{
          fontFamily: "var(--font-body)",
          fontSize: 13,
          color: "var(--color-text-muted)",
          textAlign: "center",
          marginTop: 10,
          lineHeight: 1.5,
        }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default function BlogDarioDeSiena() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ARTICLE_JSON_LD)}</script>
      </Helmet>
      <PageMeta
        title="Speaker Spotlight: Dario De Siena — NFT.NYC 2026"
        description="The Swiss-based painter and NFT creator behind R3ORDR joins NFT.NYC Co-founder Jodee Rich for a fireside chat at NFT.NYC 2026 on breaking, rebuilding, and treating art as a living system."
        path="/blog/dario-de-siena"
      />
      <Header theme="dark" onToggleTheme={() => {}} />

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "140px 24px 80px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            height: 6,
            borderRadius: 999,
            background: "linear-gradient(135deg, #06B6D4, #8B5CF6, #EC4899)",
            marginBottom: 32,
          }} />
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.25em",
            color: "var(--color-text-muted)",
            margin: "0 0 12px",
          }}>
            NFT.NYC 2026 · SPEAKER SPOTLIGHT · 7 JULY 2026
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(30px, 4.6vw, 46px)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
          }}>
            Speaker Spotlight: Dario De Siena, the Artist Rebuilding the Picture
          </h1>
        </div>

        <Figure
          src={`${IMG}/speaker-card.png`}
          alt="Dario De Siena speaker card. Cryptopunk avatar in a blue bandana with a cigarette, framed by an NFT.NYC 2026 SPEAKER badge."
          caption="Dario De Siena, NFT.NYC 2026 speaker card"
          maxWidth={520}
        />

        <p style={paragraphStyle}>Some artists polish. Dario De Siena breaks.</p>
        <p style={paragraphStyle}>
          The Swiss-based painter and NFT creator has built his reputation on a process of building, breaking, and rebuilding images until they become raw visual statements about identity, tension, and transformation. It's a philosophy that runs from his graffiti roots all the way to R3ORDR, the generative art protocol he launched this year. And at NFT.NYC 2026, he'll sit down with NFT.NYC Co-founder Jodee Rich for a fireside chat about exactly how that universe works.
        </p>

        {/* Section 1 */}
        <section style={{ marginTop: 40 }}>
          <h2 style={sectionH2Style}>FROM SPRAY CANS TO ROLLING STONE</h2>
          <p style={paragraphStyle}>
            De Siena's path started in graffiti and street art culture, then evolved into expressive mixed-media portraiture: acrylic and spray paint, bold color, emotional abstraction. What sets his work apart is his embrace of imperfection. He deliberately integrates perceived failures into the work, treating every misstep as material.
          </p>

          <Figure
            src={`${IMG}/dario-at-work.jpg`}
            alt="Dario De Siena in his studio, painting a brushstroke of purple paint that crosses in front of the camera."
            caption="Dario at work in his studio (photo: dariodesiena.com)"
          />

          <p style={paragraphStyle}>
            He entered the NFT space in 2021 and became one of the early physical artists to make the leap successfully. Recognition came fast. His reinterpretations of Bored Ape Yacht Club characters were featured in Rolling Stone. He exhibited internationally, including at NFT Paris. And he took home Best Physical Artist honors at NFT.NYC in 2021, which makes his 2026 session something of a homecoming. Along the way, projects like Third Eye, MINDDS, and FLUX charted his evolution, with FLUX marking his first deep experiments in balancing hand-made art with AI generation. Across four years, his collections have generated thousands of ETH in secondary trading volume.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginTop: 40 }}>
          <h2 style={sectionH2Style}>R3ORDR: ART AS A LIVING SYSTEM</h2>
          <p style={paragraphStyle}>
            R3ORDR is where all of it converges. Described as an evolving generative art protocol, it sits at the intersection of contemporary art, internet culture, and AI-driven systems. The collection's Hall of Fame anchors the project with 69 one-of-one artworks, but the pieces themselves are only half the story.
          </p>

          <figure style={{ margin: "32px 0" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}>
              <img src={`${IMG}/noise-dealer.jpg`} alt="R3ORDR Hall of Fame: NOISE DEALER" loading="lazy" style={hallOfFameImgStyle} />
              <img src={`${IMG}/digital-alchemist.jpg`} alt="R3ORDR Hall of Fame: DIGITAL ALCHEMIST" loading="lazy" style={hallOfFameImgStyle} />
              <img src={`${IMG}/chaos-architect.jpg`} alt="R3ORDR Hall of Fame: CHAOS ARCHITECT" loading="lazy" style={hallOfFameImgStyle} />
            </div>
            <figcaption style={{
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--color-text-muted)",
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.5,
            }}>
              From the R3ORDR Hall of Fame: NOISE DEALER, DIGITAL ALCHEMIST, CHAOS ARCHITECT (artwork: Dario De Siena, r3ordr.com)
            </figcaption>
          </figure>

          <p style={paragraphStyle}>
            There's no traditional roadmap and no utility checklist. Instead, R3ORDR operates as an open protocol that grows through repetition, reconstruction, and collective participation. The community doesn't just observe the system. It feeds it: artworks, memes, edits, prompts, and conversations continuously reshape the project in real time. The system never fully stabilizes, and that instability is the point. It's the same trial-and-error philosophy that defined his paintings, now running at the scale of a living ecosystem.
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ marginTop: 40 }}>
          <h2 style={sectionH2Style}>SEE HIM AT NFT.NYC 2026</h2>

          <div style={{ display: "flex", alignItems: "center", gap: 20, margin: "20px 0 28px" }}>
            <img
              src={`${IMG}/cryptopunk-avatar.jpg`}
              alt="Dario De Siena's cryptopunk avatar."
              loading="lazy"
              style={{
                width: 96,
                height: 96,
                borderRadius: 12,
                border: "1px solid var(--color-border)",
                flexShrink: 0,
              }}
            />
            <div style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--color-text-muted)", lineHeight: 1.55 }}>
              Fireside chat with NFT.NYC Co-founder Jodee Rich · NFT.NYC 2026 · Times Square, 1–3 September
            </div>
          </div>

          <p style={paragraphStyle}>
            In his fireside chat with Jodee Rich, De Siena will unpack his process, the thinking behind R3ORDR, and what it means for the future of NFT art: what happens when an artist stops shipping finished objects and starts building systems that keep evolving after the mint.
          </p>
          <p style={paragraphStyle}>
            If you care about where NFT art goes next, this is a conversation to be in the room for.
          </p>
          <p style={paragraphStyle}>
            Follow Dario on X at <a href="https://x.com/Dario_Desiena" target="_blank" rel="noopener noreferrer" style={linkStyle}>@Dario_Desiena</a> and explore the project at <a href="https://r3ordr.com" target="_blank" rel="noopener noreferrer" style={linkStyle}>r3ordr.com</a>.
          </p>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <button
              onClick={openTicketing}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg, #06B6D4, #8B5CF6, #EC4899)",
                backgroundSize: "300% 300%",
                animation: "liquidGradient 12s ease-in-out infinite",
                border: "none",
                borderRadius: 9999,
                padding: "0.85rem 2.25rem",
                cursor: "pointer",
              }}
            >
              Get your Earlybird ticket →
            </button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

const sectionH2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(22px, 3vw, 28px)",
  fontWeight: 800,
  lineHeight: 1.2,
  letterSpacing: "0.02em",
  margin: "0 0 20px",
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 16,
  lineHeight: 1.7,
  color: "var(--color-text)",
  margin: "0 0 18px",
};

const linkStyle: React.CSSProperties = {
  color: "var(--color-primary)",
  textDecoration: "underline",
  textUnderlineOffset: "3px",
};

const hallOfFameImgStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  height: "auto",
  aspectRatio: "3 / 4",
  objectFit: "cover",
  borderRadius: 12,
  border: "1px solid var(--color-border)",
};
