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
  { num: '01', icon: 'ℹ️', title: 'Overview', desc: 'What is the TS Challenge and how it brings collectors and artists together.' },
  { num: '02', icon: '📍', title: 'Meet Relay', desc: 'The official NFT.NYC mascot and your guide through the challenge.' },
  { num: '03', icon: '👥', title: 'Two Tracks', desc: 'Parallel journeys for collectors and artists, both fueled by T-XP.' },
  { num: '04', icon: '⚡', title: 'T-XP Engine', desc: 'Daily actions, multipliers, and the leaderboard race.' },
  { num: '05', icon: '🪙', title: 'T-XP & T-Kredits', desc: 'Two currencies powering the challenge — earn, spend, and climb.' },
  { num: '06', icon: '🎯', title: 'The Outcome', desc: 'Visibility, engagement, and earning — turn art into sustainable opportunity.' },
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
        <p className="ts-lead">A one-time, limited-edition community experience on OneHub.NFT.NYC where collectors and artists engage, compete, and earn.</p>
        <ul className="ts-list">
          <li>Artwork from the <strong>NFT.NYC 2025 Community Artist Showcase</strong> is transformed into <strong>Limited Edition Collectible TS Art</strong></li>
          <li>New art categories released <strong>weekly</strong> on <strong>OneHub.NFT.NYC</strong></li>
          <li>Collectors purchase <strong>Collectible TS Art</strong> — limited-edition, limited-time derivatives</li>
          <li>Participants earn <strong>T-XP</strong>, climb the leaderboard, and unlock rewards</li>
          <li>When artwork reaches <strong>5 unique collectors</strong>, it unlocks <strong>T-Kredits</strong> pricing and moves to the <strong>Featured Category</strong></li>
          <li><strong>T-Kredits</strong> are the only way to purchase Featured Art — purchased separately from T-XP</li>
          <li>Eligible artists may earn <strong>USDC</strong> — T-Kredits sales pay out <strong>in USDC</strong> direct to artists</li>
        </ul>
        <div className="ts-stats-row">
          <div className="ts-stat"><div className="ts-stat-number">1,500</div><div className="ts-stat-label">Artworks Showcased</div></div>
          <div className="ts-stat"><div className="ts-stat-number">12</div><div className="ts-stat-label">Week Campaign</div></div>
          <div className="ts-stat"><div className="ts-stat-number">10M</div><div className="ts-stat-label">T-XP Giveaway</div></div>
        </div>
      </>
    ),
  },
  {
    step: 2, kicker: 'Your Guide', title: 'Meet', accent: 'Relay the Rat',
    content: () => (
      <>
        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' as const }}>
          <img
            src="/relay-rat.png"
            alt="Relay the Rat"
            style={{
              width: 140, height: 140, objectFit: 'contain', flexShrink: 0,
              filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.4))',
            }}
          />
          <div style={{ flex: 1, minWidth: 240 }}>
            <p className="ts-lead">The official mascot of NFT.NYC — and the narrator of the TS Challenge.</p>
            <p>Before the stages, screens, and crowds — there were builders. Meeting in basements, coffee shops, and Discords. NFT.NYC chose the rat as its symbol because in NYC culture, the rat represents <strong>adaptability</strong>, <strong>intelligence</strong>, and <strong>thriving in complex systems</strong>.</p>
            <button
          onClick={() => {
            const btn = document.getElementById('relay-chat-btn') as HTMLElement;
            if (btn) btn.click();
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 24,
            padding: '0.65rem 1.75rem',
            borderRadius: '9999px',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            border: 'none',
            background: '#fff',
            color: '#000',
            transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 20px rgba(255,255,255,0.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          Chat with RELAY
        </button>
          </div>
        </div>
      </>
    ),
  },
  {
    step: 3, kicker: 'Two Tracks', title: 'How It', accent: 'Works',
    content: (tab, setTab) => (
      <>
        <p className="ts-lead">Parallel journeys for collectors and artists — both fueled by T-XP.</p>
        <div className="ts-tab-toggle">
          <div className="ts-tab-inner">
            <button className={`ts-tab-btn${tab === 'collectors' ? ' active' : ''}`} onClick={() => setTab('collectors')}>For Collectors</button>
            <button className={`ts-tab-btn${tab === 'artists' ? ' active' : ''}`} onClick={() => setTab('artists')}>For Artists</button>
          </div>
        </div>
        {tab === 'collectors' ? (
          <>
            <div className="ts-flow-grid three">
              <FlowCard icon="🎁" title="Your 500 T-XP Are Waiting" badge="Free to Start" badgeType="free">New Collectors can claim a <strong>500 T-XP free Welcome NFT</strong> at launch—enough to grab your first piece. Earn more daily or buy T-XP to build your edge.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="🎨" title="Browse Collectible TS Art" badge="Weekly Drops" badgeType="tip">New art drops every week across three tiers: <strong>Gallery</strong>, <strong>Billboard</strong>, and <strong>Monument</strong>. Use your T-XP to buy collectible art as soon as it drops.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="⏳" title="First 24 Hours = Best Price" badge="Price Doubles" badgeType="tip">Prices <strong>double after day one</strong>. Early collectors lock in the lowest price—and the bragging rights that come with it.</FlowCard>
            </div>
            <div style={{ height: 12 }} />
            <div className="ts-flow-grid two">
              <FlowCard icon="👑" title="Unlock Featured Art" badge="Utilize T-Kredits" badgeType="vip">The most popular pieces get promoted to <strong>Featured</strong>. T-Kredits are the <strong>only way</strong> to purchase Featured Art—if you don't have them, you're locked out.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="💫" title="Build Your Collection" badge="On Chain Record" badgeType="flex">Every piece you collect lives <strong>on-chain</strong>. Show off your taste, track your collection's growth, and stand out in the community.</FlowCard>
            </div>
          </>
        ) : (
          <>
            <div className="ts-flow-grid three">
              <FlowCard icon="🎨" title="Your Art is Listed" badge="Auto-Listed" badgeType="tip">Your Times Square artwork is listed automatically by tier—<strong>Gallery</strong>, <strong>Billboard</strong>, or <strong>Monument</strong>.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="💰" title="Earn T-XP" badge="50% Commission" badgeType="free">Earn <strong>50% T-XP</strong> on every sale during the initial listing period.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="🔓" title="Reach 5 Collectors" badge="Unlock Moment" badgeType="unlock">Once <strong>5 unique collectors</strong> own your work, it unlocks T-Kredits pricing and moves to <strong>Featured Category</strong>.</FlowCard>
            </div>
            <div style={{ height: 12 }} />
            <div className="ts-flow-grid three">
              <FlowCard icon="💵" title="Earn Real Money" badge="USDC Payout" badgeType="usdc">T-Kredits sales pay out <strong>in USDC</strong>—real dollars, direct to you.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="🛡️" title="Verify to Unlock" badge="One-Time Step" badgeType="unlock">Complete a simple <strong>identity verification</strong> step to release your USDC balance. Earnings held safely until verified.</FlowCard>
              <div className="ts-chevron"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg></div>
              <FlowCard icon="♾️" title="Your Art Lives Forever" badge="Permanent" badgeType="forever">Even after a listing expires, your artwork always lives in your <strong>portfolio</strong>.</FlowCard>
            </div>
          </>
        )}
      </>
    ),
  },
  {
    step: 4, kicker: 'The Engine', title: 'T-XP:', accent: 'Experience Points',
    content: () => (
      <>
        <p className="ts-lead">T-XP is the core mechanic — offchain experience points that work like airline miles or hotel loyalty rewards.</p>
        <div className="ts-xp-flow">
          <span className="ts-xp-node">Collect Collectible TS Art</span>
          <span className="ts-xp-arrow">+</span>
          <span className="ts-xp-node">Send Gifts</span>
          <span className="ts-xp-arrow">+</span>
          <span className="ts-xp-node">Receive Gifts</span>
          <span className="ts-xp-arrow">+</span>
          <span className="ts-xp-node">Engage on Hub</span>
          <span className="ts-xp-arrow">=</span>
          <span className="ts-xp-node ts-xp-highlight">T-XP</span>
        </div>
        <p style={{ marginTop: 20 }}><strong>T-XP powers:</strong> Gameplay, community interaction, expressive gifting, and leaderboard progression.</p>
        <p><strong>The more you participate, the higher you climb.</strong> Top leaderboard participants unlock exclusive rewards, benefits, and challenge recognition.</p>
        <p><strong>T-Kredits</strong> are a separate premium currency. While T-XP fuels gameplay and progression, <strong>T-Kredits are the only way to purchase Featured Art</strong>. Artists earn <strong>USDC from T-Kredits sales</strong>.</p>
        <div className="ts-stats-row" style={{ marginTop: 20 }}>
          <div className="ts-stat" style={{ flex: 2 }}><div className="ts-stat-number">10,000,000</div><div className="ts-stat-label">T-XP Giveaway at Launch</div></div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8, textAlign: 'center' as const }}>Distributed to the community to jumpstart the Challenge from Day 1.</p>
      </>
    ),
  },
  {
    step: 5, kicker: 'The Assets', title: 'Collectible TS Art,', accent: 'Gift NFTs & T-Kredits',
    content: () => (
      <>
        <p className="ts-lead">Three types of digital assets power the Challenge.</p>
        <div className="ts-split-three">
          <div className="ts-split-card">
            <h4>Collectible TS Art</h4>
            <ul className="ts-list">
              <li>Limited-edition artwork from the Community Showcase</li>
              <li>Available <strong>only for a short time</strong></li>
              <li>Built directly from <strong>Community Showcase artwork</strong></li>
              <li>Lives forever as a <strong>Times Square moment</strong></li>
              <li>New category <strong>released each Monday</strong></li>
            </ul>
          </div>
          <div className="ts-split-card">
            <h4>Gift NFTs</h4>
            <ul className="ts-list">
              <li>Licensed digital items to send to friends &amp; community</li>
              <li>Used for <strong>expression</strong> and <strong>recognition</strong></li>
              <li>Drive <strong>leaderboard momentum</strong></li>
              <li><strong>Send a Gift</strong> = earn T-XP</li>
              <li><strong>Receive a Gift</strong> = earn T-XP</li>
            </ul>
          </div>
          <div className="ts-split-card">
            <h4>T-Kredits</h4>
            <ul className="ts-list">
              <li>Premium currency for <strong>Featured Art</strong> only</li>
              <li>The <strong>only way</strong> to purchase art in the Featured Category</li>
              <li>Purchased separately from T-XP</li>
              <li>Artist payout: <strong>USDC</strong> per sale</li>
              <li>Unlocked when artwork reaches <strong>5 unique collectors</strong></li>
            </ul>
          </div>
        </div>
      </>
    ),
  },
  {
    step: 6, kicker: 'The Result', title: 'The', accent: 'Outcome',
    content: () => (
      <>
        <div className="ts-outcome-flow">
          <div className="ts-outcome-node"><div className="ts-outcome-icon">🎨</div><div className="ts-outcome-label">Visibility</div></div>
          <div className="ts-outcome-arrow">→</div>
          <div className="ts-outcome-node"><div className="ts-outcome-icon">🔥</div><div className="ts-outcome-label">Engagement</div></div>
          <div className="ts-outcome-arrow">→</div>
          <div className="ts-outcome-node ts-outcome-final"><div className="ts-outcome-icon">💰</div><div className="ts-outcome-label">Earn</div></div>
        </div>
        <div className="ts-closing-quote">"Turn visibility into <em>sustainable opportunity</em>"</div>
        <ul className="ts-list" style={{ marginTop: 24 }}>
          <li>Eligible artists may earn revenue (USDC) through the challenge</li>
          <li>Collectors build collections and climb leaderboards</li>
          <li>Community grows through gifting, sharing, and engagement</li>
          <li>NFT.NYC strengthens its position as the artist-first platform</li>
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
              A one-time, limited-edition community experience on OneHub.NFT.NYC — collect art, earn T-XP, and climb the leaderboard.
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
      `}</style>
    </div>
  );
}
