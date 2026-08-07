import { useState } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, Upload, X } from 'lucide-react';

interface FormState {
  email: string;
  firstname: string;
  lastname: string;
  jobtitle: string;
  phone: string;
  company: string;
  website: string;
  company_twitter_handle: string;
  company_community_size: string;
  company_recent_update: string;
  share_a_link_to_recent_nft_related_coverage: string;
  how_to_cover_nft_nyc_2023_and_publish_location: string;
  media_organization_type: string;
  nft_nyc_media_passes_requested: string;
  commitment_to_credit_nft_nyc: boolean;
  company_logo_data_url: string;
  company_logo_filename: string;
}

const EMPTY: FormState = {
  email: '',
  firstname: '',
  lastname: '',
  jobtitle: '',
  phone: '',
  company: '',
  website: '',
  company_twitter_handle: '',
  company_community_size: '',
  company_recent_update: '',
  share_a_link_to_recent_nft_related_coverage: '',
  how_to_cover_nft_nyc_2023_and_publish_location: '',
  media_organization_type: '',
  nft_nyc_media_passes_requested: '',
  commitment_to_credit_nft_nyc: false,
  company_logo_data_url: '',
  company_logo_filename: '',
};

const MEDIA_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'blog',        label: 'Blog or Online Publication' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'podcast',     label: 'Podcast' },
  { value: 'news',        label: 'Televised News' },
  { value: 'youtube',     label: 'YouTube Channel' },
];

const MAX_LOGO_BYTES = 5 * 1024 * 1024;   // 5 MB — matches bucket limit
const ACCEPTED_LOGO_MIMES = 'image/png,image/jpeg,image/svg+xml,image/webp';

