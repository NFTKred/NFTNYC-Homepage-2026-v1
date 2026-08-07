import { useState } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface FormState {
  full_name: string;
  passport_number: string;
  passport_issuing_country: string;
  date_of_birth: string;
  nationality: string;
  job_title: string;
  email: string;
  phone: string;
  ticket_order_number: string;
  notes: string;
}

const EMPTY: FormState = {
  full_name: '',
  passport_number: '',
  passport_issuing_country: '',
  date_of_birth: '',
  nationality: '',
  job_title: '',
  email: '',
  phone: '',
  ticket_order_number: '',
  notes: '',
};

const FIELDS: Array<{ key: keyof FormState; label: string; type?: string; required?: boolean; help?: string; placeholder?: string; span?: 1 | 2 }> = [
  { key: 'full_name',                label: 'Full name as it appears on passport', required: true, span: 2 },
  { key: 'passport_number',          label: 'Passport number',                     required: true },
  { key: 'passport_issuing_country', label: 'Passport issuing country',            required: true },
  { key: 'date_of_birth',            label: 'Date of birth', type: 'date',         required: true },
  { key: 'nationality',              label: 'Nationality',                         required: true },
  { key: 'job_title',                label: 'Job title',                           required: true },
  { key: 'email',                    label: 'Email', type: 'email',                required: true },
  { key: 'phone',                    label: 'Phone (with country code)',           required: true, placeholder: '+1 555 123 4567' },
  { key: 'ticket_order_number',      label: 'Eventbrite order # (optional)',       span: 2, help: 'If you have already registered, providing your order number speeds up review.' },
  { key: 'notes',                    label: 'Anything else we should know?',       span: 2 },
];

export default function Visa() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const { data, error } = await supabase.functions.invoke('submit-visa-request', { body: form });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setStatus('success');
      setForm(EMPTY);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err?.message || 'Something went wrong — please try again or email team@nft.nyc.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="visa" />
      <Header theme="dark" onToggleTheme={() => {}} />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '140px 24px 80px' }}>
        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.25em',
            color: 'var(--color-text-muted)',
            marginBottom: '12px',
          }}>
            NFT.NYC 2026 · VISA SUPPORT
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: '0 0 20px',
          }}>
            Request a letter of invitation
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            International attendees can request a signed letter of invitation to support their US visa application. Complete the form below — our team will review and email you the letter as a PDF, usually within 2 business days.
          </p>
        </div>

        {status === 'success' ? (
          <div style={{
            border: '1px solid rgba(16,185,129,0.3)',
            background: 'rgba(16,185,129,0.06)',
            borderRadius: '16px',
            padding: '40px',
            textAlign: 'center',
          }}>
            <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 16px' }} />
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Request received</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              Thanks — our team has been notified and will review your request. You'll receive the letter as a PDF at the email address you provided, usually within 2 business days.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '20px' }}>
              Questions? <a href="mailto:team@nft.nyc" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>team@nft.nyc</a>
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '20px',
            }}>
              {FIELDS.map(f => (
                <label
                  key={f.key}
                  style={{
                    gridColumn: f.span === 2 ? '1 / -1' : 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}>
                    {f.label}{f.required && <span style={{ color: '#EF4444', marginLeft: '4px' }}>*</span>}
                  </span>
                  {f.key === 'notes' ? (
                    <textarea
                      value={form[f.key]}
                      onChange={e => update(f.key, e.target.value)}
                      required={f.required}
                      rows={3}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                        resize: 'vertical',
                      }}
                    />
                  ) : (
                    <input
                      type={f.type ?? 'text'}
                      value={form[f.key]}
                      onChange={e => update(f.key, e.target.value)}
                      required={f.required}
                      placeholder={f.placeholder}
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '14px',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        background: 'var(--color-bg)',
                        color: 'var(--color-text)',
                      }}
                    />
                  )}
                  {f.help && (
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-text-muted)' }}>{f.help}</span>
                  )}
                </label>
              ))}
            </div>

            {status === 'error' && (
              <div style={{
                marginTop: '20px',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#EF4444',
                fontSize: '14px',
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: '24px',
                width: '100%',
                fontFamily: 'var(--font-body)',
                fontSize: '15px',
                fontWeight: 600,
                color: '#fff',
                background: submitting
                  ? 'var(--color-text-muted)'
                  : 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
                border: 'none',
                borderRadius: '10px',
                padding: '14px 24px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Request letter of invitation'}
            </button>

            <p style={{
              marginTop: '16px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}>
              Your details are held only for the purpose of issuing this letter. We do not share passport information with third parties. Turnaround is usually within 2 business days.
            </p>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
