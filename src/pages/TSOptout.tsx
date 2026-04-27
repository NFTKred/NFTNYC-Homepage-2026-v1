import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageMeta from '@/components/PageMeta';

const ADD_CONTACT_URL = 'https://nrzjmocvppijinjszlyg.supabase.co/functions/v1/add-contact';
const WEBHOOK_SECRET = 'j45tkjbkj4t5jbh45tjhb4jfdfgh';
const LIST_ID = '89e9db34-5e09-4333-bd74-dfd9a430d58f';

export default function TSOptout() {
  const [params] = useSearchParams();
  const paramEmail = params.get('email') ?? '';
  const paramId = params.get('id') ?? '';

  const [email, setEmail] = useState(paramEmail);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!paramId) {
      setError(
        'To opt out, please click your unique opt-out link from the email that was sent to you by NFT.NYC or email us at team@nft.nyc.'
      );
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(ADD_CONTACT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-webhook-secret': WEBHOOK_SECRET,
        },
        body: JSON.stringify({
          email,
          listId: LIST_ID,
        }),
      });

      if (!res.ok) throw new Error('Request failed');

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again or email us at team@nft.nyc.');
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: '480px',
    margin: '0 auto',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '1rem',
    padding: '2.5rem 2rem',
    backdropFilter: 'blur(16px)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem 1.25rem',
    borderRadius: '9999px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 180ms ease',
  };

  return (
    <>
    <PageMeta page="ts-optout" />
    <div style={{
      minHeight: '100vh',
      background: 'rgb(10, 10, 15)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={cardStyle}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>
          Times Square Challenge
        </h1>
        <h2 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.1rem',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.6)',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>
          Art Opt-Out
        </h2>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '15px',
              color: '#10B981',
              fontWeight: 600,
              marginBottom: '1rem',
            }}>
              Your opt-out has been recorded.
            </p>
            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
            }}>
              Your art will not be included in the Times Square Challenge. If you change your mind, email us at{' '}
              <a href="mailto:team@nft.nyc" style={{ color: '#3B82F6', textDecoration: 'none' }}>team@nft.nyc</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{
                display: 'block',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '0.4rem',
                paddingLeft: '0.5rem',
              }}>
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                readOnly={!!paramEmail}
                style={{
                  ...inputStyle,
                  ...(paramEmail ? { opacity: 0.6, cursor: 'not-allowed' } : {}),
                }}
                onFocus={e => { if (!paramEmail) e.currentTarget.style.borderColor = '#3B82F6'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
              />
            </div>

            {/* Hidden ID field — only present when ?id= is in the URL */}
            <input type="hidden" name="id" value={paramId} />

            <button
              type="submit"
              disabled={submitting}
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '15px',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
                borderRadius: '9999px',
                border: 'none',
                background: submitting ? 'rgba(255,255,255,0.1)' : '#EF4444',
                color: '#fff',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'background 180ms ease, transform 150ms ease',
                width: '100%',
              }}
              onMouseEnter={e => { if (!submitting) (e.currentTarget.style.background = '#DC2626'); }}
              onMouseLeave={e => { if (!submitting) (e.currentTarget.style.background = '#EF4444'); }}
            >
              {submitting ? 'Submitting…' : 'Opt Out of Times Square Challenge'}
            </button>

            {error && (
              <p style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '13px',
                color: '#F59E0B',
                lineHeight: 1.5,
                textAlign: 'center',
                padding: '0 0.5rem',
              }}>
                {error}
              </p>
            )}

            <p style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '12px',
              color: 'rgba(255,255,255,0.35)',
              textAlign: 'center',
              lineHeight: 1.5,
            }}>
              By opting out, your art will be excluded from the Times Square Challenge display.
              This action is recorded and cannot be undone from this page. To reverse an opt-out,
              email <a href="mailto:team@nft.nyc" style={{ color: '#3B82F6', textDecoration: 'none' }}>team@nft.nyc</a>.
            </p>
          </form>
        )}
      </div>
    </div>
    </>
  );
}
