import { ATTENDEE_TESTIMONIALS } from '@/data/nftnyc';

export default function AttendeeTestimonials() {
  return (
    <section
      id="testimonials"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-10">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>From the Community</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>Attendee Voices</h2>
        </div>

        {/* Scrolling marquee of testimonial cards */}
        <div
          className="overflow-hidden relative"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          }}
        >
          <div
            className="flex gap-4"
            style={{
              animation: 'marqueeScroll 40s linear infinite',
              width: 'max-content',
            }}
          >
            {[...ATTENDEE_TESTIMONIALS, ...ATTENDEE_TESTIMONIALS].map((t, i) => (
              <div
                key={`${t.name}-${i}`}
                style={{
                  flex: '0 0 300px',
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--card-border)',
                }}
              >
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  fontStyle: 'italic',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '0.75rem',
                }}>"{t.quote}"</p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                }}>- {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
