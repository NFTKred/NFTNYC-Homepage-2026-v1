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
  image?: string;
  /** Pin to the top of the list, above the date-sorted entries. */
  pinned?: boolean;
}

const EVENTS: SatelliteEvent[] = [
  {
    name: 'New York GoClub event by GoMining',
    host: 'GoMining',
    date: '2026-09-02',
    dateLabel: 'Wednesday, Sept 2, 2026 · 6:00 PM arrival · 7:00–11:00 PM event',
    venue: 'Hudson VU · 653 Eleventh Avenue, New York, NY · 5 min from Times Square',
    description:
      'Private night · limited seats · application only. A closed, invite-only evening bringing together a curated group of builders, partners, and ecosystem leaders. Premium food and beverages, a breathtaking nighttime view of NYC, a presentation by the CEO of GoMining, and open dialogue on current trends and challenges. All applications reviewed; selected guests receive a confirmation.',
    registrationUrl: 'https://luma.com/ej07hnvx',
    tag: 'Community',
    image: '/events/goclub-gomining.png',
    pinned: true,
  },
  {
    name: 'Taco Tech Tuesday: NFT NYC Edition',
    host: 'Taco Tech Tuesday × Own The Doge × NY Life',
    date: '2026-09-01',
    dateLabel: 'Tuesday, Sept 1, 2026 · 5:30–9:00 PM',
    venue: '285 Fulton Street · World Trade Center, NYC',
    description:
      'A special NFT.NYC edition of Taco Tech Tuesday bringing together artists, founders, builders, investors, creators, collectors, and innovators shaping the next chapter of Web3. All-star panel featuring Mahaa (Good Company), Own The Doge (stewards of the original Doge NFT and IP), and The Visceral Glitch (Brooklyn-based AR glitch artist). Partners include NY Life and LOOQ. Government-issued photo ID required for entry — Luma registration name must match. Limited capacity, RSVP recommended.',
    registrationUrl: 'https://luma.com/ws01yaks',
    tag: 'Community',
    image: '/events/taco-tech-tuesday.png',
  },
  {
    name: 'CertiK NYC Open House: NFT.NYC Edition',
    host: 'CertiK × XDC',
    date: '2026-09-02',
    dateLabel: 'Wednesday, Sept 2, 2026 · 3:00–7:00 PM',
    venue: 'CertiK New York Office',
    description:
      'An afternoon of Web3 insights, food, and networking at the CertiK New York office during NFT.NYC week. Featured panel with CertiK and XDC on the trends shaping Web3, followed by open Q&A. Meet Web3 founders, builders, and security professionals. Complimentary food and drinks, CertiK swag, and a look at the latest security initiatives including CertiK Hunt.',
    registrationUrl: 'https://luma.com/certik-8q90',
    tag: 'Community',
    image: '/events/certik-openhouse.png',
  },
  {
    name: 'The Space Between Worlds',
    host: 'One Love Art × NFT Aotearoa × Shalin Studios',
    date: '2026-09-02',
    dateLabel: 'Wednesday, Sept 2, 2026 · 6:00–9:00 PM',
    venue: 'Jutta Gallery · New York',
    description:
      'An Official NFT.NYC 2026 Satellite Event. A group exhibition of original physical artworks exploring the unseen connections between cultures, identities, technologies, environments, and states of being. Exhibiting artists include Delta Sauce, Alyssa Stevens, Andres Del Vecchio, Jen Panepinto, Yuzapata, Goli, Judasaca, Dr Lemny, Carlos Aquino, Pollis, Dominique Baker, Zoe Louise, Koratoras, Wendy Hannah, Raymund A. Maravilla, Ronnie Peters, Tracey-Lea Morgan, Jordy Elise, Meghan Geliza Jackson, and Kate McLeod.',
    registrationUrl: 'https://luma.com/r4xl402l',
    tag: 'Official',
    image: '/events/space-between-worlds.png',
  },
  {
    name: 'The Canal Street Show Vol 6 — Beyond the Veil',
    host: 'The Canal Street Show',
    date: '2026-09-03',
    dateLabel: 'Thursday, Sept 3, 2026 · 7:00 PM',
    venue: 'Canal Street · New York',
    description:
      'A physical + digital art show under the theme Beyond the Veil. Live art battle: Kat Buglione × Leeaux vs. Judasaca × Alyssa Stevens. Live performances by Jeffy Waves and City the King. Full line-up to be announced.',
    registrationUrl: 'https://partiful.com/e/6PXIBCWdkiJNUYC8t3lN',
    tag: 'Community',
    image: '/events/canal-street-show.jpg',
  },
  {
    name: 'The Meta Beast Roaming Party — Live From NYC Decentraland Community Meet Up',
    host: 'Decentraland',
    date: '2026-09-03',
    dateLabel: 'Thursday, Sept 3, 2026 · 7:00–10:00 PM',
    venue: 'SPIN New York Flatiron',
    description:
      'A Decentraland community meet up during NFT.NYC week. If you haven’t downloaded Decentraland yet, jump in and meet the community before NFT.NYC.',
    registrationUrl: 'https://luma.com/jrx3a8e4',
    tag: 'Community',
    image: '/events/decentraland-metabeast.png',
  },
  {
    name: 'BMAG presents Remains — a solo exhibition by Rupture',
    host: 'Bitcoin Magazine Art Gallery & Museum (BMAG)',
    date: '2026-09-02',
    dateLabel: 'Opening: Wednesday, Sept 2, 6–9 PM · Exhibition: Sept 3–8, daily 1–6 PM',
    venue: '46 Hester Street · Lower East Side · Free admission',
    description:
      'BMAG presents the New York solo debut of Rupture, creator of one of the most widely collected artist-made releases on Bitcoin. At the center of the show: Remains, four paintings, each bound to a digital counterpart inscribed permanently on Bitcoin. At the 2028 halving, the digital half begins to die — to preserve one, the collector must sacrifice the other. The exhibition also includes a new body of paintings, works on paper, and a monumental ink drawing made over eight months.',
    registrationUrl: 'https://luma.com/cckjg9kl',
    tag: 'Community',
    image: '/events/bmag-rupture.jpg',
  },
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
    name: 'NFT NYC: The Honey Bee Lounge',
    host: 'The Honey Bee Lounge × Digital Trvst',
    date: '2026-09-02',
    dateLabel: 'Wednesday, Sept 2, 2026 · 7:00 PM – 11:30 PM',
    venue: 'Rooftop · New York, NY',
    description:
      'An exclusive speakeasy event and NFT.NYC networking rooftop: live music, open bar, food, games, and prizes. Community partners: Honey Bee Royale, High as Unicorn, RandyAI, LFGO.',
    registrationUrl: 'https://luma.com/ol0k3pkg',
    tag: 'Community',
    image: '/events/honeybee-lounge.png',
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
    image: '/events/jeetsons.jpg',
  },
  {
    name: 'Free Pre-NFT.NYC Yacht Party',
    host: 'Aziman Tribe × NYC Squirrels NFT',
    date: '2026-08-29',
    dateLabel: 'Saturday, Aug 29, 2026 · Boarding 10:30 PM · Sails 11:30 PM – 2:30 AM',
    venue: 'Jewel Yacht · Skyport Marina · 2430 FDR Drive, New York, NY',
    description:
      'A free pre-NFT.NYC party aboard the Jewel, cruising past the New York skyline. DJs across house, progressive, melodic, and techno. Guest list registration required, and boarding closes before the 11:30 PM departure.',
    registrationUrl: 'https://luma.com/k6xtqkej',
    tag: 'Community',
  },
  {
    name: "New Quirk City '26",
    host: 'Quirkies',
    date: '2026-08-31',
    dateLabel: 'Monday, Aug 31, 2026 · 5:00 PM – 11:00 PM',
    venue: '4 Berry Street · Greenpoint, Brooklyn',
    description:
      'A night for Quirkies, Quirklings, and INX holders on the eve of NFT.NYC Week, sponsored in part by OpenSea, BAYC, re:gens, Kabu, and 3D Frankenpunks. Registration requires a correct ETH address and is subject to host approval.',
    registrationUrl: 'https://luma.com/vtzd0h88',
    tag: 'Community',
  },
  {
    name: 'Cycol Gallery Presents: Biz Markie × Bisco Smith',
    host: 'Cycol Gallery × HEFT Gallery',
    date: '2026-09-04',
    dateLabel: 'Friday, Sept 4, 2026 · Cycol 6:00 PM – 10:00 PM · HEFT 5:00 PM – 9:00 PM',
    venue: 'Cycol Gallery · 91 Allen Street, Lower East Side (HEFT Gallery · 300 Broome Street)',
    description:
      'Broome Street Gallery Night, run with HEFT Gallery straight after NFT.NYC wraps, celebrating hip hop icon Biz Markie, artist Bisco Smith, and the web3 community. The Biz Markie Experience × Bisco Smith places contemporary work by the New York artist alongside photography, personal artifacts, and archival material from Biz Markie’s life and career. At its centre is SELECT CUTS, a limited edition fine art photography series shot by George DuBose during the 1986 Make the Music With Your Mouth, Biz sessions, produced from the original archive with the authorization of the Biz Markie Estate. Sticker creation and swapping stations upstairs, so bring your sharpie and your tag. Tickets are checked at the door.',
    registrationUrl: 'https://luma.com/zpumthj0',
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
    () => {
      const pinned = EVENTS.filter((e) => e.pinned);
      const rest = EVENTS.filter((e) => !e.pinned).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return [...pinned, ...rest];
    },
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
                overflow: 'hidden',
                transition: 'border-color 200ms ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = hexToRgba(ACCENT_HEX, 0.25);
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
              }}
            >
              {event.image && (
                <div
                  style={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${hexToRgba(ACCENT_HEX, 0.08)}, ${hexToRgba(ACCENT_HEX, 0.02)})`,
                  }}
                >
                  <img
                    src={event.image}
                    alt={event.name}
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </div>
              )}
              <div style={{ padding: '1.75rem' }}>
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
