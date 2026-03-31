import { useState } from 'react';

const API_URL = 'https://nrzjmocvppijinjszlyg.supabase.co/functions/v1/add-contact';
const WEBHOOK_SECRET = 'j45tkjbkj4t5jbh45tjhb4jfdfgh';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !participation) return;

    setSubmitting(true);
    setError('');

    const selected = PARTICIPATION_OPTIONS.find(o => o.label === participation);
    if (!selected) return;

    const GENERAL_LIST_ID = '24950fb1-4d98-4b3c-94b1-ea0ebc28141f';

    try {
      // Add to persona-specific list first
      const resPersona = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          listId: selected.listId,
        }),
      });

      // Then add to general list
      const resGeneral = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          listId: GENERAL_LIST_ID,
        }),
      });

      if (!resPersona.ok && !resGeneral.ok) throw new Error('Failed to subscribe');

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

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
            <button
              type="submit"
              disabled={submitting}
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                background: submitting
                  ? 'var(--color-text-faint)'
                  : 'linear-gradient(135deg, #3B82F6, #8B5CF6, #EC4899, #F59E0B, #10B981, #06B6D4, #3B82F6)',
                backgroundSize: '300% 300%',
                animation: submitting ? 'none' : 'liquidGradient 12s ease-in-out infinite',
                color: '#fff',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'transform 150ms ease, box-shadow 150ms ease',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
              onMouseEnter={e => {
                if (!submitting) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(139,92,246,0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!submitting) {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              {submitting ? 'Submitting...' : 'Subscribe'}
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
