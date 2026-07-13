import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, XCircle, Trash2, ExternalLink, LogOut, Loader2, RefreshCw, Search } from 'lucide-react';

// Row shape from volunteer_applications.
interface Row {
  id: string;
  created_at: string;
  firstname: string;
  lastname: string;
  email: string;
  twitter_handle: string | null;
  linkedin_url: string | null;
  phone: string;
  photo_id_path: string;
  video_path: string;
  status: 'pending' | 'approved' | 'declined';
  reviewed_at: string | null;
  reviewed_by: string | null;
  notes: string | null;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'declined';

const STATUS_META: Record<Row['status'], { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: 'Pending',  color: '#F59E0B', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.35)' },
  approved: { label: 'Approved', color: '#10B981', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.35)' },
  declined: { label: 'Declined', color: '#EF4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.35)' },
};

function videoPublicUrl(path: string): string {
  const { data } = supabase.storage.from('volunteer-videos').getPublicUrl(path);
  return data.publicUrl;
}

async function signedPhotoUrl(path: string): Promise<string | null> {
  const { data } = await supabase.storage.from('volunteer-photo-ids')
    .createSignedUrl(path, 60 * 60);   // 1 hour is plenty for admin review clicks
  return data?.signedUrl ?? null;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  } catch { return iso; }
}

