import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";

const ARTICLE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: "The Times Square Challenge Is Heating Up and Art Submissions Are Open for NFT.NYC 2026",
  description:
    "Two months out from NFT.NYC 2026, the Times Square Challenge is running hot — a year-round community of collectors, gifters, and artists on OneHub, with submissions for the 2026 Times Square billboards now open.",
  url: "https://www.nft.nyc/blog/ts-challenge-momentum-2026",
  mainEntityOfPage: "https://www.nft.nyc/blog/ts-challenge-momentum-2026",
  image: "https://www.nft.nyc/og/ts-challenge.png",
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

const IMG = "/blog/ts-momentum-2026";

function Figure({ src, alt, caption }: { src: string; alt: string; caption: string }) {
  return (
    <figure style={{ margin: "32px 0" }}>
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
    </figure>
  );
}

export default function BlogTsMomentum2026() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--color-bg)", color: "var(--color-text)" }}>
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ARTICLE_JSON_LD)}</script>
      </Helmet>
      <PageMeta
        title="TS Challenge is heating up, and 2026 submissions are open"
        description="Two months out from NFT.NYC 2026, the Times Square Challenge is running hot. Community metrics, favorite art, and how artists can submit for the 2026 Times Square billboards."
        path="/blog/ts-challenge-momentum-2026"
      />
      <Header theme="dark" onToggleTheme={() => {}} />

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "140px 24px 80px" }}>
        {/* Hero */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            height: 6,
            borderRadius: 999,
            background: "linear-gradient(135deg, #F59E0B, #EF4444, #EC4899)",
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
            NFT.NYC 2026 · TIMES SQUARE CHALLENGE · 7 JULY 2026
          </p>
          <h1 style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
          }}>
            The Times Square Challenge Is Heating Up and Art Submissions Are Open for NFT.NYC 2026
          </h1>
        </div>

        {/* Section 1 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={sectionH2Style}>Something is happening in Times Square</h2>
          <p style={paragraphStyle}>
            The Times Square Challenge was built to keep the NFT.NYC community connected all year, not just for three days in September. Two months out from NFT.NYC 2026, Sept 1 to 3, the platform is proving the idea works.
          </p>
          <p style={paragraphStyle}>
            In the last 30 days alone:
          </p>

          <Figure
            src={`${IMG}/30-days-momentum.png`}
            alt="30 Days of Momentum: 365 Times Square art editions collected, 1,200+ collectible gifts sent, 997 missions completed, 572 Gift Studio creations collected, 244 new collectors this month, 124 artists made their first drop."
            caption="Momentum across the hub over the last 30 days. Source: onehub metrics tracker, July 2026."
          />

          <p style={paragraphStyle}>
            The numbers tell one story, but the shape of them tells a better one. Hundreds of these collectors and artists are brand new, making their very first collect or their very first drop this month. This is not a quiet leaderboard. It is a community that shows up.
          </p>
          <p style={paragraphStyle}>
            And that leaderboard is real. Collectors are racing for the top spots, gifters are trading art back and forth by the hundreds, and the most active creators are watching their work spread across the hub every single day.
          </p>
        </section>

        {/* Section 2 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={sectionH2Style}>The heart of the Challenge is collecting</h2>
          <p style={paragraphStyle}>
            The Times Square Challenge runs on two simple actions: collect the art you love, and send gifts to the people you meet. Every day, collectors claim limited editions from the NFT.NYC Community Artist Showcase and send each other collectible gifts that earn T-XP for everyone involved.
          </p>
          <p style={paragraphStyle}>
            Right now the most-sent gift in the community is Love and Signals, created by MarsCitizen, passed between members 55 times in the last month. On the art side, pieces from artists like kamand kavand, Diba ADIB, Metamusex, and Fereshteh Farmand are among the collector favorites, the same works that appeared at physical scale in Times Square.
          </p>

          <Figure
            src={`${IMG}/what-community-is-collecting.png`}
            alt="What the community is collecting: Love & Signals by MarsCitizen (55 gifts sent) plus collector favorites by kamand kavand, Diba ADIB, Metamusex, and Fereshteh Farmand."
            caption="What the community is collecting and gifting right now."
          />

          <p style={paragraphStyle}>
            This is what the Challenge is really about. Before a single 2026 submission opens, there is already a living market of art and gifts moving between real collectors every day. New work only adds more fuel.
          </p>
        </section>

        {/* Section 3 */}
        <section style={{ marginBottom: 48 }}>
          <h2 style={sectionH2Style}>Now the doors are open for 2026</h2>
          <p style={paragraphStyle}>
            Here is the part every artist has been waiting for. Submissions for the NFT.NYC 2026 Community Artist Showcase are open, and getting your work considered for a Times Square billboard starts with a single upload.
          </p>
          <p style={paragraphStyle}>
            The flow is fast and it is built for artists, not gatekeepers. Your first submission is free, and each additional piece you enter costs 500 T-XP to submit.
          </p>

          <Figure
            src={`${IMG}/how-to-get-your-art-to-times-square.png`}
            alt="How to get your art to Times Square: (1) Submit your work, (2) Add your Times Square sticker, (3) Go viral with Remix, (4) Get discovered with Kredentials, (5) You are live."
            caption="The full submission flow, start to finish."
          />

          <p style={paragraphStyle}>
            <strong>Step one, submit your work.</strong> Upload one piece, an image or a short video, and add your name, your socials, and a short bio for the curators. That is the whole requirement. Selected artworks will be displayed on screens throughout NFT.NYC and on the Times Square billboards themselves.
          </p>
          <p style={paragraphStyle}>
            <strong>Step two, drop your Times Square Challenge sticker.</strong> This is where it gets fun. You place a Proof of Submission sticker on your own art, in a holo or black style, and that turns your piece into a limited edition fans can start collecting the moment you submit. Each edition starts at 500 T-XP for the fans who collect it, then doubles every 24 hours, so your earliest supporters move first. As more fans collect, your listing picks up momentum on the platform.
          </p>
          <p style={paragraphStyle}>
            Those collect counts matter beyond bragging rights. The number of times your Proof of Submission edition gets collected is one of the signals our team uses, together with curator review, to help decide which pieces make it to the billboards. Your fans collecting your work is your work making its case.
          </p>
          <p style={paragraphStyle}>
            <strong>Step three, go viral with Remix.</strong> Publish your featured piece to your own page and let fans reinterpret it in styles like Neon, Vapor, and Painterly. Every remix is a shareable moment that points back to you, and you get your own OneHub address in the process.
          </p>
          <p style={paragraphStyle}>
            <strong>Step four, get discovered with Kredentials.</strong> Set up a .kred profile that gathers your links and your story so collectors, press, and even AI engines can find and cite your work. It normally costs 19 dollars a year, and NFT.NYC is covering every submitting artist's first year.
          </p>
          <p style={paragraphStyle}>
            Steps two through four are optional, but they are how your submission turns into a movement instead of a form. When you finish, your piece lands with the Showcase curators for display selection while your Challenge edition is already live for fans to collect. You are in review for the billboards and building your audience from day one.
          </p>
        </section>

        {/* Section 4 */}
        <section style={{ marginBottom: 24 }}>
          <h2 style={sectionH2Style}>Get in before the deadline</h2>
          <p style={paragraphStyle}>
            Submissions are open now and close on July 31 at midnight. Selected work goes live during NFT.NYC 2026, Sept 1 to 3, in the heart of Times Square.
          </p>
          <p style={paragraphStyle}>
            If you have been waiting for a reason to put your art in front of the world, this is it. Submit your piece, drop your sticker, and let the community carry it to the billboards.
          </p>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a
              href="/ts-challenge"
              style={{
                display: "inline-block",
                fontFamily: "var(--font-body)",
                fontSize: 16,
                fontWeight: 600,
                color: "#fff",
                background: "linear-gradient(135deg, #F59E0B, #EF4444, #EC4899)",
                backgroundSize: "300% 300%",
                animation: "liquidGradient 12s ease-in-out infinite",
                textDecoration: "none",
                borderRadius: 9999,
                padding: "0.85rem 2.25rem",
              }}
            >
              Submit to the 2026 Showcase
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

const sectionH2Style: React.CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(24px, 3.4vw, 32px)",
  fontWeight: 800,
  lineHeight: 1.2,
  margin: "0 0 20px",
};

const paragraphStyle: React.CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: 16,
  lineHeight: 1.7,
  color: "var(--color-text)",
  margin: "0 0 18px",
};
