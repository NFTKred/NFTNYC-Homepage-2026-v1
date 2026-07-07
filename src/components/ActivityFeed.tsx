/**
 * ActivityFeed — art-only slice of the OneHub activity feed, shown on the
 * homepage under the "tokenization layer" statement.
 *
 * v1: iframe-embeds onehub.nft.nyc/activity?filter=art. The whole card
 * clicks through to the same URL in a new tab so people can dive into the
 * full feed on OneHub.
 */

const FEED_URL = 'https://onehub.nft.nyc/activity?filter=art';

export default function ActivityFeed() {
  return (
    <section
      id="activity"
      aria-label="Collect from our community of creators"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        background: 'var(--color-bg)',
        borderBottom: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[1100px] mx-auto">
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 700,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            margin: '0 0 0.75rem',
          }}>
            Live from the Times Square Challenge
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)',
            fontWeight: 800,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            margin: '0 0 0.75rem',
          }}>
            Collect from our community of creators
          </h2>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            maxWidth: '52ch',
            margin: '0 auto',
            lineHeight: 1.55,
          }}>
            A live look at limited-edition art moving between collectors across the NFT.NYC community.
          </p>
        </div>

        {/* Whole card is a click-through to the standalone feed */}
        <a
          href={FEED_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open the full art feed on OneHub"
          style={{
            display: 'block',
            position: 'relative',
            borderRadius: '1rem',
            overflow: 'hidden',
            border: '1px solid var(--card-border)',
            background: 'var(--color-surface)',
            boxShadow: 'var(--shadow-md)',
            textDecoration: 'none',
          }}
        >
          <iframe
            src={FEED_URL}
            title="OneHub art feed"
            loading="lazy"
            // pointer-events: none makes the iframe itself non-interactive so
            // the wrapping <a> catches every click and opens the standalone
            // feed in a new tab — that matches the "clicks through to feed
            // on TS" behavior.
            style={{
              display: 'block',
              width: '100%',
              height: 'clamp(520px, 70vh, 720px)',
              border: 0,
              background: 'transparent',
              pointerEvents: 'none',
            }}
            referrerPolicy="no-referrer-when-downgrade"
          />
        </a>

        <p style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
        }}>
          <a
            href={FEED_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}
          >
            Open the full feed →
          </a>
        </p>
      </div>
    </section>
  );
}
