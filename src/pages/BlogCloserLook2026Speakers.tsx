import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "A Closer Look at Some Key NFT.NYC 2026 Speakers",
  description:
    "One approved session from each of the ten NFT.NYC 2026 tracks — from AI agents with on-chain identities to lunar NFT museums, national experiential-NFT frameworks, and communities that outlasted the market that minted them.",
  url: "https://www.nft.nyc/blog/closer-look-2026-speakers",
  mainEntityOfPage: "https://www.nft.nyc/blog/closer-look-2026-speakers",
  image: "https://www.nft.nyc/og/speak.png",
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

interface Session {
  track: string;
  trackColor: string;
  title: string;
  speaker: string;
  role: string;
  avatar: string;
  body: React.ReactNode;
}

const SESSIONS: Session[] = [
  {
    track: "Game Tokenization",
    trackColor: "#8B5CF6",
    title: "Culture, Web3 & the Metaverse, 3 Years Later: An Update from Animoca Brands",
    speaker: "Yat Siu",
    role: "Co-Founder and Executive Chairman, Animoca Brands",
    avatar: "https://cdn.sessionize.com/image/3c39-400o400o1-MaGWEfynyiuXyzuCmhnCRP.jpg",
    body: (
      <>Three years after his landmark NFT.NYC talk on culture and the open metaverse, Yat Siu returns with an update from one of Web3's most consequential companies. Few people have a wider view of where game tokenization, digital property rights, and the metaverse economy actually stand, and where they're going next.</>
    ),
  },
  {
    track: "Social NFTs",
    trackColor: "#EC4899",
    title: "Proof of Time: The NFT That Can Only Be Minted by Being There",
    speaker: "Tom Friend",
    role: "",
    avatar: "/speakers/tom-friend.jpg",
    body: (
      <>&ldquo;Every NFT today is backed by computational work or capital: machines and money. Proof of Time proposes a third backing, verified shared human presence.&rdquo; It's a token that can't be bought and can't be farmed. In a year dominated by AI-generated everything, this may be the most human protocol idea on the program.</>
    ),
  },
  {
    track: "AI Agent Tokenization",
    trackColor: "#3B82F6",
    title: "Tokenizing AI Models: How NFTs Turn Decentralized Intelligence into a New Asset Class",
    speaker: "Jiahao Sun",
    role: "Founder & CEO, FLock.io",
    avatar: "https://cdn.sessionize.com/image/5c86-400o400o1-HnfjGAV6jjQ4LCaB7qGV4U.jpg",
    body: (
      <>What happens when AI models themselves become tradeable on-chain assets? Jiahao Sun introduces Real Model Assets, a token class where &ldquo;value accrues from real AI inference revenue rather than speculation.&rdquo; It's one of the clearest visions yet of how NFTs and AI converge into something entirely new.</>
    ),
  },
  {
    track: "Creator Economy",
    trackColor: "#F59E0B",
    title: "When Reality Is Fake: How Deepfakes Are Manipulating Crypto Markets and How to Fix It",
    speaker: "Sandra Cai",
    role: "Founder, Plurall AI",
    avatar: "https://cdn.sessionize.com/image/4040-400o400o1-h6cDrwm24MuzXfj5P3Xsd4.png",
    body: (
      <>Voice-cloned CEOs pumping tokens. Synthetic influencer endorsements. AI-generated content faking NFT provenance. &ldquo;Deepfake attacks on crypto markets are accelerating, and the tools to detect them don't yet exist at scale.&rdquo; This session explores how on-chain verification and ZK-proof identity layers can provide defense.</>
    ),
  },
  {
    track: "Brands",
    trackColor: "#F97316",
    title: "Smart Heritage: How Italy Is Using Experiential NFTs and AI to Solve Overtourism",
    speaker: "Luca Busolli",
    role: "Blockchain Consultant",
    avatar: "https://cdn.sessionize.com/image/8de0-400o400o1-UWUN1cJp19ZPD2RmfjTVPj.jpg",
    body: (
      <>Italy's iconic cities are choking on tourists while its hidden villages go unvisited. Smart Heritage represents &ldquo;a national framework proposal that uses experiential NFTs (digital presence certificates claimed on location)&rdquo; to redirect visitor flow. Busolli presents a vision of NFTs functioning as real public infrastructure at a country scale.</>
    ),
  },
  {
    track: "RWA Tokenization",
    trackColor: "#EF4444",
    title: "Art Beyond Earth: From the First NFT Museum on the Moon to the Future of Digital Ownership in Space",
    speaker: "Scott Spiegel",
    role: "CEO, BitBasel",
    avatar: "/speakers/scott-spiegel.jpg",
    body: (
      <>BitBasel previously proposed bringing NFTs and digital art into space. That vision has materialized into actual lunar missions and permanent cultural archives beyond Earth. Spiegel returns with updates on the next phase of digital ownership extending beyond our planet.</>
    ),
  },
  {
    track: "Culture, Art and Music",
    trackColor: "#D946EF",
    title: "All In: Music NFTs in the Age of AI",
    speaker: "derelict.eth",
    role: "CEO of gatefold.xyz",
    avatar: "https://cdn.sessionize.com/image/7ead-400o400o1-fjEYsfYPK5vhabn3tcKx8h.jpg",
    body: (
      <>AI is transforming music distribution and may undermine the current all-you-can-eat streaming model. Drawing on experiences from previous music NFT cycles, this discussion examines how decentralized systems could reshape music creation, distribution, discovery, and ownership structures.</>
    ),
  },
  {
    track: "NFT Marketplaces",
    trackColor: "#38BDF8",
    title: "You Don't Own Your NFT. Now What?",
    speaker: "Celine Moille",
    role: "Lawyer",
    avatar: "https://cdn.sessionize.com/image/b727-400o400o1-pox6r1TXFXuF9duzdTP2uy.jpg",
    body: (
      <>Most collectors believe they fully own their NFTs. In reality, &ldquo;ownership is shaped by licenses, marketplace rules, and royalty enforcement that is inconsistent or absent across platforms.&rdquo; This legal examination clarifies what &ldquo;ownership&rdquo; actually entails and what changes are necessary.</>
    ),
  },
  {
    track: "DeFi",
    trackColor: "#10B981",
    title: "1099-DAs and AI Bots: How to Protect Your NFT Gains in 2026 and Beyond",
    speaker: "Zac McClure",
    role: "Co-Founder and CEO, TokenTax",
    avatar: "https://cdn.sessionize.com/image/4a31-400o400o1-Bue5qQRAX49uYHTmagLR65.jpg",
    body: (
      <>Between Form 1099-DA introduction and IRS wallet-by-wallet tracking requirements, NFT taxation has become significantly more complex in 2026. This session offers practical guidance for the tax season, covering those who have engaged in NFT flipping or claim RWA-linked tokens.</>
    ),
  },
  {
    track: "On-chain Infrastructure",
    trackColor: "#06B6D4",
    title: "From JPEGs to Verifiable NFTs: Secure Reveal, Dynamic Logic & Max Guarantees",
    speaker: "ariutokintumi",
    role: "Author of Datamorpho, Co-Founder of EVVM.org",
    avatar: "https://cdn.sessionize.com/image/67c5-400o400o1-hFvcE32GY2GfLoA3bfhX8n.jpg",
    body: (
      <>&ldquo;Most NFTs still run on trust: metadata servers, delayed reveals, off-chain logic.&rdquo; When NFTs power games, dynamic characteristics, AI identity, and RWAs, trust becomes insufficient. This session outlines verifiable NFT architecture with provable reveal mechanics and tamper-resistant dynamic tokens.</>
    ),
  },
];

