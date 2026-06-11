// /speakers — live from the Sessionize "All" API.
//
// Browser fetches the Sessionize endpoint on mount, processes the response
// into a flat speaker view-model, and renders the grid + filter chips +
// modal. No build-time generation, no committed snapshot. Updates in
// Sessionize show up on the page within ~2 minutes (Sessionize sets
// Cache-Control: max-age=117 on the response, so most navigations hit
// the browser cache).
//
// Display name comes from speaker.fullName, which Sessionize pre-computes
// as ScreenName → Pseudonym → "First Last" — so the user's previously-
// configured priority is already honoured.

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";

const SESSIONIZE_URL          = "https://sessionize.com/api/v2/x65weaqz/view/All";
const TRACK_CATEGORY_ID       = 124360;   // "Track" category in Sessionize
const COMPANY_QUESTION_ID     = 124328;   // "Company Name" question

// Filter-chip colours per track. The actual track names come from the
// API; this map is here to color-code them consistently with the rest
// of the site. New track? Add an entry. Missing entry? Falls back to coral.
const TRACK_COLOR: Record<string, string> = {
  'Art':               '#D946EF',
  'Brands':            '#F97316',
  'BTC and Ordinals':  '#FB923C',
  'Community':         '#EC4899',
  'Entertainment':     '#A78BFA',
  'Future':            '#3B82F6',
  'Gaming':            '#8B5CF6',
  'Legal':             '#06B6D4',
  'NFTs and AI':       '#10B981',
  'Performer':         '#38BDF8',
};
const trackColor = (t: string | null) => (t && TRACK_COLOR[t]) || '#f06347';

interface SpeakerVM {
  id: string;
  displayName: string;
  tagLine: string;
  company: string;
  bio: string;
  xHandle: string;
  profilePictureUrl: string;
  track: string | null;
}

