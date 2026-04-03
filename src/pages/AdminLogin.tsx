import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function AdminLogin() {
  const { session, loading, signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return null;
  if (session) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await signInWithMagicLink(email);
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgb(10, 10, 15)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '2.5rem',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '24px',
          fontWeight: 700,
          color: '#fff',
          textTransform: 'uppercase',
          textAlign: 'center',
          marginBottom: '0.5rem',
        }}>NFT.NYC Admin</h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'rgb(149, 149, 176)',
          textAlign: 'center',
          marginBottom: '2rem',
        }}>Sign in with your email to access the dashboard.</p>

        {sent ? (
          <div style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: '#10B981',
            lineHeight: 1.6,
          }}>
            Check your email for a magic link. Click the link to sign in.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                outline: 'none',
                marginBottom: '1rem',
                boxSizing: 'border-box',
              }}
            />
            {error && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '13px',
                color: '#EF4444',
                marginBottom: '1rem',
              }}>{error}</p>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                background: submitting ? 'rgba(255,255,255,0.1)' : '#3B82F6',
                color: '#fff',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '15px',
                cursor: submitting ? 'default' : 'pointer',
                transition: 'background 200ms',
              }}
            >
              {submitting ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
