import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ECOSYSTEMS } from '@/data/nftnyc';
import { type VerticalResource } from '@/data/verticalResources';
import ResourceCard from '@/components/ResourceCard';

/**
 * Standalone, screenshot-friendly preview of a resource card as it appears
 * on its vertical page — with neighboring cards so the speaker can see
 * they're featured alongside other industry resources (not in isolation).
 *
 * Route: /card/:resourceId
 *
 * Layout: "Resources / Latest on X" header, then the target resource's
 * card pinned first (guaranteed to be visible in the Microlink viewport),
 * followed by two other approved cards from the same vertical.
 *
 * No site header, footer, or nav — just the section block Microlink
 * captures and embeds in outreach emails.
 */
export default function CardPreview() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [target, setTarget] = useState<(VerticalResource & { vertical_id: string }) | null>(null);
  const [neighbors, setNeighbors] = useState<VerticalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;
    (async () => {
      const { data: own, error: ownErr } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .maybeSingle();
      if (ownErr) { setError(ownErr.message); setLoading(false); return; }
      if (!own) { setError('Resource not found'); setLoading(false); return; }

      const toVR = (r: typeof own): VerticalResource => ({
        title: r.title,
        url: r.url,
        type: r.type,
        date: r.date,
        source: r.source,
        topicTag: r.topic_tag,
        description: r.description ?? undefined,
        image: r.image ?? undefined,
        displayOrder: r.display_order ?? null,
      });

      setTarget({ ...toVR(own), vertical_id: own.vertical_id });

      // Fetch two other approved resources from the same vertical to show
      // context. Prefer ones with images so the screenshot reads well.
      const { data: others } = await supabase
        .from('resources')
        .select('*')
        .eq('vertical_id', own.vertical_id)
        .eq('status', 'approved')
        .neq('id', own.id)
        .not('image', 'is', null)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('date', { ascending: false })
        .limit(2);

      setNeighbors((others ?? []).map(toVR));
      setLoading(false);
    })();
  }, [resourceId]);

  // Match the dark-themed vertical pages exactly
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme');
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.style.background = '#0a0a14';
    return () => {
      if (prev) document.documentElement.setAttribute('data-theme', prev);
      else document.documentElement.removeAttribute('data-theme');
      document.body.style.background = '';
    };
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a14', color: 'rgb(149,149,176)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        Loading preview…
      </div>
    );
  }

  if (error || !target) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a14', color: 'rgb(149,149,176)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        {error ?? 'Resource not found'}
      </div>
    );
  }

  const eco = ECOSYSTEMS.find(e => e.id === target.vertical_id);
  const color = eco?.color ?? '#3B82F6';
  const verticalName = eco?.name ?? target.vertical_id;

  return (
    <div
      style={{
        background: '#0a0a14',
        padding: '48px 32px 56px',
        minHeight: '100vh',
        fontFamily: 'var(--font-body)',
      }}
      data-card-preview
    >
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* ── Section header (matches VerticalPage Resources section) ── */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: 'rgb(90, 90, 117)',
          textAlign: 'center',
          marginBottom: '0.75rem',
        }}>Resources</p>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 700,
          textAlign: 'center',
          letterSpacing: '-0.5px',
          color: 'var(--color-text, #fff)',
          textTransform: 'uppercase',
          marginBottom: '2.5rem',
          margin: '0 0 2.5rem',
        }}>
          Latest on <span style={{ color }}>{verticalName.toLowerCase()}</span>
        </h2>

        {/* ── Cards: speaker's resource first, then 2 neighbors for context ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <ResourceCard resource={target} color={color} interactive={false} />
          {neighbors.map((r, i) => (
            <ResourceCard key={i} resource={r} color={color} interactive={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
