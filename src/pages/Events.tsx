import { useState, useMemo } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';
import { Calendar, MapPin, ExternalLink } from 'lucide-react';

interface SatelliteEvent {
  name: string;
  host: string;
  date: string;
  dateLabel: string;
  venue: string;
  description: string;
  registrationUrl?: string;
  sourceUrl?: string;
  tag?: 'Official' | 'Community';
}

const EVENTS: SatelliteEvent[] = [
  {
    name: 'DDNYC 2026',
    host: 'Doginal Dogs × TAO Hospitality Group',
    date: '2026-09-02',
    dateLabel: 'Sept 2–4, 2026',
    venue: 'New York City · Venues TBA',
    description:
      'A three-day community gathering running directly alongside NFT.NYC — beach club takeover, hotel takeover, and nightclub takeover, plus keynotes and live music. Tickets sold out in under an hour.',
    sourceUrl:
      'https://www.barchart.com/story/news/2160887/doginal-dogs-announces-ddnyc-2026-in-collaboration-with-tao-hospitality-group-sept-2-4-in-nyc',
    tag: 'Community',
  },
  {
    name: 'NFT NYC: Honeybee Lounge',
    host: 'Bee & The Bitcoin Barbie',
    date: '2026-09-02',
    dateLabel: 'During NFT.NYC Week · Exact date TBA',
    venue: 'The Honeybee House · Midtown Manhattan',
    description:
      'Rooftop party with music, drinks, food, games, and prizes. Registration requires host approval. Partners include the Quakey Collective, music by Stu Kwan, and media by VTATV.',
    registrationUrl: 'https://luma.com/kkxw3r3g',
    tag: 'Community',
  },
  {
    name: 'Beef Stew Radio Presents: The Jeetsons',
    host: 'Beef Stew Radio',
    date: '2026-09-03',
    dateLabel: 'Thursday, Sept 3, 2026 · 7:00 PM',
    venue: 'The Delancey Rooftop · Lower East Side',
    description:
      'Party and comedy show branded as an NFT.NYC week event on the Lower East Side rooftop.',
    registrationUrl:
      'https://www.eventbrite.com/e/beef-stew-radio-presents-the-jeetsons-party-comedy-show-during-nft-nyc-tickets-1992834789501',
    tag: 'Community',
  },
];

const ACCENT = 'var(--nft-blue)';
const ACCENT_HEX = '#3B82F6';

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function Events() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const sorted = useMemo(
    () => [...EVENTS].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    []
  );

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="events" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <section style={{ padding: '160px 32px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="text-center" style={{ marginBottom: '2.5rem' }}>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              letterSpacing: '4px',
              textTransform: 'uppercase',
              color: 'rgb(90, 90, 117)',
              marginBottom: '0.75rem',
            }}
          >
            NFT.NYC Week · Sept 1–3, 2026
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.5px',
              textTransform: 'uppercase',
            }}
          >
            Satellite Events
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              maxWidth: '600px',
              margin: '1.25rem auto 0',
            }}
          >
            Community events, meetups, parties, and activations happening across
            New York City during NFT.NYC Week. This list grows as new events are
            announced — check back through August.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sorted.map((event) => (
            <article
              key={event.name}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px',
                padding: '1.75rem',
                transition: 'border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = hexToRgba(ACCENT_HEX, 0.25);
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                {event.tag && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: hexToRgba(ACCENT_HEX, 0.12),
                      color: ACCENT,
                    }}
                  >
                    {event.tag}
                  </span>
                )}
                <span
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '12px',
                    color: 'rgb(149, 149, 176)',
                  }}
                >
                  {event.host}
                </span>
              </div>

              <h2
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(20px, 2.5vw, 24px)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  letterSpacing: '-0.02em',
                  marginBottom: '0.75rem',
                }}
              >
                {event.name}
              </h2>

              <div
                style={{
                  display: 'flex',
                  gap: '1.25rem',
                  flexWrap: 'wrap',
                  marginBottom: '1rem',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  color: 'rgb(149, 149, 176)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Calendar size={14} style={{ color: ACCENT }} />
                  {event.dateLabel}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} style={{ color: ACCENT }} />
                  {event.venue}
                </span>
              </div>

              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '14px',
                  color: 'var(--color-text-muted)',
                  lineHeight: 1.65,
                  marginBottom: '1.25rem',
                }}
              >
                {event.description}
              </p>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {event.registrationUrl && (
                  <a
                    href={event.registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 600,
                      fontSize: '13px',
                      textDecoration: 'none',
                      border: `1px solid ${ACCENT}`,
                      color: ACCENT,
                      transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = ACCENT_HEX;
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                      (e.currentTarget as HTMLElement).style.color = ACCENT_HEX;
                    }}
                  >
                    Register
                    <ExternalLink size={12} />
                  </a>
                )}
                {event.sourceUrl && (
                  <a
                    href={event.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.55rem 1.25rem',
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-body)',
                      fontWeight: 500,
                      fontSize: '13px',
                      textDecoration: 'none',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: 'var(--color-text-muted)',
                      transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.3)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)';
                      (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)';
                    }}
                  >
                    Source
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>

        <div
          style={{
            marginTop: '3rem',
            padding: '2rem',
            background: 'var(--color-surface)',
            borderRadius: '1rem',
            border: '1px solid var(--card-border)',
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(18px, 2.5vw, 22px)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}
          >
            Hosting an event?
          </h3>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              maxWidth: '520px',
              margin: '0 auto 1.5rem',
            }}
          >
            If you’re running a meetup, party, workshop, or activation during NFT.NYC Week
            (Sept 1–3, 2026), email team@nft.nyc to be listed here.
          </p>
          <a
            href="mailto:team@nft.nyc?subject=NFT.NYC%202026%20Satellite%20Event%20Submission"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              border: `1px solid ${ACCENT}`,
              background: 'transparent',
              color: ACCENT,
              transition: 'all 180ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = ACCENT_HEX;
              (e.currentTarget as HTMLElement).style.color = '#fff';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
              (e.currentTarget as HTMLElement).style.color = ACCENT_HEX;
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Submit your event
          </a>
        </div>
      </section>

      <SiteFooter stage={stage} />
    </div>
  );
}
