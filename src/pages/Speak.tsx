import { useMemo, useState } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import {
  Megaphone,
  Award,
  Globe,
  Compass,
  MapPin,
  Users,
  Mic,
  MessageSquare,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

/* ─── Feature flag ─── */
export const SHOW_SPEAK_PAGE = true;

/* ─── Constants ─── */
const SESSIONIZE_URL = 'https://sessionize.com/nft-nyc-2026/';

/* ─── Data arrays ─── */
const STATS = [
  { value: '70,000', label: 'Alumni' },
  { value: '3,900', label: 'Speakers to date' },
  { value: '9th', label: 'Annual event' },
  { value: '100', label: 'Countries represented' },
];

const BENEFITS = [
  { icon: Megaphone, title: 'Amplify your signal', text: 'Present to thousands of engaged builders, investors, and creators who are actively shaping the NFT ecosystem. Your message reaches the people who matter.' },
  { icon: Award, title: 'Community-curated stage', text: 'Every session is selected based on quality and relevance. Speaking at NFT.NYC is a recognized mark of credibility across the web3 space.' },
  { icon: Globe, title: 'Global visibility', text: 'Speakers gain exposure through NFT.NYC media channels, partner networks, and a worldwide audience spanning over 100 countries.' },
  { icon: Compass, title: 'Shape the narrative', text: 'NFT.NYC sets the agenda for the year ahead. Speakers define the conversation around tokenization, AI identity, creator economies, and digital culture.' },
  { icon: MapPin, title: 'Times Square energy', text: 'There is something extraordinary about presenting in the heart of Times Square, surrounded by iconic billboards and the pulse of New York City.' },
  { icon: Users, title: 'Network at scale', text: 'Connect with other speakers, brand sponsors, and the wider NFT.NYC community through exclusive receptions and VIP events surrounding the conference.' },
];

const TRACKS = [
  { name: 'AI agent identity', color: '#3B82F6' },
  { name: 'On-chain infrastructure', color: '#8B5CF6' },
  { name: 'Social NFTs', color: '#EC4899' },
  { name: 'Creator and IP economy', color: '#F59E0B' },
  { name: 'Gaming and virtual worlds', color: '#10B981' },
  { name: 'NFT communities', color: '#06B6D4' },
  { name: 'DeFi and capital markets', color: '#EF4444' },
  { name: 'Culture, art, and music', color: '#D946EF' },
  { name: 'Brands and engagement', color: '#F97316' },
  { name: 'NFT marketplaces', color: '#14B8A6' },
];

const FORMATS = [
  { icon: Mic, title: 'Solo talk', text: '10 min presentation' },
  { icon: MessageSquare, title: 'Panel', text: '25 min moderated discussion (3–5 speakers)' },
  { icon: Rocket, title: 'Product pitch', text: '5 min focused demo (sponsors only)' },
];

const PAST_SPEAKERS = [
  { name: 'Busta Rhymes', title: 'Grammy-Nominated Artist' },
  { name: 'Quentin Tarantino', title: 'Director' },
  { name: 'Kimbal Musk', title: 'Entrepreneur' },
  { name: 'Alexis Ohanian', title: 'Co-Founder, Reddit' },
  { name: 'Spike Lee', title: 'Director' },
  { name: 'Roham Gharegozlou', title: 'CEO, Dapper Labs' },
  { name: 'Ivan Soto-Wright', title: 'CEO, MoonPay' },
  { name: 'Logan Paul', title: 'Entrepreneur & Creator' },
  { name: 'Sebastien Borget', title: 'COO, The Sandbox' },
  { name: 'Robby Yung', title: 'CEO, Animoca Brands' },
  { name: 'Gary Vaynerchuk', title: 'CEO, VaynerMedia' },
  { name: 'David Schwartz', title: 'CTO, Ripple' },
  { name: 'David Pakman', title: 'Managing Partner, CoinFund' },
  { name: 'Tom Bilyeu', title: 'Co-Founder, Quest Nutrition' },
  { name: 'Devin Finzer', title: 'CEO, OpenSea' },
];

const TIMELINE = [
  { title: 'Submissions open', subtitle: 'Now accepting proposals', color: '#E85D2B' },
  { title: 'Review period', subtitle: 'Community and team curation', color: '#F5A623' },
  { title: 'Speakers announced', subtitle: 'Notification and scheduling', color: '#7BC67E' },
  { title: 'NFT.NYC 2026', subtitle: '1–3 September, Times Square', color: '#3DBFB8' },
];

/* ─── Shared styles ─── */
const rainbowGradient = 'linear-gradient(135deg, #E85D2B, #F5A623, #E8D44D, #7BC67E, #3DBFB8)';

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  letterSpacing: '4px',
  textTransform: 'uppercase',
  color: 'rgb(90, 90, 117)',
  textAlign: 'center',
  marginBottom: '0.75rem',
};

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 700,
  textAlign: 'center',
  letterSpacing: '-0.5px',
  color: 'var(--color-text)',
  textTransform: 'uppercase',
  marginBottom: '2.5rem',
};

