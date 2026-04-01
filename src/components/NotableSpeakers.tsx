const NOTABLE_SPEAKERS = [
  { name: 'Alexis Ohanian', title: 'Founder Reddit', image: '/speakers/Alexis Ohanian.jpeg' },
  { name: 'David Pakman', title: 'CoinFund Managing Partner', image: '/speakers/davidpakman.jpeg' },
  { name: 'Devin Finzer', title: 'CEO OpenSea', image: '/speakers/devin.jpeg' },
  { name: 'Gary Vaynerchuk', title: 'Founder Veefriends', image: '/speakers/garyvee.jpg' },
  { name: 'Jimmy Wales', title: 'Founder Wikipedia', image: '/speakers/jimmywale.jpeg' },
  { name: 'John Kosner', title: 'ESPN Sports Media Veteran', image: '/speakers/johnkosner.jpeg' },
  { name: 'Kimbal Musk', title: 'Businessman', image: '/speakers/kimbal.png' },
  { name: 'Michael Casey', title: 'CEO & Co-Founder Tell Network', image: '/speakers/casey.jpeg' },
  { name: 'Quentin Tarantino', title: 'Golden Globe Winner', image: '/speakers/taratino.jpeg' },
  { name: 'Robby Yung', title: 'CEO Animoca', image: '/speakers/robby.jpeg' },
  { name: 'Spike Lee', title: 'Academy Award Winner', image: '/speakers/spikelee.jpg' },
  { name: 'T.J. Miller', title: 'Comedian', image: '/speakers/TJ-Miller-featured-pic.jpg' },
];

export default function NotableSpeakers() {
  return (
    <section style={{ padding: 'clamp(3rem, 8vw, 6rem) 0' }}>
      <div className="max-w-[960px] mx-auto px-6">
        <div className="text-center mb-12">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>Influential Voices from NFT.NYC</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 1rem + 2.5vw, 3rem)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}>12 Notable Past Speakers</h2>
        </div>
        <div
          className="notable-speakers-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem 3rem',
          }}
        >
          {NOTABLE_SPEAKERS.map(s => (
            <div
              key={s.name}
              className="scroll-fade-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '0.75rem',
                border: '1px solid var(--card-border)',
                background: 'var(--color-surface)',
                transition: 'border-color var(--transition-interactive)',
              }}
            >
              <img
                src={s.image}
                alt={s.name}
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '2px solid var(--card-border)',
                }}
              />
              <div>
                <p style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  textTransform: 'uppercase',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}>{s.name}</p>
                <p style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.25rem',
                }}>{s.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .notable-speakers-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