function processSessionizeData(api: any): SpeakerVM[] {
  // Build itemId → trackName for the Track category only.
  const trackCategory = (api.categories ?? []).find((c: any) => c.id === TRACK_CATEGORY_ID);
  const trackItemMap = new Map<number, string>();
  (trackCategory?.items ?? []).forEach((it: any) => trackItemMap.set(it.id, it.name));

  // Build sessionId → trackName.
  const sessionToTrack = new Map<number, string>();
  (api.sessions ?? []).forEach((s: any) => {
    for (const itemId of s.categoryItems ?? []) {
      const trackName = trackItemMap.get(itemId);
      if (trackName) {
        sessionToTrack.set(s.id, trackName);
        break;
      }
    }
  });

  return (api.speakers ?? []).map((s: any): SpeakerVM => {
    const xLink = (s.links ?? []).find((l: any) => l?.linkType === 'Twitter');
    const xHandleMatch = xLink?.url?.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)/i);
    const company = (s.questionAnswers ?? []).find((qa: any) => qa?.questionId === COMPANY_QUESTION_ID)?.answerValue ?? '';
    const firstSession = (s.sessions ?? [])[0];
    const track = firstSession != null ? sessionToTrack.get(firstSession) ?? null : null;

    return {
      id: String(s.id ?? ''),
      displayName: String(s.fullName ?? '').trim() || '(unnamed)',
      tagLine: String(s.tagLine ?? '').trim(),
      company: String(company ?? '').trim(),
      bio: String(s.bio ?? '').trim(),
      xHandle: xHandleMatch?.[1] ?? '',
      profilePictureUrl: String(s.profilePicture ?? ''),
      track,
    };
  });
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Speakers() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [speakers, setSpeakers] = useState<SpeakerVM[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeTrack, setActiveTrack] = useState<string>('all');
  const [openSpeaker, setOpenSpeaker] = useState<SpeakerVM | null>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  // Fetch from Sessionize. CORS is open on the API; the response is
  // cached by the browser for ~2 minutes per the Cache-Control header.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(SESSIONIZE_URL);
        if (!res.ok) throw new Error(`Sessionize ${res.status}`);
        const data = await res.json();
        if (cancelled) return;
        setSpeakers(processSessionizeData(data));
        setLoading(false);
      } catch (e: any) {
        if (cancelled) return;
        setFetchError(e?.message ?? String(e));
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Body scroll lock + Escape close while the modal is open.
  useEffect(() => {
    if (!openSpeaker) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenSpeaker(null); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [openSpeaker]);

  // Tracks with at least one speaker. Order: by speaker count desc, then by name.
  const activeTracks = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of speakers) {
      if (s.track) counts.set(s.track, (counts.get(s.track) ?? 0) + 1);
    }
    return Array.from(counts.keys()).sort((a, b) => (counts.get(b)! - counts.get(a)!) || a.localeCompare(b));
  }, [speakers]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return speakers.filter(s => {
      if (activeTrack !== 'all' && s.track !== activeTrack) return false;
      if (!term) return true;
      const hay = `${s.displayName} ${s.tagLine} ${s.company} ${s.xHandle}`.toLowerCase();
      return hay.includes(term);
    });
  }, [speakers, search, activeTrack]);

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="speakers" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: '5rem 1.5rem 2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: '12px', fontWeight: 500,
            letterSpacing: '0.25em', textTransform: 'uppercase',
            color: '#f06347', marginBottom: '0.75rem',
          }}>
            Round 1 · More announcements coming
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 6vw, 64px)',
            fontWeight: 700, textTransform: 'uppercase',
            color: 'var(--color-text)', margin: 0, lineHeight: 1.05,
          }}>
            Speakers
          </h1>
          <p style={{
            color: 'var(--color-text-muted)', fontFamily: 'var(--font-body)',
            fontSize: '16px', marginTop: '1.25rem',
            maxWidth: '640px', marginLeft: 'auto', marginRight: 'auto',
          }}>
            Selected Speakers for NFT.NYC 2026. See if your favorite is on the list.
          </p>
        </div>
      </section>

      {/* ── Filter + search row ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: '0 1.5rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <FilterChip
              label="All"
              active={activeTrack === 'all'}
              onClick={() => setActiveTrack('all')}
            />
            {activeTracks.map(name => (
              <FilterChip
                key={name}
                label={name}
                color={TRACK_COLOR[name] ?? '#f06347'}
                active={activeTrack === name}
                onClick={() => setActiveTrack(name)}
              />
            ))}
          </div>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
            <input
              type="search"
              placeholder="Search speakers"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
                padding: '0.55rem 0.9rem 0.55rem 2.25rem',
                borderRadius: 999, fontSize: 13,
                width: 240, outline: 'none',
                fontFamily: 'inherit',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Loading / error / grid ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: '0 1.5rem 5rem' }}>
        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : fetchError ? (
          <p style={{ textAlign: 'center', color: '#EF4444', padding: '4rem 0' }}>
            Couldn't load speakers from Sessionize ({fetchError}). Try refreshing the page in a moment.
          </p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem 0' }}>
            No speakers match this filter.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}>
            {filtered.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => setOpenSpeaker(s)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 16,
                  padding: '1.25rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'transform 200ms ease, border-color 200ms ease, background 200ms ease',
                  color: 'inherit',
                  fontFamily: 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              >
                <Avatar speaker={s} size={96} />
                {/* Single-line + ellipsis on each text field; full name in modal. */}
                <div style={{ minWidth: 0, width: '100%' }}>
                  <p
                    title={s.displayName}
                    style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18,
                      margin: 0, lineHeight: 1.2,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                  >
                    {s.displayName}
                  </p>
                  {s.tagLine && (
                    <p
                      title={s.tagLine}
                      style={{
                        fontSize: 13, color: 'var(--color-text-muted)',
                        margin: '0.25rem 0 0', lineHeight: 1.35,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {s.tagLine}
                    </p>
                  )}
                  {s.company && (
                    <p
                      title={s.company}
                      style={{
                        fontSize: 13, color: 'var(--color-text)',
                        margin: '0.1rem 0 0', fontWeight: 500,
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}
                    >
                      {s.company}
                    </p>
                  )}
                </div>
                {s.track && (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                    padding: '4px 10px', borderRadius: 999,
                    background: `${trackColor(s.track)}1A`, color: trackColor(s.track),
                    border: `1px solid ${trackColor(s.track)}33`,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: trackColor(s.track) }} />
                    {s.track}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ── Speaker detail modal ───────────────────────────────────────── */}
      {openSpeaker && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${openSpeaker.displayName} bio`}
          onClick={() => setOpenSpeaker(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '2rem', cursor: 'zoom-out',
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={e => { e.stopPropagation(); setOpenSpeaker(null); }}
            style={{
              position: 'absolute', top: '1rem', right: '1rem',
              width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: 'min(680px, 92vw)',
              maxHeight: '88vh',
              overflowY: 'auto',
              background: 'var(--color-bg)',
              border: '1px solid var(--color-border)',
              borderRadius: 20,
              padding: '2rem',
              cursor: 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <Avatar speaker={openSpeaker} size={112} />
              <div style={{ flex: 1, minWidth: 0, overflowWrap: 'break-word' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, margin: 0, lineHeight: 1.1 }}>
                  {openSpeaker.displayName}
                </h2>
                {openSpeaker.tagLine && (
                  <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: '0.4rem 0 0', lineHeight: 1.4 }}>
                    {openSpeaker.tagLine}
                  </p>
                )}
                {openSpeaker.company && (
                  <p style={{ fontSize: 14, color: 'var(--color-text)', margin: '0.1rem 0 0', fontWeight: 600 }}>
                    {openSpeaker.company}
                  </p>
                )}
              </div>
            </div>

            {openSpeaker.track && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                padding: '4px 10px', borderRadius: 999,
                background: `${trackColor(openSpeaker.track)}1A`, color: trackColor(openSpeaker.track),
                border: `1px solid ${trackColor(openSpeaker.track)}33`,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: trackColor(openSpeaker.track) }} />
                {openSpeaker.track}
              </span>
            )}

            {openSpeaker.bio && (
              <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--color-text)', whiteSpace: 'pre-wrap', margin: 0 }}>
                {openSpeaker.bio}
              </p>
            )}

            {openSpeaker.xHandle && (
              <a
                href={`https://x.com/${openSpeaker.xHandle}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '8px 14px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)', textDecoration: 'none',
                  fontSize: 13, fontWeight: 500,
                }}
              >
                @{openSpeaker.xHandle} on X
              </a>
            )}
          </div>
        </div>
      )}

      <SiteFooter stage={stage} hideIndustryFeed />
    </div>
  );
}