export default function Media() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_BYTES) {
      setError('Logo file must be under 5 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    update('company_logo_data_url', dataUrl);
    update('company_logo_filename', file.name);
  };

  const clearLogo = () => {
    update('company_logo_data_url', '');
    update('company_logo_filename', '');
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.commitment_to_credit_nft_nyc) {
      setError('Please agree to credit NFT.NYC in your coverage.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const { data, error } = await supabase.functions.invoke('submit-media-pass', { body: form });
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
      <PageMeta page="media" />
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
            NFT.NYC 2026 · MEDIA PASS APPLICATION
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: '0 0 20px',
          }}>
            Apply to cover NFT.NYC 2026
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '17px',
            lineHeight: 1.6,
            color: 'var(--color-text-muted)',
            maxWidth: '640px',
            margin: '0 auto',
          }}>
            Journalists, podcasters, and creators can apply for a Media Pass. Applications are reviewed weekly. Approved applicants are contacted directly.
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
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Application received</h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-text-muted)', lineHeight: 1.6, maxWidth: '540px', margin: '0 auto' }}>
              Thanks for submitting your Media Pass Application. Applications are reviewed weekly and you will be contacted if you are approved.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-text-muted)', lineHeight: 1.6, marginTop: '20px', maxWidth: '540px', margin: '20px auto 0' }}>
              To increase your chances of being selected, post your favorite NFT.NYC moment on your socials with a link to <a href="/register" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>nft.nyc/register</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            {/* Section 1: Contact Details */}
            <SectionHeading>Contact Details</SectionHeading>

            <Field label="Contact Email" required help="Must be an email at the domain of the organization where your content will be published. Important — this contact receives updates about the application.">
              <Input type="email" value={form.email} onChange={v => update('email', v)} required />
            </Field>

            <Row>
              <Field label="Contact First name" required>
                <Input value={form.firstname} onChange={v => update('firstname', v)} required />
              </Field>
              <Field label="Contact Last name" required>
                <Input value={form.lastname} onChange={v => update('lastname', v)} required />
              </Field>
            </Row>

            <Row>
              <Field label="Contact Title">
                <Input value={form.jobtitle} onChange={v => update('jobtitle', v)} />
              </Field>
              <Field label="Contact Phone" required>
                <Input type="tel" value={form.phone} onChange={v => update('phone', v)} required minLength={7} maxLength={20} placeholder="+1 555 123 4567" />
              </Field>
            </Row>

            {/* Section 2: Organization Details */}
            <SectionHeading style={{ marginTop: 40 }}>Organization Details</SectionHeading>

            <Field label="Media Organization Name" required>
              <Input value={form.company} onChange={v => update('company', v)} required />
            </Field>

            <Field label="Media Organization Website" required>
              <Input type="url" value={form.website} onChange={v => update('website', v)} required placeholder="https://" />
            </Field>

            <Field label="Media Organization Twitter @name" required>
              <Input value={form.company_twitter_handle} onChange={v => update('company_twitter_handle', v)} required placeholder="@yourhandle" />
            </Field>

            <Field label="Media Organization Logo" help="Logo to be displayed if your application is approved. PNG, JPG, SVG, or WebP. Max 5 MB.">
              {form.company_logo_filename ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 12, padding: '10px 12px', borderRadius: 8,
                  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
                }}>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {form.company_logo_filename}
                  </span>
                  <button type="button" onClick={clearLogo} style={{
                    background: 'none', border: 'none', color: 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 4, display: 'inline-flex', alignItems: 'center',
                  }} aria-label="Remove logo">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
                  border: '1px dashed var(--color-border)', background: 'var(--color-bg)',
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-muted)',
                }}>
                  <Upload size={16} />
                  Choose a file
                  <input type="file" accept={ACCEPTED_LOGO_MIMES} onChange={onLogoChange} style={{ display: 'none' }} />
                </label>
              )}
            </Field>

            <Field label="How big is your Community?" required help="Share the size of your organization's community or expected reach.">
              <Input type="number" min="0" value={form.company_community_size} onChange={v => update('company_community_size', v)} required />
            </Field>

            <Field label="Share a link to recent non-NFT related coverage" required>
              <Input type="url" value={form.company_recent_update} onChange={v => update('company_recent_update', v)} required placeholder="https://" />
            </Field>

            <Field label="Share a link to recent NFT related coverage" required>
              <Input type="url" value={form.share_a_link_to_recent_nft_related_coverage} onChange={v => update('share_a_link_to_recent_nft_related_coverage', v)} required placeholder="https://" />
            </Field>

            <Field label="How do you plan on covering NFT.NYC and where will your coverage be published?" required>
              <Textarea rows={4} value={form.how_to_cover_nft_nyc_2023_and_publish_location} onChange={v => update('how_to_cover_nft_nyc_2023_and_publish_location', v)} required />
            </Field>

            <Field label="Media Type" required>
              <RadioGroup name="media_organization_type" value={form.media_organization_type} onChange={v => update('media_organization_type', v)} options={MEDIA_TYPE_OPTIONS} />
            </Field>

            <Field label="How many Media Passes does your organization require (max 2)?" required>
              <RadioGroup name="nft_nyc_media_passes_requested" value={form.nft_nyc_media_passes_requested} onChange={v => update('nft_nyc_media_passes_requested', v)} options={[{ value: '1', label: '1' }, { value: '2', label: '2' }]} inline />
            </Field>

            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              marginTop: 20, padding: '14px 16px', borderRadius: 10,
              border: '1px solid var(--color-border)', background: 'var(--color-bg)',
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={form.commitment_to_credit_nft_nyc}
                onChange={e => update('commitment_to_credit_nft_nyc', e.target.checked)}
                required
                style={{ marginTop: 3 }}
              />
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--color-text)' }}>
                I agree to credit NFT.NYC in any content created about NFT.NYC, and during NFT.NYC. <span style={{ color: '#EF4444' }}>*</span>
              </span>
            </label>

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
            {error && status !== 'error' && (
              <p style={{ marginTop: 12, fontSize: 13, color: '#EF4444' }}>{error}</p>
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
              {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : 'Apply'}
            </button>

            <p style={{
              marginTop: '16px',
              fontFamily: 'var(--font-body)',
              fontSize: '12px',
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}>
              Applications are reviewed weekly. Approved applicants will be contacted directly. Questions? Email <a href="mailto:team@nft.nyc" style={{ color: 'var(--color-primary)' }}>team@nft.nyc</a>.
            </p>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

// ── Local presentational primitives ────────────────────────────────────────
function SectionHeading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '20px',
      fontWeight: 700,
      color: 'var(--color-text)',
      margin: '0 0 20px',
      paddingBottom: 8,
      borderBottom: '1px solid var(--color-border)',
      ...style,
    }}>
      {children}
    </h3>
  );
}

function Field({ label, required, help, children }: { label: string; required?: boolean; help?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{
          fontFamily: 'var(--font-body)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--color-text)',
        }}>
          {label}{required && <span style={{ color: '#EF4444', marginLeft: 4 }}>*</span>}
        </span>
        {children}
        {help && (
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>{help}</span>
        )}
      </label>
    </div>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 20,
    }}>
      {children}
    </div>
  );
}

function Input(props: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  min?: string;
  minLength?: number;
  maxLength?: number;
}) {
  const { onChange, ...rest } = props;
  return (
    <input
      {...rest}
      onChange={e => onChange(e.target.value)}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    />
  );
}

function Textarea(props: { value: string; onChange: (v: string) => void; required?: boolean; rows?: number }) {
  return (
    <textarea
      value={props.value}
      onChange={e => props.onChange(e.target.value)}
      required={props.required}
      rows={props.rows ?? 3}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        padding: '10px 12px',
        borderRadius: 8,
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        resize: 'vertical',
      }}
    />
  );
}

function RadioGroup({ name, value, onChange, options, inline }: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Array<{ value: string; label: string }>;
  inline?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: inline ? 'row' : 'column', gap: inline ? 20 : 8, flexWrap: 'wrap' }}>
      {options.map(o => (
        <label key={o.value} style={{
          display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text)',
        }}>
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
            required
          />
          {o.label}
        </label>
      ))}
    </div>
  );
}
