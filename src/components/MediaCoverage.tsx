import { PRESS_COVERAGE } from '@/data/nftnyc';

export default function MediaCoverage() {
  return (
    <section
      id="media"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10 scroll-fade-up">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>As Seen In</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>In the Media</h2>
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
        >
          {PRESS_COVERAGE.map(item => (
            <a
              key={item.outlet}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                background: 'var(--color-bg)',
                border: '1px solid var(--card-border)',
                textDecoration: 'none',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
              }}
            >
              {/* Background photo */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '160px',
                overflow: 'hidden',
              }}>
                <img
                  src={item.photo}
                  alt={`${item.outlet} coverage of NFT.NYC`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Gradient overlay for readability */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                }} />
                {/* Logo in bottom-left of photo */}
                <div style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  left: '0.75rem',
                }}>
                  <img
                    src={item.image}
                    alt={item.outlet}
                    style={{
                      height: '32px',
                      maxWidth: '120px',
                      objectFit: 'contain',
                      borderRadius: '4px',
                    }}
                  />
                </div>
              </div>

              {/* Quote */}
              <div style={{ padding: '1rem 1.25rem 1.25rem' }}>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontStyle: 'italic',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                }}>"{item.quote}"</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
