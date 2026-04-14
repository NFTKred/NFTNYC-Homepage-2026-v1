import { useState } from 'react';
import nftLogo from '@/assets/nftnyc-logo.svg';
import { Sun, Moon, Menu, X } from 'lucide-react';
import Countdown from '@/components/Countdown';
import { SHOW_SPEAK_PAGE } from '@/pages/Speak';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  stage?: number;
}

function openEventbrite() {
  const w = window as any;
  if (!w._ebWidgetReady) {
    if (w.EBWidgets?.createWidget) {
      w.EBWidgets.createWidget({
        widgetType: 'checkout',
        eventId: '1985747187292',
        promoCode: 'Earlybird',
        themeSettings: {
          brandColor: '#f06347',
          fontColor: '#FFFFFF',
          background: '#111118',
        },
        modal: true,
        modalTriggerElementId: 'eb-trigger',
        onOrderComplete: () => console.log('Order complete!'),
      });
      w._ebWidgetReady = true;
    }
  }
  setTimeout(() => {
    const trigger = document.getElementById('eb-trigger');
    if (trigger) trigger.click();
  }, 100);
}

export default function Header({ theme, onToggleTheme, stage = 0 }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const allNavLinks = [
    { href: '#about', label: 'About', minStage: 0 },
    { href: '/speak', label: 'Speak', minStage: 0 },
    { href: '#ecosystem', label: 'Ecosystem', minStage: 0 },
    { href: '#speakers', label: 'Speakers', minStage: 1 },
    { href: '/sponsor', label: 'Brands', minStage: 0 },
    { href: '#media', label: 'Media', minStage: 0 },
    { href: '#events', label: 'Events', minStage: 1 },
    { href: '#faq', label: 'FAQ', minStage: 0 },
  ];

  const navLinks = allNavLinks.filter(link => stage >= link.minStage);

  const extLinks: { href: string; label: string }[] = [];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/')) {
      window.location.href = href;
      setMenuOpen(false);
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
    }
    setMenuOpen(false);
  };

  const [bannerDismissed, setBannerDismissed] = useState(false);
  const showBanner = !bannerDismissed;
  const bannerHeight = showBanner ? 36 : 0;

  return (
    <>
      {/* ─── URGENCY BANNER ─── */}
      {showBanner && (
        <div
          className="fixed top-0 left-0 right-0 z-[101]"
          style={{
            height: '36px',
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.12))',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(16,185,129,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
          }}
        >
          <a
            href="/speak"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              color: '#fff',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span style={{ color: '#10B981', fontWeight: 700 }}>Round 1</span>
            Speaker Submissions Close 30 April.
            <span style={{
              fontWeight: 700,
              color: '#10B981',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
            }}>Apply Now →</span>
          </a>
          <button
            onClick={e => { e.stopPropagation(); setBannerDismissed(true); }}
            style={{
              position: 'absolute',
              right: '12px',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
              padding: '4px',
            }}
            aria-label="Dismiss banner"
          >×</button>
        </div>
      )}

      <header
        className="fixed left-0 right-0 z-[100] px-6 py-4"
        style={{
          top: `${bannerHeight}px`,
          background: 'oklch(from var(--color-bg) l c h / 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--header-border)',
          backgroundColor: `color-mix(in srgb, var(--color-bg) 85%, transparent)`,
        }}
      >
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" style={{ display: 'flex', alignItems: 'center' }}>
            <img src={nftLogo} alt="NFT.NYC" style={{ height: '32px', width: 'auto', filter: theme === 'light' ? 'invert(1)' : 'none', transition: 'filter 180ms ease' }} />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px 0',
                  transition: 'color var(--transition-interactive)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {link.label}
              </button>
            ))}
            {extLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                  padding: '8px 0',
                  transition: 'color var(--transition-interactive)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
              >
                {link.label}
              </a>
            ))}
            <Countdown compact />
            <button
              onClick={openEventbrite}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
                backgroundSize: '300% 300%',
                animation: 'liquidGradient 12s ease-in-out infinite',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.45rem 1rem',
                cursor: 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(139,92,246,0.4)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              Earlybird Tickets
            </button>
            <button
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-dynamic)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex items-center justify-center w-11 h-11"
            style={{ color: 'var(--color-text)' }}
            onClick={() => setMenuOpen(v => !v)}
            aria-label="Open menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[99] flex items-center justify-center"
          style={{
            background: 'var(--overlay-bg)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <nav className="flex flex-col items-center gap-8">
            {navLinks.map(link => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-2xl)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </button>
            ))}
            <div style={{ width: '40px', height: '1px', background: 'var(--mobile-divider)' }} />
            {extLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 500,
                  color: 'var(--color-text-muted)',
                  textDecoration: 'none',
                }}
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={() => {
                setMenuOpen(false);
                openEventbrite();
              }}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-lg)',
                fontWeight: 600,
                color: '#fff',
                background: 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
                backgroundSize: '300% 300%',
                animation: 'liquidGradient 12s ease-in-out infinite',
                border: 'none',
                borderRadius: '9999px',
                padding: '0.75rem 2rem',
                cursor: 'pointer',
                marginTop: '0.5rem',
              }}
            >
              Earlybird Tickets
            </button>
          </nav>
        </div>
      )}
    </>
  );
}
