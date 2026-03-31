const VIBES = [
  {
    src: 'https://510411.fs1.hubspotusercontent-na1.net/hubfs/510411/TS%20Group.png',
    alt: 'Attendees watching NFT art on Times Square billboards during NFT.NYC 2025',
    caption: 'Times Square Takeover',
  },
  {
    src: 'https://510411.fs1.hubspotusercontent-na1.net/hubfs/510411/nftnyc-artistsvillage-cropped.jpg',
    alt: 'Attendees connecting and viewing digital art at the NFT.NYC 2023 Artists Village',
    caption: 'Community Connection',
  },
  {
    src: 'https://510411.fs1.hubspotusercontent-na1.net/hubfs/510411/artist%20showcase%20pic.png',
    alt: 'Artists presenting work at the NFT.NYC 2024 Artist Showcase at the Javits Center',
    caption: 'Artist Showcase',
  },
];

function srcSet(url: string) {
  // HubSpot CDN supports ?width= for responsive images
  return `${url}?width=400 400w, ${url}?width=800 800w, ${url}?width=1200 1200w`;
}

export default function EventVibes() {
  return (
    <section
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-8 scroll-fade-up">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>The Experience</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>What NFT.NYC Feels Like</h2>
        </div>

        <div
          className="scroll-fade-up vibes-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
          }}
        >
          {VIBES.map((v, i) => (
            <div
              key={v.caption}
              className={i === 0 ? 'vibes-hero' : ''}
              style={{
                position: 'relative',
                borderRadius: '0.75rem',
                overflow: 'hidden',
                border: '1px solid var(--card-border)',
                aspectRatio: i === 0 ? '2 / 1' : '16 / 10',
                gridColumn: i === 0 ? '1 / -1' : undefined,
              }}
            >
              <img
                src={v.src}
                srcSet={srcSet(v.src)}
                sizes="(max-width: 640px) 100vw, 50vw"
                alt={v.alt}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)',
                pointerEvents: 'none',
              }} />
              <span style={{
                position: 'absolute',
                bottom: '0.75rem',
                left: '0.75rem',
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}>{v.caption}</span>
            </div>
          ))}
        </div>

        {/* Responsive: single column on mobile */}
        <style>{`
          @media (max-width: 640px) {
            .vibes-grid {
              grid-template-columns: 1fr !important;
            }
            .vibes-hero {
              grid-column: 1 !important;
              aspect-ratio: 16 / 10 !important;
            }
          }
        `}</style>
      </div>
    </section>
  );
}
