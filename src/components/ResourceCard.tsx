import {
  FileText,
  Play,
  Headphones,
  MessageCircle,
  BookOpen,
  Newspaper,
  ExternalLink,
} from 'lucide-react';
import { type VerticalResource } from '@/data/verticalResources';

/* ─── Helpers ─── */
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const TYPE_META: Record<VerticalResource['type'], { icon: typeof FileText; label: string }> = {
  blog: { icon: FileText, label: 'Blog' },
  youtube: { icon: Play, label: 'YouTube' },
  podcast: { icon: Headphones, label: 'Podcast' },
  tweet: { icon: MessageCircle, label: 'Tweet' },
  paper: { icon: BookOpen, label: 'Paper' },
  news: { icon: Newspaper, label: 'News' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '24px',
  transition: 'border-color 200ms ease',
};

/**
 * Shared resource card used on VerticalPage and the /card/:resourceId preview
 * route (for outreach email screenshots). Interactivity is optional so the
 * preview route can render a static, screenshot-friendly version.
 */
export default function ResourceCard({
  resource,
  color,
  interactive = true,
}: {
  resource: VerticalResource;
  color: string;
  interactive?: boolean;
}) {
  const meta = TYPE_META[resource.type];
  const Icon = meta.icon;
  const ytId = resource.type === 'youtube' ? getYouTubeId(resource.url) : null;

  return (
    <div
      style={{
        ...cardStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '0',
        overflow: 'hidden',
        padding: 0,
      }}
      onMouseEnter={interactive ? (e => (e.currentTarget.style.borderColor = hexToRgba(color, 0.25))) : undefined}
      onMouseLeave={interactive ? (e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')) : undefined}
    >
      {/* YouTube embed or thumbnail */}
      {ytId ? (
        <div style={{ position: 'relative', width: '100%', paddingBottom: '52.36%', background: '#000' }}>
          {interactive ? (
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={resource.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            // Static YouTube thumbnail for screenshotting (no iframe - deterministic render)
            <img
              src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
              alt=""
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', border: 'none' }}
            />
          )}
        </div>
      ) : resource.image ? (
        <a
          href={interactive ? resource.url : undefined}
          target={interactive ? '_blank' : undefined}
          rel={interactive ? 'noopener noreferrer' : undefined}
          style={{
            display: 'block',
            position: 'relative',
            width: '100%',
            aspectRatio: '1.91 / 1',
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${hexToRgba(color, 0.08)}, ${hexToRgba(color, 0.02)})`,
            cursor: interactive ? 'pointer' : 'default',
          }}
        >
          <img
            src={resource.image}
            alt=""
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => {
              // Hide the image container if the image fails to load
              const link = (e.target as HTMLImageElement).closest('a');
              if (link) link.style.display = 'none';
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
          <div style={{
            position: 'absolute',
            top: '0.75rem',
            left: '0.75rem',
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: '#fff',
            opacity: 0.8,
            background: 'rgba(0,0,0,0.4)',
            padding: '2px 8px',
            borderRadius: '4px',
          }}>{meta.label}</div>
        </a>
      ) : null}

      {/* Content area */}
      <div style={{ padding: '20px 24px', flex: 1, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        {!ytId && !resource.image && (
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: hexToRgba(color, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px',
          }}>
            <Icon size={18} style={{ color }} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
        <a
          href={interactive ? resource.url : undefined}
          target={interactive ? '_blank' : undefined}
          rel={interactive ? 'noopener noreferrer' : undefined}
          style={{ textDecoration: 'none', color: 'inherit', cursor: interactive ? 'pointer' : 'default' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{
              fontFamily: 'var(--font-body)',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-text)',
              lineHeight: 1.4,
            }}>
              {resource.title}
            </h3>
            <ExternalLink size={12} style={{ color: 'rgb(90, 90, 117)', flexShrink: 0 }} />
          </div>
        </a>
        {resource.description && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgb(149, 149, 176)',
            lineHeight: 1.5,
            marginBottom: '0.5rem',
          }}><span style={{ color, fontWeight: 600, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>The NFT angle:&nbsp;</span>{resource.description}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'rgb(90, 90, 117)',
          }}>{resource.source}</span>
          <span style={{ fontSize: '11px', color: 'rgb(60, 60, 80)' }}>·</span>
          <span style={{
            fontSize: '11px',
            color: 'rgb(90, 90, 117)',
          }}>{formatDate(resource.date)}</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '4px',
            background: hexToRgba(color, 0.1),
            color,
          }}>{resource.topicTag}</span>
          <span style={{
            fontSize: '10px',
            fontWeight: 500,
            padding: '2px 8px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.05)',
            color: 'rgb(90, 90, 117)',
          }}>{meta.label}</span>
        </div>
        </div>
      </div>
    </div>
  );
}
