import { useEffect, useRef, useState } from 'react';
import { ECOSYSTEMS } from '@/data/nftnyc';
import { VERTICAL_RESOURCES } from '@/data/verticalResources';
import { supabase } from '@/lib/supabase';

interface FeedItem {
  title: string;
  url: string;
  color: string;
  vertical: string;
}

const ECO_MAP = Object.fromEntries(ECOSYSTEMS.map(e => [e.id, { name: e.name, color: e.color }]));

function getStaticFeedItems(): FeedItem[] {
  const items: FeedItem[] = [];
  for (const [vid, resources] of Object.entries(VERTICAL_RESOURCES)) {
    const eco = ECO_MAP[vid];
    if (!eco) continue;
    for (const r of resources) {
      items.push({ title: r.title, url: r.url, color: eco.color, vertical: eco.name });
    }
  }
  return items.sort((a, b) => b.title.localeCompare(a.title)).slice(0, 20);
}

function buildFeedHTML(items: FeedItem[]): string {
  return items.map(p => `
    <a href="${p.url}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem 1rem;background:var(--color-surface);border:1px solid var(--card-border);border-radius:0.75rem;flex-shrink:0;text-decoration:none;transition:border-color 150ms ease;text-align:left;">
      <span style="width:8px;height:8px;border-radius:9999px;background:${p.color};flex-shrink:0;animation:feedDotPulse 3s ease-in-out infinite;"></span>
      <span style="flex:1;font-family:var(--font-body);font-size:13px;font-weight:500;color:var(--color-text);letter-spacing:-0.01em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left;">${p.title.replace(/'/g, '&#39;')}</span>
      <span style="font-family:var(--font-body);font-size:9px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:${p.color};background:${p.color}1A;padding:2px 6px;border-radius:4px;flex-shrink:0;white-space:nowrap;text-align:right;margin-left:auto;">${p.vertical.replace(/'/g, '&#39;')}</span>
    </a>
  `).join('');
}

export default function SiteFooter({ stage = 0 }: { stage?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [feedItems, setFeedItems] = useState<FeedItem[]>(getStaticFeedItems);

  // Fetch from Supabase, fall back to static
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('title, url, vertical_id')
          .eq('status', 'approved')
          .order('date', { ascending: false })
          .limit(30);
        if (!cancelled && !error && data && data.length > 0) {
          setFeedItems(data.map(r => ({
            title: r.title,
            url: r.url,
            color: ECO_MAP[r.vertical_id]?.color ?? '#3B82F6',
            vertical: ECO_MAP[r.vertical_id]?.name ?? r.vertical_id,
          })));
        }
      } catch {
        // Supabase unavailable — keep static fallback
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (trackRef.current && feedItems.length > 0) {
      const html = buildFeedHTML(feedItems);
      trackRef.current.innerHTML = html + html;
      const duration = `${Math.max(feedItems.length * 2, 14)}s`;
      trackRef.current.parentElement?.style.setProperty('--feed-duration', duration);
    }
  }, [feedItems]);

  const socialLinks = [
    {
      href: 'https://twitter.com/NFT_NYC', label: 'X (Twitter)',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    },
    {
      href: 'https://www.instagram.com/nft_nyc/', label: 'Instagram',
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
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
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[960px] mx-auto text-center">
        <div className="mb-8">
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            marginBottom: '1.5rem',
            textTransform: 'uppercase',
          }}>NFTs in Other Industries</h2>
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
                  border: '1px solid var(--card-border)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface-dynamic)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-text-faint)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                  (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
                }}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div
          className="overflow-hidden mb-8 relative"
          style={{
            maxWidth: '100%',
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

        {stage >= 1 && (
          <div className="flex gap-4 justify-center flex-wrap mb-10">
            <a
              href="https://sessionize.com/nft-nyc-2026/"
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
              href="mailto:sponsors@nft.nyc?subject=NFT.NYC%202026%20Sponsorship%20Inquiry"
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
        )}

        <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
            Times Square, New York City | 1–3 September 2026
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
            © 2026 NFT.NYC
          </p>
          {/* Hidden trigger for Eventbrite widget */}
          <span id="eb-trigger" style={{ display: 'none' }} />
          <span
            onClick={() => {
              const w = window as any;
              if (!w._ebWidgetReady) {
                if (w.EBWidgets?.createWidget) {
                  w.EBWidgets.createWidget({
                    widgetType: 'checkout',
                    eventId: '1985747187292',
                    promoCode: 'Earlybird',
                    themeSettings: {
                      brandColor: '#111118',
                      fontColor: '#FFFFFF',
                      background: '#000000',
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
            }}
            style={{
              display: 'inline-block',
              marginTop: '1rem',
              fontSize: '10px',
              color: 'var(--color-text-faint)',
              textDecoration: 'none',
              opacity: 0.15,
              cursor: 'pointer',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.15'; }}
          >R</span>
        </div>
      </div>
    </footer>
  );
}
