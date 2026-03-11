import { BRAND_TESTIMONIALS } from '@/data/nftnyc';

export default function BrandQuotes() {
  return (
    <section
      id="brands"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
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
          }}>What Brands Say</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>Trusted by Industry Leaders</h2>
        </div>
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))' }}
        >
          {BRAND_TESTIMONIALS.map(item => (
            <div
              key={item.brand}
              className="fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                background: 'var(--color-surface)',
                border: '1px solid var(--card-border)',
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
                  alt={`${item.brand} at NFT.NYC`}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)',
                }} />
                {/* Logo in bottom-left */}
                <div style={{
                  position: 'absolute',
                  bottom: '0.75rem',
                  left: '0.75rem',
                }}>
                  <img
                    src={item.logo}
                    alt={item.brand}
                    loading="lazy"
                    style={{
                      height: '32px',
                      width: '32px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                    }}
                  />
                </div>
                {/* Brand name */}
                <span style={{
                  position: 'absolute',
                  bottom: '0.85rem',
                  left: '3.25rem',
                  fontFamily: 'var(--font-display)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.03em',
                }}>{item.brand}</span>
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
