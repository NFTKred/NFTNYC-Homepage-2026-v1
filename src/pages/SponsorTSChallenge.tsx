import { useState, useMemo } from "react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import PackageInquiryModal, { type BasePackage as InquiryBasePackage } from "@/components/sponsor/PackageInquiryModal";
import { MapPin, Mic, Users, Palette, Megaphone, Sparkles, Gift, Check } from "lucide-react";

// Replace these URLs once you have final TS Challenge screenshots on Backblaze.
// Each slot is a visual moment in the flow: collector view, artist upload,
// live Times Square moment, on-chain leaderboard, etc.
const BB = "https://f005.backblazeb2.com/file/PB-HubSpot/";

const TS_IMAGES = [
  { src: BB + "times-square-crowd-night.png", alt: "NFT.NYC community in Times Square at night with NFT art on billboards", caption: "NFT.NYC community taking over Times Square" },
];

const INCLUDES = [
  "Your product, experience, or artwork integrated into the Times Square Challenge online experience",
  "Branded presence throughout the challenge interface — before, during, and after NFT.NYC 2026",
  "Co-branded social content promoting the challenge across NFT.NYC channels (175K+ followers)",
  "Post-event engagement data and audience insights from challenge participants",
  "10 min speaking slot to share your experience on stage at NFT.NYC",
  "2 VIP + 4 GA tickets",
];

const HIGHLIGHTS = [
  {
    icon: MapPin,
    title: "Times Square stage",
    desc: "The Challenge plays out live across Times Square billboards and the NFT.NYC community — your brand rides the wave.",
  },
  {
    icon: Users,
    title: "Captive NFT.NYC community",
    desc: "Tens of thousands of NFT.NYC alumni, speakers, artists, and attendees actively engage with the challenge.",
  },
  {
    icon: Palette,
    title: "Creative integration",
    desc: "We work with you to weave your product, token, or activation into the Challenge storyline — not a banner ad tacked on top.",
  },
  {
    icon: Megaphone,
    title: "Amplification engine",
    desc: "Co-branded social, press, and community email treatments carry the Challenge — and your involvement — far beyond NFT.NYC itself.",
  },
];

type FaqItem = { q: string; a: (open: () => void) => React.ReactNode };

const FAQ: FaqItem[] = [
  {
    q: "What is the Times Square Challenge?",
    a: () => "A month-long community-wide online experience running before, during, and after NFT.NYC 2026. Participants complete Missions — minting, collecting, curating, or interacting with sponsor activations — to earn T-XP and a spot on the leaderboard. The highest-engaged moments play out live on Times Square billboards.",
  },
  {
    q: "How does my sponsorship show up?",
    a: () => "Your product, token, game, or activation becomes a Mission in the Challenge. Participants complete it to earn rewards. Your brand sits alongside NFT.NYC's in all Challenge interfaces, social, email, and the Times Square moments themselves.",
  },
  {
    q: "Can we integrate a custom experience?",
    a: (open) => (
      <>
        Yes.{" "}
        <button
          onClick={open}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            color: '#f06347',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 600,
            cursor: 'pointer',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
          }}
        >
          Click here
        </button>{" "}
        and describe what you'd like to include — a playable demo, a collectible drop, an on-chain action, a video, a Times Square takeover moment — and our team will scope the integration with you.
      </>
    ),
  },
  {
    q: "What does it cost?",
    a: () => "$35,000. Includes full integration into the Challenge, the amplification package, 10 minutes on the main NFT.NYC stage to share your experience, plus 2 VIP and 4 GA tickets.",
  },
];

