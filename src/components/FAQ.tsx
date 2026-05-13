import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

interface FAQItem {
  q: string;
  a: React.ReactNode;
  /** Plain-text fallback used for FAQPage JSON-LD. Required when `a`
   *  is JSX (links/etc.) since structured data must be plain text.
   *  When `a` is already a string, this is optional. */
  plainA?: string;
}

interface FAQCategory {
  title: string;
  items: FAQItem[];
}

const FAQ_DATA: FAQCategory[] = [
  {
    title: 'Attendee FAQs',
    items: [
      {
        q: 'When is NFT.NYC 2026?',
        a: 'NFT.NYC 2026 is September 1-3 at the Edison Ballroom in Times Square, NY.',
      },
      {
        q: '2026 Satellite Events',
        a: <>If you’re hosting a satellite event during NFT.NYC 2026 Week (1–3 September), email <a href="mailto:team@nft.nyc" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>team@nft.nyc</a> to be included in the official Events page. Across eight editions, NFT.NYC has hosted hundreds of satellite events — over 450 in 2022 alone.</>,
        plainA: 'If you’re hosting a satellite event during NFT.NYC 2026 Week (1–3 September), email team@nft.nyc to be included in the official Events page. Across eight editions, NFT.NYC has hosted hundreds of satellite events — over 450 in 2022 alone.',
      },
      {
        q: 'What to expect during NFT.NYC 2026?',
        a: 'Attendees can expect a jam-packed schedule of excitement this year. NFT.NYC 2026 kicks off with Registration Day, where attendees pick up their badge and claim sponsor merch. That same evening we have our VIP and Speaker Reception and Times Square Roadblock (come catch our NFTs on billboards in Times Square). The main event kicks off with programming where industry thought leaders will share their insight on stage. The event will also have many partner activations, exhibits and treasure hunts. NFT.NYC 2026 will continue with our Artist Showcase and live performances.',
      },
      {
        q: 'What do I receive for a GA ticket?',
        a: 'NFT.NYC is a community event. Sponsors and ticket sales fund the event. We strive to offer a high level of value for our attendees by offering a diverse and expert speaker lineup, valuable networking opportunities, and access to official satellite events. Registration also includes complimentary food and beverage throughout the event. Community members who contribute can also receive a complimentary ticket as a Speaker, Volunteer, or Artist in the Community Showcase.',
      },
      {
        q: 'How do I transfer my ticket to a friend if I\'m unable to make it?',
        a: <>Eventbrite allows you to easily transfer your ticket to someone else, using their full name and email address. See <a href="https://www.eventbrite.com/help/en-us/articles/431834/how-to-transfer-tickets-to-someone-else/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Eventbrite's guide to transfer a ticket</a>.</>,
        plainA: 'Eventbrite allows you to easily transfer your ticket to someone else, using their full name and email address. See Eventbrite\'s guide to transfer a ticket: https://www.eventbrite.com/help/en-us/articles/431834/how-to-transfer-tickets-to-someone-else/',
      },
      {
        q: 'I purchased my ticket with cryptocurrency. What happens next?',
        a: 'Crypto orders are processed via our Shopify backend (you should have received a confirmation email or text message when you ordered). Your ticket is held for you on Eventbrite (where we reconcile all registrations) and we will issue you a link to complete registration shortly. If you have any issues with your link, please send an email to Team@NFT.NYC',
      },
    ],
  },
  {
    title: 'Speaker FAQs',
    items: [
      {
        q: 'How can I apply to be a speaker at NFT.NYC?',
        a: <>Round 1 of speaker submissions for NFT.NYC 2026 closed on 30 April. Round 2 opens soon — follow <a href="https://twitter.com/NFT_NYC" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>NFT.NYC on X</a> to be the first to know when submissions reopen, then visit <a href="/speak" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>/speak</a> for the full application details.</>,
        plainA: 'Round 1 of speaker submissions for NFT.NYC 2026 closed on 30 April. Round 2 opens soon — follow NFT.NYC on X (https://twitter.com/NFT_NYC) to be the first to know when submissions reopen, then visit https://www.nft.nyc/speak for the full application details.',
      },
      {
        q: 'Do we each need to submit a separate application for collaborations?',
        a: 'Yes, each speaker needs to submit a separate speaker application.',
      },
      {
        q: 'I am no longer able to attend and speak. What should I do?',
        a: 'If you are unable to attend please notify us at team@nft.nyc. We do not allow speakers to transfer their ticket or speaking slot. Only approved Speakers with a ticket will be allowed on stage. Your VIP Speaker Ticket will be cancelled.',
      },
      {
        q: 'Can you tell me when I will be speaking?',
        a: 'The NFT.NYC 2026 program will be settled in advance of the event. We will then follow up with approved Speakers to confirm the time and format (Panel or Talk) of their sessions.',
      },
      {
        q: 'Is the event recorded or streamed?',
        a: <>We will record select sessions and upload the videos to our YouTube channel - <a href="https://www.youtube.com/@NFTNYC" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>NFT.NYC/youtube</a>. We will not be streaming the event this year.</>,
        plainA: 'We will record select sessions and upload the videos to our YouTube channel at https://www.youtube.com/@NFTNYC. We will not be streaming the event this year.',
      },
      {
        q: 'What do I receive as a speaker?',
        a: '1 VIP Speaker Ticket. The VIP Speaker Ticket includes an invitation to the VIP and Speaker Reception, daily lunch, and full access to the conference. Approved Speakers are also featured on the NFT.NYC Speaker Gallery.',
      },
      {
        q: 'Do you pay speakers?',
        a: 'No, we do not pay speakers. We are committed to including as many great speakers in our programming as possible. Approved and Confirmed Speakers receive an invitation to the VIP and Speaker Reception at no charge, receive personalized Speaker Card NFTs that attendees can claim, and are featured on the NFT.NYC website.',
      },
      {
        q: 'How are speakers selected?',
        a: 'We select speakers for their thought-leadership of NFT uses and include individuals from a diverse range of industries such as: startup founders, developers, lawyers, designers, artists, musicians, marketers and more. Speakers are chosen for their thought leadership and passion for NFTs. Celebrity status is not a criterion. Company product pitches are not approved for panels or talks. To accommodate as many great speakers as possible, we may group similar talks into panels.',
      },
      {
        q: 'Why does NFT.NYC host so many speakers?',
        a: 'We are very proud to include Featured Speakers and passionate community members. Some stages will have CEOs and Founders of the largest companies in the space, and other stages will have rising star community members. One of our core values since the event\'s inception in 2019 has been to provide a platform and give the NFT community a voice.',
      },
    ],
  },
  {
    title: 'Sponsor FAQs',
    items: [
      {
        q: 'What is an NFT Swag Bag?',
        a: 'In partnership with NFT.Kred, NFT.NYC will again be releasing its annual Partner NFT giveaways to NFT.NYC 2026 attendees. The NFT.NYC Partner NFT giveaways help sponsors, speakers and other partners of NFT.NYC to share custom NFTs with attendees of the event. Sponsors and Partners are invited to contribute a special NFT to be shared with the community.',
      },
      {
        q: 'What are the NFT.NYC Awards?',
        a: 'The NFT.NYC NFT Awards celebrate and share recognition of community-selected NFT projects in various categories, hosted in partnership with OneHub.',
      },
      {
        q: 'Can I bring my own merch to the event?',
        a: 'Yes! NFT.NYC is a community event and committed to creating a great attendee experience. Sponsors who bring their own merch will be able to share with attendees.',
      },
      {
        q: 'Do you have a sponsorship pack?',
        a: <>Browse partnership packages and request a custom proposal on the <a href="/sponsor" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>NFT.NYC Sponsor page</a>, or email <a href="mailto:team@nft.nyc" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>team@nft.nyc</a> to start the conversation directly.</>,
        plainA: 'Browse partnership packages and request a custom proposal at https://www.nft.nyc/sponsor, or email team@nft.nyc to start the conversation directly.',
      },
      {
        q: 'Do we still need to submit a Speaker application if our sponsor package includes a talk?',
        a: 'Yes. If your speaker has not registered or has not provided their speaker information, your company will not be included in the program. You will still be featured as a sponsor.',
      },
    ],
  },
  {
    title: 'About NFT.NYC',
    items: [
      {
        q: 'What is NFT.NYC?',
        a: 'The conference, which started in 2019, connects leaders, influencers, developers, and fans of NFTs in NYC. It focuses on the companies and individuals using NFTs to advance the adoption of blockchain beyond its current use cases to a mainstream audience. NFT.NYC hosts the industry\'s most prevalent debates, thought leader talks, workshops, and briefings from the leading names and brands of blockchain.',
      },
      {
        q: 'Where is NFT.NYC 2026?',
        a: 'NFT.NYC 2026 will be held at the Edison Ballroom in Times Square, NYC. Satellite events will be held throughout NYC during the week.',
      },
      {
        q: 'Will I get an NFT for attending the event?',
        a: 'Yes! Attendees will be offered a selection of NFTs from NFT.NYC and its partners via NFT Giveaways.',
      },
      {
        q: 'What are the hours of the conference?',
        a: 'Programming: Tuesday 9/2: 9:00am - 6:00pm, Wednesday 9/3: 9:00am - 6:00pm. Subject to change.',
      },
      {
        q: 'How do I buy tickets?',
        a: 'Earlybird tickets to NFT.NYC 2026 are on sale now via Eventbrite. Click the "Earlybird Tickets" button in the site header to purchase — promo code "Earlybird" is applied automatically.',
      },
      {
        q: 'How can I learn more and engage ahead of time?',
        a: <><a href="https://twitter.com/NFT_NYC" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>Follow us on X</a> for event updates and conversations about the 2026 event.</>,
        plainA: 'Follow us on X at https://twitter.com/NFT_NYC for event updates and conversations about the 2026 event.',
      },
    ],
  },
];

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

  const toggleItem = (key: string) => {
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // FAQPage structured data — flattens every Q/A across categories.
  // Uses plainA when set (JSX answers), otherwise the string answer.
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.flatMap(category =>
      category.items.map(item => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.plainA ?? (typeof item.a === 'string' ? item.a : ''),
        },
      }))
    ),
  };

  return (
    <section
      id="faq"
      style={{
        padding: 'clamp(3rem, 8vw, 6rem) 1.5rem',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(faqJsonLd)}
        </script>
      </Helmet>
      <div className="max-w-[800px] mx-auto">
        <div className="text-center mb-4 scroll-fade-up">
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            fontWeight: 500,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: 'var(--color-text-faint)',
            marginBottom: '0.75rem',
          }}>Got Questions?</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'flex-end',
            gap: 0,
          }}>FAQ<img
              src="/relay-leaning.png"
              alt=""
              style={{
                height: '1em',
                width: 'auto',
                marginLeft: '-0.35em',
                marginBottom: '0em',
                objectFit: 'contain',
              }}
            /></h2>
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
          textAlign: 'center',
          maxWidth: '640px',
          margin: '0 auto 3rem',
          lineHeight: 1.6,
        }}>
          Find common answers below, or{' '}
          <button
            onClick={() => {
              const w = window as any;
              if (w.RelayChatWidget?.open) { w.RelayChatWidget.open(); return; }
              if (w.Relay?.open) { w.Relay.open(); return; }
              const btn = document.querySelector('[data-relay-toggle], .relay-chat-toggle, .relay-launcher, iframe[src*="relay"] ~ button') as HTMLElement;
              if (btn) { btn.click(); return; }
              const candidates = document.querySelectorAll('button, div[role="button"]');
              for (const el of candidates) {
                const rect = (el as HTMLElement).getBoundingClientRect();
                if (rect.bottom > window.innerHeight - 100 && rect.right > window.innerWidth - 100) {
                  (el as HTMLElement).click(); return;
                }
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--color-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              fontFamily: 'inherit',
              fontSize: 'inherit',
            }}
          >
            Ask Relay
          </button>
        </p>

        {FAQ_DATA.map((category, ci) => (
          <div key={ci} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              fontWeight: 700,
              color: 'var(--color-text)',
              textTransform: 'uppercase',
              letterSpacing: '-0.01em',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--card-border)',
            }}>{category.title}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {category.items.map((item, i) => {
                const key = `${ci}-${i}`;
                const isOpen = openItems[key] || false;
                return (
                  <div
                    key={key}
                    style={{
                      background: isOpen ? 'var(--color-surface)' : 'transparent',
                      borderRadius: '0.5rem',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <button
                      onClick={() => toggleItem(key)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '0.85rem 1rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        gap: '1rem',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-sm)',
                        fontWeight: 600,
                        color: 'var(--color-text)',
                        lineHeight: 1.4,
                      }}>{item.q}</span>
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: 'var(--text-base)',
                        color: 'var(--color-text-faint)',
                        flexShrink: 0,
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{
                        padding: '0 1rem 1rem',
                      }}>
                        <p style={{
                          fontFamily: 'var(--font-body)',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--color-text-muted)',
                          lineHeight: 1.65,
                        }}>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div style={{
          textAlign: 'center',
          marginTop: '2rem',
          padding: '1.5rem',
          background: 'var(--color-surface)',
          borderRadius: '0.75rem',
          border: '1px solid var(--card-border)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}>
            Still have questions?{' '}
            <button
              onClick={() => {
                const w = window as any;
                if (w.RelayChatWidget?.open) { w.RelayChatWidget.open(); return; }
                if (w.Relay?.open) { w.Relay.open(); return; }
                const btn = document.querySelector('[data-relay-toggle], .relay-chat-toggle, .relay-launcher, iframe[src*="relay"] ~ button') as HTMLElement;
                if (btn) { btn.click(); return; }
                const candidates = document.querySelectorAll('button, div[role="button"]');
                for (const el of candidates) {
                  const rect = (el as HTMLElement).getBoundingClientRect();
                  if (rect.bottom > window.innerHeight - 100 && rect.right > window.innerWidth - 100) {
                    (el as HTMLElement).click(); return;
                  }
                }
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                color: 'var(--color-primary)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
                fontFamily: 'inherit',
                fontSize: 'inherit',
              }}
            >
              Ask Relay
            </button>
            {' '}or reach out to the team at{' '}
            <a href="mailto:team@nft.nyc" style={{ color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' }}>team@nft.nyc</a>
          </p>
        </div>
      </div>
    </section>
  );
}
