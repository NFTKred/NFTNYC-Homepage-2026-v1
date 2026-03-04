import { useEffect, useRef } from 'react';
import { FEED_POSTS } from '@/data/nftnyc';

function buildFeedHTML(): string {
  return FEED_POSTS.map(p => `
    <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem 1.25rem;background:var(--color-surface);border:1px solid rgba(255,255,255,0.08);border-radius:0.75rem;flex-shrink:0;">
      <span style="width:8px;height:8px;border-radius:9999px;background:${p.color};flex-shrink:0;animation:feedDotPulse 3s ease-in-out infinite;"></span>
      <span style="font-family:var(--font-body);font-size:var(--text-sm);font-weight:500;color:var(--color-text);letter-spacing:-0.01em;">${p.title}</span>
    </div>
  `).join('');
}

export default function SiteFooter() {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trackRef.current) {
      const items = buildFeedHTML();
      trackRef.current.innerHTML = items + items;
      const duration = `${FEED_POSTS.length * 2}s`;
      trackRef.current.parentElement?.style.setProperty('--feed-duration', duration);
    }
  }, []);

  const socialLinks = [
    {
      href: '#', label: 'X (Twitter)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
    {
      href: '#', label: 'Instagram',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
    },
    {
      href: '#', label: 'LinkedIn',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    },
    {
      href: '#', label: 'YouTube',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    },
  ];

  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.75rem 1.5rem',
    borderRadius: '9999px',
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    fontSize: 'var(--text-sm)',
    textDecoration: 'none',
    cursor: 'pointer',
    minHeight: '44px',
    border: 'none',
    transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <footer
      id="footer"
      style={{
        padding: 'clamp(3rem, 6vw, 5rem) 1.5rem',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div className="max-w-[960px] mx-auto text-center">
        <div className="mb-8">
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 900,
            color: 'var(--color-text)',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
          }}>Join the Conversation</h2>
          <div className="flex justify-center gap-4">
            {socialLinks.map(link => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow on ${link.label}`}
                className="flex items-center justify-center w-11 h-11 rounded-full transition-all"
                style={{
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-surface)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-dynamic)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-faint)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
                }}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div
          className="overflow-hidden mx-auto mb-8 relative"
          style={{
            maxWidth: '480px',
            height: '168px',
            maskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)',
          }}
        >
          <div
            ref={trackRef}
            className="flex flex-col gap-3"
            style={{
              animation: 'feedScrollUp var(--feed-duration, 14s) linear infinite',
            }}
          />
        </div>

        <div className="flex gap-4 justify-center flex-wrap mb-10">
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

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            Times Square, New York City | H2 2026
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            © 2026 NFT.NYC
          </p>
        </div>
      </div>
    </footer>
  );
}
