// /speakers — Round 1 speaker showcase.
//
// Source data: src/data/speakersRound1.ts (generated from the Sessionize CSV).
// Profile photos are loaded from Sessionize-hosted URLs in each record.

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";
import { SPEAKERS_ROUND_1, type SpeakerRecord } from "@/data/speakersRound1";
import { ECOSYSTEMS } from "@/data/nftnyc";

// Show only tracks with at least one speaker in this round.
const ACTIVE_TRACK_IDS = new Set(SPEAKERS_ROUND_1.map(s => s.track).filter(Boolean) as string[]);
const ACTIVE_TRACKS = ECOSYSTEMS.filter(e => ACTIVE_TRACK_IDS.has(e.id));
const verticalFor = (id: string | null) => (id ? ECOSYSTEMS.find(e => e.id === id) : undefined);

// ─── Page ───────────────────────────────────────────────────────────────────
export default function Speakers() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [search, setSearch] = useState('');
  const [activeTrack, setActiveTrack] = useState<string>('all');
  const [openSpeaker, setOpenSpeaker] = useState<SpeakerRecord | null>(null);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return SPEAKERS_ROUND_1.filter(s => {
      if (activeTrack !== 'all' && s.track !== activeTrack) return false;
      if (!term) return true;
      const hay = `${s.displayName} ${s.firstName} ${s.lastName} ${s.tagLine} ${s.company} ${s.xHandle}`.toLowerCase();
      return hay.includes(term);
    });
  }, [search, activeTrack]);

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
            {ACTIVE_TRACKS.map(eco => (
              <FilterChip
                key={eco.id}
                label={eco.name}
                color={eco.color}
                active={activeTrack === eco.id}
                onClick={() => setActiveTrack(eco.id)}
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

      {/* ── Speaker grid ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: '0 1.5rem 5rem' }}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '4rem 0' }}>
            No speakers match this search.
          </p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.25rem',
          }}>
            {filtered.map(s => {
              const eco = verticalFor(s.track);
              return (
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
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, margin: 0, lineHeight: 1.2 }}>
                      {s.displayName}
                    </p>
                    {s.tagLine && (
                      <p style={{ fontSize: 13, color: 'var(--color-text-muted)', margin: '0.25rem 0 0', lineHeight: 1.35 }}>
                        {s.tagLine}
                      </p>
                    )}
                    {s.company && (
                      <p style={{ fontSize: 13, color: 'var(--color-text)', margin: '0.1rem 0 0', fontWeight: 500 }}>
                        {s.company}
                      </p>
                    )}
                  </div>
                  {eco && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                      padding: '4px 10px', borderRadius: 999,
                      background: `${eco.color}1A`, color: eco.color,
                      border: `1px solid ${eco.color}33`,
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: eco.color }} />
                      {eco.name}
                    </span>
                  )}
                </button>
              );
            })}
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
              <div style={{ flex: 1, minWidth: 0 }}>
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

            {(() => {
              const eco = verticalFor(openSpeaker.track);
              if (!eco) return null;
              return (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, alignSelf: 'flex-start',
                  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600,
                  padding: '4px 10px', borderRadius: 999,
                  background: `${eco.color}1A`, color: eco.color,
                  border: `1px solid ${eco.color}33`,
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: eco.color }} />
                  {eco.name}
                </span>
              );
            })()}

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
// Renders the Sessionize-hosted profile picture. Falls back to a coral
// gradient with the speaker's initials if the image fails to load.
function Avatar({ speaker, size }: { speaker: SpeakerRecord; size: number }) {
  const [errored, setErrored] = useState(false);
  const initials =
    (speaker.firstName?.[0] ?? '') + (speaker.lastName?.[0] ?? speaker.displayName?.[1] ?? '');
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
        {initials.toUpperCase() || '?'}
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