// ─── Filter chip ────────────────────────────────────────────────────────────
function FilterChip({ label, color, active, onClick }: {
  label: string;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  const accent = color ?? '#f06347';
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: active ? `${accent}1F` : 'transparent',
        border: `1px solid ${active ? accent : 'var(--color-border)'}`,
        color: active ? accent : 'var(--color-text-muted)',
        padding: '0.45rem 0.85rem',
        borderRadius: 999,
        fontSize: 12, fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        cursor: 'pointer', whiteSpace: 'nowrap',
        transition: 'all 150ms ease', fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

// ─── Avatar ─────────────────────────────────────────────────────────────────
function Avatar({ speaker, size }: { speaker: SpeakerVM; size: number }) {
  const [errored, setErrored] = useState(false);
  // Initials from displayName for the fallback.
  const initials = (() => {
    const parts = speaker.displayName.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return speaker.displayName.slice(0, 2).toUpperCase();
  })();
  if (errored || !speaker.profilePictureUrl) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 25%, #f06347cc, #1a1a2e)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: Math.round(size * 0.32), letterSpacing: '0.05em',
        border: '1px solid #f0634766', flexShrink: 0,
      }}>
        {initials || '?'}
      </div>
    );
  }
  return (
    <img
      src={speaker.profilePictureUrl}
      alt={speaker.displayName}
      loading="lazy"
      onError={() => setErrored(true)}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover',
        border: '1px solid var(--color-border)',
        flexShrink: 0,
        background: '#1a1a2e',
      }}
    />
  );
}

// ─── Skeleton card (loading state) ─────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid var(--color-border)',
      borderRadius: 16,
      padding: '1.25rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(110deg, rgba(255,255,255,0.05) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 70%)',
        backgroundSize: '200% 100%',
        animation: 'speakers-skeleton 1.2s ease-in-out infinite',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ height: 18, width: '70%', borderRadius: 4, background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ height: 12, width: '90%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ height: 12, width: '60%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
      </div>
      <style>{`@keyframes speakers-skeleton { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
}
