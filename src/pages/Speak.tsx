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
  Search,
  MessageCircle,
  Mail,
  Vote,
  CheckCircle,
  XCircle,
  ClipboardList,
  Flame,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

/* ─── Feature flag ─── */
export const SHOW_SPEAK_PAGE = true;

/* ─── Constants ─── */
const SESSIONIZE_URL = 'https://sessionize.com/nft-nyc-2026/';

/* ─── Data arrays ─── */
const STATS = [
  { value: '205', label: 'Speaking slots' },
  { value: '6', label: 'Fireside chats' },
  { value: '9', label: 'Industry verticals' },
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
  { name: 'AI agent identity', color: '#3B82F6', desc: 'ERC-8004 NFTs, autonomous agents with wallets, reputation and identity systems' },
  { name: 'On-chain infrastructure', color: '#8B5CF6', desc: 'L1 and L2, rollups, wallets, ZK identity, ENS, NFT developer apps' },
  { name: 'Social NFTs', color: '#EC4899', desc: 'Community art projects, artist collaborations, social coordination' },
  { name: 'Creator and IP economy', color: '#F59E0B', desc: 'Creator tools, IP licensing, on-chain attribution, royalty enforcement' },
  { name: 'Gaming and virtual worlds', color: '#10B981', desc: 'Web3 gaming, on-chain games, virtual assets, player-owned economies' },
  { name: 'NFT communities', color: '#06B6D4', desc: 'Internet-native communities, meme culture, digital identity and belonging' },
  { name: 'DeFi and capital markets', color: '#EF4444', desc: 'NFT lending, fractionalization, RWAs, meme coins as community capital' },
  { name: 'Culture, art, and music', color: '#D946EF', desc: 'Digital art, generative art, AI-generated art, music NFTs, on-chain attribution' },
  { name: 'Brands and engagement', color: '#F97316', desc: 'Loyalty programs, phygital authentication, NFT ticketing, retail integrations' },
  { name: 'NFT marketplaces', color: '#14B8A6', desc: 'Marketplace infrastructure, royalty enforcement, discovery platforms' },
];

const FORMATS = [
  { icon: Rocket, title: 'Product pitch', time: '5 min', text: 'Product pitch sessions are for paying sponsors only.' },
  { icon: Mic, title: 'Solo talk', time: '10 min', text: 'One speaker, one idea, maximum impact.' },
  { icon: MessageSquare, title: 'Panel', time: '25 min', text: 'Moderated discussion with 3\u20134 speakers. Multiple perspectives, one topic.' },
  { icon: Flame, title: 'Fireside chat', time: '15 min', text: 'Moderated conversation with 1 speaker and host. Depth over breadth.' },
];

const PATHWAYS = [
  {
    slots: 20,
    title: 'Invited Speakers',
    tagline: 'Selected by NFT.NYC',
    desc: 'Twenty slots reserved for industry leaders shaping how tokenization works across AI, gaming, brands, and DeFi. If you are doing standout work in your field, we may reach out to you directly.',
    bullets: [
      'Your work may already be featured on our industry landing pages',
      'Invitations come from NFT.NYC and industry peers',
      'Complimentary VIP speaker pass included',
    ],
    pill: 'Curated by NFT.NYC',
    color: '#10B981',
  },
  {
    slots: 175,
    title: 'Open Applications',
    tagline: "The community's stage",
    desc: 'Panels of 3\u20134 speakers and solo presentations \u2014 selected through a combination of community input and editorial curation. Each speaker may submit up to 2 applications.',
    bullets: [
      'Submit with talk title, description, and industry vertical',
      'Provide a link to a video of you speaking',
      'April 8 \u2013 June 16',
    ],
    pill: 'Community + Editorial',
    color: '#8B5CF6',
  },
  {
    slots: 10,
    title: 'Reserved Spots',
    tagline: 'Guarantee your spot',
    desc: 'A limited number of speaking slots are reserved for those who want to guarantee their place on stage with a VIP ticket purchase. Details are shared with applicants during the selection process.',
    bullets: [
      'VIP ticket purchase secures a speaking slot',
      'Details shared during the selection process',
      'First come, first served',
    ],
    pill: 'First Come, First Served',
    color: '#F97316',
  },
];

