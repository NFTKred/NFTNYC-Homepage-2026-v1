import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import NeuralMesh from '@/components/NeuralMesh';
import Countdown from '@/components/Countdown';
import SpeakersSection from '@/components/SpeakersSection';
import EcosystemSection from '@/components/EcosystemSection';
import SiteFooter from '@/components/SiteFooter';
import { ECOSYSTEMS } from '@/data/nftnyc';

export default function Index() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem 2rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 'var(--text-base)',
    textDecoration: 'none',
    cursor: 'pointer',
    minHeight: '44px',
    border: 'none',
    transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <div data-theme={theme} style={{ background: 'var(--color-bg)', minHeight: '100dvh' }}>
      <SiteHeader theme={theme} onToggleTheme={toggleTheme} />

      <main id="main">
        {/* ======== HERO ======== */}
        <section
          id="hero"
          className="flex flex-col items-center justify-start"
          style={{ padding: 'calc(4rem + 56px) 1rem 2rem' }}
          aria-label="NFT.NYC 2026 Interactive Ecosystem Map"
        >
          <div className="text-center relative z-[2] mb-8">
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: 'var(--color-text-muted)',
              marginBottom: '1rem',
            }}>THE 9TH NFT INDUSTRY EVENT</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-hero)',
              fontWeight: 900,
              color: 'var(--color-text)',
              letterSpacing: '0.06em',
              lineHeight: 1,
              textTransform: 'uppercase',
            }}>
              NFT<span style={{ color: 'var(--nft-blue)' }}>.</span>NYC{' '}
              <span style={{
                background: 'linear-gradient(135deg, var(--nft-blue), var(--nft-purple), var(--nft-pink))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>2026</span>
            </h1>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: 'var(--color-text-faint)',
              marginTop: '1rem',
            }}>TIMES SQUARE, NEW YORK CITY&ensp;|&ensp;1–2 SEPTEMBER 2026</p>
            <Countdown />
          </div>

          {/* Neural mesh (desktop) */}
          <div className="hidden sm:flex justify-center w-full">
            <NeuralMesh />
          </div>

          {/* Mobile fallback */}
          <div className="sm:hidden w-full max-w-[500px] px-4">
            <div
              className="text-center mb-6 p-8 rounded-xl"
              style={{
                border: '2px solid var(--nft-blue)',
                background: 'rgba(59,130,246,0.08)',
              }}
            >
              <span style={{ fontSize: 'var(--text-2xl)', display: 'block', marginBottom: '0.5rem', color: 'var(--nft-blue)' }}>◆</span>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--color-text)' }}>NFTs</h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Tokenizing Virtual Assets</p>
            </div>
            <div className="flex flex-col gap-3">
              {ECOSYSTEMS.map(eco => (
                <div
                  key={eco.id}
                  className="flex items-center gap-4 p-4 rounded-[0.75rem]"
                  style={{
                    background: 'var(--color-surface)',
                    borderLeft: `3px solid ${eco.color}`,
                  }}
                >
                  <span style={{ fontSize: 'var(--text-xl)', flexShrink: 0 }}>{eco.icon}</span>
                  <div>
                    <strong style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text)', display: 'block' }}>{eco.name}</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', display: 'block', marginTop: '0.25rem' }}>{eco.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ======== STATEMENT ======== */}
        <section
          id="about"
          style={{
            padding: 'clamp(3rem, 8vw, 8rem) 1.5rem',
            background: 'var(--color-surface)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div className="max-w-[960px] mx-auto text-center">
            <h2 style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xl)',
              fontWeight: 500,
              color: 'var(--color-text)',
              letterSpacing: '-0.01em',
              lineHeight: 1.4,
              maxWidth: '50ch',
              marginInline: 'auto',
              marginBottom: '2.5rem',
            }}>
              NFTs are the tokenization layer for virtual assets — from AI agent identity to gaming economies, from community ownership to digital culture.
            </h2>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnBase, background: 'var(--color-primary)', color: '#fff' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(59,130,246,0.3)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                Speak at NFT.NYC 2026
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnBase, background: 'transparent', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-dynamic)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                Become a Sponsor
              </a>
            </div>
          </div>
        </section>

        <SpeakersSection />
        <EcosystemSection />

        <SiteFooter />
      </main>
    </div>
  );
}
