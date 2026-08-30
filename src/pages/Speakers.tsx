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
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PageMeta from "@/components/PageMeta";

const SESSIONIZE_URL          = "https://sessionize.com/api/v2/x65weaqz/view/All";
const TRACK_CATEGORY_ID       = 124360;   // "Track" category in Sessionize
const COMPANY_QUESTION_ID     = 124328;   // "Company Name" question

// Per-speaker avatar image URL overrides. Some Sessionize headshots are
// pre-cropped so tightly that the top of the head gets clipped by the
// circular avatar mask. When that happens, drop a better-framed square
// crop in /public/speakers and map it here by lowercased display name.
const AVATAR_URL: Record<string, string> = {
  "scott spiegel": "/speakers/scott-spiegel.jpg",
};

// Per-speaker suppress-list for the X/Twitter link in the modal. Match
// by lowercased displayName. Add a name here when the speaker asks to
// hide their X handle from the /speakers page.
const HIDE_X_HANDLE: Set<string> = new Set([
  "shyan hussain",
]);

// Per-speaker exclusion — matches against the Sessionize fullName
// AFTER any DISPLAY_NAME_OVERRIDE has been applied, lowercased.
// Use when a speaker asks to be removed from the public /speakers
// page but is still marked Accepted in Sessionize.
const HIDE_SPEAKER: Set<string> = new Set([
  "patrick camuso",
  "patrick camuso, cpa",
  "artur merabian",
]);

// Per-speaker displayName override. Keyed on the lowercased Sessionize
// fullName; value is what we show on the site instead. Use when a
// speaker asks to be listed by their real name rather than the screen
// name Sessionize returns.
const DISPLAY_NAME_OVERRIDE: Record<string, string> = {
  "ombruja": "Carolina Coto",
};

// Per-speaker tagLine (headline) override. Keyed on the final displayName
// (after any DISPLAY_NAME_OVERRIDE), lowercased. Use when Sessionize
// carries a stale tagLine and the speaker asks for a different one.
const TAGLINE_OVERRIDE: Record<string, string> = {
  "rebecca rose": "Artist",
};

// Filter-chip colours per track. The actual track names come from the
// API; this map is here to color-code them consistently with the
// ECOSYSTEMS palette on /sponsor. Both the typo'd "Tokenizaton" and the
// corrected "Tokenization" are mapped so the color survives if Sessionize
// fixes the spelling. Missing entry? Falls back to coral.
const TRACK_COLOR: Record<string, string> = {
  'Culture, Art and Music':         '#D946EF',
  'Creator Economy':                '#F59E0B',
  'RWA Tokenization':               '#EF4444',
  'Brands':                         '#F97316',
  'AI Agent Tokenizaton':           '#3B82F6',
  'AI Agent Tokenization':          '#3B82F6',
  'Social NFTs':                    '#EC4899',
  'NFT Marketplaces':               '#38BDF8',
  'On-chain Infrastructure':        '#06B6D4',
  'DeFi':                           '#10B981',
  'Game Tokenization':              '#8B5CF6',
  'DeSci - Longevity Tokenization': '#84CC16',
  'DNS ENS Domain Tokens':          '#14B8A6',
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
  isFeatured: boolean;        // Sessionize "Top Speaker" flag — sorts first in All view.
}