export default function SponsorTSChallenge() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const basePackage: InquiryBasePackage = {
    name: "Times Square Challenge Sponsorship",
    price: "$35,000",
    context: 'packages',
  };

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'var(--font-body)',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.25em',
    textTransform: 'uppercase',
    color: '#f06347',
    marginBottom: '0.75rem',
  };

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="sponsor-ts-challenge" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ─── HERO ─── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(6rem, 14vw, 10rem) 1.5rem 4rem',
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BB}times-square-crowd-night.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.7,
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.7) 60%, var(--color-bg) 100%)',
          zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
          <p style={sectionLabel}>Featured Sponsorship · $35,000</p>
          <h1 style={{
            fontFamily: "'Monument Extended', var(--font-display)",
            fontSize: 'clamp(28px, 5.5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-1px',
            lineHeight: 1.1,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            maxWidth: '900px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            <span style={{ display: 'block' }}>Be part of the</span>
            {/* Times\u00A0Square never breaks (joined by non-breaking space).
                Between "Square" and "Challenge" we allow a break on narrow screens. */}
            <span style={{ display: 'block' }}>Times&nbsp;Square Challenge</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            maxWidth: '720px',
            margin: '0 auto 2.5rem',
          }}>
            A month-long, community-wide experience running <strong style={{ color: 'var(--color-text)' }}>before, during, and after NFT.NYC 2026</strong>.
            Integrate your product, token, or artwork into a Mission that the NFT.NYC community plays through — live from Times Square.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={() => setInquiryOpen(true)}
              style={{
                padding: '1rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                background: '#f06347',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 180ms ease, box-shadow 180ms ease',
                boxShadow: '0 8px 24px rgba(249, 115, 22, 0.3)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(249, 115, 22, 0.45)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(249, 115, 22, 0.3)';
              }}
            >
              Register your interest →
            </button>
            <a
              href="/ts-challenge"
              style={{
                padding: '1rem 2rem',
                borderRadius: '9999px',
                border: '1px solid var(--color-border)',
                background: 'transparent',
                color: 'var(--color-text)',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: 'none',
                transition: 'border-color 180ms ease',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-faint)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'; }}
            >
              Learn how the challenge works
            </a>
          </div>
        </div>
      </section>


      {/* ─── Why sponsor highlights ─── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={sectionLabel}>Why sponsor</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', var(--font-body)",
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '3rem',
          maxWidth: '700px',
          margin: '0 auto 3rem',
        }}>
          The partnership that extends outside the event walls.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1.5rem',
          textAlign: 'left',
        }}>
          {HIGHLIGHTS.map(h => {
            const Icon = h.icon;
            return (
              <div key={h.title} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '1rem',
                padding: '1.75rem',
              }}>
                <Icon size={28} style={{ color: '#f06347', marginBottom: '1rem' }} />
                <h3 style={{
                  fontFamily: "'Space Grotesk', var(--font-body)",
                  fontSize: '18px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.5rem',
                }}>{h.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.6,
                }}>{h.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── What's included ─── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(239, 68, 68, 0.04))',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          borderRadius: '1.25rem',
          padding: 'clamp(2rem, 4vw, 3rem)',
        }}>
          <p style={sectionLabel}>What's included</p>
          <h2 style={{
            fontFamily: "'Space Grotesk', var(--font-body)",
            fontSize: 'clamp(24px, 3vw, 32px)',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '0.5rem',
          }}>
            Times Square Challenge Sponsorship
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '28px',
            fontWeight: 700,
            color: '#f06347',
            marginBottom: '2rem',
          }}>$35,000</p>

          <ul style={{ display: 'grid', gap: '0.75rem', maxWidth: '760px', padding: 0, margin: '0 auto', listStyle: 'none', textAlign: 'left' }}>
            {INCLUDES.map((item, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                color: 'var(--color-text)',
                lineHeight: 1.55,
              }}>
                <Check size={18} style={{ color: '#f06347', marginTop: '3px', flexShrink: 0 }} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Boson Protocol billboard example ─── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <figure style={{ margin: 0 }}>
          <img
            src={BB + "times-square-boson-billboard.png"}
            alt="Boson Protocol branded Times Square billboard during NFT.NYC"
            style={{
              width: '100%',
              height: 'clamp(200px, 35vw, 380px)',
              objectFit: 'cover',
              borderRadius: '1rem',
              border: '1px solid var(--color-border)',
              display: 'block',
            }}
          />
          <figcaption style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            color: 'var(--color-text-faint)',
            marginTop: '0.75rem',
            textAlign: 'center',
            fontStyle: 'italic',
          }}>Boson Protocol's Times Square billboard during NFT.NYC — "our best marketing of the year"</figcaption>
        </figure>
      </section>

      {/* ─── Product/service integration CTA ─── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={sectionLabel}>How integration works</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', var(--font-body)",
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '1.5rem',
          maxWidth: '780px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Tell us about the product or service you want to weave into the Challenge.
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          maxWidth: '760px',
          margin: '0 auto 2.5rem',
        }}>
          Our team will scope the integration with you — from a playable demo in the Challenge UI, to an on-chain mint or action, to a Times Square billboard moment tied to participant milestones.
          Use the notes field in the registration form to describe what you have in mind.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
          textAlign: 'left',
        }}>
          {[
            { icon: Mic, title: '1. Submit details', desc: 'Share the product, activation, or experience you\'d like to feature.' },
            { icon: Sparkles, title: '2. Scope together', desc: 'We design the integration with you — turnkey or custom.' },
            { icon: Gift, title: '3. Launch & amplify', desc: 'Your Mission goes live. NFT.NYC drives the community to it.' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
              }}>
                <Icon size={22} style={{ color: '#f06347', marginBottom: '0.75rem' }} />
                <h3 style={{
                  fontFamily: "'Space Grotesk', var(--font-body)",
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  marginBottom: '0.35rem',
                }}>{s.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.55,
                }}>{s.desc}</p>
              </div>
            );
          })}
        </div>

      </section>

      {/* ─── Put Your Experience on the Map CTA ─── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(4rem, 10vw, 8rem) 1.5rem',
        overflow: 'hidden',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${BB}nyc-map-dark.jpg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.9,
          zIndex: 0,
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, var(--color-bg) 0%, rgba(10,10,15,0.5) 20%, rgba(10,10,15,0.5) 80%, var(--color-bg) 100%)',
          zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '900px', margin: '0 auto' }}>
          <h2 style={{
            fontFamily: "'Monument Extended', var(--font-display)",
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-1px',
            lineHeight: 1.05,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            marginBottom: '2rem',
          }}>
            Put your experience<br />on the map.
          </h2>
          <button
            onClick={() => setInquiryOpen(true)}
            style={{
              padding: '1.1rem 2.4rem',
              borderRadius: '9999px',
              border: 'none',
              background: '#f06347',
              color: '#fff',
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 180ms ease, box-shadow 180ms ease, background 180ms ease',
              boxShadow: '0 10px 32px rgba(240, 99, 71, 0.45)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(240, 99, 71, 0.6)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 32px rgba(240, 99, 71, 0.45)';
            }}
          >
            Register your interest →
          </button>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ maxWidth: '880px', margin: '0 auto', padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={sectionLabel}>FAQ</p>
        <h2 style={{
          fontFamily: "'Space Grotesk', var(--font-body)",
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '2.5rem',
        }}>Frequently asked</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          {FAQ.map((f, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontFamily: "'Space Grotesk', var(--font-body)",
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '0.5rem',
              }}>{f.q}</h3>
              <div style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
              }}>{f.a(() => setInquiryOpen(true))}</div>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter stage={stage} hideIndustryFeed />

      {/* Inquiry modal with TS-specific notes prompt */}
      <PackageInquiryModal
        open={inquiryOpen}
        onOpenChange={setInquiryOpen}
        basePackage={basePackage}
        notesLabel="Tell us about your product, service, or activation for the Challenge"
        notesPlaceholder="What would you like participants to do? Mint a token, play a mini-game, visit a URL, complete an on-chain action, watch a video? Share any links or screenshots we should reference."
      />
    </div>
  );
}
