export default function SatelliteEvents() {
  const tiers = [
    {
      label: 'Official Events',
      accent: 'var(--nft-blue)',
      accentBg: 'rgba(59,130,246,0.08)',
      description:
        'Host a featured event within the Edison Ballroom or at your own venue during NFT.NYC Week. Official Events are highlighted on the event program with your branding, call to action, and image.',
      perks: [
        'Featured on the NFT.NYC event program',
        'Your branding, image, and CTA included',
        'Host within the venue or at your own space',
        'Cross-promotion to 200,000+ NFT.NYC alumni',
      ],
      cta: 'Become an Official Event',
      href: 'mailto:team@nft.nyc?subject=NFT.NYC%202026%20Official%20Event%20Inquiry',
    },
    {
      label: 'Community Events',
      accent: 'var(--nft-purple)',
      accentBg: 'rgba(139,92,246,0.08)',
      description:
        'Hosting a meetup, party, workshop, or activation during NFT.NYC Week? Submit your event for review and get listed on the NFT.NYC Community Events Calendar.',
      perks: [
        'Listed on the public Community Events Calendar',
        'Visible to all NFT.NYC attendees',
        'Open to any web3 community or project',
        'Free to submit',
      ],
      cta: 'Submit a Community Event',
      href: 'mailto:team@nft.nyc?subject=NFT.NYC%202026%20Community%20Event%20Submission',
    },
  ];

  return (
    <section
      id="events"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="text-center mb-4 scroll-fade-up">
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--color-text-faint)',
              marginBottom: '0.75rem',
            }}
          >
            NFT.NYC Week
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}
          >
            Community Events
          </h2>
        </div>

        <p
          className="scroll-fade-up"
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
            maxWidth: '640px',
            margin: '0 auto 3rem',
            lineHeight: 1.6,
          }}
        >
          Since 2019, major brands and builders have launched projects and
          engaged their communities at NFT.NYC. In 2022 alone, over 450
          satellite events took place across New York City during NFT.NYC Week.
        </p>

        {/* Two-tier cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))',
            gap: '1.5rem',
            marginBottom: '3rem',
          }}
        >
          {tiers.map((tier) => (
            <div
              key={tier.label}
              className="scroll-fade-scale"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--card-border)',
                borderRadius: '1rem',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = tier.accent;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 24px ${tier.accentBg}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Tier badge */}
              <span
                style={{
                  display: 'inline-block',
                  alignSelf: 'flex-start',
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding: '0.3rem 0.75rem',
                  borderRadius: '9999px',
                  background: tier.accentBg,
                  color: tier.accent,
                  marginBottom: '1.25rem',
                }}
              >
                {tier.label}
              </span>

              {/* Description */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                }}
              >
                {tier.description}
              </p>

              {/* Perks list */}
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem',
                  flex: 1,
                }}
              >
                {tier.perks.map((perk) => (
                  <li
                    key={perk}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text)',
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: tier.accent,
                        flexShrink: 0,
                        marginTop: '0.1rem',
                        fontSize: '0.65rem',
                      }}
                    >
                      ●
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={tier.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.75rem',
                  borderRadius: '9999px',
                  fontFamily: 'var(--font-body)',
                  fontWeight: 600,
                  fontSize: 'var(--text-sm)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  border: `1px solid ${tier.accent}`,
                  background: 'transparent',
                  color: tier.accent,
                  transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                  textAlign: 'center',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = tier.accent;
                  (e.currentTarget as HTMLElement).style.color = '#fff';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 16px ${tier.accentBg}`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = tier.accent;
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {tier.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div
          style={{
            textAlign: 'center',
            padding: '1.5rem',
            background: 'var(--color-surface)',
            borderRadius: '0.75rem',
            border: '1px solid var(--card-border)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}
          >
            Want to discuss sponsorship or partnership opportunities?{' '}
            <a
              href="mailto:sponsors@nft.nyc?subject=NFT.NYC%202026%20Sponsorship%20Inquiry"
              style={{
                color: 'var(--color-primary)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Contact our sponsorship team
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
