import { SPEAKERS } from '@/data/nftnyc';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function SpeakersSection() {
  return (
    <section
      id="speakers"
      style={{ padding: 'clamp(3rem, 8vw, 6rem) 0' }}
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center mb-12">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>Featured Voices</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 900,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>Speakers</h2>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))' }}>
          {SPEAKERS.map(s => (
            <article
              key={s.handle}
              className="fade-in rounded-[0.75rem] p-6 transition-all"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: s.ecoColor,
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-lg)',
                    fontWeight: 700,
                    color: '#fff',
                  }}
                >
                  {s.name.charAt(0)}
                </div>
                <div>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '18px',
                    fontWeight: 900,
                    color: 'var(--color-text)',
                    letterSpacing: '-0.01em',
                    textTransform: 'uppercase',
                  }}>{s.name}</h3>
                  <p style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    marginTop: '0.25rem',
                  }}>{s.role}</p>
                </div>
              </div>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.02em',
                  marginBottom: '0.75rem',
                  background: hexToRgba(s.ecoColor, 0.12),
                  color: s.ecoColor,
                }}
              >{s.eco}</span>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.5,
                marginBottom: '1rem',
                maxWidth: '72ch',
              }}>{s.why}</p>
              <a
                href={`https://x.com/${s.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'color var(--transition-interactive)',
                }}
              >@{s.handle}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
