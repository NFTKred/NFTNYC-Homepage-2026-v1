import { ECOSYSTEMS } from '@/data/nftnyc';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 0',
        background: 'var(--color-surface)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
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
          }}>The NFT Landscape</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>Ecosystem</h2>
        </div>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))' }}>
          {ECOSYSTEMS.map(eco => (
            <article
              key={eco.id}
              className="fade-in relative overflow-hidden rounded-[0.75rem] p-6 transition-all"
              style={{
                background: 'var(--color-bg)',
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
              {/* Top color bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[0.75rem]"
                style={{ background: eco.color }}
              />
              <div className="flex items-center gap-3 mb-4">
                <span style={{ fontSize: 'var(--text-xl)' }}>{eco.icon}</span>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.01em',
                  textTransform: 'uppercase',
                }}>{eco.name}</h3>
              </div>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                marginBottom: '1rem',
                maxWidth: '72ch',
              }}>{eco.desc}</p>
              {eco.examples.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {eco.examples.map(ex => (
                    <span
                      key={ex}
                      style={{
                        display: 'inline-flex',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '0.375rem',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        background: hexToRgba(eco.color, 0.1),
                        color: eco.color,
                      }}
                    >{ex}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
