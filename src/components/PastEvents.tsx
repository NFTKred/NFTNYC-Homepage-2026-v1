import { useRef } from 'react';
import { PAST_EVENTS } from '@/data/nftnyc';

const CARD_WIDTH = 400 + 20; // card width + gap

function ArrowBtn({ dir, onClick }: { dir: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      aria-label={`Scroll ${dir}`}
      onClick={onClick}
      style={{
        position: 'absolute',
        top: '50%',
        [dir === 'left' ? 'left' : 'right']: '0.5rem',
        transform: 'translateY(-50%)',
        zIndex: 3,
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: '9999px',
        border: '1px solid var(--card-border)',
        background: 'var(--color-surface)',
        color: 'var(--color-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.1rem',
        lineHeight: 1,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border-hover)';
        (e.currentTarget as HTMLElement).style.background = 'var(--color-bg)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
        (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)';
      }}
    >
      {dir === 'left' ? '‹' : '›'}
    </button>
  );
}

export default function PastEvents() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === 'left' ? -CARD_WIDTH : CARD_WIDTH,
      behavior: 'smooth',
    });
  };

  return (
    <section
      id="past-events"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 0',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div style={{ padding: '0 1.5rem' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-8 scroll-fade-up">
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--color-text-faint)',
              marginBottom: '0.75rem',
            }}>Past Events</p>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}>Since 2018</h2>
          </div>
        </div>
      </div>

      {/* Horizontal carousel */}
      <div style={{ position: 'relative' }}>
        {/* Left shadow */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '3rem',
          background: 'linear-gradient(to right, var(--color-bg), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />
        {/* Right shadow */}
        <div style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '3rem',
          background: 'linear-gradient(to left, var(--color-bg), transparent)',
          zIndex: 2,
          pointerEvents: 'none',
        }} />

        <ArrowBtn dir="left" onClick={() => scroll('left')} />
        <ArrowBtn dir="right" onClick={() => scroll('right')} />

      <div
        ref={scrollRef}
        style={{
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'thin',
          scrollbarColor: 'var(--color-text-faint) transparent',
          padding: '0 1.5rem 1rem',
        }}
      >
        <div style={{
          display: 'flex',
          gap: '1.25rem',
          width: 'max-content',
          paddingRight: '1.5rem',
        }}>
          {PAST_EVENTS.map((event) => (
            <div
              key={event.name}
              className="fade-in"
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '400px',
                flexShrink: 0,
                borderRadius: '0.75rem',
                overflow: 'hidden',
                background: 'var(--color-surface)',
                border: '1px solid var(--card-border)',
                transition: 'transform 0.2s ease, border-color 0.2s ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border-hover)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
              }}
            >
              {/* Event screenshot */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '180px',
                overflow: 'hidden',
              }}>
                <img
                  src={event.image}
                  srcSet={`${event.image}?width=400 400w, ${event.image}?width=800 800w, ${event.image}?width=1200 1200w`}
                  sizes="400px"
                  alt={event.name}
                  loading="lazy"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                }} />
                {/* Year badge */}
                <span style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '0.75rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '4px',
                  letterSpacing: '0.05em',
                }}>{event.year}</span>
              </div>

              {/* Content */}
              <div style={{
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}>
                {/* Fixed-height header area for consistent tag alignment */}
                <div style={{
                  minHeight: '5.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginBottom: '0.75rem',
                }}>
                  <h3 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    marginBottom: '0.5rem',
                  }}>{event.tagline}</h3>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-faint)',
                    lineHeight: 1.5,
                  }}>{event.dates}<br />{event.venue}</p>
                </div>

                {/* Stats row */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  marginBottom: '0.75rem',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                  }}>{event.attendees} Attendees</span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                  }}>{event.speakers} Speakers</span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    background: 'var(--color-surface)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '9999px',
                  }}>{event.tracks} {parseInt(event.tracks) === 1 ? 'Track' : 'Tracks'}</span>
                </div>

                {/* Description */}
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.5,
                  marginBottom: '0.75rem',
                }}>{event.description}</p>

                {/* Highlights */}
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.35rem',
                }}>
                  {event.highlights.map((h, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '11px',
                        color: 'var(--color-text-muted)',
                        paddingLeft: '1rem',
                        position: 'relative',
                        lineHeight: 1.4,
                      }}
                    >
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--color-primary)',
                      }}>›</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
