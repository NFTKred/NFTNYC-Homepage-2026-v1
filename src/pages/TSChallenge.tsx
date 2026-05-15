import { useState, useMemo } from 'react';
import useScrollReveal from '@/hooks/useScrollReveal';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';
import NewsletterCapture from '@/components/NewsletterCapture';

/* ============================================================
   DATA
   ============================================================ */

const STEPS = [
  { num: '01', icon: 'ℹ️', title: 'The Challenge',   desc: '12 NFT missions showing how tokenization is reshaping real industries.' },
  { num: '02', icon: '🏷️', title: 'The 6 Industries', desc: 'Art · Collectibles · Certifications · Gameplay · Identity · DeFi.' },
  { num: '03', icon: '🗺️', title: 'The NYC Map',     desc: 'Discover every mission on a live, interactive map of New York City.' },
  { num: '04', icon: '⚡', title: 'T-XP Engine',     desc: 'Three ways to earn, three ways to spend. Climb the global leaderboard.' },
  { num: '05', icon: '🛂', title: 'Your Passport',   desc: 'Your .Kred domain — the permanent record of every mission you complete.' },
  { num: '06', icon: '🎯', title: 'The Outcome',     desc: 'Arrive at NFT.NYC 2026 already part of the conversation.' },
];

// Master list of the 12 missions — used by the new mission grid section.
// Categories map to the six industries showcased on /ts-challenge.
const MISSIONS = [
  { num:  1, category: 'Art',            title: 'Collect Collectible TS Art',                desc: "Mission #1 and the on-ramp. Collect editions from NFT.NYC's global community of artists." },
  { num:  2, category: 'Collectibles',   title: 'Send Collectible NFT Gifts',                desc: 'Share recognition with fun NFT gifts. Both sender and recipient earn T-XP.' },
  { num:  3, category: 'Certifications', title: 'Claim your Proof of Exhibition',            desc: "For artists in the 2025 Community Showcase — claim your certificate on-chain." },
  { num:  4, category: 'Gameplay',       title: 'Design your TS Collectible car',            desc: 'Use HotGarage — the AI-powered design studio inspired by NYC streetscapes.' },
  { num:  5, category: 'Art',            title: 'Submit Art for the 2026 Showcase',          desc: 'Submit your work to the NFT.NYC 2026 Community Artist Showcase open call.' },
  { num:  6, category: 'Identity',       title: 'Claim your Passport',                       desc: 'A .Kred domain that holds every mission, T-XP, attestation, and collectible you earn.' },
  { num:  7, category: 'DeFi',           title: 'List on the Social Stockmarket',            desc: 'Experience social DeFi — list on the Social Stockmarket and discover Gen 2 Shares.' },
  { num:  8, category: 'Identity',       title: 'Meet FOMO — your AI Agent',                 desc: 'Extend your Passport with FOMO, your own NFT.NYC AI agent anchored to your .Kred.' },
  { num:  9, category: 'Gameplay',       title: 'Race your car in the streets of NYC',       desc: 'Race the TS Collectible car you designed in Mission #4 across the streets of NYC.' },
  { num: 10, category: 'DeFi',           title: 'Collect 10 Gen 2 Shares',                   desc: 'Collect 10 Gen 2 Shares on the Social Stockmarket to advance your DeFi mission.' },
  { num: 11, category: 'Collectibles',   title: 'Collect 10 NFT Speaker Cards',              desc: "Each card is an attestation from a speaker's Passport, signed onto yours." },
  { num: 12, category: 'Certifications', title: 'Claim NFT Proof of Attendance',             desc: 'The permanent closing attestation on your Passport, signed on-chain after the event.' },
];

// Six industries shown on the TS Challenge, each with its color and the
// mission numbers that belong to it. Powers the "6 Industries" section.
const INDUSTRIES = [
  { name: 'Art',            color: '#D946EF', missions: '#1 · #5',  blurb: 'Collect limited-edition NFT art from the global community and submit your own for 2026.' },
  { name: 'Collectibles',   color: '#EC4899', missions: '#2 · #11', blurb: 'Send Collectible NFT Gifts and collect Speaker Card attestations.' },
  { name: 'Certifications', color: '#F59E0B', missions: '#3 · #12', blurb: 'Claim on-chain Proof of Exhibition and Proof of Attendance certificates.' },
  { name: 'Gameplay',       color: '#10B981', missions: '#4 · #9',  blurb: 'Design TS Collectible cars in HotGarage, then race them in the streets of NYC.' },
  { name: 'Identity',       color: '#8B5CF6', missions: '#6 · #8',  blurb: 'Claim your .Kred Passport and extend it with FOMO, your own NFT.NYC AI agent.' },
  { name: 'DeFi',           color: '#3B82F6', missions: '#7 · #10', blurb: 'Experience social DeFi by listing and collecting Gen 2 Shares on the Social Stockmarket.' },
];

