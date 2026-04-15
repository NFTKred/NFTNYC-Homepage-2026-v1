import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { ECOSYSTEMS } from '@/data/nftnyc';
import { VERTICAL_TOPICS } from '@/data/verticalTopics';
import { Plus, Search, LogOut, Trash2, Pencil, Check, X, Loader2, Copy, GripVertical, Download, Mail } from 'lucide-react';

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

/* ─── Types ─── */
interface Resource {
  id: string;
  vertical_id: string;
  title: string;
  url: string;
  type: string;
  date: string;
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
  related_resource_id: string | null;
  resource_relationship: string | null;
  outreach_channel: string | null;
  outreach_status: string;
  outreach_notes: string | null;
  created_at: string;
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

function buildOutreachDraft(speaker: Speaker, resource: Resource | undefined): string {
  const name = firstName(speaker.name);
  const verticalLabel = VERTICAL_LABEL[speaker.vertical_id] ?? speaker.vertical_id;
  const pageUrl = `${window.location.origin}/${speaker.vertical_id}`;
  // Auto-generated screenshot of the vertical page via Microlink (no API key
  // required). `embed=screenshot.url` returns the image directly so the URL
  // inlines as a preview in most email clients.
  const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(pageUrl)}&screenshot=true&embed=screenshot.url`;

  const resourceLine = resource
    ? `We have featured \u2014 ${resource.title} (${resource.url}) on our NFT.NYC/${verticalLabel} projects page: ${pageUrl}`
    : `We have featured [resource] on our NFT.NYC/${verticalLabel} projects page: ${pageUrl}`;

  return [
    `${name},`,
    '',
    `NFT.NYC 2026 (Sept 1\u20133, The Edison, Times Square) is including interesting ${verticalLabel} tokenization projects.`,
    '',
    resourceLine,
    '',
    screenshotUrl,
  ].join('\n');
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
  const [copiedDraftId, setCopiedDraftId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [crmChecked, setCrmChecked] = useState<Set<string>>(new Set());

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
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-resources'] }),
  });

  const updateSpeakerField = useMutation({
    mutationFn: async ({ id, field, value }: { id: string; field: string; value: string | null }) => {
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

  const resources = resourcesQuery.data ?? [];
  const speakers = speakersQuery.data ?? [];
  const approvedResources = resources.filter(r => r.status === 'approved');
  const pendingResources = resources.filter(r => r.status === 'pending');

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

    const headers = ['Name', 'Role', 'Vertical', 'Email', 'Handle', 'Related Resource', 'Date of Resource', 'Resource Source', 'Related Resource Description', 'Relationship', 'Channel', 'Status', 'Draft'];
    const rows = allSpeakers.map(s => {
      const r = allResources.find(res => res.id === s.related_resource_id);
      const draft = buildOutreachDraft(s, r);
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

      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>

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
          {activeVertical === 'all' && approvedResources.length > 0 && (
            <p style={{ fontSize: '12px', color: 'rgb(149,149,176)', marginBottom: '0.75rem' }}>
              Select a single vertical above to drag-and-drop resources into your preferred order.
            </p>
          )}
          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...headerCellStyle, width: '28px' }}></th>
                  <th style={headerCellStyle}>Title</th>
                  <th style={headerCellStyle}>Vertical</th>
                  <th style={headerCellStyle}>Type</th>
                  <th style={headerCellStyle}>Source</th>
                  <th style={headerCellStyle}>Date</th>
                  <th style={headerCellStyle}>Topic</th>
                  <th style={{ ...headerCellStyle, width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {approvedResources.length === 0 ? (
                  <tr><td colSpan={8} style={{ ...cellStyle, textAlign: 'center', color: 'rgb(90, 90, 117)' }}>No resources yet</td></tr>
                ) : approvedResources.map(r => {
                  const dragEnabled = activeVertical !== 'all';
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
                    <td style={cellStyle}>{r.date}</td>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, textTransform: 'uppercase' }}>
              Speakers & Outreach ({speakers.length})
            </h2>
            <button onClick={() => { setEditingSpeaker(null); setShowSpeakerForm(true); }} style={{ ...btnStyle, background: '#3B82F6', color: '#fff' }}>
              <Plus size={14} /> Add Speaker
            </button>
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Name</th>
                  <th style={headerCellStyle}>Role</th>
                  <th style={headerCellStyle}>Vertical</th>
                  <th style={headerCellStyle}>Email</th>
                  <th style={headerCellStyle}>Handle</th>
                  <th style={headerCellStyle}>Related Resource</th>
                  <th style={headerCellStyle}>Relationship</th>
                  <th style={headerCellStyle}>Channel</th>
                  <th style={headerCellStyle}>Status</th>
                  <th style={headerCellStyle}>Notes</th>
                  <th style={{ ...headerCellStyle, width: '80px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {speakers.length === 0 ? (
                  <tr><td colSpan={11} style={{ ...cellStyle, textAlign: 'center', color: 'rgb(90, 90, 117)' }}>No speakers yet</td></tr>
                ) : speakers.map(s => {
                  const relatedResource = resources.find(r => r.id === s.related_resource_id);
                  const verticalResources = resources.filter(r => r.vertical_id === s.vertical_id);
                  return (
                  <tr key={s.id}>
                    <td style={{ ...cellStyle, fontWeight: 600 }}>{s.name}</td>
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
                    <td style={{ ...cellStyle, maxWidth: '220px' }}>
                      <select
                        value={s.related_resource_id ?? ''}
                        onChange={e => updateSpeakerField.mutate({ id: s.id, field: 'related_resource_id', value: e.target.value || null })}
                        style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '4px', color: s.related_resource_id ? '#3B82F6' : 'rgb(60, 60, 80)', fontSize: '11px', padding: '2px 4px', cursor: 'pointer', outline: 'none', width: '100%', maxWidth: '210px', textOverflow: 'ellipsis' }}
                      >
                        <option value="" style={{ background: '#1a1a2e' }}>—</option>
                        {verticalResources.map(r => <option key={r.id} value={r.id} style={{ background: '#1a1a2e' }}>{r.title}</option>)}
                      </select>
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
                            const draft = buildOutreachDraft(s, relatedResource);
                            try {
                              await navigator.clipboard.writeText(draft);
                              setCopiedDraftId(s.id);
                              setTimeout(() => setCopiedDraftId(prev => prev === s.id ? null : prev), 1500);
                            } catch {
                              window.prompt('Copy outreach draft:', draft);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, status: 'approved', auto_found: false };
    let error: { message: string } | null = null;
    if (initial) {
      ({ error } = await supabase.from('resources').update(payload).eq('id', initial.id));
    } else {
      ({ error } = await supabase.from('resources').insert(payload));
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
      <label style={{ fontSize: '12px', color: 'rgb(149, 149, 176)' }}>Image URL (optional)<input value={form.image} onChange={e => set('image', e.target.value)} type="url" style={{ ...inputStyle, marginTop: '4px' }} /></label>
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