const VOTE_TIERS = [
  { multiplier: '1x', title: 'Public', desc: 'Anyone with an email can vote. One vote per submission per person. Email verification required.', color: 'rgb(149, 149, 176)' },
  { multiplier: '10x', title: 'GA Ticketholders', desc: 'General Admission ticket holders receive 10x vote weight. Verified by ticket purchase email.', color: '#06B6D4' },
  { multiplier: '30x', title: 'VIP Ticketholders', desc: 'VIP ticket holders receive 30x vote weight. The most invested community members shape the program the most.', color: '#8B5CF6' },
];

const TIPS_DO = [
  'Focus on tokenization within your specific industry vertical',
  'Lead with thought leadership, rather than a product pitch',
  'Provide a detailed session description with a clear takeaway',
  'Make your 60-second video count \u2014 energy, clarity, and substance matter more than production quality',
  'Apply early \u2014 historically, general-window applicants saw a 55% selection rate compared to 13% for late-window applicants',
  'Self-organize your panel if applying as a group: all panelists must submit an application with the same title and description. All speakers must be approved by our team',
];

const TIPS_DONT = [
  'Product pitches in the open application track will be declined \u2014 paid sponsors have a separate format',
  'Remote speaking requests will be declined \u2014 this is an in-person event at the Edison Times Square NYC',
  'Generic \u201ccrypto\u201d or \u201cWeb3\u201d framing without a tokenization angle will be declined',
  'Broken video links, videos over 2 minutes, or missing videos mean automatic disqualification',
];

const CHECKLIST = [
  'A detailed session description (100\u20131,000 characters) with a clear NFT focus',
  'A link to a video of you speaking',
  'A quotable message our team can share on social media about your session',
  'Your ETH or BTC wallet address',
  'Your phone number (speaker\u2019s direct number, required for day-of coordination)',
  'A high-resolution headshot (minimum 1000\u00d71000 pixels)',
  'Social profiles (X, LinkedIn, Instagram) and Linktree URL',
];

const PAST_SPEAKERS = [
  { name: 'Alexis Ohanian', title: 'Founder Reddit', image: '/speakers/Alexis Ohanian.jpeg' },
  { name: 'David Pakman', title: 'CoinFund Managing Partner', image: '/speakers/davidpakman.jpeg' },
  { name: 'Devin Finzer', title: 'CEO OpenSea', image: '/speakers/devin.jpeg' },
  { name: 'Gary Vaynerchuk', title: 'Founder Veefriends', image: '/speakers/garyvee.jpg' },
  { name: 'Jimmy Wales', title: 'Founder Wikipedia', image: '/speakers/jimmywale.jpeg' },
  { name: 'John Kosner', title: 'ESPN Sports Media Veteran', image: '/speakers/johnkosner.jpeg' },
  { name: 'Kimbal Musk', title: 'Businessman', image: '/speakers/kimbal.png' },
  { name: 'Michael Casey', title: 'CEO & Co-Founder Tell Network', image: '/speakers/casey.jpeg' },
  { name: 'Quentin Tarantino', title: 'Golden Globe Winner', image: '/speakers/taratino.jpeg' },
  { name: 'Robby Yung', title: 'CEO Animoca', image: '/speakers/robby.jpeg' },
  { name: 'Spike Lee', title: 'Academy Award Winner', image: '/speakers/spikelee.jpg' },
  { name: 'T.J. Miller', title: 'Comedian', image: '/speakers/TJ-Miller-featured-pic.jpg' },
];