export default function ManageVolunteers() {
  const { user, signOut } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [photoUrlCache, setPhotoUrlCache] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('volunteer_applications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) { setError(error.message); setRows([]); }
    else setRows((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  // Pre-warm signed URLs for visible rows.
  useEffect(() => {
    const missing = rows.filter(r => !photoUrlCache[r.id]).slice(0, 40);
    if (!missing.length) return;
    (async () => {
      const entries = await Promise.all(missing.map(async r => {
        const url = await signedPhotoUrl(r.photo_id_path);
        return [r.id, url ?? ''] as const;
      }));
      setPhotoUrlCache(prev => {
        const next = { ...prev };
        for (const [id, url] of entries) next[id] = url;
        return next;
      });
    })();
  }, [rows]);   // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return rows.filter(r => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (!term) return true;
      const hay = `${r.firstname} ${r.lastname} ${r.email} ${r.phone} ${r.twitter_handle ?? ''} ${r.linkedin_url ?? ''}`.toLowerCase();
      return hay.includes(term);
    });
  }, [rows, filter, search]);

  const counts = useMemo(() => ({
    all: rows.length,
    pending: rows.filter(r => r.status === 'pending').length,
    approved: rows.filter(r => r.status === 'approved').length,
    declined: rows.filter(r => r.status === 'declined').length,
  }), [rows]);

  async function updateStatus(row: Row, next: Row['status']) {
    setBusyId(row.id);
    const { error } = await supabase
      .from('volunteer_applications')
      .update({ status: next, reviewed_at: new Date().toISOString(), reviewed_by: user?.email ?? 'admin' })
      .eq('id', row.id);
    setBusyId(null);
    if (error) { alert(`Update failed: ${error.message}`); return; }
    setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: next, reviewed_at: new Date().toISOString(), reviewed_by: user?.email ?? 'admin' } : r));
  }

  async function deleteRow(row: Row) {
    const ok = window.confirm(
      `Permanently delete ${row.firstname} ${row.lastname}'s application?\n\n` +
      `This removes the row AND both files (photo ID + video). Cannot be undone.`
    );
    if (!ok) return;
    setBusyId(row.id);
    // Best-effort: delete files first (safe if row still exists after failure),
    // then delete the row.
    const [photoDel, videoDel] = await Promise.all([
      supabase.storage.from('volunteer-photo-ids').remove([row.photo_id_path]),
      supabase.storage.from('volunteer-videos').remove([row.video_path]),
    ]);
    const rowDel = await supabase.from('volunteer_applications').delete().eq('id', row.id);
    setBusyId(null);

    const errs = [
      photoDel.error && `photo: ${photoDel.error.message}`,
      videoDel.error && `video: ${videoDel.error.message}`,
      rowDel.error && `row: ${rowDel.error.message}`,
    ].filter(Boolean);
    if (errs.length) alert(`Some deletes failed:\n${errs.join('\n')}`);

    setRows(prev => prev.filter(r => r.id !== row.id));
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'oklch(from var(--color-bg) l c h / 0.9)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--color-border)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: '0.24em', fontWeight: 700, color: 'var(--color-text-muted)', margin: 0 }}>MANAGE</p>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800, margin: '2px 0 0' }}>Volunteers</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{user?.email}</span>
            <button onClick={() => void load()} title="Refresh" style={iconBtnStyle}>
              <RefreshCw size={16} />
            </button>
            <button onClick={signOut} title="Sign out" style={iconBtnStyle}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Filter chips + search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          {(['all', 'pending', 'approved', 'declined'] as StatusFilter[]).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={chipStyle(filter === f)}>
              {f[0].toUpperCase() + f.slice(1)}
              <span style={{ marginLeft: 8, opacity: 0.6, fontSize: 12 }}>{counts[f]}</span>
            </button>
          ))}
          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone…"
              style={{
                fontFamily: 'var(--font-body)', fontSize: 13,
                padding: '8px 12px 8px 32px', borderRadius: 8,
                border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)',
                width: 260, minWidth: 200,
              }}
            />
          </div>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>
            <Loader2 size={20} className="animate-spin" style={{ display: 'inline-block', marginRight: 8, verticalAlign: 'middle' }} />
            Loading…
          </div>
        )}

        {error && (
          <div style={{ padding: 16, borderRadius: 10, border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.06)', color: '#EF4444', fontSize: 14 }}>
            Could not load applications: {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)', fontSize: 14 }}>
            No applications match this filter.
          </div>
        )}

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(r => {
            const s = STATUS_META[r.status];
            const photoUrl = photoUrlCache[r.id];
            const videoUrl = videoPublicUrl(r.video_path);
            const isBusy = busyId === r.id;
            return (
              <article key={r.id} style={{
                border: '1px solid var(--color-border)',
                background: 'var(--color-surface)',
                borderRadius: 14,
                padding: 22,
                opacity: isBusy ? 0.55 : 1,
                transition: 'opacity 120ms ease',
              }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: 16, justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, margin: 0 }}>
                      {r.firstname} {r.lastname}
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '4px 0 0' }}>
                      Submitted {fmtDate(r.created_at)}
                      {r.reviewed_at && r.status !== 'pending' && (
                        <> · <em>{r.status}</em> by {r.reviewed_by} on {fmtDate(r.reviewed_at)}</>
                      )}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: s.color, background: s.bg, border: `1px solid ${s.border}`,
                    borderRadius: 999, padding: '4px 12px',
                  }}>
                    {s.label}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
                  <FieldRow label="Email"><a href={`mailto:${r.email}`} style={linkStyle}>{r.email}</a></FieldRow>
                  <FieldRow label="Phone">{r.phone}</FieldRow>
                  {r.twitter_handle && <FieldRow label="X / Twitter">{r.twitter_handle}</FieldRow>}
                  {r.linkedin_url && <FieldRow label="LinkedIn"><a href={r.linkedin_url} target="_blank" rel="noopener noreferrer" style={linkStyle}>Profile ↗</a></FieldRow>}
                </div>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                  {photoUrl ? (
                    <a href={photoUrl} target="_blank" rel="noopener noreferrer" style={fileBtnStyle}>
                      <ExternalLink size={14} /> Photo ID
                    </a>
                  ) : (
                    <span style={{ ...fileBtnStyle, opacity: 0.5, cursor: 'wait' }}>Photo ID (loading…)</span>
                  )}
                  <a href={videoUrl} target="_blank" rel="noopener noreferrer" style={fileBtnStyle}>
                    <ExternalLink size={14} /> Intro video
                  </a>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => void updateStatus(r, 'approved')}
                    disabled={isBusy || r.status === 'approved'}
                    style={actionBtnStyle('#10B981', r.status === 'approved')}
                  >
                    <CheckCircle2 size={14} /> Approve
                  </button>
                  <button
                    onClick={() => void updateStatus(r, 'declined')}
                    disabled={isBusy || r.status === 'declined'}
                    style={actionBtnStyle('#F59E0B', r.status === 'declined')}
                  >
                    <XCircle size={14} /> Decline
                  </button>
                  <button
                    onClick={() => void updateStatus(r, 'pending')}
                    disabled={isBusy || r.status === 'pending'}
                    style={actionBtnStyle('#8B5CF6', r.status === 'pending')}
                  >
                    Reset to pending
                  </button>
                  <span style={{ flex: 1 }} />
                  <button
                    onClick={() => void deleteRow(r)}
                    disabled={isBusy}
                    style={{ ...actionBtnStyle('#EF4444', false), background: 'rgba(239,68,68,0.08)' }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ── Local primitives ────────────────────────────────────────────────────────
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--color-text-muted)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 14, color: 'var(--color-text)' }}>{children}</div>
    </div>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 36, height: 36, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent',
  color: 'var(--color-text-muted)', cursor: 'pointer',
};

const linkStyle: React.CSSProperties = { color: 'var(--color-primary)', textDecoration: 'underline', textUnderlineOffset: '3px' };

const fileBtnStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 6,
  fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 500,
  padding: '8px 12px', borderRadius: 8,
  border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)',
  textDecoration: 'none',
};

function chipStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
    padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text-muted)',
  };
}

function actionBtnStyle(color: string, active: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
    padding: '8px 14px', borderRadius: 8,
    border: `1px solid ${color}55`,
    background: active ? `${color}22` : 'transparent',
    color, cursor: active ? 'default' : 'pointer',
    opacity: active ? 0.6 : 1,
  };
}
