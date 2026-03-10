import { useState, useEffect } from 'react';
import { BRAND_QUOTES } from '@/data/nftnyc';

export default function BrandQuotes() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive(prev => (prev + 1) % BRAND_QUOTES.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const q = BRAND_QUOTES[active];

  return (
    <section
      id="brands"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[960px] mx-auto">
        <div className="text-center mb-10 scroll-fade-up">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>Industry Leaders on NFTs</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>Why NFTs?</h2>
        </div>

        {/* Active quote */}
        <div
          className="text-center mx-auto"
          style={{ maxWidth: '700px', minHeight: '200px' }}
        >
          <p
            key={active}
            className="fade-in"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-lg)',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'var(--color-text)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
            }}
          >
            "{q.quote}"
          </p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-sm)',
            fontWeight: 700,
            color: 'var(--color-text)',
            textTransform: 'uppercase',
          }}>{q.name}</p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            marginTop: '0.25rem',
          }}>{q.title} - {q.company}</p>
        </div>

        {/* Brand name pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-8 scroll-fade-up">
          {BRAND_QUOTES.map((bq, i) => (
            <button
              key={bq.company}
              onClick={() => setActive(i)}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                padding: '0.35rem 0.75rem',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 180ms ease',
                background: i === active ? 'var(--color-primary)' : 'var(--color-surface)',
                color: i === active ? '#fff' : 'var(--color-text-muted)',
              }}
            >
              {bq.company}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
