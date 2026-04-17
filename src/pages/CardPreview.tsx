import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ECOSYSTEMS } from '@/data/nftnyc';
import { type VerticalResource } from '@/data/verticalResources';
import ResourceCard from '@/components/ResourceCard';

/**
 * Standalone, screenshot-friendly preview of a single resource card as it
 * appears on its vertical page. Used by the outreach-draft pipeline:
 * Microlink captures this URL and the resulting image is embedded in the
 * email we send to the speaker.
 *
 * Route: /card/:resourceId
 *
 * No site header, footer, or nav — just the "Resources / Latest on X"
 * section header followed by a single ResourceCard.
 */
export default function CardPreview() {
  const { resourceId } = useParams<{ resourceId: string }>();
  const [resource, setResource] = useState<(VerticalResource & { vertical_id: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!resourceId) return;
    (async () => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', resourceId)
        .maybeSingle();
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      if (!data) {
        setError('Resource not found');
        setLoading(false);
        return;
      }
      setResource({
        title: data.title,
        url: data.url,
        type: data.type,
        date: data.date,
        source: data.source,
        topicTag: data.topic_tag,
        description: data.description ?? undefined,
        image: data.image ?? undefined,
        displayOrder: data.display_order ?? null,
        vertical_id: data.vertical_id,
      });
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

  if (error || !resource) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a14', color: 'rgb(149,149,176)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-body)' }}>
        {error ?? 'Resource not found'}
      </div>
    );
  }

  const eco = ECOSYSTEMS.find(e => e.id === resource.vertical_id);
  const color = eco?.color ?? '#3B82F6';
  const verticalName = eco?.name ?? resource.vertical_id;

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

        {/* ── Single card (non-interactive for deterministic screenshots) ── */}
        <ResourceCard resource={resource} color={color} interactive={false} />
      </div>
    </div>
  );
}
