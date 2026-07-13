import { useState } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, Upload, X } from 'lucide-react';

interface FormState {
  firstname: string;
  lastname: string;
  email: string;
  twitter_handle: string;
  linkedin_url: string;
  phone: string;
  photo_id_file: File | null;
  video_file: File | null;
  wants_to_volunteer: boolean;
  agree_conduct: boolean;
  understands_ticket_terms: boolean;
}

const EMPTY: FormState = {
  firstname: '',
  lastname: '',
  email: '',
  twitter_handle: '',
  linkedin_url: '',
  phone: '',
  photo_id_file: null,
  video_file: null,
  wants_to_volunteer: false,
  agree_conduct: false,
  understands_ticket_terms: false,
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;  // 100 MB
const ACCEPT_PHOTO = 'image/png,image/jpeg,image/webp,image/heic,image/heif,application/pdf';
const ACCEPT_VIDEO = 'video/mp4,video/quicktime,video/webm,video/x-m4v';

function extFor(filename: string, fallback: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx + 1).toLowerCase() : fallback;
}

export default function Volunteer() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');
  const [uploadPhase, setUploadPhase] = useState<'' | 'photo' | 'video' | 'submitting'>('');

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm(f => ({ ...f, [k]: v }));

  const onPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PHOTO_BYTES) {
      setError('Photo ID file must be under 10 MB.');
      e.target.value = '';
      return;
    }
    setError('');
    update('photo_id_file', file);
  };

  const onVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_VIDEO_BYTES) {
      setError('Video must be under 100 MB. Try re-encoding at a lower bitrate.');
      e.target.value = '';
      return;
    }
    setError('');
    update('video_file', file);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.photo_id_file) return setError('Please upload a photo of your ID.');
    if (!form.video_file)    return setError('Please upload your intro video.');
    if (!form.wants_to_volunteer) return setError('Please confirm you would like to volunteer.');
    if (!form.agree_conduct || !form.understands_ticket_terms) return setError('Please accept both acknowledgements.');

    setSubmitting(true);
    try {
      // Client-side random id so we can name storage keys before the DB row exists.
      const clientId = (crypto as any).randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

      // Upload photo ID
      setUploadPhase('photo');
      const photoExt = extFor(form.photo_id_file.name, 'jpg');
      const photoPath = `${clientId}/id.${photoExt}`;
      {
        const { error } = await supabase.storage
          .from('volunteer-photo-ids')
          .upload(photoPath, form.photo_id_file, { contentType: form.photo_id_file.type, upsert: false });
        if (error) throw new Error(`Photo ID upload failed: ${error.message}`);
      }

      // Upload video
      setUploadPhase('video');
      const videoExt = extFor(form.video_file.name, 'mp4');
      const videoPath = `${clientId}/intro.${videoExt}`;
      {
        const { error } = await supabase.storage
          .from('volunteer-videos')
          .upload(videoPath, form.video_file, { contentType: form.video_file.type, upsert: false });
        if (error) throw new Error(`Video upload failed: ${error.message}`);
      }

      // Submit the form JSON
      setUploadPhase('submitting');
      const payload = {
        firstname: form.firstname,
        lastname: form.lastname,
        email: form.email,
        twitter_handle: form.twitter_handle,
        linkedin_url: form.linkedin_url,
        phone: form.phone,
        photo_id_path: photoPath,
        video_path: videoPath,
        wants_to_volunteer: form.wants_to_volunteer,
        agree_conduct: form.agree_conduct,
        understands_ticket_terms: form.understands_ticket_terms,
      };
      const { data, error: fnErr } = await supabase.functions.invoke('submit-volunteer-application', { body: payload });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      setStatus('success');
      setForm(EMPTY);
    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setError(err?.message || 'Something went wrong — please try again or email team@nft.nyc.');
    } finally {
      setSubmitting(false);
      setUploadPhase('');
    }
  };

  const submitLabel = () => {
    if (uploadPhase === 'photo')      return 'Uploading photo ID…';
    if (uploadPhase === 'video')      return 'Uploading video…';
    if (uploadPhase === 'submitting') return 'Submitting…';
    return 'Submit application';
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta
        title="Volunteer at NFT.NYC 2026"
        description="Sign up to volunteer at NFT.NYC 2026 (Sept 1-3). Volunteers get a complimentary General Admission ticket in exchange for their time supporting the community."
        path="/volunteer"
      />
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
            NFT.NYC 2026 · VOLUNTEER PROGRAM
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 800,
            lineHeight: 1.1,
            margin: 0,
          }}>
            Volunteer at NFT.NYC 2026
          </h1>
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
              Thanks for applying. Our team will review your application and reach out if you're selected. Any questions in the meantime? Email <a href="mailto:team@nft.nyc" style={{ color: 'var(--color-primary)', textDecoration: 'underline' }}>team@nft.nyc</a>.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} style={{
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            <SectionHeading>Step 1 · Tell us about yourself</SectionHeading>

            <Row>
              <Field label="First name" required>
                <Input value={form.firstname} onChange={v => update('firstname', v)} required />
              </Field>
              <Field label="Last name" required>
                <Input value={form.lastname} onChange={v => update('lastname', v)} required />
              </Field>
            </Row>

            <Field label="Email address" required>
              <Input type="email" value={form.email} onChange={v => update('email', v)} required />
            </Field>

            <Row>
              <Field label="Twitter / X username">
                <Input value={form.twitter_handle} onChange={v => update('twitter_handle', v)} placeholder="@yourhandle" />
              </Field>
              <Field label="LinkedIn profile URL">
                <Input type="url" value={form.linkedin_url} onChange={v => update('linkedin_url', v)} placeholder="https://linkedin.com/in/…" />
              </Field>
            </Row>

            <Field label="Phone number" required>
              <Input type="tel" value={form.phone} onChange={v => update('phone', v)} required minLength={7} maxLength={20} placeholder="+1 555 123 4567" />
            </Field>

            <Field label="Photo ID" required help="Government-issued ID (driver's license, passport, etc.). PNG, JPG, WebP, HEIC, or PDF. Max 10 MB. Stored securely and shared only with the NFT.NYC review team.">
              <FilePicker file={form.photo_id_file} accept={ACCEPT_PHOTO} onChange={onPhotoChange} onClear={() => update('photo_id_file', null)} />
            </Field>

            <label style={{ ...checkboxStyle, marginTop: 24 }}>
              <input
                type="checkbox"
                checked={form.wants_to_volunteer}
                onChange={e => update('wants_to_volunteer', e.target.checked)}
                required
                style={checkboxInputStyle}
              />
              <span>I would like to volunteer <strong>Sept 1–3</strong>. <span style={{ color: '#EF4444' }}>*</span></span>
            </label>

            {/* Intro video */}
            <SectionHeading style={{ marginTop: 40 }}>Step 2 · Intro video</SectionHeading>

            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--color-text-muted)',
              margin: '0 0 8px',
            }}>
              To be considered, please continue to Step 2 and record a short video telling us what you are most excited about at NFT.NYC and what you think our volunteers do.
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              lineHeight: 1.6,
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
              margin: '0 0 20px',
            }}>
              Your video may be used on NFT.NYC social accounts.
            </p>

            <Field label="Upload your intro video" required help="MP4, MOV, or WebM. Max 100 MB.">
              <FilePicker file={form.video_file} accept={ACCEPT_VIDEO} onChange={onVideoChange} onClear={() => update('video_file', null)} icon="video" />
            </Field>

            {/* Acknowledgements */}
            <SectionHeading style={{ marginTop: 40 }}>Acknowledgements</SectionHeading>

            <div style={{
              padding: '16px 18px',
              borderRadius: 10,
              border: '1px solid var(--color-border)',
              background: 'var(--color-bg)',
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.65,
              color: 'var(--color-text-muted)',
              marginBottom: 12,
            }}>
              By clicking yes, you fully acknowledge and understand your responsibilities as a volunteer. You agree to uphold a professional and hard-working attitude throughout our event. You agree to represent the NFT.NYC brand positively.
            </div>
            <label style={checkboxStyle}>
              <input
                type="checkbox"
                checked={form.agree_conduct}
                onChange={e => update('agree_conduct', e.target.checked)}
                required
                style={checkboxInputStyle}
              />
              <span>Yes, I agree and fully understand the above statement. I have answered all other questions on this form truthfully. <span style={{ color: '#EF4444' }}>*</span></span>
            </label>

            <label style={{ ...checkboxStyle, marginTop: 12 }}>
              <input
                type="checkbox"
                checked={form.understands_ticket_terms}
                onChange={e => update('understands_ticket_terms', e.target.checked)}
                required
                style={checkboxInputStyle}
              />
              <span>I understand that I will receive a complimentary General Admission ticket to NFT.NYC in exchange for my services to the NFT.NYC community. If I do not provide the service I have offered, I understand my NFT.NYC ticket may be cancelled. <span style={{ color: '#EF4444' }}>*</span></span>
            </label>

            {error && (
              <div style={{
                marginTop: 20,
                padding: '12px 16px',
                borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'rgba(239,68,68,0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                color: '#EF4444',
                fontSize: 14,
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              style={{
                marginTop: 24,
                width: '100%',
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                background: submitting
                  ? 'var(--color-text-muted)'
                  : 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
                border: 'none',
                borderRadius: 10,
                padding: '14px 24px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {submitting ? <><Loader2 size={16} className="animate-spin" /> {submitLabel()}</> : submitLabel()}
            </button>

            <p style={{
              marginTop: 14,
              fontFamily: 'var(--font-body)',
              fontSize: 12,
              color: 'var(--color-text-muted)',
              lineHeight: 1.5,
            }}>
              Your files are uploaded directly to our secure private storage. Only the NFT.NYC review team can access them.
            </p>
          </form>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}

// ── Local primitives ────────────────────────────────────────────────────────
function SectionHeading({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: 20,
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

function FilePicker({ file, accept, onChange, onClear, icon = 'file' }: {
  file: File | null;
  accept: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  icon?: 'file' | 'video';
}) {
  if (file) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '10px 12px', borderRadius: 8,
        border: '1px solid var(--color-border)', background: 'var(--color-bg)',
      }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file.name} <span style={{ color: 'var(--color-text-muted)' }}>· {(file.size / (1024*1024)).toFixed(1)} MB</span>
        </span>
        <button type="button" onClick={onClear} style={{
          background: 'none', border: 'none', color: 'var(--color-text-muted)',
          cursor: 'pointer', padding: 4, display: 'inline-flex', alignItems: 'center',
        }} aria-label="Remove file">
          <X size={16} />
        </button>
      </div>
    );
  }
  return (
    <label style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      padding: '10px 14px', borderRadius: 8, cursor: 'pointer',
      border: '1px dashed var(--color-border)', background: 'var(--color-bg)',
      fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-text-muted)',
    }}>
      <Upload size={16} />
      Choose {icon === 'video' ? 'a video' : 'a file'}
      <input type="file" accept={accept} onChange={onChange} style={{ display: 'none' }} />
    </label>
  );
}

const checkboxStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'flex-start', gap: 10,
  padding: '14px 16px', borderRadius: 10,
  border: '1px solid var(--color-border)', background: 'var(--color-bg)',
  cursor: 'pointer',
  fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.55, color: 'var(--color-text)',
};

const checkboxInputStyle: React.CSSProperties = { marginTop: 3, flexShrink: 0 };