function processSessionizeData(api: any): SpeakerVM[] {
  // Build itemId → trackName for the Track category only. Tracks are
  // assigned at the speaker level in this Sessionize event — speaker
  // .categoryItems contains both a country and a Track itemId.
  const trackCategory = (api.categories ?? []).find((c: any) => c.id === TRACK_CATEGORY_ID);
  const trackItemMap = new Map<number, string>();
  (trackCategory?.items ?? []).forEach((it: any) => trackItemMap.set(it.id, it.name));

  // Acceptance gate: only show speakers who have at least one session
  // with status === 'Accepted'. This protects against Round-2 / pending /
  // declined speakers leaking onto the public page before they're approved.
  const acceptedSpeakerIds = new Set<string>();
  (api.sessions ?? []).forEach((sess: any) => {
    if (String(sess?.status ?? '').toLowerCase() !== 'accepted') return;
    for (const spkId of sess.speakers ?? []) acceptedSpeakerIds.add(String(spkId));
  });

  return (api.speakers ?? [])
    .filter((s: any) => acceptedSpeakerIds.has(String(s.id)))
    .filter((s: any) => {
      const raw = String(s.fullName ?? '').trim().toLowerCase();
      const overridden = (DISPLAY_NAME_OVERRIDE[raw] ?? raw).toLowerCase();
      return !HIDE_SPEAKER.has(raw) && !HIDE_SPEAKER.has(overridden);
    })
    .map((s: any): SpeakerVM => {
    const xLink = (s.links ?? []).find((l: any) => l?.linkType === 'Twitter');
    const xHandleMatch = xLink?.url?.match(/(?:x|twitter)\.com\/([A-Za-z0-9_]+)/i);
    const company = (s.questionAnswers ?? []).find((qa: any) => qa?.questionId === COMPANY_QUESTION_ID)?.answerValue ?? '';
    // First Track-category item on the speaker.
    const track = (s.categoryItems ?? [])
      .map((cid: number) => trackItemMap.get(cid))
      .find((name: string | undefined) => !!name) ?? null;

    const rawDisplayName = String(s.fullName ?? '').trim() || '(unnamed)';
    const displayName = DISPLAY_NAME_OVERRIDE[rawDisplayName.toLowerCase()] ?? rawDisplayName;
    const rawTagLine = String(s.tagLine ?? '').trim();
    const tagLine = TAGLINE_OVERRIDE[displayName.toLowerCase()] ?? rawTagLine;
    return {
      id: String(s.id ?? ''),
      displayName,
      tagLine,
      company: String(company ?? '').trim(),
      bio: String(s.bio ?? '').trim(),
      xHandle: HIDE_X_HANDLE.has(displayName.toLowerCase()) ? '' : (xHandleMatch?.[1] ?? ''),
      profilePictureUrl: String(s.profilePicture ?? ''),
      track,
      isFeatured: Boolean(s.isTopSpeaker),
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link into a specific speaker's modal via ?speaker=<name>.
  // The Program page links speaker names into this. Matching is
  // case-insensitive on displayName; unmatched names just show the
  // page normally with no modal.
  useEffect(() => {
    if (loading || !speakers.length) return;
    const target = searchParams.get('speaker');
    if (!target) {
      if (openSpeaker) setOpenSpeaker(null);
      return;
    }
    const norm = target.trim().toLowerCase();
    const match = speakers.find(s => s.displayName.toLowerCase() === norm);
    setOpenSpeaker(match ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, speakers, searchParams]);

  // Reflect modal state back into the URL so users can share links.
  const closeModal = () => {
    setOpenSpeaker(null);
    if (searchParams.has('speaker')) {
      const next = new URLSearchParams(searchParams);
      next.delete('speaker');
      setSearchParams(next, { replace: true });
    }
  };
  const openSpeakerAndSync = (s: SpeakerVM) => {
    setOpenSpeaker(s);
    const next = new URLSearchParams(searchParams);
    next.set('speaker', s.displayName);
    setSearchParams(next, { replace: true });
  };

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
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
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
    const list = speakers.filter(s => {
      if (activeTrack !== 'all' && s.track !== activeTrack) return false;
      if (!term) return true;
      const hay = `${s.displayName} ${s.tagLine} ${s.company} ${s.xHandle}`.toLowerCase();
      return hay.includes(term);
    });
    // Featured (Sessionize "Top Speaker") always come first — in the All
    // view AND inside any track filter. Within each group (featured /
    // non-featured) the API's natural order is preserved (stable sort).
    return [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
  }, [speakers, search, activeTrack]);

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <PageMeta page="speakers" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto" style={{ padding: 'calc(5rem + 100px) 1.5rem 2rem' }}>
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

      {/* Card styles. Defined here (not inline) so the foil border on
          featured cards can use the dual-background gradient-border trick
          and animate via a keyframe — both of which inline styles don't
          handle cleanly. */}
      <style>{`
        .speaker-card {
          position: relative;        /* anchor for the featured-label */
          background: rgba(255,255,255,0.03);
          border: 1px solid var(--color-border);
          border-radius: 16px;
          padding: 1.25rem;
          cursor: pointer;
          text-align: left;
          color: inherit;
          font-family: inherit;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          transition: transform 200ms ease, background 200ms ease, border-color 200ms ease;
        }
        .featured-label {
          position: absolute;
          top: 10px;
          right: 10px;
          padding: 3px 8px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #FBBF24;
          background: rgba(251, 191, 36, 0.12);
          border: 1px solid rgba(251, 191, 36, 0.45);
          pointer-events: none;
          line-height: 1.1;
          white-space: nowrap;
        }
        .speaker-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.06);
        }
        /* Featured = Sessionize "Top Speaker". Holographic foil border via the
           padding-box / border-box dual-background trick. The outer linear
           gradient sits in the border layer, the inner solid fill sits in
           the padding layer. Animation slides the gradient horizontally for
           a slow shimmer. */
        .speaker-card.is-featured {
          border: 2px solid transparent;
          /* Three stacked backgrounds, from top of paint order to bottom:
             1) padding-box  → subtle white overlay so the inner fill still
                               reads slightly lighter than the page (matches
                               the non-featured cards).
             2) padding-box  → opaque page background, blocks the gradient
                               from bleeding into the card body.
             3) border-box   → animated foil gradient, only the 2px border
                               edge is visible since (1) and (2) cover the
                               interior.
             Only layer (3) is wider than the box so only it animates. */
          background:
            linear-gradient(rgba(255,255,255,0.03), rgba(255,255,255,0.03)) padding-box,
            linear-gradient(var(--color-bg), var(--color-bg)) padding-box,
            linear-gradient(120deg,
              #FBBF24 0%,
              #F472B6 22%,
              #60A5FA 45%,
              #34D399 68%,
              #FBBF24 100%
            ) border-box;
          background-size: 100% 100%, 100% 100%, 300% 100%;
          background-position: 0% 50%, 0% 50%, 0% 50%;
          animation: speakers-foil-shine 7s ease-in-out infinite;
        }
        .speaker-card.is-featured:hover {
          transform: translateY(-2px);
          background:
            linear-gradient(rgba(255,255,255,0.06), rgba(255,255,255,0.06)) padding-box,
            linear-gradient(var(--color-bg), var(--color-bg)) padding-box,
            linear-gradient(120deg,
              #FBBF24 0%,
              #F472B6 22%,
              #60A5FA 45%,
              #34D399 68%,
              #FBBF24 100%
            ) border-box;
          background-size: 100% 100%, 100% 100%, 300% 100%;
        }
        @keyframes speakers-foil-shine {
          0%, 100% { background-position: 0% 50%, 0% 50%, 0% 50%; }
          50%      { background-position: 0% 50%, 0% 50%, 100% 50%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .speaker-card.is-featured { animation: none; }
        }
      `}</style>

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
                className={`speaker-card${s.isFeatured ? ' is-featured' : ''}`}
                onClick={() => openSpeakerAndSync(s)}
              >
                {s.isFeatured && <span className="featured-label">Featured Speaker</span>}
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
          onClick={closeModal}
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
            onClick={e => { e.stopPropagation(); closeModal(); }}
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
  const overrideUrl = AVATAR_URL[speaker.displayName.toLowerCase()];
  return (
    <img
      src={overrideUrl ?? speaker.profilePictureUrl}
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
