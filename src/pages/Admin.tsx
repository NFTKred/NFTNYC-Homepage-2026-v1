import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ECOSYSTEMS } from '@/data/nftnyc';
import { VERTICAL_TOPICS } from '@/data/verticalTopics';
import { Plus, Search, LogOut, Trash2, Pencil, Check, X, Loader2, Copy, GripVertical, Download, Mail, Upload, ImageIcon, RefreshCw, Send, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle, MessageCircle } from 'lucide-react';
import { getYouTubeId } from '@/components/ResourceCard';

/* ─── Twenty CRM lookup ─── */
const TWENTY_API_KEY = import.meta.env.VITE_TWENTY_API_KEY ?? '';
const TWENTY_API_BASE = 'https://peoplebrowsr.twenty.com/rest';

async function lookupCRMEmail(fullName: string): Promise<string | null> {
  if (!TWENTY_API_KEY) return null;
  const parts = fullName.replace(/\s*\([^)]*\)\s*/g, '').trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts.slice(1).join(' ') ?? '';
  if (!first) return null;
  try {
    const filter = last
      ? `and(name.firstName[eq]:${first},name.lastName[eq]:${last})`
      : `name.firstName[eq]:${first}`;
    const res = await fetch(
      `${TWENTY_API_BASE}/people?filter=${encodeURIComponent(filter)}&limit=1`,
      { headers: { Authorization: `Bearer ${TWENTY_API_KEY}`, 'Content-Type': 'application/json' } }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const email = json?.data?.people?.[0]?.emails?.primaryEmail;
    return email || null;
  } catch {
    return null;
  }
}

/* ─── OG image auto-fetch via Microlink (no API key required) ─── */

/**
 * Try to get the og:image for a URL.
 *
 * Strategy:
 *   1. Our own fetch-og-image Supabase Edge Function. It fetches the page
 *      server-side with a real browser User-Agent, so antibot-protected
 *      publishers (TheBlock, CoinDesk, etc.) work fine. No free-tier quota.
 *   2. If that yields nothing, fall back to Microlink. Microlink's metadata
 *      API fails with EPROXYNEEDED on antibot sites (requires PRO plan) but
 *      works well for long-tail publishers without that protection — and
 *      sometimes extracts a `logo` field when the page has no og:image.
 *   3. If both fail on the page URL, retry against the root domain.
 */
async function fetchOgImage(url: string): Promise<string | null> {
  // Primary: our edge function
  const tryEdge = async (u: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-og-image', { body: { url: u } });
      if (!error && data?.image) return data.image;
    } catch { /* ignore */ }
    return null;
  };

  // Secondary: Microlink (catches some cases where our HTML scrape misses a JS-rendered image)
  const tryMicrolink = async (u: string): Promise<string | null> => {
    try {
      const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(u)}`);
      if (res.ok) {
        const json = await res.json();
        return json?.data?.image?.url ?? json?.data?.logo?.url ?? null;
      }
    } catch { /* ignore */ }
    return null;
  };

  const edge = await tryEdge(url);
  if (edge) return edge;

  const microlink = await tryMicrolink(url);
  if (microlink) return microlink;

  // Root-domain fallback
  try {
    const rootUrl = new URL(url).origin;
    if (rootUrl !== url && rootUrl + '/' !== url) {
      const rootEdge = await tryEdge(rootUrl);
      if (rootEdge) return rootEdge;
      const rootMicrolink = await tryMicrolink(rootUrl);
      if (rootMicrolink) return rootMicrolink;
    }
  } catch { /* invalid URL */ }

  return null;
}

/* ─── Types ─── */
interface Resource {
  id: string;
  vertical_id: string;
  title: string;
  url: string;
  type: string;
  date: string;
  date_verified: boolean;
  source: string;
  topic_tag: string;
  description: string | null;
  image: string | null;
  status: string;
  auto_found: boolean;
  created_at: string;
  display_order: number | null;
}

interface Speaker {
  id: string;
  vertical_id: string;
  name: string;
  role: string;
  email: string | null;
  handle: string | null;
  unable_to_dm: boolean;
  qrt_eligible: boolean;
  related_resource_id: string | null;
  resource_relationship: string | null;
  outreach_channel: string | null;
  outreach_status: string;
  outreach_notes: string | null;
  created_at: string;
}

interface SpeakerTweet {
  id: string;
  speaker_id: string;
  tweet_url: string;
  tweet_id: string | null;
  posted_at: string | null;
  text: string;
  media_type: string | null;
  is_thread: boolean;
  engagement: { likes?: number; reposts?: number; replies?: number; views?: number; verified?: boolean } | null;
  qrt_score: number;
  qrt_reason: string | null;
  topic_match: string | null;
  qrt_status: string;            // 'candidate' | 'approved' | 'used' | 'rejected'
  created_at: string;
  updated_at: string;
}

const RESOURCE_TYPES = ['blog', 'youtube', 'podcast', 'tweet', 'paper', 'news'] as const;
const OUTREACH_CHANNELS = ['twitter_dm', 'email', 'linkedin', 'telegram', 'intro', 'other'] as const;
const OUTREACH_STATUSES = ['not_started', 'drafted', 'contacted', 'responded', 'confirmed', 'declined'] as const;
const RESOURCE_RELATIONSHIPS = ['authored', 'mentioned', 'interviewed', 'quoted', 'topic_expert'] as const;

/* ─── Outreach draft template ─── */

// Short name used in the draft ("our NFT.NYC/<X> projects page").
const VERTICAL_LABEL: Record<string, string> = {
  ai:           'AI Identity',
  gaming:       'Gaming',
  infra:        'Infrastructure',
  social:       'Social NFT',
  creator:      'Creator Economy',
  defi:         'DeFi',
  rwa:          'RWA',
  brands:       'Brands & Engagement',
  culture:      'Culture, Art & Music',
  domains:      'ENS Domains',
  desci:        'DeSci',
  marketplaces: 'NFT Marketplace',
};

function firstName(fullName: string): string {
  // "Yat Siu" → "Yat"; "Snowfro (Erick Calderon)" → "Snowfro"; "Yat Siu (alt)" → "Yat"
  return fullName.replace(/\s*\([^)]*\)\s*/g, '').trim().split(/\s+/)[0] ?? fullName;
}

interface OutreachDraft {
  subject: string;
  text: string;
  html: string;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildOutreachDraft(
  speaker: Speaker,
  resource: Resource | undefined,
  _allResources: Resource[] = [],
): OutreachDraft {
  const name = firstName(speaker.name);
  const verticalLabel = VERTICAL_LABEL[speaker.vertical_id] ?? speaker.vertical_id;
  const pageUrl = `${window.location.origin}/${speaker.vertical_id}`;

  // ONE PNG of the "Latest on <Vertical>" section with this speaker's
  // resource on top + 2 neighbors. Generated by /api/card-section/<id>
  // (Vercel function) which uses a screenshot service to capture the
  // already-existing /card/<id> React page. Cached at the edge.
  //
  // ?v=<timestamp> cache-busts the email-client image proxy so each fresh
  // Copy Draft click pulls a current version.
  const imageUrl = resource
    ? `${window.location.origin}/api/card-section/${resource.id}?v=${Date.now()}`
    : null;

  const subject = `${speaker.name}: You're featured on NFT.NYC ${verticalLabel}`;

  const resourceLineText = resource
    ? `We have featured \u2014 ${resource.title} (${resource.url}) on our NFT.NYC/${verticalLabel} projects page: ${pageUrl}`
    : `We have featured [resource] on our NFT.NYC/${verticalLabel} projects page: ${pageUrl}`;

  const text = [
    `${name},`,
    '',
    `NFT.NYC 2026 (Sept 1\u20133, The Edison, Times Square) is including interesting ${verticalLabel} tokenization projects.`,
    '',
    resourceLineText,
    ...(imageUrl ? ['', imageUrl] : []),
  ].join('\n');

  const resourceLineHtml = resource
    ? `We have featured &mdash; <a href="${escapeHtml(resource.url)}">${escapeHtml(resource.title)}</a> on our <a href="${escapeHtml(pageUrl)}">NFT.NYC/${escapeHtml(verticalLabel)} projects page</a>.`
    : `We have featured [resource] on our <a href="${escapeHtml(pageUrl)}">NFT.NYC/${escapeHtml(verticalLabel)} projects page</a>.`;

  // Image links to the vertical page since that's what the section preview
  // visually represents.
  const imageHtml = imageUrl
    ? `<p><a href="${escapeHtml(pageUrl)}"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(resource?.title ?? 'Resource image')}" style="max-width:600px;width:100%;height:auto;border:1px solid #ddd;border-radius:6px;" /></a></p>`
    : '';

  const html = [
    `<div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.5;color:#111;">`,
    `<p>${escapeHtml(name)},</p>`,
    `<p>NFT.NYC 2026 (Sept 1&ndash;3, The Edison, Times Square) is including interesting ${escapeHtml(verticalLabel)} tokenization projects.</p>`,
    `<p>${resourceLineHtml}</p>`,
    imageHtml,
    `</div>`,
  ].join('');

  return { subject, text, html };
}

