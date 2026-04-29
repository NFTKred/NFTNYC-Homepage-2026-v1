export default function WhyNYC({ stage = 0 }: { stage?: number }) {
  return (
    <section
      id="why-nyc"
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: 'clamp(3rem, 7vw, 5rem) 1.5rem',
      }}
    >
      {/* Background image */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(https://f005.backblazeb2.com/file/PB-HubSpot/pastevents-2021-3.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }} />
      {/* Dark overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 50%, rgba(0,0,0,0.82) 100%)',
      }} />

      <div className="max-w-[800px] mx-auto text-center" style={{ position: 'relative', zIndex: 1 }}>
        <p className="scroll-fade-up" style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: 'rgba(255,255,255,0.5)',
          marginBottom: '0.75rem',
        }}>The World's Stage</p>

        <h2 className="scroll-fade-up" style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          marginBottom: '1.25rem',
        }}>Why Times Square?</h2>

        <p className="scroll-fade-up" style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.7,
          marginBottom: '1rem',
          maxWidth: '640px',
          marginInline: 'auto',
        }}>
          New York City sits at the intersection of art, finance, technology, and entertainment - the four pillars of the NFT economy. And Times Square - the biggest art gallery in the world - is our main stage.
        </p>

        {/* The "TS Billboard Challenge turns that visibility…" paragraph
            previously lived here; it has been moved (and rewritten) into
            the SeeWhatsOnTheMap section directly below this one. */}

        {/* CTAs */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          marginTop: stage < 1 ? '1.5rem' : '0',
        }}>
          {stage >= 1 && (
            <a
              href="https://onehub.nft.nyc/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.85rem 2.25rem',
                borderRadius: '9999px',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                textDecoration: 'none',
                cursor: 'pointer',
                border: 'none',
                background: '#fff',
                color: '#000',
                transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(255,255,255,0.2)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              Join the TS Billboard Challenge
            </a>
          )}

          {/* "Learn How the TS Challenge Works" button moved next to the
              "Complete your first mission" CTA inside SeeWhatsOnTheMap. */}

          {/* "Meet your guide, Relay" card moved into the SeeWhatsOnTheMap
              section directly below this one. */}
        </div>
      </div>
    </section>
  );
}