const rainbowText: React.CSSProperties = {
  background: rainbowGradient,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '32px',
  transition: 'border-color 200ms ease',
};

const dividerLine = (
  <div style={{
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 32px',
  }}>
    <div style={{
      height: '1px',
      background: 'linear-gradient(90deg, transparent, #E85D2B, #F5A623, #E8D44D, #7BC67E, #3DBFB8, #8B5CF6, transparent)',
      opacity: 0.35,
    }} />
  </div>
);

const ctaGradientStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  color: '#fff',
  background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
  backgroundSize: '200% 200%',
  animation: 'liquidGradient 8s ease-in-out infinite',
  border: 'none',
  borderRadius: '50px',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'transform 180ms ease, box-shadow 180ms ease',
};

/* ─── Component ─── */
export default function Speak() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);

  if (!SHOW_SPEAK_PAGE) return <Navigate to="/" replace />;

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ─── HERO ─── */}
      <section style={{ padding: '160px 32px 80px', textAlign: 'center', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={{ ...sectionLabel, fontSize: '14px', marginBottom: '1.5rem' }}>Call for speakers</p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 700,
          letterSpacing: '-1px',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          lineHeight: 1.1,
          maxWidth: '800px',
          margin: '0 auto 1.5rem',
        }}>
          Share your voice on the future of{' '}
          <span style={rainbowText}>digital ownership</span>
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '20px',
          color: 'rgb(149, 149, 176)',
          maxWidth: '600px',
          margin: '0 auto 1.5rem',
          lineHeight: 1.6,
        }}>
          NFT.NYC 2026 is assembling the builders, brands, and creators defining the tokenization layer. The stage is yours.
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          color: 'rgb(90, 90, 117)',
          marginBottom: '2.5rem',
        }}>
          Times Square, New York City · 1–3 September 2026
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href={SESSIONIZE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...ctaGradientStyle, padding: '14px 36px', fontSize: '16px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Submit to speak
          </a>
          <button
            onClick={() => document.getElementById('tracks')?.scrollIntoView({ behavior: 'smooth' })}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '16px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.75)',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50px',
              padding: '14px 36px',
              cursor: 'pointer',
              transition: 'all 180ms ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = 'transparent'; }}
          >
            Explore the tracks
          </button>
        </div>
      </section>

      {dividerLine}

      {/* ─── STATS ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '2rem',
          textAlign: 'center',
        }} className="speak-stats-grid">
          {STATS.map(s => (
            <div key={s.label}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 700, color: 'rgb(240, 240, 245)', lineHeight: 1.2 }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgb(90, 90, 117)', marginTop: '0.5rem' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {dividerLine}

      {/* ─── PAST SPEAKERS MARQUEE ─── */}
      <section style={{
        padding: '80px 0',
        overflow: 'hidden',
        position: 'relative',
        backgroundImage: 'url(https://f005.backblazeb2.com/file/PB-HubSpot/rcmh.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {/* Dark overlay for legibility */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          zIndex: 0,
        }} />
        <p style={{ ...sectionLabel, paddingInline: '32px', position: 'relative', zIndex: 1 }}>You're in great company</p>
        <h2 style={{ ...sectionHeading, paddingInline: '32px', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          <span style={rainbowText}>Past speakers</span>
        </h2>
        <div className="speak-marquee-wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="speak-marquee-track">
            {[...PAST_SPEAKERS, ...PAST_SPEAKERS].map((speaker, i) => (
              <span key={i} className="speak-marquee-item">
                <span className="speak-marquee-name-block">
                  <span className="speak-marquee-name">{speaker.name}</span>
                  <span className="speak-marquee-title">{speaker.title}</span>
                </span>
                <span className="speak-marquee-dot" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {dividerLine}

      {/* ─── WHY SPEAK ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Why speak at NFT.NYC</p>
        <h2 style={sectionHeading}>
          The global stage for <span style={rainbowText}>web3 thought leaders</span>
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }} className="speak-benefits-grid">
          {BENEFITS.map(b => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                style={cardStyle}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <Icon size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '-0.01em' }}>{b.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {dividerLine}

      {/* ─── TRACKS ─── */}
      <section id="tracks" style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>2026 session tracks</p>
        <h2 style={sectionHeading}>
          The <span style={rainbowText}>tokenization layer</span> ecosystem
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem',
          maxWidth: '860px',
          margin: '0 auto',
        }} className="speak-tracks-grid">
          {TRACKS.map(t => (
            <div
              key={t.name}
              style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem', padding: '20px 24px' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)' }}>{t.name}</span>
            </div>
          ))}
        </div>
      </section>

      {dividerLine}

      {/* ─── SESSION FORMATS ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Session formats</p>
        <h2 style={sectionHeading}>Choose your format</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          maxWidth: '900px',
          margin: '0 auto',
        }} className="speak-formats-grid">
          {FORMATS.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                style={{ ...cardStyle, textAlign: 'center', padding: '40px 28px' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <Icon size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', display: 'inline-block' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>{f.title}</h3>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {dividerLine}

      {/* ─── TIMELINE ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Key dates</p>
        <h2 style={sectionHeading}>Submission timeline</h2>
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          {/* Connecting line (desktop) */}
          <div className="speak-timeline-line" style={{
            position: 'absolute',
            top: '5px',
            left: '10%',
            right: '10%',
            height: '2px',
            background: 'linear-gradient(90deg, #E85D2B, #F5A623, #7BC67E, #3DBFB8)',
            opacity: 0.4,
          }} />
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'relative',
          }} className="speak-timeline-steps">
            {TIMELINE.map(step => (
              <div key={step.title} style={{ textAlign: 'center', flex: 1 }}>
                <span style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: step.color,
                  border: '2px solid rgb(10, 10, 15)',
                  boxShadow: `0 0 8px ${step.color}55`,
                  marginBottom: '1rem',
                  position: 'relative',
                  zIndex: 1,
                }} />
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>{step.title}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)' }}>{step.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {dividerLine}

      {/* ─── BOTTOM CTA ─── */}
      <section id="submit" style={{ padding: '80px 32px 100px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          marginBottom: '1rem',
        }}>
          Ready to take the <span style={rainbowText}>stage</span>?
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'rgb(149, 149, 176)',
          maxWidth: '520px',
          margin: '0 auto 2.5rem',
          lineHeight: 1.6,
        }}>
          Submissions are reviewed on a rolling basis. Early applications receive priority consideration.
        </p>
        <a
          href={SESSIONIZE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...ctaGradientStyle, padding: '16px 44px', fontSize: '18px' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Submit to speak
        </a>
      </section>

      <SiteFooter />

      {/* Responsive CSS */}
      <style>{`
        @keyframes speakMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .speak-marquee-wrap {
          position: relative;
          width: 100%;
          mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
          -webkit-mask-image: linear-gradient(90deg, transparent, black 8%, black 92%, transparent);
        }
        .speak-marquee-track {
          display: flex;
          align-items: center;
          width: max-content;
          animation: speakMarquee 90s linear infinite;
          will-change: transform;
        }
        .speak-marquee-track:hover {
          animation-play-state: paused;
        }
        .speak-marquee-item {
          display: inline-flex;
          align-items: center;
          gap: 0;
          white-space: nowrap;
          cursor: default;
          padding: 0 0.5rem;
          opacity: 1;
        }
        .speak-marquee-name-block {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .speak-marquee-name {
          font-family: var(--font-display);
          font-size: clamp(20px, 3vw, 32px);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: -0.5px;
          color: rgba(255,255,255,1);
          line-height: 1.2;
        }
        .speak-marquee-title {
          font-family: var(--font-body);
          font-size: clamp(11px, 1.2vw, 14px);
          font-weight: 400;
          color: rgb(149, 149, 176);
          text-transform: none;
          letter-spacing: 0.5px;
          line-height: 1.3;
          margin-top: 2px;
        }
        .speak-marquee-dot {
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: linear-gradient(135deg, #E85D2B, #3DBFB8);
          margin-left: 1.5rem;
          margin-right: 1rem;
          flex-shrink: 0;
          opacity: 0.5;
        }
        @media (max-width: 768px) {
          .speak-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .speak-benefits-grid { grid-template-columns: 1fr !important; }
          .speak-tracks-grid { grid-template-columns: 1fr !important; }
          .speak-formats-grid { grid-template-columns: 1fr !important; }
          .speak-timeline-steps { flex-direction: column !important; gap: 2rem !important; align-items: flex-start !important; padding-left: 2rem !important; }
          .speak-timeline-line { display: none !important; }
        }
      `}</style>
    </div>
  );
}