interface GuideSection {
  step: number;
  kicker: string;
  title: string;
  accent: string;
  content: (tab: string, setTab: (t: string) => void) => React.ReactNode;
}

const GUIDE_SECTIONS: GuideSection[] = [
  {
    step: 1, kicker: 'Overview', title: 'What Is The', accent: 'TS Challenge',
    content: () => (
      <>
        <p className="ts-lead">The Times Square Challenge is a free 12-mission program on OneHub.NFT.NYC that showcases how tokenization is reshaping real industries — leading up to NFT.NYC 2026 on September 1–3, 2026.</p>
        <ul className="ts-list">
          <li><strong>12 missions</strong> across six industries: Art, Collectibles, Certifications, Gameplay, Identity, and DeFi</li>
          <li>Each mission is a <strong>working example</strong> of tokenization in a different real-world vertical</li>
          <li>Every mission is plotted on an <strong>interactive map of New York City</strong> — discover them geographically</li>
          <li>Participants earn <strong>T-XP</strong> (Times Square Experience Points), climb a global leaderboard, and grow their <strong>Passport</strong></li>
          <li><strong>Mission #1 is the on-ramp</strong>: collect art from NFT.NYC's global community of 1,500+ artists, curated by Superchief Gallery</li>
          <li>Free to join — every signup gets a welcome bonus. Some missions require T-XP to interact</li>
          <li>Powered by <strong>OneHub</strong>, built by the NFT.NYC team and powered by <strong>NFT.Kred</strong></li>
        </ul>
        <div className="ts-stats-row">
          <div className="ts-stat"><div className="ts-stat-number">12</div><div className="ts-stat-label">Missions</div></div>
          <div className="ts-stat"><div className="ts-stat-number">6</div><div className="ts-stat-label">Industries</div></div>
          <div className="ts-stat"><div className="ts-stat-number">150K+</div><div className="ts-stat-label">Community Members</div></div>
        </div>
      </>
    ),
  },
  {
    step: 2, kicker: 'Six Verticals', title: 'The', accent: '6 Industries',
    content: () => (
      <>
        <p className="ts-lead">Every mission is a working example of tokenization in a real-world industry. The 12 missions split across six categories — giving participants a full tour of how NFTs are being used in 2026.</p>
        <div className="ts-industries-grid">
          {INDUSTRIES.map(ind => (
            <div key={ind.name} className="ts-industry-card" style={{ borderColor: `${ind.color}55` }}>
              <div className="ts-industry-header">
                <span className="ts-industry-name" style={{ color: ind.color }}>{ind.name}</span>
                <span className="ts-industry-missions" style={{ background: `${ind.color}22`, color: ind.color }}>{ind.missions}</span>
              </div>
              <p className="ts-industry-blurb">{ind.blurb}</p>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    step: 3, kicker: 'Discovery', title: 'The Interactive', accent: 'NYC Map',
    content: () => (
      <>
        <p className="ts-lead">Every mission is plotted on an interactive map of New York City. Discover them geographically — pin by pin, neighborhood by neighborhood.</p>
        <ul className="ts-list">
          <li>The map is the <strong>central discovery surface</strong>. Each mission is a pin you can select and interact with directly.</li>
          <li>It's a <strong>living surface</strong> — new missions appear in the lead-up to NFT.NYC 2026 as partners and industries come online.</li>
          <li>See at a glance which experiences are <strong>live</strong>, which are <strong>coming soon</strong>, and where each one sits in the city.</li>
          <li>The map ties digital experience to physical place — Times Square, Fifth Avenue, Coney Island, the Flatiron, the Hudson.</li>
          <li>Open the live map at <a href="https://onehub.nft.nyc/map" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>OneHub.NFT.NYC/map</a>.</li>
        </ul>
      </>
    ),
  },
  {
    step: 4, kicker: 'The Engine', title: 'T-XP:', accent: 'Earn & Spend',
    content: () => (
      <>
        <p className="ts-lead">T-XP (Times Square Experience Points) rewards engagement and powers the leaderboard. Three ways to earn, three ways to spend — a clean mental model that mirrors the mission-driven structure of the Challenge.</p>
        <div className="ts-split-three" style={{ marginTop: 8 }}>
          <div className="ts-split-card">
            <h4>Three ways to earn</h4>
            <ul className="ts-list">
              <li><strong>Complete missions</strong> across Art, Collectibles, Certifications, Gameplay, Identity, and DeFi.</li>
              <li><strong>Take daily actions</strong> — send and receive gifts, redeem benefits, share on social, invite friends.</li>
              <li><strong>Engage with the community</strong> — post, comment, like, and grow your network.</li>
            </ul>
          </div>
          <div className="ts-split-card">
            <h4>Three ways to spend</h4>
            <ul className="ts-list">
              <li><strong>Collect Collectible TS Art</strong>, Speaker Cards, and HotGarage creations.</li>
              <li><strong>Send Collectible NFT Gifts</strong> to friends — earn bonus T-XP on every send.</li>
              <li><strong>Design and race</strong> in HotGarage — design in Mission #4, race in Mission #9.</li>
            </ul>
          </div>
          <div className="ts-split-card">
            <h4>Streaks multiply</h4>
            <ul className="ts-list">
              <li>Daily actions across consecutive days build a <strong>streak</strong>.</li>
              <li>Streaks apply a <strong>Boost Multiplier</strong> starting at 1.1× and increasing up to 4×.</li>
              <li>Breaking a streak resets the multiplier — consistency is the fastest way to climb.</li>
            </ul>
          </div>
        </div>
        <p style={{ marginTop: 20, fontSize: 13, color: 'var(--color-text-muted)' }}>Earned T-XP expires 60 days after issuance. Purchased T-XP expires 12 months after issuance. T-XP has no cash value and cannot be redeemed for money.</p>
      </>
    ),
  },
  {
    step: 5, kicker: 'Your Identity', title: 'Your', accent: 'Passport',
    content: () => (
      <>
        <p className="ts-lead">Every mission completion signs to your Passport — the permanent, portable record of your TS Challenge year. Your Passport is a <strong>.Kred domain</strong> that you claim in Mission #6.</p>
        <ul className="ts-list">
          <li><strong>One Passport, every record.</strong> Mission completions, T-XP, attestations, and collectibles all sign to it.</li>
          <li><strong>It's yours, permanently.</strong> The .Kred domain is portable — it travels with you beyond the Challenge.</li>
          <li><strong>Speakers have Passports too.</strong> Each Speaker Card you collect in Mission #11 is an attestation from a speaker's <code>SpeakerName.Kred</code> Passport, signed onto yours.</li>
          <li><strong>Anchor your AI agent.</strong> In Mission #8 you extend your Passport with FOMO — your own NFT.NYC AI agent.</li>
          <li><strong>Close the loop on event day.</strong> Mission #12 signs an NFT Proof of Attendance onto your Passport — the permanent closing attestation of NFT.NYC 2026.</li>
        </ul>
        <div className="ts-stats-row" style={{ marginTop: 20 }}>
          <div className="ts-stat"><div className="ts-stat-number">.Kred</div><div className="ts-stat-label">Domain</div></div>
          <div className="ts-stat"><div className="ts-stat-number">ERC-8004</div><div className="ts-stat-label">Reputation Layer</div></div>
          <div className="ts-stat"><div className="ts-stat-number">12</div><div className="ts-stat-label">Mission Attestations</div></div>
        </div>
      </>
    ),
  },
  {
    step: 6, kicker: 'The Result', title: 'The', accent: 'Outcome',
    content: () => (
      <>
        <div className="ts-outcome-flow">
          <div className="ts-outcome-node"><div className="ts-outcome-icon">🗺️</div><div className="ts-outcome-label">Explore</div></div>
          <div className="ts-outcome-arrow">→</div>
          <div className="ts-outcome-node"><div className="ts-outcome-icon">⚡</div><div className="ts-outcome-label">Complete</div></div>
          <div className="ts-outcome-arrow">→</div>
          <div className="ts-outcome-node ts-outcome-final"><div className="ts-outcome-icon">🛂</div><div className="ts-outcome-label">Arrive</div></div>
        </div>
        <div className="ts-closing-quote">"Arrive at NFT.NYC 2026 <em>already in the conversation</em>"</div>
        <ul className="ts-list" style={{ marginTop: 24 }}>
          <li><strong>Industry professionals</strong> get a live sandbox of how NFTs are being applied across art, collectibles, credentials, gaming, identity, and DeFi.</li>
          <li><strong>NFT.NYC attendees and alumni</strong> stay engaged year-round and arrive at the event having already interacted with every use case firsthand.</li>
          <li><strong>Eligible artists</strong> may earn USDC through Mission #1 Featured Art and the 2026 Showcase open call.</li>
          <li><strong>Every participant</strong> closes the year with a Passport that records every mission, attestation, and collectible — a permanent record of NFT.NYC 2026.</li>
        </ul>
        <div className="ts-compliance">
          <strong>Earn Stage Eligibility &amp; USDC Payouts:</strong> The Earn Stage is optional and requires an affirmative opt-in. To access the Earn Stage, participants must: (1) meet the applicable eligibility requirements set out in our Terms of Service, (2) complete KYC (Know Your Customer) identity verification in accordance with our AML/CTF (Anti-Money Laundering / Counter-Terrorism Financing) compliance obligations, and (3) accept the Earn Stage Terms. USDC payouts are subject to successful KYC verification and are not guaranteed by participation in the TS Challenge.
        </div>
      </>
    ),
  },
];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */

function FlowCard({ icon, title, badge, badgeType, children }: {
  icon: string; title: string; badge: string; badgeType: string; children: React.ReactNode;
}) {
  return (
    <div className="ts-flow-card">
      <div className="ts-flow-icon">{icon}</div>
      <div className="ts-flow-title">{title}</div>
      <div className="ts-flow-desc">{children}</div>
      <span className={`ts-badge ts-badge-${badgeType}`}>{badge}</span>
    </div>
  );
}

/* ============================================================
   PAGE
   ============================================================ */

export default function TSChallenge() {
  const stage = useMemo(() => {
    try { return Number(localStorage.getItem('nftnyc-stage') ?? 0); } catch { return 0; }
  }, []);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [openSection, setOpenSection] = useState(0); // 0-indexed, first open by default
  const [tab, setTab] = useState('collectors');
  useScrollReveal();

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <div data-theme={theme} style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>
      <PageMeta page="ts-challenge" />
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <main id="main">
        {/* ======== HERO ======== */}
        <section style={{
          position: 'relative',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: 'calc(4rem + 56px) 1rem 3rem',
        }}>
          {/* Background image */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'url(https://f005.backblazeb2.com/file/PB-HubSpot/pastevents-2021-3.jpg)',
            backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
          }} />
          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.78) 50%, rgba(0,0,0,0.97) 100%)',
          }} />

          <div style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 24px', textAlign: 'center' as const }}>
            {/* Badge pill */}
            <div className="scroll-fade-up" style={{ marginBottom: 32 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 100,
                border: '1px solid rgba(241,86,33,0.4)',
                fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)',
              }}>🚀 TS Challenge — How It Works</span>
            </div>

            {/* Headline */}
            <h1 className="scroll-fade-up" style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(28px, 5vw, 64px)', lineHeight: 1.1,
              letterSpacing: '0.02em', textTransform: 'uppercase' as const,
              marginBottom: 24, color: 'var(--color-text)',
            }}>
              The Times Square{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--color-primary), #ff8a50)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Challenge</span>
            </h1>

            {/* Tagline */}
            <p className="scroll-fade-up" style={{
              fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 2vw, 20px)',
              color: 'var(--color-text-muted)', maxWidth: 640, margin: '0 auto 16px', lineHeight: 1.6,
            }}>
              12 NFT missions across Art, Collectibles, Certifications, Gameplay, Identity, and DeFi — each a working example of how tokenization is reshaping a real industry. Plotted on an interactive NYC map, leading up to NFT.NYC 2026.
            </p>
            <p className="scroll-fade-up" style={{
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--color-primary)', marginBottom: 24, opacity: 0.7,
            }}>Powered by OneHub on onehub.nft.nyc</p>

            {/* Relay mascot */}
            <img
              src="/relay-rat.png"
              alt="Relay the Rat — NFT.NYC mascot"
              className="scroll-fade-up"
              style={{
                width: 120, height: 120, objectFit: 'contain',
                margin: '0 auto 32px',
                filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.5))',
              }}
            />

            {/* 6 Step cards */}
            <div className="scroll-fade-up ts-steps-grid">
              {STEPS.map(s => (
                <div key={s.num} className="ts-step-card">
                  <div className="ts-step-watermark">{s.num}</div>
                  <div className="ts-step-icon-circle">{s.icon}</div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                    textTransform: 'uppercase' as const, marginBottom: 8, color: 'var(--color-text)', letterSpacing: '0.02em',
                  }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======== THE 12 MISSIONS ======== */}
        <section className="ts-missions-section">
          <div className="ts-missions-inner">
            <div className="scroll-fade-up" style={{ textAlign: 'center' as const, marginBottom: 48 }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 500,
                letterSpacing: '0.25em', textTransform: 'uppercase' as const,
                color: 'var(--color-primary)', marginBottom: 12,
              }}>The Showcase</p>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontWeight: 700,
                fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.1,
                letterSpacing: '0.02em', textTransform: 'uppercase' as const,
                marginBottom: 16, color: 'var(--color-text)',
              }}>
                The 12{' '}
                <span style={{
                  background: 'linear-gradient(135deg, var(--color-primary), #ff8a50)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>Missions</span>
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'clamp(14px, 1.5vw, 17px)',
                color: 'var(--color-text-muted)', maxWidth: 680, margin: '0 auto', lineHeight: 1.6,
              }}>
                Each mission is a working example of tokenization in a different industry. Missions release progressively and appear on the interactive NYC map as they go live.
              </p>
            </div>

            <div className="ts-missions-grid scroll-fade-up">
              {MISSIONS.map(m => {
                const ind = INDUSTRIES.find(i => i.name === m.category)!;
                return (
                  <div key={m.num} className="ts-mission-card" style={{ borderColor: `${ind.color}30` }}>
                    <div className="ts-mission-head">
                      <span className="ts-mission-num">#{m.num}</span>
                      <span className="ts-mission-cat" style={{ background: `${ind.color}1c`, color: ind.color }}>{m.category}</span>
                    </div>
                    <h3 className="ts-mission-title">{m.title}</h3>
                    <p className="ts-mission-desc">{m.desc}</p>
                  </div>
                );
              })}
            </div>

            <p className="scroll-fade-up" style={{
              fontFamily: 'var(--font-body)', fontSize: 13,
              color: 'var(--color-text-muted)', textAlign: 'center' as const,
              marginTop: 32, lineHeight: 1.6,
            }}>
              Have an idea?{' '}
              <a href="https://onehub.nft.nyc/map" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                Submit a Mission
              </a>{' '}
              that showcases how your project, brand, or use case is putting tokenization to work.
            </p>
          </div>
        </section>

        {/* ======== COMPLETE GUIDE ======== */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 40px' }}>
          <div className="scroll-fade-up" style={{ textAlign: 'center' as const, padding: '64px 0 48px', borderBottom: '1px solid var(--card-border)' }}>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(24px, 4vw, 48px)', lineHeight: 1.1,
              letterSpacing: '0.02em', textTransform: 'uppercase' as const, color: 'var(--color-text)',
            }}>
              Complete{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--color-primary), #ff8a50)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Guide</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="ts-timeline">
            {GUIDE_SECTIONS.map((sec, i) => {
              const isOpen = openSection === i;
              return (
                <div key={sec.step} className={`ts-guide-section${isOpen ? ' open' : ''}`} data-step={sec.step}>
                  <div className="ts-section-header" onClick={() => setOpenSection(isOpen ? -1 : i)}>
                    <div>
                      <h3 style={{
                        fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const,
                        letterSpacing: '2px', color: 'var(--color-primary)', marginBottom: 4,
                        fontFamily: 'var(--font-body)',
                      }}>{sec.kicker}</h3>
                      <h2 style={{
                        fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 700, textTransform: 'uppercase' as const,
                        letterSpacing: '0.5px', lineHeight: 1.2, fontFamily: 'var(--font-display)', color: 'var(--color-text)',
                      }}>{sec.title} <span style={{ color: 'var(--color-primary)' }}>{sec.accent}</span></h2>
                    </div>
                    <div className="ts-section-chevron" style={{ transform: isOpen ? 'rotate(90deg)' : undefined }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
                  </div>
                  <div className="ts-section-body" style={{
                    maxHeight: isOpen ? 3000 : 0,
                    paddingBottom: isOpen ? 48 : 0,
                    overflow: 'hidden',
                    transition: 'max-height 0.4s ease, padding-bottom 0.4s ease',
                  }}>
                    {sec.content(tab, setTab)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA — stage 1 only */}
          {stage >= 1 && (
            <div style={{ textAlign: 'center' as const, padding: '48px 0' }}>
              <a
                href="https://onehub.nft.nyc"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '16px 48px', borderRadius: 12,
                  background: 'var(--color-primary)', color: '#fff',
                  fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15,
                  letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  textDecoration: 'none', border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 24px rgba(241,86,33,0.4)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 32px rgba(241,86,33,0.55)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(241,86,33,0.4)'; }}
              >Join the Challenge</a>
            </div>
          )}
        </div>

        <NewsletterCapture />
        <SiteFooter stage={stage} />
      </main>

      {/* ======== PAGE-SCOPED STYLES ======== */}
      <style>{`
        /* Step cards grid */
        .ts-steps-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 960px;
          margin: 0 auto;
        }
        @media (min-width: 640px) {
          .ts-steps-grid { grid-template-columns: repeat(3, 1fr); gap: 16px; }
        }
        .ts-step-card {
          position: relative;
          background: var(--color-surface);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          padding: 24px 20px;
          text-align: center;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        .ts-step-card:hover {
          border-color: rgba(241,86,33,0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          transform: translateY(-4px);
        }
        .ts-step-watermark {
          position: absolute;
          top: -8px; left: 50%; transform: translateX(-50%);
          font-family: var(--font-display); font-weight: 700; font-size: 56px;
          color: rgba(255,255,255,0.03); pointer-events: none; line-height: 1;
          transition: color 0.3s ease;
        }
        .ts-step-card:hover .ts-step-watermark { color: rgba(241,86,33,0.08); }
        .ts-step-icon-circle {
          width: 48px; height: 48px; border-radius: 12px;
          background: rgba(241,86,33,0.1);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px; font-size: 22px;
          transition: transform 0.3s ease;
        }
        .ts-step-card:hover .ts-step-icon-circle { transform: scale(1.1); }

        /* Timeline */
        .ts-timeline {
          position: relative;
          padding: 0;
        }
        .ts-timeline::before {
          content: '';
          position: absolute; left: 30px; top: 0; bottom: 0; width: 2px;
          background: linear-gradient(to bottom, var(--color-primary), rgba(241,86,33,0.1));
        }
        .ts-guide-section {
          position: relative;
          border-bottom: 1px solid var(--card-border);
        }
        .ts-guide-section:last-child { border-bottom: none; }
        .ts-guide-section::before {
          content: attr(data-step);
          position: absolute; left: 16px; top: 28px;
          width: 30px; height: 30px; background: var(--color-primary);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
          text-align: center; line-height: 30px; z-index: 1;
          transition: box-shadow 0.3s ease;
        }
        .ts-guide-section.open::before {
          box-shadow: 0 0 12px rgba(241,86,33,0.5);
        }
        .ts-section-header {
          padding: 24px 0 24px 80px;
          cursor: pointer;
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          user-select: none; transition: opacity 0.2s ease;
        }
        .ts-section-header:hover { opacity: 0.85; }
        .ts-section-chevron {
          color: var(--color-primary);
          transition: transform 0.3s ease; flex-shrink: 0; width: 32px;
          display: flex; align-items: center; justify-content: center;
        }
        .ts-section-body {
          padding: 0 0 0 80px;
        }

        /* Guide typography */
        .ts-section-body p {
          font-family: var(--font-body);
          font-size: 15px; color: var(--color-text-muted);
          margin-bottom: 12px; line-height: 1.7;
        }
        .ts-section-body p strong { color: var(--color-text); }
        .ts-lead {
          font-size: 17px !important; color: var(--color-text-muted) !important;
          margin-bottom: 20px !important;
        }

        /* Lists */
        .ts-list { list-style: none; padding: 0; margin: 12px 0; }
        .ts-list li {
          position: relative; padding-left: 20px; margin-bottom: 8px;
          font-family: var(--font-body); font-size: 14px; color: var(--color-text-muted); line-height: 1.6;
        }
        .ts-list li strong { color: var(--color-text); }
        .ts-list li::before {
          content: ''; position: absolute; left: 0; top: 8px;
          width: 8px; height: 8px; background: var(--color-primary); border-radius: 50%;
        }

        /* Stats */
        .ts-stats-row { display: flex; gap: 24px; margin: 24px 0; flex-wrap: wrap; }
        .ts-stat {
          flex: 1; min-width: 140px;
          background: var(--color-surface); border: 1px solid var(--card-border);
          border-radius: 8px; padding: 20px; text-align: center;
        }
        .ts-stat-number {
          font-size: 32px; font-weight: 700; color: var(--color-primary);
          font-family: var(--font-display); line-height: 1;
        }
        .ts-stat-label {
          font-size: 12px; color: var(--color-text-muted);
          text-transform: uppercase; letter-spacing: 1px; margin-top: 6px;
        }

        /* Tab toggle */
        .ts-tab-toggle { display: flex; justify-content: center; margin-bottom: 32px; }
        .ts-tab-inner {
          display: flex; background: var(--color-surface);
          border: 1px solid var(--card-border); border-radius: 12px;
          padding: 4px; gap: 4px;
        }
        .ts-tab-btn {
          padding: 14px 36px; border: none; border-radius: 9px;
          font-family: var(--font-body); font-size: 14px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px;
          cursor: pointer; transition: all 0.3s ease;
          color: var(--color-text-muted); background: transparent;
        }
        .ts-tab-btn:hover { color: var(--color-text); background: var(--color-surface-2); }
        .ts-tab-btn.active {
          background: var(--color-primary); color: #fff;
          box-shadow: 0 4px 24px rgba(241,86,33,0.4);
        }

        /* Flow cards */
        .ts-flow-grid {
          display: grid; align-items: stretch; gap: 16px 12px;
        }
        .ts-flow-grid.three { grid-template-columns: 1fr auto 1fr auto 1fr; }
        .ts-flow-grid.two { grid-template-columns: 1fr auto 1fr; }
        .ts-chevron {
          display: flex; align-items: center; justify-content: center;
          color: var(--color-primary);
          filter: drop-shadow(0 0 8px rgba(241,86,33,0.5));
        }
        .ts-flow-card {
          background: var(--color-surface); border: 1px solid var(--card-border);
          border-radius: 16px; padding: 30px 24px 26px; position: relative;
          display: flex; flex-direction: column; text-align: left;
          transition: all 0.3s ease; overflow: hidden;
        }
        .ts-flow-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, var(--color-primary), rgba(241,86,33,0.3));
          opacity: 0; transition: opacity 0.3s ease;
        }
        .ts-flow-card:hover {
          border-color: rgba(241,86,33,0.35); transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(241,86,33,0.12), 0 0 0 1px rgba(241,86,33,0.1);
        }
        .ts-flow-card:hover::before { opacity: 1; }
        .ts-flow-icon {
          width: 56px; height: 56px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 26px; margin-bottom: 18px;
          background: rgba(241,86,33,0.08); border: 1px solid rgba(241,86,33,0.15);
        }
        .ts-flow-card:hover .ts-flow-icon {
          background: rgba(241,86,33,0.12); border-color: rgba(241,86,33,0.3);
          box-shadow: 0 0 20px rgba(241,86,33,0.15);
        }
        .ts-flow-title {
          font-size: 15px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.5px; margin-bottom: 10px; line-height: 1.3; color: var(--color-text);
        }
        .ts-flow-desc {
          font-size: 14px; color: var(--color-text-muted); line-height: 1.65; flex: 1;
        }
        .ts-flow-desc strong { color: var(--color-text); font-weight: 600; }
        .ts-flow-card ul { margin: 0; }
        .ts-flow-card ul li::before { display: none; }
        .ts-flow-card ul li { padding-left: 0; }

        /* Badges */
        .ts-badge {
          display: inline-block; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 1.5px;
          padding: 5px 12px; border-radius: 6px; margin-top: 14px;
        }
        .ts-badge-tip { background: rgba(241,86,33,0.12); color: var(--color-primary); border: 1px solid rgba(241,86,33,0.25); }
        .ts-badge-free { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .ts-badge-usdc { background: rgba(34,197,94,0.1); color: #22c55e; border: 1px solid rgba(34,197,94,0.2); }
        .ts-badge-unlock { background: rgba(168,85,247,0.1); color: #a855f7; border: 1px solid rgba(168,85,247,0.2); }
        .ts-badge-vip { background: rgba(234,179,8,0.1); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }
        .ts-badge-forever { background: rgba(59,130,246,0.1); color: #3b82f6; border: 1px solid rgba(59,130,246,0.2); }
        .ts-badge-flex { background: rgba(236,72,153,0.1); color: #ec4899; border: 1px solid rgba(236,72,153,0.2); }

        /* XP flow */
        .ts-xp-flow {
          display: flex; align-items: center; justify-content: center;
          gap: 12px; margin: 24px 0; flex-wrap: wrap;
        }
        .ts-xp-node {
          background: var(--color-surface); border: 1px solid var(--card-border);
          border-radius: 8px; padding: 14px 20px; text-align: center;
          font-size: 13px; font-weight: 600; color: var(--color-text);
        }
        .ts-xp-arrow { color: var(--color-primary); font-size: 20px; font-weight: 700; }
        .ts-xp-highlight {
          background: var(--color-primary) !important; color: #fff !important;
          border: none !important; font-weight: 800; font-size: 14px;
        }

        /* Split three */
        .ts-split-three { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin: 20px 0; }
        .ts-split-card {
          background: var(--color-surface); border: 1px solid var(--card-border);
          border-radius: 8px; padding: 24px;
        }
        .ts-split-card h4 {
          font-size: 16px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; margin-bottom: 14px; padding-bottom: 10px;
          border-bottom: 2px solid var(--color-primary);
          font-family: var(--font-display); color: var(--color-text);
        }
        .ts-split-card li { font-size: 13px; margin-bottom: 6px; }

        /* Outcome */
        .ts-outcome-flow {
          display: flex; align-items: center; justify-content: center; gap: 0; margin: 30px 0;
        }
        .ts-outcome-node { text-align: center; padding: 20px 28px; }
        .ts-outcome-icon { font-size: 32px; margin-bottom: 6px; }
        .ts-outcome-label {
          font-size: 16px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: var(--color-text);
        }
        .ts-outcome-arrow { font-size: 28px; color: var(--color-primary); font-weight: 700; padding: 0 4px; }
        .ts-outcome-final .ts-outcome-label { color: var(--color-primary); font-size: 20px; }

        .ts-closing-quote {
          text-align: center; font-size: 20px; font-weight: 300; font-style: italic;
          color: var(--color-text-muted); margin: 30px 0 10px; padding: 20px 0;
          border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border);
        }
        .ts-closing-quote em { color: var(--color-primary); font-weight: 600; font-style: normal; }

        .ts-compliance {
          background: rgba(241,86,33,0.08); border: 1px solid rgba(241,86,33,0.25);
          border-radius: 6px; padding: 16px 20px; margin-top: 24px;
          font-size: 12px; color: var(--color-text-muted); line-height: 1.7;
        }
        .ts-compliance strong { color: var(--color-text-faint); }

        /* Responsive */
        @media (max-width: 900px) {
          .ts-split-three { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 700px) {
          .ts-section-header { padding: 20px 0 20px 60px; }
          .ts-section-body { padding-left: 60px; }
          .ts-guide-section::before { left: 6px; top: 24px; }
          .ts-timeline::before { left: 20px; }
          .ts-split-three { grid-template-columns: 1fr; }
          .ts-stats-row { flex-direction: column; }
          .ts-flow-grid { grid-template-columns: 1fr !important; }
          .ts-chevron { display: none; }
          .ts-tab-btn { padding: 12px 24px; font-size: 12px; }
          .ts-flow-card { padding: 22px 20px; }
          .ts-section-header h2 { font-size: 18px !important; }
        }

        /* ── 12 Missions section ───────────────────────────────── */
        .ts-missions-section {
          padding: 80px 24px 96px;
          background: linear-gradient(180deg, transparent 0%, rgba(241,86,33,0.03) 100%);
          border-top: 1px solid var(--card-border);
        }
        .ts-missions-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .ts-missions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .ts-mission-card {
          background: var(--color-surface);
          border: 1px solid var(--card-border);
          border-radius: 14px;
          padding: 20px 22px;
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .ts-mission-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.18);
        }
        .ts-mission-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .ts-mission-num {
          font-family: var(--font-display);
          font-size: 22px;
          font-weight: 700;
          color: var(--color-text);
          letter-spacing: -0.01em;
        }
        .ts-mission-cat {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 9999px;
        }
        .ts-mission-title {
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text);
          line-height: 1.3;
          margin: 0;
        }
        .ts-mission-desc {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          line-height: 1.55;
          margin: 0;
        }

        /* ── 6 Industries grid (inside the "How It Works" accordion) ─── */
        .ts-industries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 14px;
          margin-top: 16px;
        }
        .ts-industry-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid;
          border-radius: 12px;
          padding: 18px 20px;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .ts-industry-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.04);
        }
        .ts-industry-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 10px;
        }
        .ts-industry-name {
          font-family: var(--font-display);
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .ts-industry-missions {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          padding: 3px 9px;
          border-radius: 9999px;
        }
        .ts-industry-blurb {
          font-family: var(--font-body);
          font-size: 13px;
          color: var(--color-text-muted);
          line-height: 1.55;
          margin: 0;
        }

        @media (max-width: 640px) {
          .ts-missions-section { padding: 56px 18px 72px; }
          .ts-missions-grid { grid-template-columns: 1fr; }
          .ts-industries-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