const openTicketing = () => window.dispatchEvent(new CustomEvent("nftnyc:open-ticketing"));

export default function BlogCloserLook2026Speakers() {
  const trackGradient = `linear-gradient(135deg, ${SESSIONS.map(s => s.trackColor).join(", ")})`;

  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ARTICLE_JSON_LD)}</script>
      </Helmet>
      <PageMeta
        title="A Closer Look at Some Key NFT.NYC 2026 Speakers"
        description="One approved session from each of the ten NFT.NYC 2026 tracks — AI agents, RWAs, deepfake defense, national NFT frameworks, and the first NFT museum on the moon."
        path="/blog/closer-look-2026-speakers"
      />
      <Header theme="dark" onToggleTheme={() => {}} />

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "140px 24px 80px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 48 }}>
          <div style={{
            height: 6,
            borderRadius: 999,
            background: trackGradient,
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
            NFT.NYC 2026 · SPEAKER PREVIEW · 7 JULY 2026
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: "0 0 20px",
          }}>
            A Closer Look at Some Key NFT.NYC 2026 Speakers
          </h1>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 18,
            lineHeight: 1.6,
            color: "var(--color-text-muted)",
            margin: 0,
          }}>
            With the first two rounds of approved speakers now locked in, the shape of NFT.NYC 2026 is coming into focus. Programming is still being finalized, and more speakers, panels, and sessions will be announced in the weeks ahead. But the approved talks already tell a story about where this space is heading in 2026: AI agents with on-chain identities, tokenized real-world assets, national frameworks deploying NFTs at scale, and communities that outlasted the market that minted them. Here's one session we're excited about from each of the ten tracks.
          </p>
        </div>

        {/* Track cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {SESSIONS.map(s => (
            <article
              key={s.track}
              style={{
                border: "1px solid var(--color-border)",
                borderRadius: 16,
                padding: "24px 28px",
                background: "var(--color-surface)",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: 3,
                borderRadius: "16px 16px 0 0",
                background: s.trackColor,
                opacity: 0.9,
              }} />
              <span style={{
                display: "inline-block",
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: s.trackColor,
                background: `${s.trackColor}22`,
                border: `1px solid ${s.trackColor}55`,
                borderRadius: 999,
                padding: "4px 12px",
                marginBottom: 14,
              }}>
                {s.track}
              </span>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(20px, 2.6vw, 26px)",
                fontWeight: 700,
                lineHeight: 1.25,
                margin: "0 0 16px",
              }}>
                {s.title}
              </h2>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 18,
              }}>
                <img
                  src={s.avatar}
                  alt={s.speaker}
                  loading="lazy"
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: `1px solid ${s.trackColor}66`,
                    background: "#1a1a2e",
                    flexShrink: 0,
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <p style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 15,
                    fontWeight: 600,
                    color: "var(--color-text)",
                    margin: 0,
                  }}>
                    {s.speaker}
                  </p>
                  {s.role && (
                    <p style={{
                      fontFamily: "var(--font-body)",
                      fontSize: 13,
                      color: "var(--color-text-muted)",
                      margin: "2px 0 0",
                    }}>
                      {s.role}
                    </p>
                  )}
                </div>
              </div>
              <p style={{
                fontFamily: "var(--font-body)",
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--color-text)",
                margin: 0,
              }}>
                {s.body}
              </p>
            </article>
          ))}
        </div>

        {/* Closing + CTA */}
        <div style={{ marginTop: 48, textAlign: "center" }}>
          <p style={{
            fontFamily: "var(--font-body)",
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--color-text-muted)",
            margin: "0 0 28px",
            maxWidth: 620,
            marginLeft: "auto",
            marginRight: "auto",
          }}>
            These ten are just the beginning. The full program, including panels, performances, and featured sessions, will be announced as programming is finalized.
          </p>
          <button
            onClick={openTicketing}
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 15,
              fontWeight: 600,
              color: "#fff",
              background: "linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)",
              backgroundSize: "300% 300%",
              animation: "liquidGradient 12s ease-in-out infinite",
              border: "none",
              borderRadius: 9999,
              padding: "0.75rem 2rem",
              cursor: "pointer",
            }}
          >
            Get your Earlybird ticket →
          </button>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