const STATUS_COLORS: Record<string, string> = {
  not_started: '#6B7280',
  drafted: '#A78BFA',
  contacted: '#F59E0B',
  responded: '#3B82F6',
  confirmed: '#10B981',
  declined: '#EF4444',
};

/* ─── Styles ─── */
const cellStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.8)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'top',
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: 'rgb(90, 90, 117)',
  background: '#12121e',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem 0.75rem',
  borderRadius: '6px',
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  outline: 'none',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  padding: '0.5rem 1rem',
  borderRadius: '6px',
  border: 'none',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '13px',
  cursor: 'pointer',
  transition: 'opacity 200ms',
};

/* ─── Component ─── */
export default function Admin() {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [activeVertical, setActiveVertical] = useState('all');
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [showSpeakerForm, setShowSpeakerForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [seeking, setSeeking] = useState(false);
  const [seekResult, setSeekResult] = useState<string | null>(null);
  const [seekingTweets, setSeekingTweets] = useState(false);
  const [seekTweetsResult, setSeekTweetsResult] = useState<string | null>(null);
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [sentEmailId, setSentEmailId] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterRelationship, setFilterRelationship] = useState('');
  const [filterHasEmail, setFilterHasEmail] = useState<'any' | 'yes' | 'no'>('any');
  const [filterHasResource, setFilterHasResource] = useState<'any' | 'yes' | 'no'>('any');
  // null key = no sort (use default order from query); asc/desc cycle on click
  type SpeakerSortKey = 'name' | 'role' | 'vertical_id' | 'email' | 'handle' | 'unable_to_dm' | 'resource_title' | 'resource_relationship' | 'outreach_channel' | 'outreach_status' | 'outreach_notes';
  const [sortKey, setSortKey] = useState<SpeakerSortKey | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  type ResourceSortKey = 'title' | 'vertical_id' | 'type' | 'source' | 'date' | 'topic_tag';
  const [resourceSortKey, setResourceSortKey] = useState<ResourceSortKey | null>(null);
  const [resourceSortDir, setResourceSortDir] = useState<'asc' | 'desc'>('asc');
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [crmChecked, setCrmChecked] = useState<Set<string>>(new Set());
  const [findingForSpeakerId, setFindingForSpeakerId] = useState<string | null>(null);
  const [findResult, setFindResult] = useState<{ speakerId: string; message: string; tone: 'ok' | 'warn' | 'err' } | null>(null);

  /* ─── CRM email auto-lookup (persists results to Supabase) ─── */
  const lookupSpeakerEmails = useCallback(async (speakerList: Speaker[]) => {
    if (!TWENTY_API_KEY) return;
    // Only lookup speakers that don't already have a stored email AND haven't been checked this session
    const unchecked = speakerList.filter(s => !s.email && !crmChecked.has(s.id));
    if (unchecked.length === 0) return;
    const newChecked = new Set(crmChecked);
    // Lookup in batches of 5 to avoid hammering the API
    for (let i = 0; i < unchecked.length; i += 5) {
      const batch = unchecked.slice(i, i + 5);
      const lookups = await Promise.all(batch.map(s => lookupCRMEmail(s.name)));
      for (let j = 0; j < batch.length; j++) {
        const speaker = batch[j];
        const email = lookups[j];
        newChecked.add(speaker.id);
        if (email) {
          // Persist to Supabase so we never look this up again
          await supabase.from('speakers').update({ email }).eq('id', speaker.id).then(({ error }) => {
            if (error) console.warn(`Could not save CRM email for ${speaker.name}:`, error.message);
          });
        }
      }
    }
    setCrmChecked(newChecked);
    // Refresh speakers to show the newly saved emails
    queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
  }, [crmChecked, queryClient]);

  /* ─── Queries ─── */
  const resourcesQuery = useQuery({
    queryKey: ['admin-resources', activeVertical],
    queryFn: async () => {
      let q = supabase
        .from('resources')
        .select('*')
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('date', { ascending: false });
      if (activeVertical !== 'all') q = q.eq('vertical_id', activeVertical);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Resource[];
    },
  });

  const speakersQuery = useQuery({
    queryKey: ['admin-speakers', activeVertical],
    queryFn: async () => {
      let q = supabase.from('speakers').select('*').order('name');
      if (activeVertical !== 'all') q = q.eq('vertical_id', activeVertical);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Speaker[];
    },
  });

  // Tweets keyed by speaker_id, top score first per speaker. Filtered to the
  // active vertical via a join through speakers. Only candidate/approved/used
  // — rejected tweets stay hidden.
  const tweetsQuery = useQuery({
    queryKey: ['admin-speaker-tweets', activeVertical],
    queryFn: async () => {
      let q = supabase
        .from('speaker_tweets')
        .select('*, speakers!inner(vertical_id)')
        .neq('qrt_status', 'rejected')
        .order('qrt_score', { ascending: false });
      if (activeVertical !== 'all') q = q.eq('speakers.vertical_id', activeVertical);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as (SpeakerTweet & { speakers: { vertical_id: string } })[];
    },
  });

  /* ─── Mutations ─── */
  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      // .select() forces Supabase to return the deleted rows, so we can
      // detect the silent-fail case where RLS blocks the DELETE and no
      // error is raised but 0 rows are affected.
      const { data, error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          'No rows deleted. This usually means your user is not in the admin_users table, or the row does not exist. Check Supabase → admin_users table for your email.'
        );
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-resources'] }),
    onError: (err: Error) => alert(`Delete failed: ${err.message}`),
  });

  // Persist a new order for a subset of resources (all within one vertical).
  // Calls Supabase in parallel; React Query handles the refetch.
  const reorderResources = useMutation({
    mutationFn: async (ordered: { id: string; display_order: number }[]) => {
      const results = await Promise.all(
        ordered.map(({ id, display_order }) =>
          supabase.from('resources').update({ display_order }).eq('id', id).select()
        )
      );
      const firstErr = results.find(r => r.error)?.error;
      if (firstErr) throw firstErr;
      const silent = results.find(r => !r.error && (!r.data || r.data.length === 0));
      if (silent) {
        throw new Error('Reorder blocked by RLS — check your admin_users entry.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['resources'] });
    },
    onError: (err: Error) => alert(`Reorder failed: ${err.message}`),
  });

  const updateResourceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('resources').update({ status }).eq('id', id);
      if (error) throw error;
      return { id, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
    },
  });

  const updateSpeakerField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string | boolean | null }) => {
      const { error } = await supabase.from('speakers').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-speakers'] }),
    onError: (err: Error) => alert(`Update failed: ${err.message}`),
  });

  const deleteSpeaker = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('speakers')
        .delete()
        .eq('id', id)
        .select();
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error(
          'No rows deleted. Your user is probably not in admin_users, or the speaker no longer exists.'
        );
      }
    },
    onError: (err: Error) => alert(`Delete failed: ${err.message}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-speakers'] }),
  });

  /* ─── Auto-seek ─── */
  const handleAutoSeek = async () => {
    if (activeVertical === 'all') return;
    setSeeking(true);
    setSeekResult(null);
    try {
      const topics = (VERTICAL_TOPICS[activeVertical] ?? []).map(t => t.label);
      const eco = ECOSYSTEMS.find(e => e.id === activeVertical);
      const { data, error } = await supabase.functions.invoke('auto-seek-resources', {
        body: { verticalId: activeVertical, verticalName: eco?.name ?? activeVertical, topics },
      });
      if (error) {
        console.error('Auto-seek error:', error);
        setSeekResult(`Error: ${error.message || JSON.stringify(error)}`);
      } else if (data?.error) {
        setSeekResult(`No results: ${data.error}`);
      } else {
        setSeekResult(`Found ${data?.resourceCount ?? 0} resources with ${data?.speakerCount ?? 0} speakers`);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
    } catch (err: any) {
      console.error('Auto-seek exception:', err);
      setSeekResult(`Exception: ${err.message || String(err)}`);
    } finally {
      setSeeking(false);
    }
  };

  /* ─── Auto-seek tweets (per-vertical batch) ─── */
  const handleAutoSeekTweets = async () => {
    if (activeVertical === 'all') return;
    setSeekingTweets(true);
    setSeekTweetsResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('auto-seek-tweets', {
        body: { verticalId: activeVertical },
      });
      if (error) {
        console.error('Auto-seek tweets error:', error);
        setSeekTweetsResult(`Error: ${error.message || JSON.stringify(error)}`);
      } else if (data?.error) {
        setSeekTweetsResult(`No results: ${data.error}`);
      } else {
        const errCount = Array.isArray(data?.errors) ? data.errors.length : 0;
        setSeekTweetsResult(
          `Found ${data?.tweetCount ?? 0} candidate tweets across ${data?.speakerCount ?? 0} speakers` +
          (errCount > 0 ? ` (${errCount} per-speaker errors — see console)` : '')
        );
        if (errCount > 0) console.warn('auto-seek-tweets per-speaker errors:', data.errors);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-speaker-tweets'] });
    } catch (err: any) {
      console.error('Auto-seek tweets exception:', err);
      setSeekTweetsResult(`Exception: ${err.message || String(err)}`);
    } finally {
      setSeekingTweets(false);
    }
  };

  /* ─── Per-speaker resource finder (Perplexity web search) ─── */
  const handleFindResourceForSpeaker = async (speakerId: string) => {
    setFindingForSpeakerId(speakerId);
    setFindResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('find-resource-for-speaker', {
        body: { speakerId },
      });
      if (error) {
        // Supabase wraps non-2xx responses in a FunctionsHttpError whose `context`
        // is the underlying Response — read its body so the user sees why.
        let detail = error.message || 'Unknown error';
        try {
          const ctx: any = (error as any).context;
          if (ctx && typeof ctx.text === 'function') {
            const body = await ctx.text();
            if (body) detail = body.length > 300 ? body.slice(0, 300) + '…' : body;
          }
        } catch { /* ignore */ }
        console.error('find-resource-for-speaker error:', error, 'body:', detail);
        setFindResult({ speakerId, message: `Error: ${detail}`, tone: 'err' });
      } else if (data?.status === 'linked' || data?.status === 'linked_resource_only') {
        setFindResult({ speakerId, message: 'Found — review in Pending Review', tone: 'ok' });
      } else if (data?.status === 'already_linked') {
        setFindResult({ speakerId, message: 'Already linked', tone: 'warn' });
      } else if (data?.status === 'not_found') {
        setFindResult({ speakerId, message: 'No resource found', tone: 'warn' });
      } else if (data?.error) {
        setFindResult({ speakerId, message: `Error: ${data.error}`, tone: 'err' });
      } else {
        setFindResult({ speakerId, message: 'Unexpected response', tone: 'err' });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-resources'] });
      queryClient.invalidateQueries({ queryKey: ['admin-speakers'] });
    } catch (err: any) {
      setFindResult({ speakerId, message: `Exception: ${err.message || String(err)}`, tone: 'err' });
    } finally {
      setFindingForSpeakerId(null);
      setTimeout(() => {
        setFindResult(prev => (prev && prev.speakerId === speakerId ? null : prev));
      }, 5000);
    }
  };

  /* ─── Card screenshot generation ─── */
  const resources = resourcesQuery.data ?? [];
  const speakers = speakersQuery.data ?? [];
  // Group tweets by speaker_id, highest qrt_score first per speaker (already
  // ordered by the query, but defensive in case of caching).
  const tweetsBySpeakerId = (() => {
    const m = new Map<string, SpeakerTweet[]>();
    for (const t of tweetsQuery.data ?? []) {
      const list = m.get(t.speaker_id) ?? [];
      list.push(t);
      m.set(t.speaker_id, list);
    }
    for (const list of m.values()) list.sort((a, b) => Number(b.qrt_score) - Number(a.qrt_score));
    return m;
  })();
  const approvedResourcesUnsorted = resources.filter(r => r.status === 'approved');
  const approvedResources = (() => {
    if (!resourceSortKey) return approvedResourcesUnsorted;
    const list = [...approvedResourcesUnsorted];
    const get = (r: Resource): string => {
      switch (resourceSortKey) {
        case 'title':       return (r.title ?? '').toLowerCase();
        case 'vertical_id': return r.vertical_id ?? '';
        case 'type':        return r.type ?? '';
        case 'source':      return (r.source ?? '').toLowerCase();
        case 'date':        return r.date ?? '';
        case 'topic_tag':   return (r.topic_tag ?? '').toLowerCase();
      }
    };
    list.sort((a, b) => {
      const av = get(a);
      const bv = get(b);
      const aEmpty = av === '';
      const bEmpty = bv === '';
      if (aEmpty && !bEmpty) return 1;
      if (!aEmpty && bEmpty) return -1;
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return resourceSortDir === 'asc' ? cmp : -cmp;
    });
    return list;
  })();
  const pendingResources = resources.filter(r => r.status === 'pending');

  // Search → structured filters → sort pipeline. Pre-compute the related
  // resource lookup as a Map so we don't do an O(n×m) scan when sorting.
  const resourceById = new Map(resources.map(r => [r.id, r]));

  const filteredSpeakers = (() => {
    let list = speakers;

    // Free-text search across name/role/email/handle/notes/resource title
    const q = speakerSearch.trim().toLowerCase();
    if (q) {
      list = list.filter(s => {
        const related = s.related_resource_id ? resourceById.get(s.related_resource_id) : null;
        const hay = [s.name, s.role, s.email, s.handle, s.outreach_notes, related?.title]
          .filter(Boolean).join(' ').toLowerCase();
        return hay.includes(q);
      });
    }

    // Enum filters
    if (filterStatus) list = list.filter(s => s.outreach_status === filterStatus);
    if (filterChannel) list = list.filter(s => s.outreach_channel === filterChannel);
    if (filterRelationship) list = list.filter(s => s.resource_relationship === filterRelationship);

    // Boolean presence filters
    if (filterHasEmail === 'yes') list = list.filter(s => !!s.email);
    if (filterHasEmail === 'no')  list = list.filter(s => !s.email);
    if (filterHasResource === 'yes') list = list.filter(s => !!s.related_resource_id);
    if (filterHasResource === 'no')  list = list.filter(s => !s.related_resource_id);

    // Sort (stable: copy before mutating)
    if (sortKey) {
      const STATUS_ORDER: Record<string, number> = {
        not_started: 0, drafted: 1, contacted: 2, responded: 3, confirmed: 4, declined: 5,
      };
      const getSortValue = (s: Speaker): string | number => {
        switch (sortKey) {
          case 'name':                 return s.name.toLowerCase();
          case 'role':                 return (s.role ?? '').toLowerCase();
          case 'vertical_id':          return s.vertical_id;
          case 'email':                return (s.email ?? '').toLowerCase();
          case 'handle':               return (s.handle ?? '').toLowerCase();
          case 'unable_to_dm':         return s.unable_to_dm ? 1 : 0;
          case 'resource_title':       return (resourceById.get(s.related_resource_id ?? '')?.title ?? '').toLowerCase();
          case 'resource_relationship':return s.resource_relationship ?? '';
          case 'outreach_channel':     return s.outreach_channel ?? '';
          case 'outreach_status':      return STATUS_ORDER[s.outreach_status] ?? 99;
          case 'outreach_notes':       return (s.outreach_notes ?? '').toLowerCase();
        }
      };
      list = [...list].sort((a, b) => {
        const av = getSortValue(a);
        const bv = getSortValue(b);
        // Push empty strings to the end regardless of direction (they're
        // usually noise at the top of alpha sorts).
        const aEmpty = av === '' || av === 99;
        const bEmpty = bv === '' || bv === 99;
        if (aEmpty && !bEmpty) return 1;
        if (!aEmpty && bEmpty) return -1;
        const cmp = av < bv ? -1 : av > bv ? 1 : 0;
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  })();

  const anyFilterActive = Boolean(
    speakerSearch.trim() || filterStatus || filterChannel || filterRelationship ||
    filterHasEmail !== 'any' || filterHasResource !== 'any'
  );

  const resetSpeakerFilters = () => {
    setSpeakerSearch('');
    setFilterStatus('');
    setFilterChannel('');
    setFilterRelationship('');
    setFilterHasEmail('any');
    setFilterHasResource('any');
    setSortKey(null);
    setSortDir('asc');
  };

  const toggleSort = (key: SpeakerSortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      // Third click — clear sort
      setSortKey(null);
      setSortDir('asc');
    }
  };

  const toggleResourceSort = (key: ResourceSortKey) => {
    if (resourceSortKey !== key) {
      setResourceSortKey(key);
      setResourceSortDir('asc');
    } else if (resourceSortDir === 'asc') {
      setResourceSortDir('desc');
    } else {
      setResourceSortKey(null);
      setResourceSortDir('asc');
    }
  };

  // Auto-lookup CRM emails when speakers load
  useEffect(() => {
    if (speakers.length > 0) lookupSpeakerEmails(speakers);
  }, [speakers, lookupSpeakerEmails]);

  const exportSpeakersCSV = async () => {
    // Fetch all speakers and resources across all verticals
    const [speakerRes, resourceRes] = await Promise.all([
      supabase.from('speakers').select('*').order('name'),
      supabase.from('resources').select('*'),
    ]);
    const allSpeakers = (speakerRes.data ?? []) as Speaker[];
    const allResources = (resourceRes.data ?? []) as Resource[];

    const escapeCSV = (val: string) => {
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const headers = ['Name', 'Role', 'Vertical', 'Email', 'Handle', 'Related Resource', 'Date of Resource', 'Resource Source', 'Related Resource Description', 'Relationship', 'Channel', 'Status', 'Subject', 'Draft'];
    const rows = allSpeakers.map(s => {
      const r = allResources.find(res => res.id === s.related_resource_id);
      const { subject, text: draft } = buildOutreachDraft(s, r, resources);
      return [
        s.name,
        s.role,
        s.vertical_id,
        s.email || '',
        s.handle ? `https://x.com/${s.handle}` : '',
        r?.url ?? '',
        r?.date ?? '',
        r?.source ?? '',
        r?.description ?? '',
        s.resource_relationship ?? '',
        s.outreach_channel?.replace('_', ' ') ?? '',
        s.outreach_status.replace('_', ' '),
        subject,
        draft,
      ].map(v => escapeCSV(v)).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nftnyc-speakers-outreach-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(10, 10, 15)', color: '#fff' }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        background: 'rgb(10, 10, 15)',
        zIndex: 50,
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '18px',
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>NFT.NYC Admin</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)' }}>
            {user?.email}
          </span>
          <button onClick={signOut} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgb(149, 149, 176)' }}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      {/* Vertical tabs */}
      <div style={{
        display: 'flex',
        gap: '0.25rem',
        padding: '1rem 2rem',
        overflowX: 'auto',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <TabPill label="All" active={activeVertical === 'all'} onClick={() => setActiveVertical('all')} />
        {ECOSYSTEMS.map(eco => (
          <TabPill
            key={eco.id}
            label={eco.name}
            color={eco.color}
            active={activeVertical === eco.id}
            onClick={() => setActiveVertical(eco.id)}
          />
        ))}
      </div>

      <div style={{ padding: '2rem' }}>

        {/* ─── PENDING REVIEW ─── */}
        {pendingResources.length > 0 && (
          <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '1rem', color: '#F59E0B' }}>
              Pending Review ({pendingResources.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingResources.map(r => (
                <div key={r.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1rem',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.15)',
                  borderRadius: '8px',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#fff' }}>{r.title}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgb(149, 149, 176)', marginTop: '0.25rem' }}>
                      {r.source} · {r.type} · <span style={{ color: '#F59E0B' }}>{r.date}</span> · {r.topic_tag}
                    </p>
                    {r.description && <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgb(120, 120, 150)', marginTop: '0.25rem' }}>{r.description}</p>}
                    {(() => {
                      const linkedSpeaker = speakers.find(s => s.related_resource_id === r.id);
                      return linkedSpeaker ? (
                        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#8B5CF6', marginTop: '0.35rem' }}>
                          Speaker: <strong>{linkedSpeaker.name}</strong> ({linkedSpeaker.role}) — {linkedSpeaker.resource_relationship?.replace('_', ' ')}
                        </p>
                      ) : null;
                    })()}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'flex-end', flexShrink: 0 }}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#3B82F6' }}>View</a>
                    <button onClick={() => updateResourceStatus.mutate({ id: r.id, status: 'approved' })} style={{ ...btnStyle, background: '#10B981', color: '#fff', padding: '0.4rem 0.75rem' }}>
                      <Check size={14} /> Accept
                    </button>
                    <button onClick={() => updateResourceStatus.mutate({ id: r.id, status: 'rejected' })} style={{ ...btnStyle, background: '#EF4444', color: '#fff', padding: '0.4rem 0.75rem' }}>
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── RESOURCES ─── */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
              Resources ({approvedResources.length})
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {activeVertical !== 'all' && (
                <button onClick={handleAutoSeek} disabled={seeking} style={{ ...btnStyle, background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}>
                  {seeking ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  {seeking ? 'Searching...' : 'Auto-Seek Resources'}
                </button>
              )}
              {activeVertical !== 'all' && (
                <button onClick={handleAutoSeekTweets} disabled={seekingTweets} style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }} title="Find QRT-worthy recent tweets for every QRT-eligible speaker in this vertical">
                  {seekingTweets ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
                  {seekingTweets ? 'Searching...' : 'Auto-Seek Tweets'}
                </button>
              )}
              <button onClick={() => { setEditingResource(null); setShowResourceForm(true); }} style={{ ...btnStyle, background: '#3B82F6', color: '#fff' }}>
                <Plus size={14} /> Add Resource
              </button>
              {activeVertical === 'all' && (
                <button onClick={exportSpeakersCSV} style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Download size={14} /> Export CSV
                </button>
              )}
            </div>
          </div>
          {seekResult && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: seekResult.startsWith('Error') || seekResult.startsWith('Exception') ? '#EF4444' : seekResult.startsWith('No') ? '#F59E0B' : '#10B981',
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px',
            }}>{seekResult}</p>
          )}
          {seekTweetsResult && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: seekTweetsResult.startsWith('Error') || seekTweetsResult.startsWith('Exception') ? '#EF4444' : seekTweetsResult.startsWith('No') ? '#F59E0B' : '#10B981',
              marginBottom: '1rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '6px',
            }}>{seekTweetsResult}</p>
          )}
          {activeVertical === 'all' && approvedResources.length > 0 && (
            <p style={{ fontSize: '12px', color: 'rgb(149,149,176)', marginBottom: '0.75rem' }}>
              Select a single vertical above to drag-and-drop resources into your preferred order.
            </p>
          )}
          <div style={{ overflow: 'auto', maxHeight: '60vh', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  {(() => {
                    const ResourceSortHeader = ({ label, sortKey: key, style }: { label: string; sortKey: ResourceSortKey; style?: React.CSSProperties }) => {
                      const active = resourceSortKey === key;
                      const Icon = active ? (resourceSortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                      return (
                        <th
                          style={{ ...headerCellStyle, color: '#fff', cursor: 'pointer', userSelect: 'none', ...style }}
                          onClick={() => toggleResourceSort(key)}
                          title={active ? `Click to ${resourceSortDir === 'asc' ? 'sort descending' : 'clear sort'}` : 'Click to sort'}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fff' }}>
                            {label}
                            <Icon size={11} style={{ opacity: active ? 1 : 0.6 }} />
                          </span>
                        </th>
                      );
                    };
                    return <>
                      <th style={{ ...headerCellStyle, width: '28px' }}></th>
                      <ResourceSortHeader label="Title" sortKey="title" />
                      <ResourceSortHeader label="Vertical" sortKey="vertical_id" />
                      <ResourceSortHeader label="Type" sortKey="type" />
                      <ResourceSortHeader label="Source" sortKey="source" />
                      <ResourceSortHeader label="Date" sortKey="date" />
                      <ResourceSortHeader label="Topic" sortKey="topic_tag" />
                      <th style={{ ...headerCellStyle, width: '80px' }}>Actions</th>
                    </>;
                  })()}
                </tr>
              </thead>
              <tbody>
                {approvedResources.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...cellStyle, textAlign: 'center', color: 'rgb(90, 90, 117)' }}>No resources yet</td></tr>
                ) : approvedResources.map(r => {
                  const dragEnabled = activeVertical !== 'all' && !resourceSortKey;
                  const isDragging = draggingId === r.id;
                  const isDragOver = dragOverId === r.id && draggingId !== r.id;
                  return (
                  <tr
                    key={r.id}
                    draggable={dragEnabled}
                    onDragStart={() => { if (dragEnabled) setDraggingId(r.id); }}
                    onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                    onDragOver={(e) => {
                      if (!dragEnabled || !draggingId || draggingId === r.id) return;
                      e.preventDefault();
                      if (dragOverId !== r.id) setDragOverId(r.id);
                    }}
                    onDrop={(e) => {
                      if (!dragEnabled || !draggingId || draggingId === r.id) return;
                      e.preventDefault();
                      const from = approvedResources.findIndex(x => x.id === draggingId);
                      const to = approvedResources.findIndex(x => x.id === r.id);
                      if (from < 0 || to < 0) return;
                      const next = approvedResources.slice();
                      const [moved] = next.splice(from, 1);
                      next.splice(to, 0, moved);
                      // Optimistic: update the cached query data immediately
                      queryClient.setQueryData(['admin-resources', activeVertical], (old: Resource[] | undefined) => {
                        if (!old) return old;
                        const reordered = next.map((x, i) => ({ ...x, display_order: i + 1 }));
                        // Preserve any pending-status rows at their original positions
                        const byId = new Map(reordered.map(x => [x.id, x]));
                        return old.map(x => byId.get(x.id) ?? x);
                      });
                      reorderResources.mutate(
                        next.map((x, i) => ({ id: x.id, display_order: i + 1 }))
                      );
                      setDraggingId(null);
                      setDragOverId(null);
                    }}
                    style={{
                      opacity: isDragging ? 0.4 : 1,
                      background: isDragOver ? 'rgba(59,130,246,0.08)' : 'transparent',
                      borderTop: isDragOver ? '2px solid #3B82F6' : undefined,
                    }}
                  >
                    <td style={{ ...cellStyle, textAlign: 'center', color: dragEnabled ? 'rgb(149, 149, 176)' : 'rgb(60, 60, 80)', cursor: dragEnabled ? 'grab' : 'not-allowed' }} title={dragEnabled ? 'Drag to reorder' : 'Select a single vertical to enable reordering'}>
                      <GripVertical size={14} />
                    </td>
                    <td style={cellStyle}>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>{r.title}</a>
                    </td>
                    <td style={cellStyle}>{r.vertical_id}</td>
                    <td style={cellStyle}><span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', fontSize: '11px' }}>{r.type}</span></td>
                    <td style={cellStyle}>{r.source}</td>
                    <td style={cellStyle}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        {r.date}
                        {!r.date_verified && (
                          <span
                            title="Publication date not verified — page metadata couldn't be read during the last audit. Edit the resource to verify."
                            style={{ display: 'inline-flex', alignItems: 'center', color: '#F59E0B' }}
                          >
                            <AlertTriangle size={13} />
                          </span>
                        )}
                      </span>
                    </td>
                    <td style={cellStyle}>{r.topic_tag}</td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button onClick={() => { setEditingResource(r); setShowResourceForm(true); }} style={{ background: 'none', border: 'none', color: 'rgb(149, 149, 176)', cursor: 'pointer', padding: '4px' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Delete resource "${r.title}"?`)) deleteResource.mutate(r.id); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── SPEAKERS ─── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
              Speakers & Outreach ({speakerSearch.trim() ? `${filteredSpeakers.length} of ${speakers.length}` : speakers.length})
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: 'flex-end' }}>
              <div style={{ position: 'relative', minWidth: '260px' }}>
                <Search
                  size={14}
                  style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'rgb(90, 90, 117)', pointerEvents: 'none' }}
                />
                <input
                  type="search"
                  placeholder="Search speakers (name, role, email, handle, notes, resource…)"
                  value={speakerSearch}
                  onChange={e => setSpeakerSearch(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: '32px',
                    paddingRight: speakerSearch ? '30px' : '0.75rem',
                    fontSize: '13px',
                  }}
                />
                {speakerSearch && (
                  <button
                    onClick={() => setSpeakerSearch('')}
                    title="Clear search"
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgb(149, 149, 176)', cursor: 'pointer', padding: '2px', display: 'inline-flex' }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <button onClick={() => { setEditingSpeaker(null); setShowSpeakerForm(true); }} style={{ ...btnStyle, background: '#3B82F6', color: '#fff' }}>
                <Plus size={14} /> Add Speaker
              </button>
            </div>
          </div>

          {/* ─── Filter row ─── */}
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            {(() => {
              const filterSelectStyle: React.CSSProperties = {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.8)',
                fontSize: '12px',
                padding: '6px 10px',
                cursor: 'pointer',
                outline: 'none',
              };
              return <>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ ...filterSelectStyle, color: filterStatus ? STATUS_COLORS[filterStatus] ?? '#fff' : 'rgba(255,255,255,0.6)' }}>
                  <option value="" style={{ background: '#1a1a2e', color: '#fff' }}>Status: All</option>
                  {OUTREACH_STATUSES.map(s => <option key={s} value={s} style={{ background: '#1a1a2e', color: STATUS_COLORS[s] }}>{s.replace('_', ' ')}</option>)}
                </select>
                <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} style={filterSelectStyle}>
                  <option value="" style={{ background: '#1a1a2e' }}>Channel: All</option>
                  {OUTREACH_CHANNELS.map(c => <option key={c} value={c} style={{ background: '#1a1a2e' }}>{c.replace('_', ' ')}</option>)}
                </select>
                <select value={filterRelationship} onChange={e => setFilterRelationship(e.target.value)} style={filterSelectStyle}>
                  <option value="" style={{ background: '#1a1a2e' }}>Relationship: All</option>
                  {RESOURCE_RELATIONSHIPS.map(r => <option key={r} value={r} style={{ background: '#1a1a2e' }}>{r.replace('_', ' ')}</option>)}
                </select>
                <select value={filterHasEmail} onChange={e => setFilterHasEmail(e.target.value as 'any' | 'yes' | 'no')} style={filterSelectStyle}>
                  <option value="any" style={{ background: '#1a1a2e' }}>Email: Any</option>
                  <option value="yes" style={{ background: '#1a1a2e' }}>Email: Has email</option>
                  <option value="no"  style={{ background: '#1a1a2e' }}>Email: No email</option>
                </select>
                <select value={filterHasResource} onChange={e => setFilterHasResource(e.target.value as 'any' | 'yes' | 'no')} style={filterSelectStyle}>
                  <option value="any" style={{ background: '#1a1a2e' }}>Resource: Any</option>
                  <option value="yes" style={{ background: '#1a1a2e' }}>Resource: Linked</option>
                  <option value="no"  style={{ background: '#1a1a2e' }}>Resource: Not linked</option>
                </select>
                {anyFilterActive && (
                  <button onClick={resetSpeakerFilters} title="Clear all filters, search, and sort" style={{ ...filterSelectStyle, color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <X size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Reset
                  </button>
                )}
              </>;
            })()}
          </div>

          <div style={{ overflow: 'auto', maxHeight: '70vh', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
                <tr>
                  {(() => {
                    const SortHeader = ({ label, sortKey: key, style }: { label: string; sortKey: SpeakerSortKey; style?: React.CSSProperties }) => {
                      const active = sortKey === key;
                      const Icon = active ? (sortDir === 'asc' ? ArrowUp : ArrowDown) : ArrowUpDown;
                      return (
                        <th
                          style={{ ...headerCellStyle, color: '#fff', cursor: 'pointer', userSelect: 'none', ...style }}
                          onClick={() => toggleSort(key)}
                          title={active ? `Click to ${sortDir === 'asc' ? 'sort descending' : 'clear sort'}` : 'Click to sort'}
                        >
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#fff' }}>
                            {label}
                            <Icon size={11} style={{ opacity: active ? 1 : 0.6 }} />
                          </span>
                        </th>
                      );
                    };
                    return <>
                      <SortHeader label="Name" sortKey="name" style={{ position: 'sticky', left: 0, zIndex: 3, minWidth: '120px', borderRight: '2px solid rgba(255,255,255,0.1)' }} />
                      <SortHeader label="Role" sortKey="role" />
                      <SortHeader label="Vertical" sortKey="vertical_id" />
                      <SortHeader label="Email" sortKey="email" />
                      <SortHeader label="Handle" sortKey="handle" />
                      <SortHeader label="Unable to DM" sortKey="unable_to_dm" />
                      <SortHeader label="Related Resource" sortKey="resource_title" />
                      <th style={{ ...headerCellStyle, color: '#fff', minWidth: '220px' }}>Recent Tweet</th>
                      <SortHeader label="Relationship" sortKey="resource_relationship" />
                      <SortHeader label="Channel" sortKey="outreach_channel" />
                      <SortHeader label="Status" sortKey="outreach_status" />
                      <SortHeader label="Notes" sortKey="outreach_notes" />
                      <th style={{ ...headerCellStyle, color: '#fff', width: '320px' }}>Actions</th>
                    </>;
                  })()}
                </tr>
              </thead>
              <tbody>
                {filteredSpeakers.length === 0 ? (
                  <tr><td colSpan={13} style={{ ...cellStyle, textAlign: 'center', color: 'rgb(90, 90, 117)' }}>
                    {speakers.length === 0
                      ? 'No speakers yet'
                      : `No speakers match "${speakerSearch}"`}
                  </td></tr>
                ) : filteredSpeakers.map(s => {
                  const relatedResource = resources.find(r => r.id === s.related_resource_id);
                  const verticalResources = resources.filter(r => r.vertical_id === s.vertical_id);
                  const speakerTweets = tweetsBySpeakerId.get(s.id) ?? [];
                  return (
                  <tr key={s.id}>
                    <td style={{ ...cellStyle, fontWeight: 600, position: 'sticky', left: 0, zIndex: 1, background: '#12121e', minWidth: '120px', borderRight: '2px solid rgba(255,255,255,0.1)' }}>{s.name}</td>
                    <td style={cellStyle}>{s.role}</td>
                    <td style={cellStyle}>{s.vertical_id}</td>
                    <td style={cellStyle}>
                      {s.email ? (
                        <a href={`mailto:${s.email}`} style={{ color: '#10B981', textDecoration: 'none', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={11} />{s.email}
                        </a>
                      ) : !crmChecked.has(s.id) && TWENTY_API_KEY ? (
                        <Loader2 size={12} className="animate-spin" style={{ color: 'rgb(90, 90, 117)' }} />
                      ) : (
                        <span style={{ color: 'rgb(60, 60, 80)', fontSize: '11px' }}>—</span>
                      )}
                    </td>
                    <td style={cellStyle}>{s.handle && <a href={`https://x.com/${s.handle}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3B82F6', textDecoration: 'none' }}>@{s.handle}</a>}</td>
                    <td style={{ ...cellStyle, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={s.unable_to_dm}
                        onChange={e => updateSpeakerField.mutate({ id: s.id, field: 'unable_to_dm', value: e.target.checked })}
                        title={s.unable_to_dm ? 'This speaker cannot be DMd on X — using another channel' : 'Mark this speaker as unable to be DMd on X'}
                        style={{ cursor: 'pointer', accentColor: '#EF4444' }}
                      />
                    </td>
                    <td style={{ ...cellStyle, maxWidth: '220px' }}>
                      <select
                        value={s.related_resource_id ?? ''}
                        onChange={e => updateSpeakerField.mutate({ id: s.id, field: 'related_resource_id', value: e.target.value || null })}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: s.related_resource_id ? '#3B82F6' : 'rgb(60, 60, 80)', fontSize: '11px', padding: '2px 4px', cursor: 'pointer', outline: 'none', width: '100%', maxWidth: '210px', textOverflow: 'ellipsis' }}
                      >
                        <option value="" style={{ background: '#1a1a2e' }}>—</option>
                        {verticalResources.map(r => <option key={r.id} value={r.id} style={{ background: '#1a1a2e' }}>{r.title}</option>)}
                      </select>
                      {!s.related_resource_id && (
                        <div style={{ marginTop: '4px' }}>
                          <button
                            onClick={() => handleFindResourceForSpeaker(s.id)}
                            disabled={findingForSpeakerId === s.id}
                            title="Search the web for a resource by or featuring this speaker"
                            style={{
                              background: 'rgba(139,92,246,0.12)',
                              border: 'none',
                              color: '#8B5CF6',
                              cursor: findingForSpeakerId === s.id ? 'wait' : 'pointer',
                              padding: '3px 6px',
                              borderRadius: '4px',
                              fontSize: '10px',
                              fontWeight: 600,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            {findingForSpeakerId === s.id ? <Loader2 size={10} className="animate-spin" /> : <Search size={10} />}
                            {findingForSpeakerId === s.id ? 'Searching…' : 'Find Resource'}
                          </button>
                          {findResult?.speakerId === s.id && (
                            <div style={{
                              marginTop: '3px',
                              fontSize: '10px',
                              color: findResult.tone === 'ok' ? '#10B981' : findResult.tone === 'warn' ? '#F59E0B' : '#EF4444',
                            }}>{findResult.message}</div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ ...cellStyle, maxWidth: '260px' }}>
                      {speakerTweets.length === 0 ? (
                        <span style={{ color: 'rgb(60, 60, 80)', fontSize: '11px' }}>—</span>
                      ) : speakerTweets.length === 1 ? (
                        <a
                          href={speakerTweets[0].tweet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${speakerTweets[0].text}\n\nScore: ${Math.round(Number(speakerTweets[0].qrt_score))} — ${speakerTweets[0].qrt_reason ?? ''}`}
                          style={{ color: '#3B82F6', textDecoration: 'none', fontSize: '11px', display: 'inline-block', maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle' }}
                        >
                          {speakerTweets[0].posted_at ? `${new Date(speakerTweets[0].posted_at).toISOString().slice(5, 10)} · ` : ''}
                          {speakerTweets[0].text.slice(0, 80)}{speakerTweets[0].text.length > 80 ? '…' : ''}
                        </a>
                      ) : (
                        <select
                          defaultValue={speakerTweets[0].id}
                          onChange={e => {
                            const t = speakerTweets.find(x => x.id === e.target.value);
                            if (t) window.open(t.tweet_url, '_blank', 'noopener');
                          }}
                          title={`${speakerTweets.length} candidate tweets — choose one to open`}
                          style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: '#3B82F6', fontSize: '11px', padding: '2px 4px', cursor: 'pointer', outline: 'none', maxWidth: '250px' }}
                        >
                          {speakerTweets.map(t => (
                            <option key={t.id} value={t.id} style={{ background: '#1a1a2e' }}>
                              {Math.round(Number(t.qrt_score))} · {t.text.slice(0, 60)}{t.text.length > 60 ? '…' : ''}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td style={cellStyle}>
                      {s.resource_relationship ? (
                        <span style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>{s.resource_relationship.replace('_', ' ')}</span>
                      ) : <span style={{ color: 'rgb(60, 60, 80)' }}>—</span>}
                    </td>
                    <td style={cellStyle}>
                      <select
                        value={s.outreach_channel ?? ''}
                        onChange={e => updateSpeakerField.mutate({ id: s.id, field: 'outreach_channel', value: e.target.value || null })}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: 'rgba(255,255,255,0.8)', fontSize: '11px', padding: '2px 4px', cursor: 'pointer', outline: 'none' }}
                      >
                        <option value="" style={{ background: '#1a1a2e' }}>—</option>
                        {OUTREACH_CHANNELS.map(ch => <option key={ch} value={ch} style={{ background: '#1a1a2e' }}>{ch.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td style={cellStyle}>
                      <select
                        value={s.outreach_status}
                        onChange={e => updateSpeakerField.mutate({ id: s.id, field: 'outreach_status', value: e.target.value })}
                        style={{
                          background: `${STATUS_COLORS[s.outreach_status] ?? '#6B7280'}22`,
                          border: `1px solid ${STATUS_COLORS[s.outreach_status] ?? '#6B7280'}44`,
                          borderRadius: '4px',
                          color: STATUS_COLORS[s.outreach_status] ?? '#6B7280',
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '2px 4px',
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        {OUTREACH_STATUSES.map(st => <option key={st} value={st} style={{ background: '#1a1a2e', color: STATUS_COLORS[st] }}>{st.replace('_', ' ')}</option>)}
                      </select>
                    </td>
                    <td style={{ ...cellStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.outreach_notes}</td>
                    <td style={cellStyle}>
                      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                        <button
                          onClick={async () => {
                            const { subject, text, html } = buildOutreachDraft(s, relatedResource, resources);
                            const fullText = `Subject: ${subject}\n\n${text}`;
                            const fullHtml = `<p style="font-weight:600;color:#555;font-size:13px;margin:0 0 12px;">Subject: ${escapeHtml(subject)}</p>${html}`;
                            try {
                              if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
                                await navigator.clipboard.write([
                                  new ClipboardItem({
                                    'text/plain': new Blob([fullText], { type: 'text/plain' }),
                                    'text/html':  new Blob([fullHtml], { type: 'text/html'  }),
                                  }),
                                ]);
                              } else {
                                await navigator.clipboard.writeText(fullText);
                              }
                              setCopiedDraftId(s.id);
                              setTimeout(() => setCopiedDraftId(prev => prev === s.id ? null : prev), 1500);
                            } catch {
                              window.prompt('Copy outreach draft:', fullText);
                            }
                          }}
                          title={relatedResource ? 'Copy outreach draft' : 'No linked resource — draft will have a placeholder'}
                          style={{
                            background: copiedDraftId === s.id ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.12)',
                            border: 'none',
                            color: copiedDraftId === s.id ? '#10B981' : '#3B82F6',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {copiedDraftId === s.id ? <Check size={12} /> : <Copy size={12} />}
                          {copiedDraftId === s.id ? 'Copied' : 'Copy Draft'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!s.email) {
                              alert('No email on file for this speaker. Add an email address first.');
                              return;
                            }
                            const { subject, text, html } = buildOutreachDraft(s, relatedResource, resources);
                            const fullText = `Subject: ${subject}\n\n${text}`;
                            const fullHtml = `<p style="font-weight:600;color:#555;font-size:13px;margin:0 0 12px;">Subject: ${escapeHtml(subject)}</p>${html}`;
                            // Also copy the rich HTML draft to the clipboard so the user
                            // can optionally paste (⌘V) in Gmail to swap the plain-text
                            // URL body for the HTML version with the embedded card image.
                            try {
                              if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
                                await navigator.clipboard.write([
                                  new ClipboardItem({
                                    'text/plain': new Blob([fullText], { type: 'text/plain' }),
                                    'text/html':  new Blob([fullHtml], { type: 'text/html'  }),
                                  }),
                                ]);
                              } else {
                                await navigator.clipboard.writeText(fullText);
                              }
                            } catch {
                              // Clipboard can fail silently — Gmail still opens with the
                              // plain-text body via URL param, so the user isn't blocked.
                            }
                            const gmailUrl = new URL('https://mail.google.com/mail/');
                            if (user?.email) gmailUrl.searchParams.set('authuser', user.email);
                            gmailUrl.searchParams.set('view', 'cm');
                            gmailUrl.searchParams.set('fs', '1');
                            gmailUrl.searchParams.set('to', s.email);
                            gmailUrl.searchParams.set('su', subject);
                            // Gmail compose URL only accepts plain-text bodies. Pre-fill with
                            // the draft text so the user isn't staring at an empty compose
                            // window — they can paste (⌘V) over it to get the rich HTML.
                            gmailUrl.searchParams.set('body', text);
                            window.open(gmailUrl.toString(), '_blank', 'noopener,noreferrer');
                            setSentEmailId(s.id);
                            setTimeout(() => setSentEmailId(prev => prev === s.id ? null : prev), 1500);
                          }}
                          disabled={!s.email}
                          title={
                            !s.email
                              ? 'No email on file — add one first'
                              : 'Copy draft and open Gmail compose — paste (⌘V) after it opens'
                          }
                          style={{
                            background: sentEmailId === s.id ? 'rgba(16,185,129,0.15)' : (s.email ? 'rgba(234,88,12,0.12)' : 'rgba(255,255,255,0.04)'),
                            border: 'none',
                            color: sentEmailId === s.id ? '#10B981' : (s.email ? '#EA580C' : 'rgb(60,60,80)'),
                            cursor: s.email ? 'pointer' : 'not-allowed',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {sentEmailId === s.id ? <Check size={12} /> : <Send size={12} />}
                          {sentEmailId === s.id ? 'Opened' : 'Send Email'}
                        </button>
                        <button
                          onClick={async () => {
                            if (!relatedResource) {
                              alert('No linked resource for this speaker.');
                              return;
                            }
                            const cardUrl = `${window.location.origin}/api/card-section/${relatedResource.id}?v=${Date.now()}`;
                            try {
                              const res = await fetch(cardUrl);
                              if (!res.ok) throw new Error(`HTTP ${res.status}`);
                              const blob = await res.blob();
                              const objectUrl = URL.createObjectURL(blob);
                              const safeName = s.name
                                .replace(/[^\w\s-]/g, '')
                                .trim()
                                .replace(/\s+/g, '-')
                                .toLowerCase();
                              const a = document.createElement('a');
                              a.href = objectUrl;
                              a.download = `nftnyc-${s.vertical_id}-${safeName}.png`;
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                              URL.revokeObjectURL(objectUrl);
                              setDownloadedId(s.id);
                              setTimeout(() => setDownloadedId(prev => prev === s.id ? null : prev), 1500);
                            } catch (e: any) {
                              alert(`Failed to download image: ${e.message || e}`);
                            }
                          }}
                          disabled={!relatedResource}
                          title={
                            !relatedResource
                              ? 'No linked resource for this speaker'
                              : 'Download the card-preview image to drag into Gmail for an inline image'
                          }
                          style={{
                            background: downloadedId === s.id
                              ? 'rgba(16,185,129,0.15)'
                              : (relatedResource ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.04)'),
                            border: 'none',
                            color: downloadedId === s.id
                              ? '#10B981'
                              : (relatedResource ? '#8B5CF6' : 'rgb(60,60,80)'),
                            cursor: relatedResource ? 'pointer' : 'not-allowed',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {downloadedId === s.id ? <Check size={12} /> : <Download size={12} />}
                          {downloadedId === s.id ? 'Saved' : 'Image'}
                        </button>
                        <button onClick={() => { setEditingSpeaker(s); setShowSpeakerForm(true); }} style={{ background: 'none', border: 'none', color: 'rgb(149, 149, 176)', cursor: 'pointer', padding: '4px' }}>
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => { if (window.confirm(`Delete speaker "${s.name}"?`)) deleteSpeaker.mutate(s.id); }} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ─── RESOURCE FORM DIALOG ─── */}
      {showResourceForm && (
        <FormDialog title={editingResource ? 'Edit Resource' : 'Add Resource'} onClose={() => setShowResourceForm(false)}>
          <ResourceForm
            initial={editingResource}
            defaultVertical={activeVertical !== 'all' ? activeVertical : 'ai'}
            onSave={() => { setShowResourceForm(false); queryClient.invalidateQueries({ queryKey: ['admin-resources'] }); }}
          />
        </FormDialog>
      )}

      {/* ─── SPEAKER FORM DIALOG ─── */}
      {showSpeakerForm && (
        <FormDialog title={editingSpeaker ? 'Edit Speaker' : 'Add Speaker'} onClose={() => setShowSpeakerForm(false)}>
          <SpeakerForm
            initial={editingSpeaker}
            defaultVertical={activeVertical !== 'all' ? activeVertical : 'ai'}
            resources={resources}
            onSave={() => { setShowSpeakerForm(false); queryClient.invalidateQueries({ queryKey: ['admin-speakers'] }); }}
          />
        </FormDialog>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function TabPill({ label, color, active, onClick }: { label: string; color?: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '12px',
        fontWeight: 500,
        padding: '0.4rem 0.75rem',
        borderRadius: '6px',
        border: `1px solid ${active ? (color ?? '#3B82F6') : 'rgba(255,255,255,0.08)'}`,
        background: active ? `${color ?? '#3B82F6'}22` : 'transparent',
        color: active ? (color ?? '#3B82F6') : 'rgb(149, 149, 176)',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 150ms',
      }}
    >
      {label}
    </button>
  );
}

function FormDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: '100%',
        maxWidth: '520px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: 'rgb(15, 15, 20)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '12px',
        padding: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', color: '#fff' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgb(149, 149, 176)', cursor: 'pointer' }}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ResourceForm({ initial, defaultVertical, onSave }: { initial: Resource | null; defaultVertical: string; onSave: () => void }) {
  const [form, setForm] = useState({
    vertical_id: initial?.vertical_id ?? defaultVertical,
    title: initial?.title ?? '',
    url: initial?.url ?? '',
    type: initial?.type ?? 'blog',
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    source: initial?.source ?? '',
    topic_tag: initial?.topic_tag ?? '',
    description: initial?.description ?? '',
    image: initial?.image ?? '',
  });
  const [saving, setSaving] = useState(false);
  const [fetchingImage, setFetchingImage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const lastFetchedUrl = useState({ current: '' })[0]; // ref-like via stable object

  /* Auto-fetch og:image when URL field changes (debounced) */
  useEffect(() => {
    // Only auto-fetch if there's no image already set (don't overwrite manual entries or existing images)
    if (form.image || !form.url) return;
    try { new URL(form.url); } catch { return; } // valid URL check
    if (lastFetchedUrl.current === form.url) return;

    const timer = setTimeout(async () => {
      lastFetchedUrl.current = form.url;
      // Special-case YouTube: skip og:image scrape (which returns YT's generic
      // site logo) and use the video's actual thumbnail directly.
      const ytId = getYouTubeId(form.url);
      if (ytId) {
        const ytThumb = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        setForm(f => f.url === form.url && !f.image ? { ...f, image: ytThumb } : f);
        return;
      }
      setFetchingImage(true);
      setImageError(false);
      const img = await fetchOgImage(form.url);
      setFetchingImage(false);
      if (img) {
        setForm(f => f.url === form.url && !f.image ? { ...f, image: img } : f);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [form.url, form.image, lastFetchedUrl]);

  /* Manual re-fetch (force) */
  const handleRefetchImage = async () => {
    if (!form.url) return;
    // YouTube shortcut — derive from videoId, skip the og:image scrape.
    const ytId = getYouTubeId(form.url);
    if (ytId) {
      setForm(f => ({ ...f, image: `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` }));
      return;
    }
    setFetchingImage(true);
    setImageError(false);
    const img = await fetchOgImage(form.url);
    setFetchingImage(false);
    if (img) {
      setForm(f => ({ ...f, image: img }));
    } else {
      alert('No image found for this URL or its root domain.');
    }
  };

  /* Upload custom image to Supabase Storage */
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5 MB.');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'png';
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('resource-images').upload(path, file, {
      cacheControl: '31536000',
      upsert: false,
    });
    setUploading(false);
    if (error) {
      alert(`Upload failed: ${error.message}`);
      return;
    }
    const { data: urlData } = supabase.storage.from('resource-images').getPublicUrl(path);
    if (urlData?.publicUrl) {
      setForm(f => ({ ...f, image: urlData.publicUrl }));
      setImageError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Editing the form is treated as date verification — the user has just
    // looked at and confirmed/typed the publication date.
    const payload = { ...form, status: 'approved', auto_found: false, date_verified: true };
    let error: { message: string } | null = null;
    let savedId: string | null = null;
    if (initial) {
      ({ error } = await supabase.from('resources').update(payload).eq('id', initial.id));
      savedId = initial.id;
    } else {
      const res = await supabase.from('resources').insert(payload).select('id').single();
      error = res.error;
      savedId = res.data?.id ?? null;
    }
    setSaving(false);
    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }
    // Card preview is now rendered dynamically by /api/card-image/<id> on
    // every email open — no pre-generated screenshot needed.
    onSave();
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
        Vertical
        <select value={form.vertical_id} onChange={e => set('vertical_id', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
          {ECOSYSTEMS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Title<input value={form.title} onChange={e => set('title', e.target.value)} required style={{ ...inputStyle, marginTop: '4px' }} /></label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>URL<input value={form.url} onChange={e => set('url', e.target.value)} required type="url" style={{ ...inputStyle, marginTop: '4px' }} /></label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
          Type
          <select value={form.type} onChange={e => set('type', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
            {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Date<input value={form.date} onChange={e => set('date', e.target.value)} type="date" style={{ ...inputStyle, marginTop: '4px' }} /></label>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Source<input value={form.source} onChange={e => set('source', e.target.value)} required style={{ ...inputStyle, marginTop: '4px' }} /></label>
        <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Topic Tag<input value={form.topic_tag} onChange={e => set('topic_tag', e.target.value)} required style={{ ...inputStyle, marginTop: '4px' }} /></label>
      </div>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>NFT Angle (description)<textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} style={{ ...inputStyle, marginTop: '4px', resize: 'vertical' }} /></label>

      {/* ─── Featured Image ─── */}
      <div style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ImageIcon size={12} /> Featured Image
            {fetchingImage && <Loader2 size={12} className="animate-spin" style={{ color: '#3B82F6' }} />}
          </span>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={handleRefetchImage}
              disabled={fetchingImage || !form.url}
              title="Re-fetch image from URL"
              style={{ background: 'rgba(59,130,246,0.12)', border: 'none', color: '#3B82F6', cursor: 'pointer', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', opacity: fetchingImage || !form.url ? 0.4 : 1 }}
            >
              <RefreshCw size={11} /> Fetch
            </button>
            <label
              title="Upload a custom image"
              style={{ background: 'rgba(139,92,246,0.12)', border: 'none', color: '#8B5CF6', cursor: 'pointer', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Upload size={11} /> {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} disabled={uploading} />
            </label>
          </div>
        </div>
        <input
          value={form.image}
          onChange={e => { set('image', e.target.value); setImageError(false); }}
          type="url"
          placeholder="Auto-fetched from link, or paste / upload a custom image"
          style={{ ...inputStyle }}
        />
        {form.image && (
          <div style={{ marginTop: '8px', position: 'relative', borderRadius: '6px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.3)' }}>
            {!imageError ? (
              <img
                src={form.image}
                alt="Preview"
                onError={() => setImageError(true)}
                style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ padding: '1rem', textAlign: 'center', color: '#EF4444', fontSize: '11px' }}>
                Image failed to load. Try re-fetching or uploading a replacement.
              </div>
            )}
            <button
              type="button"
              onClick={() => { set('image', ''); setImageError(false); }}
              title="Remove image"
              style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={12} />
            </button>
          </div>
        )}
      </div>

      <button type="submit" disabled={saving} style={{ ...btnStyle, background: '#3B82F6', color: '#fff', justifyContent: 'center', padding: '0.75rem' }}>
        {saving ? 'Saving...' : initial ? 'Update Resource' : 'Add Resource'}
      </button>
    </form>
  );
}

function SpeakerForm({ initial, defaultVertical, resources, onSave }: { initial: Speaker | null; defaultVertical: string; resources: Resource[]; onSave: () => void }) {
  const [form, setForm] = useState({
    vertical_id: initial?.vertical_id ?? defaultVertical,
    name: initial?.name ?? '',
    role: initial?.role ?? '',
    email: initial?.email ?? '',
    handle: initial?.handle ?? '',
    unable_to_dm: initial?.unable_to_dm ?? false,
    related_resource_id: initial?.related_resource_id ?? '',
    resource_relationship: initial?.resource_relationship ?? '',
    outreach_channel: initial?.outreach_channel ?? '',
    outreach_status: initial?.outreach_status ?? 'not_started',
    outreach_notes: initial?.outreach_notes ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = {
      ...form,
      related_resource_id: form.related_resource_id || null,
      resource_relationship: form.resource_relationship || null,
      outreach_channel: form.outreach_channel || null,
    };
    // Only include email in payload if the user entered one — avoids errors if the column doesn't exist yet
    if (form.email) {
      payload.email = form.email;
    } else {
      delete payload.email;
    }
    let error: { message: string } | null = null;
    if (initial) {
      ({ error } = await supabase.from('speakers').update(payload).eq('id', initial.id));
    } else {
      ({ error } = await supabase.from('speakers').insert(payload));
    }
    setSaving(false);
    if (error) {
      alert(`Save failed: ${error.message}`);
      return;
    }
    onSave();
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
        Vertical
        <select value={form.vertical_id} onChange={e => set('vertical_id', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
          {ECOSYSTEMS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Name<input value={form.name} onChange={e => set('name', e.target.value)} required style={{ ...inputStyle, marginTop: '4px' }} /></label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Role / Company<input value={form.role} onChange={e => set('role', e.target.value)} required style={{ ...inputStyle, marginTop: '4px' }} /></label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Email<input value={form.email} onChange={e => set('email', e.target.value)} type="email" style={{ ...inputStyle, marginTop: '4px' }} /></label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Handle (Twitter/X)<input value={form.handle} onChange={e => set('handle', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }} /></label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.25rem' }}>
        <input
          type="checkbox"
          checked={form.unable_to_dm}
          onChange={e => setForm(f => ({ ...f, unable_to_dm: e.target.checked }))}
          style={{ cursor: 'pointer', accentColor: '#EF4444' }}
        />
        Unable to DM (X profile doesn't accept DMs / closed inbox)
      </label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
        Related Resource
        <select value={form.related_resource_id} onChange={e => set('related_resource_id', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
          <option value="">None</option>
          {resources.filter(r => r.vertical_id === form.vertical_id || !form.vertical_id).map(r => (
            <option key={r.id} value={r.id}>{r.title}</option>
          ))}
        </select>
      </label>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
        Relationship to Resource
        <select value={form.resource_relationship} onChange={e => set('resource_relationship', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
          <option value="">Not set</option>
          {RESOURCE_RELATIONSHIPS.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
        </select>
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
          Outreach Channel
          <select value={form.outreach_channel} onChange={e => set('outreach_channel', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
            <option value="">Not set</option>
            {OUTREACH_CHANNELS.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
        </label>
        <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>
          Status
          <select value={form.outreach_status} onChange={e => set('outreach_status', e.target.value)} style={{ ...inputStyle, marginTop: '4px' }}>
            {OUTREACH_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </label>
      </div>
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Notes<textarea value={form.outreach_notes} onChange={e => set('outreach_notes', e.target.value)} rows={2} style={{ ...inputStyle, marginTop: '4px', resize: 'vertical' }} /></label>
      <button type="submit" disabled={saving} style={{ ...btnStyle, background: '#3B82F6', color: '#fff', justifyContent: 'center', padding: '0.75rem' }}>
        {saving ? 'Saving...' : initial ? 'Update Speaker' : 'Add Speaker'}
      </button>
    </form>
  );
}
