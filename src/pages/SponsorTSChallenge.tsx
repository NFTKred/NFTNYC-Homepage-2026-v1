import { useState, useMemo } from "react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PackageInquiryModal, { type BasePackage as InquiryBasePackage } from "@/components/sponsor/PackageInquiryModal";
import { MapPin, Mic, Users, Palette, Megaphone, Sparkles, Gift, Check } from "lucide-react";

// Replace these URLs once you have final TS Challenge screenshots on Backblaze.
// Each slot is a visual moment in the flow: collector view, artist upload,
// live Times Square moment, on-chain leaderboard, etc.
const BB = "https://f005.backblazeb2.com/file/PB-HubSpot/";

const TS_IMAGES = [
  { src: BB + "times-square-crowd-night.png", alt: "NFT.NYC community in Times Square at night with NFT art on billboards", caption: "NFT.NYC community taking over Times Square" },
  { src: BB + "times-square-billboard-nftnyc.jpg", alt: "#NFTNYC projected on Times Square buildings at night", caption: "#NFTNYC lighting up Times Square" },
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

const FAQ = [
  {
    q: "What is the Times Square Challenge?",
    a: "A month-long community-wide online experience running before, during, and after NFT.NYC 2026. Participants complete missions — minting, collecting, curating, or interacting with sponsor activations — to earn T-XP, T-Kredits, and a spot on the leaderboard. The highest-engaged moments play out live on Times Square billboards.",
  },
  {
    q: "How does my sponsorship show up?",
    a: "Your product, token, game, or activation becomes a mission in the Challenge. Participants complete it to earn rewards. Your brand sits alongside NFT.NYC's in all Challenge interfaces, social, email, and the Times Square moments themselves.",
  },
  {
    q: "Can we integrate a custom experience?",
    a: "Yes. Use the form below to describe what you'd like to include — a playable demo, a collectible drop, an on-chain action, a video, a Times Square takeover moment — and our team will scope the integration with you.",
  },
  {
    q: "What does it cost?",
    a: "$35,000. Includes full integration into the Challenge, the amplification package, 10 minutes on the main NFT.NYC stage to share your experience, plus 2 VIP and 4 GA tickets.",
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
    color: '#f97316',
    marginBottom: '0.75rem',
  };

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ─── HERO ─── */}
      <section style={{
        position: 'relative',
        padding: 'clamp(6rem, 14vw, 10rem) 1.5rem 4rem',
        maxWidth: '1100px',
        margin: '0 auto',
        textAlign: 'left',
      }}>
        <div style={{
          position: 'absolute',
          top: '25%', left: '20%',
          width: '500px', height: '500px',
          background: 'rgba(249, 115, 22, 0.08)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          zIndex: 0,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={sectionLabel}>Featured Sponsorship · $35,000</p>
          <h1 style={{
            fontFamily: "'Monument Extended', var(--font-display)",
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700,
            letterSpacing: '-1.5px',
            lineHeight: 1.05,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
            marginBottom: '1.5rem',
            maxWidth: '900px',
          }}>
            Be a part of the<br /><span style={{ whiteSpace: 'nowrap' }}>Times Square Challenge</span>
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'clamp(16px, 1.4vw, 20px)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.55,
            maxWidth: '720px',
            marginBottom: '2.5rem',
          }}>
            A month-long, community-wide experience running <strong style={{ color: 'var(--color-text)' }}>before, during, and after NFT.NYC 2026</strong>.
            Integrate your product, token, or artwork into a mission that the NFT.NYC community plays through — live from Times Square.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setInquiryOpen(true)}
              style={{
                padding: '1rem 2rem',
                borderRadius: '9999px',
                border: 'none',
                background: 'linear-gradient(135deg, #f97316, #ef4444)',
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

      {/* ─── Image hero ─── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
        {TS_IMAGES.map((img, i) => (
          <figure key={i} style={{ margin: 0 }}>
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: 'clamp(280px, 50vw, 520px)',
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
            }}>{img.caption}</figcaption>
          </figure>
        ))}
      </section>

      {/* ─── Why sponsor highlights ─── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <p style={sectionLabel}>Why sponsor</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 3.5vw, 40px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '3rem',
          maxWidth: '700px',
        }}>
          The only sponsorship that lives outside the event walls.
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.5rem',
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
                <Icon size={28} style={{ color: '#f97316', marginBottom: '1rem' }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)',
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
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(239, 68, 68, 0.04))',
          border: '1px solid rgba(249, 115, 22, 0.25)',
          borderRadius: '1.25rem',
          padding: 'clamp(2rem, 4vw, 3rem)',
        }}>
          <p style={sectionLabel}>What's included</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
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
            color: '#f97316',
            marginBottom: '2rem',
          }}>$35,000</p>

          <ul style={{ display: 'grid', gap: '0.75rem', maxWidth: '760px', padding: 0, margin: 0, listStyle: 'none' }}>
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
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <p style={sectionLabel}>How integration works</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '1.5rem',
          maxWidth: '780px',
        }}>
          Tell us about the product or service you want to weave into the Challenge.
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'var(--color-text-muted)',
          lineHeight: 1.6,
          maxWidth: '760px',
          marginBottom: '2.5rem',
        }}>
          Our team will scope the integration with you — from a playable demo in the Challenge UI, to an on-chain mint or action, to a Times Square billboard moment tied to participant milestones.
          Use the notes field in the registration form to describe what you have in mind; we follow up within one business day.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem',
        }}>
          {[
            { icon: Mic, title: '1. Submit details', desc: 'Share the product, activation, or experience you\'d like to feature.' },
            { icon: Sparkles, title: '2. Scope together', desc: 'We design the integration with you — turnkey or custom.' },
            { icon: Gift, title: '3. Launch & amplify', desc: 'Your mission goes live. NFT.NYC drives the community to it.' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '1rem',
                padding: '1.5rem',
              }}>
                <Icon size={22} style={{ color: '#f97316', marginBottom: '0.75rem' }} />
                <h3 style={{
                  fontFamily: 'var(--font-display)',
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

        <button
          onClick={() => setInquiryOpen(true)}
          style={{
            padding: '1rem 2rem',
            borderRadius: '9999px',
            border: 'none',
            background: 'linear-gradient(135deg, #f97316, #ef4444)',
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
      </section>

      {/* ─── FAQ ─── */}
      <section style={{ maxWidth: '880px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <p style={sectionLabel}>FAQ</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3vw, 32px)',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '2.5rem',
        }}>Frequently asked</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {FAQ.map((f, i) => (
            <div key={i} style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '0.5rem',
              }}>{f.q}</h3>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '14px',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
              }}>{f.a}</p>
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
