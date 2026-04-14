import { useState, useEffect, useCallback, useRef } from 'react';

// ── Anti-spam: route through our proxy Edge Function which validates
// Turnstile, checks the honeypot, and then forwards to add-contact.
const SUBSCRIBE_URL = 'https://zgryfbuoarrlmocavodo.supabase.co/functions/v1/subscribe';

const TURNSTILE_SITE_KEY = '0x4AAAAAAC9g5alRCRTjMTnh';

const PARTICIPATION_OPTIONS = [
  { label: "I'd like to attend", listId: '4547c3c7-e7db-4a6f-ae1d-5400496aeb70' },
  { label: "I'd like to speak on stage", listId: '2cf8a51b-1c90-4761-a1c2-fc336da40d8f' },
  { label: "I'd like to show my art", listId: '7db7e8d2-cc36-4041-b966-ab2a7a570469' },
  { label: "I'd like to exhibit as a sponsor", listId: '5ce7fc50-29f8-4670-a172-788028c535b8' },
  { label: "I'd like to cover with a media pass", listId: '11c1b074-ccd2-4947-9c5f-948fa33e1570' },
  { label: "I'd like to host my own mini event", listId: '4705efaa-e572-4f85-959d-832f6bc3ede1' },
];

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: 'var(--text-sm)',
  padding: '0.75rem 1.25rem',
  borderRadius: '9999px',
  border: '1px solid var(--color-border)',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  outline: 'none',
  transition: 'border-color 180ms ease',
};

export default function NewsletterCapture() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [participation, setParticipation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Turnstile token — set by the widget callback.
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  // Honeypot — hidden field that bots fill, humans don't.
  const [honeypot, setHoneypot] = useState('');

  // Load the Turnstile script once.
  useEffect(() => {
    if (document.querySelector('script[src*="turnstile"]')) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Render the widget once the script + container are ready.
  useEffect(() => {
    if (!turnstileRef.current) return;
    const el = turnstileRef.current;

    const tryRender = () => {
      const w = (window as any).turnstile;
      if (!w) return false;
      // Avoid double-render if the container already has a widget.
      if (el.dataset.widgetId) return true;
      const id = w.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(null),
        'error-callback': () => setTurnstileToken(null),
        theme: 'dark',
        size: 'flexible',
      });
      el.dataset.widgetId = id;
      return true;
    };

    if (tryRender()) return;
    // Script may still be loading — poll briefly.
    const timer = setInterval(() => {
      if (tryRender()) clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [submitted]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !participation) return;

    const selected = PARTICIPATION_OPTIONS.find(o => o.label === participation);
    if (!selected) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(SUBSCRIBE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          listId: selected.listId,
          turnstileToken,
          website: honeypot, // honeypot field — should always be empty
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Failed to subscribe');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [firstName, lastName, email, participation, turnstileToken, honeypot]);

  return (
    <section
      id="updates"
      style={{
        padding: 'clamp(3rem, 8vw, 5rem) 1.5rem',
        background: 'var(--color-surface)',
        borderTop: '1px solid var(--card-border)',
      }}
    >
      <div className="max-w-[560px] mx-auto text-center scroll-fade-up">
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          fontWeight: 700,
          color: 'var(--color-text)',
          textTransform: 'uppercase',
          marginBottom: '0.75rem',
        }}>Don't Miss the Signals</h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          marginBottom: '1.5rem',
          lineHeight: 1.5,
        }}>
          Be the first to know when tickets drop, speakers are announced, and early-bird pricing goes live.
        </p>

        {submitted ? (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            padding: '1rem',
          }}>
            You're on the list. We'll be in touch.
          </p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div className="flex gap-3 flex-wrap sm:flex-nowrap">
              <input
                type="text"
                required
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full sm:w-auto"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
              <input
                type="text"
                required
                placeholder="Last name"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full sm:w-auto"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
              />
            </div>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={{ ...inputStyle, width: '100%' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            />

            {/* ── Honeypot: invisible to humans, filled by bots ── */}
            <div style={{ position: 'absolute', left: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={e => setHoneypot(e.target.value)}
              />
            </div>

            <select
              required
              value={participation}
              onChange={e => setParticipation(e.target.value)}
              style={{
                ...inputStyle,
                width: '100%',
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                paddingRight: '2.5rem',
                cursor: 'pointer',
                color: participation ? 'var(--color-text)' : 'var(--color-text-faint)',
              }}
              onFocus={e => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <option value="" disabled>How would you like to participate?</option>
              {PARTICIPATION_OPTIONS.map(opt => (
                <option key={opt.listId} value={opt.label}>{opt.label}</option>
              ))}
            </select>

            {/* ── Turnstile widget ── */}
            <div
              ref={turnstileRef}
              style={{ display: 'flex', justifyContent: 'center', minHeight: '65px' }}
            />

            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                background: (submitting || !turnstileToken)
                  ? 'var(--color-text-faint)'
                  : 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
                backgroundSize: '300% 300%',
                animation: (submitting || !turnstileToken) ? 'none' : 'liquidGradient 12s ease-in-out infinite',
                color: '#fff',
                cursor: (submitting || !turnstileToken) ? 'not-allowed' : 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!submitting && turnstileToken) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(139,92,246,0.4)';
                }
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {submitting ? 'Submitting...' : !turnstileToken ? 'Verifying...' : 'Subscribe'}
            </button>
            {error && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: '#ef4444',
                marginTop: '0.25rem',
              }}>{error}</p>
            )}
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              marginTop: '0.25rem',
            }}>No spam. Only key announcements for NFT.NYC.</p>
          </form>
        )}
      </div>
    </section>
  );
}