const DETAILED_TIMELINE = [
  { date: 'April 8', title: 'Applications open', desc: 'Submit your application at nft.nyc/speak. Videos published on a rolling basis. Community voting begins.', color: '#10B981' },
  { date: 'April 8 \u2013 June 16', title: 'General application window', desc: 'Submit your talk title, description, industry vertical, and video link. Community votes accumulate. Pathway 1 outreach progresses in parallel.', color: '#06B6D4' },
  { date: 'June 16, 11:59 PM ET', title: 'General applications close', desc: 'Final review period begins. Team evaluates vote strength, video quality, industry diversity across all 9 verticals, and topic balance.', color: '#8B5CF6' },
  { date: 'June 17 \u2013 28', title: 'Late application window', desc: 'Extended submission period for GA ticket holders only. A second chance to apply after the general window closes.', color: '#F97316' },
  { date: 'July 2026', title: 'Selections announced', desc: 'Speakers selected and notified. Each speaker may appear in one accepted session (solo talk, panel, or product pitch).', color: '#EC4899' },
  { date: 'September 1\u20133', title: 'NFT.NYC 2026', desc: 'The Edison, Times Square NYC. Program published August 2026. Speaker prep begins upon acceptance.', color: '#F5A623' },
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

const sectionSub: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '15px',
  color: 'rgb(149, 149, 176)',
  maxWidth: '640px',
  margin: '0 auto 48px',
  textAlign: 'center',
  lineHeight: 1.6,
  marginTop: '-1.5rem',
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
  const [showModal, setShowModal] = useState(false);

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
          <button
            onClick={() => setShowModal(true)}
            style={{ ...ctaGradientStyle, padding: '14px 36px', fontSize: '16px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Submit to speak
          </button>
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
          gridTemplateColumns: 'repeat(3, 1fr)',
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
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          zIndex: 0,
        }} />
        <p style={{ ...sectionLabel, paddingInline: '32px', position: 'relative', zIndex: 1 }}>Influential Voices from NFT.NYC</p>
        <h2 style={{ ...sectionHeading, paddingInline: '32px', marginBottom: '3rem', position: 'relative', zIndex: 1 }}>
          <span style={rainbowText}>12 Notable Past Speakers</span>
        </h2>
        <div className="speak-marquee-wrap" style={{ position: 'relative', zIndex: 1 }}>
          <div className="speak-marquee-track">
            {[...PAST_SPEAKERS, ...PAST_SPEAKERS].map((speaker, i) => (
              <div key={i} className="speak-marquee-item" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.6rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(8px)',
                marginRight: '0.75rem',
                flexShrink: 0,
              }}>
                <img
                  src={speaker.image}
                  alt={speaker.name}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    flexShrink: 0,
                    border: '2px solid rgba(255,255,255,0.15)',
                  }}
                />
                <div>
                  <p style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '14px',
                    fontWeight: 700,
                    color: '#fff',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                  }}>{speaker.name}</p>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                  }}>{speaker.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {dividerLine}

      {/* ─── THREE PATHWAYS ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>The three pathways</p>
        <h2 style={sectionHeading}>
          Three pathways to the <span style={rainbowText}>stage</span>
        </h2>
        <p style={sectionSub}>
          Every selected speaker receives a VIP speaker pass, an invitation to the opening party on September 1, and their own collectible NFT speaker cards for their audience to claim.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
        }} className="speak-pathways-grid">
          {PATHWAYS.map(p => (
            <div
              key={p.title}
              style={{ ...cardStyle, display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: 900, color: p.color, lineHeight: 1, marginBottom: '4px' }}>{p.slots}</p>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: p.color, textTransform: 'uppercase', marginBottom: '4px' }}>{p.title}</h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', fontStyle: 'italic', marginBottom: '16px' }}>{p.tagline}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.65, marginBottom: '16px' }}>{p.desc}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '12px', flex: 1 }}>
                {p.bullets.map(b => (
                  <li key={b} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', lineHeight: 1.7, paddingLeft: '18px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 0, top: '8px', width: '8px', height: '8px', borderRadius: '50%', background: p.color }} />
                    {b}
                  </li>
                ))}
              </ul>
              <span style={{
                display: 'inline-block',
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                alignSelf: 'flex-start',
                background: `${p.color}1F`,
                color: p.color,
              }}>{p.pill}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href={SESSIONIZE_URL} target="_blank" rel="noopener noreferrer" style={{ ...ctaGradientStyle, padding: '14px 36px', fontSize: '16px' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Submit to speak</a>
        </div>
      </section>

      {dividerLine}

      {/* ─── VOTING MECHANICS ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Have your say</p>
        <h2 style={sectionHeading}>
          Community <span style={rainbowText}>vote weighting</span>
        </h2>
        <p style={{ ...sectionSub, maxWidth: '780px', textWrap: 'balance' } as React.CSSProperties}>
          Anyone can vote. Ticketholders carry serious weight. Votes inform our decisions — not dictate them.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          maxWidth: '900px',
          margin: '0 auto',
        }} className="speak-vote-grid">
          {VOTE_TIERS.map(v => (
            <div
              key={v.title}
              style={{ ...cardStyle, textAlign: 'center' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 900, color: v.color, marginBottom: '8px' }}>{v.multiplier}</p>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text)', marginBottom: '6px' }}>{v.title}</h4>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', lineHeight: 1.5 }}>{v.desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a
            href="https://vote.nft.nyc"
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...ctaGradientStyle, padding: '14px 36px', fontSize: '16px' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Vote now
          </a>
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
        <p style={sectionSub}>
          The strongest applications connect tokenization to a specific domain — the days of recycling the same conversations are over.
        </p>
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
              style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '20px 24px' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: t.color, flexShrink: 0, marginTop: '5px' }} />
              <div>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 500, color: 'var(--color-text)', display: 'block' }}>{t.name}</span>
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', lineHeight: 1.5 }}>{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href={SESSIONIZE_URL} target="_blank" rel="noopener noreferrer" style={{ ...ctaGradientStyle, padding: '14px 36px', fontSize: '16px' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Submit to speak</a>
        </div>
      </section>

      {dividerLine}

      {/* ─── SESSION FORMATS ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Stage formats</p>
        <h2 style={sectionHeading}>Speaking slot types</h2>
        <p style={sectionSub}>
          Format assigned during program curation based on topic and schedule balance. You'll be notified with your acceptance.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '1.25rem',
          maxWidth: '960px',
          margin: '0 auto',
        }} className="speak-formats-grid">
          {FORMATS.map(f => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                style={{ ...cardStyle, textAlign: 'center', padding: '36px 20px' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <Icon size={28} style={{ color: 'var(--color-text-muted)', marginBottom: '0.75rem', display: 'inline-block' }} />
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px', textTransform: 'uppercase' }}>{f.title}</h3>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '28px',
                  fontWeight: 900,
                  ...rainbowText,
                  marginBottom: '8px',
                }}>{f.time}</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{f.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {dividerLine}

      {/* ─── APPLICATION TIPS ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Application tips</p>
        <h2 style={sectionHeading}>
          What makes a <span style={rainbowText}>strong application</span>
        </h2>
        <p style={sectionSub}>
          Tell us how tokenization is changing your industry. Videos that teach one actionable thing win over generic overviews every time.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1.25rem',
          maxWidth: '860px',
          margin: '0 auto',
        }} className="speak-tips-grid">
          <div
            style={cardStyle}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
          >
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#10B981', marginBottom: '16px' }}>Do</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {TIPS_DO.map(tip => (
                <li key={tip} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', lineHeight: 1.7, paddingLeft: '24px', position: 'relative', marginBottom: '6px' }}>
                  <span style={{ position: 'absolute', left: 0, fontWeight: 700, color: '#10B981' }}>{'\u2713'}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <div
            style={cardStyle}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
          >
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', color: '#EF4444', marginBottom: '16px' }}>Avoid</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {TIPS_DONT.map(tip => (
                <li key={tip} style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', lineHeight: 1.7, paddingLeft: '24px', position: 'relative', marginBottom: '6px' }}>
                  <span style={{ position: 'absolute', left: 0, fontWeight: 700, color: '#EF4444' }}>{'\u2717'}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {dividerLine}

      {/* ─── APPLICATION CHECKLIST ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Before you apply</p>
        <h2 style={sectionHeading}>What to prepare</h2>
        <p style={sectionSub}>
          Be ready to provide the following when you start your submission.
        </p>
        <div
          style={{ ...cardStyle, maxWidth: '740px', margin: '0 auto' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
        >
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {CHECKLIST.map(item => (
              <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgb(149, 149, 176)', lineHeight: 1.8, paddingLeft: '28px', position: 'relative' }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '2px',
                  fontSize: '16px',
                  color: '#06B6D4',
                  fontWeight: 700,
                }}>{'\u2713'}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a href={SESSIONIZE_URL} target="_blank" rel="noopener noreferrer" style={{ ...ctaGradientStyle, padding: '14px 36px', fontSize: '16px' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>I'm ready — submit to speak</a>
        </div>
      </section>

      {dividerLine}

      {/* ─── DETAILED TIMELINE ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <p style={sectionLabel}>Key dates</p>
        <h2 style={sectionHeading}>
          Timeline: <span style={rainbowText}>April to September</span>
        </h2>
        <p style={sectionSub}>
          From application launch to the Edison stage.
        </p>
        <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="speak-detailed-timeline">
          {DETAILED_TIMELINE.map((step, i) => (
            <div
              key={step.title}
              style={{
                ...cardStyle,
                padding: '24px 28px',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <span style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: step.color,
                flexShrink: 0,
                marginTop: '6px',
                boxShadow: `0 0 8px ${step.color}55`,
              }} />
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: step.color, marginBottom: '4px' }}>{step.date}</p>
                <h4 style={{ fontFamily: 'var(--font-body)', fontSize: '15px', fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>{step.title}</h4>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)', lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
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
        <button
          onClick={() => setShowModal(true)}
          style={{ ...ctaGradientStyle, padding: '16px 44px', fontSize: '18px' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Submit to speak
        </button>
      </section>

      {/* ─── SUBMISSION FLOW MODAL ─── */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setShowModal(false)}
        >
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} />
          <div
            style={{
              position: 'relative',
              background: 'var(--color-bg)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '48px 40px 40px',
              maxWidth: '520px',
              width: '100%',
              textAlign: 'center',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                color: 'rgb(149, 149, 176)',
                fontSize: '24px',
                cursor: 'pointer',
                lineHeight: 1,
                padding: '4px',
              }}
            >{'\u00d7'}</button>

            <p style={{ ...sectionLabel, marginBottom: '0.5rem' }}>Speaker submission flow</p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(22px, 3vw, 28px)',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--color-text)',
              marginBottom: '2rem',
            }}>
              How it <span style={rainbowText}>works</span>
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left', marginBottom: '2.5rem' }}>
              {[
                { step: '1', title: 'Share your topic', color: '#10B981' },
                { step: '2', title: 'Record a short video', color: '#06B6D4' },
                { step: '3', title: 'Complete your submission', color: '#8B5CF6' },
                { step: '4', title: 'Community votes', color: '#F59E0B' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: `${s.color}1A`,
                    border: `2px solid ${s.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '16px',
                    fontWeight: 900,
                    color: s.color,
                    flexShrink: 0,
                  }}>{s.step}</span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'var(--color-text)',
                  }}>{s.title}</span>
                </div>
              ))}
            </div>

            <a
              href={SESSIONIZE_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ ...ctaGradientStyle, padding: '14px 40px', fontSize: '16px' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Submit now
            </a>
          </div>
        </div>
      )}

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
          transition: opacity 200ms ease;
        }
        .speak-marquee-item:hover {
          opacity: 0.8;
        }
        @media (max-width: 768px) {
          .speak-stats-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .speak-benefits-grid { grid-template-columns: 1fr !important; }
          .speak-pathways-grid { grid-template-columns: 1fr !important; }
          .speak-tracks-grid { grid-template-columns: 1fr !important; }
          .speak-formats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .speak-funnel-grid { grid-template-columns: 1fr !important; }
          .speak-vote-grid { grid-template-columns: 1fr !important; }
          .speak-tips-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
