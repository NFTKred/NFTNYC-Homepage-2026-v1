import { PRESS_COVERAGE } from '@/data/nftnyc';

// Community Media Partners — assets live in /public/media-partners.
// Prefer a proper logo file; fall back to X/IG avatar if that's all we
// have. Names are the outlet's display name.
interface MediaPartner {
  name: string;
  url?: string;
  logo?: string | null;
}
const COMMUNITY_MEDIA_PARTNERS: MediaPartner[] = [
  { name: 'CoinGape',                   url: 'https://coingape.com',                             logo: '/media-partners/coingape_logo.png' },
  { name: 'CryptoRank',                 url: 'https://cryptorank.io',                            logo: '/media-partners/cryptorank_logo.svg' },
  { name: 'CoinNewsSpan',               url: 'https://coinnewsspan.com',                         logo: '/media-partners/coinnewsspan_logo.svg' },
  { name: 'Crypto Jobs List',           url: 'https://cryptojobslist.com',                       logo: '/media-partners/cryptojobslist_logo.png' },
  { name: 'BlockDelta',                 url: 'https://blockdelta.com',                           logo: '/media-partners/blockdelta_logo.png' },
  { name: 'Crypto Live Leak',           url: 'https://www.cryptoliveleak.org/events/nft-nyc-2026', logo: '/media-partners/cryptoliveleak_logo.png' },
  { name: 'CCM Web3',                   url: 'https://ccmweb3.com',                              logo: '/media-partners/ccmweb3_logo.svg' },
  { name: 'KEY Difference',             url: 'https://keydifference.com',                        logo: '/media-partners/keydifference_logo.svg' },
  { name: 'VTA TV',                     url: 'https://vtatv.io/',                                logo: '/media-partners/vtatv_logo.png' },
  { name: 'Lookhu',                     url: 'https://lookhu.com/',                              logo: '/media-partners/lookhu_logo.jpg' },
  { name: 'Not Another Media',          url: 'http://notanother.media',                          logo: '/media-partners/notanother_logo_wordmark.png' },
  { name: 'Third Planet Studio',        url: 'https://www.thirdplanet.studio',                   logo: '/media-partners/thirdplanet_logo.png' },
  { name: 'The Loudmouth Team',         url: 'https://theloudmouthteam.com/',                    logo: '/media-partners/theloudmouthteam_logo.jpeg' },
  { name: 'The Beau Monde Magazine',    url: 'https://www.thebeaumondemagazine.com/',            logo: '/media-partners/thebeaumondemagazine_logo.png' },
  { name: 'What Do You Collect Podcast', url: 'https://www.whatdoyoucollectpodcast.com',         logo: '/media-partners/whatdoyoucollect_logo.jpg' },
  { name: 'Mona Salama',                url: 'https://www.monasalama.com/',                      logo: '/media-partners/monasalama_logo.jpg' },
  { name: 'National Coalition Against Censorship', url: 'http://www.ncac.org/',                  logo: '/media-partners/ncac_logo.png' },
  { name: 'TOP Bodyanych',              url: 'https://x.com/TOPBodyanych',                       logo: '/media-partners/topbodyanych_x.jpg' },
  { name: 'NFT Community',              url: 'https://www.instagram.com/nft_community',          logo: '/media-partners/nft_community_instagram_avatar.jpg' },
];

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
        {/* ─── Community Media Partners ───────────────────────────────── */}
        <div className="text-center mb-8 scroll-fade-up">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>2026 Media</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            margin: 0,
          }}>Community Media Partners</h2>
        </div>
        <div
          className="grid gap-3 mb-16"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))',
          }}
        >
          {COMMUNITY_MEDIA_PARTNERS.map(partner => {
            const inner = (
              <div style={{
                aspectRatio: '2 / 1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f5f5f7',
                border: '1px solid var(--card-border)',
                borderRadius: '0.75rem',
                padding: '0.75rem',
                transition: 'border-color 200ms ease, transform 200ms ease',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border-hover)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              }}
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    style={{
                      maxWidth: '80%',
                      maxHeight: '70%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-faint)',
                    textAlign: 'center',
                    lineHeight: 1.35,
                  }}>{partner.name}<br /><span style={{fontSize: '9px', letterSpacing: '0.08em', opacity: 0.6}}>Logo placeholder</span></span>
                )}
              </div>
            );
            return partner.url ? (
              <a
                key={partner.name}
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                {inner}
              </a>
            ) : (
              <div key={partner.name}>{inner}</div>
            );
          })}
        </div>

        {/* ─── In the Media (existing press-coverage cards) ────────────── */}
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
