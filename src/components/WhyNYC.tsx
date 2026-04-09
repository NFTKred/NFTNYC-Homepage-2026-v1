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
        backgroundImage: 'url(https://f005.backblazeb2.com/file/PB-HubSpot/pastevents-2021.jpeg)',
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

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.7,
          maxWidth: '640px',
          marginInline: 'auto',
          marginBottom: '2rem',
        }}>
          The <strong style={{ color: '#fff' }}>TS Billboard Challenge</strong> turns that visibility into opportunity - artists showcase on Times Square billboards, collectors purchase derivatives, and creators receive XP and USDC rewards.
        </p>

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

          <a
            href="/ts-challenge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.65rem 1.75rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              cursor: 'pointer',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.85)',
              transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
            }}
          >
            Learn How the TS Challenge Works →
          </a>

          {/* Meet Relay Card */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '1rem',
              padding: '1.25rem 1.5rem',
              maxWidth: '480px',
              textAlign: 'left',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            <img
              src="/relay-rat.png"
              alt="Relay the Rat"
              style={{
                width: '100px',
                height: '100px',
                objectFit: 'contain',
                flexShrink: 0,
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-sm)',
                fontWeight: 700,
                color: '#fff',
                textTransform: 'uppercase',
                letterSpacing: '-0.01em',
                marginBottom: '0.35rem',
              }}>Meet your guide, Relay</p>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'rgba(255,255,255,0.7)',
                lineHeight: 1.5,
                marginBottom: '0.75rem',
              }}>Born and raised in Times Square, Relay is your local guide to NFT.NYC. Ask Relay anything about past events, what to expect in 2026, or how to get involved.</p>
              <button
                onClick={() => {
                  const btn = document.getElementById('relay-chat-btn') as HTMLElement;
                  if (btn) { btn.click(); return; }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  background: '#fff',
                  color: '#000',
                  border: 'none',
                  transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(255,255,255,0.2)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                Ask Relay
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
