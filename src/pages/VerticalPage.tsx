import { useMemo, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { ECOSYSTEMS } from '@/data/nftnyc';
import { VERTICAL_TOPICS, type VerticalTopic } from '@/data/verticalTopics';
import { type VerticalResource } from '@/data/verticalResources';
import { useVerticalResources } from '@/hooks/useVerticalResources';
import EcoIcon from '@/components/EcoIcon';
import ResourceCard from '@/components/ResourceCard';
import {
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

/* ─── Helpers ─── */
function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─── Shared styles ─── */
const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '12px',
  letterSpacing: '4px',
  textTransform: 'uppercase',
  color: 'rgb(90, 90, 117)',
  textAlign: 'center',
  marginBottom: '0.75rem',
};

const sectionHeading: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 700,
  textAlign: 'center',
  letterSpacing: '-0.5px',
  color: 'var(--color-text)',
  textTransform: 'uppercase',
  marginBottom: '2.5rem',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  padding: '24px',
  transition: 'border-color 200ms ease',
};

/* ─── Component ─── */
export default function VerticalPage() {
  const { verticalId } = useParams<{ verticalId: string }>();
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);

  const eco = ECOSYSTEMS.find(e => e.id === verticalId);
  const { data: allResources = [] } = useVerticalResources(verticalId ?? '');

  if (!eco) return <Navigate to="/" replace />;

  const topics = VERTICAL_TOPICS[eco.id] ?? [];
  const resources = allResources
    .sort((a, b) => {
      // Admin-defined order wins. Rows without a display_order fall back
      // to date desc, and sit after all manually-ordered rows.
      const aHas = a.displayOrder != null;
      const bHas = b.displayOrder != null;
      if (aHas && bHas) return (a.displayOrder! - b.displayOrder!);
      if (aHas) return -1;
      if (bHas) return 1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const keyTopics = topics.filter(t => t.status === 'key');
  const emergingTopics = topics.filter(t => t.status === 'emerging');

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const dividerLine = (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 32px' }}>
      <div style={{
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${eco.color}, transparent)`,
        opacity: 0.35,
      }} />
    </div>
  );

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* ─── HERO ─── */}
      <section style={{ padding: '140px 32px 60px', textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}>
        <Link
          to="/#ecosystem"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'rgb(149, 149, 176)',
            textDecoration: 'none',
            marginBottom: '2rem',
            transition: 'color 200ms',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = eco.color)}
          onMouseLeave={e => (e.currentTarget.style.color = 'rgb(149, 149, 176)')}
        >
          <ArrowLeft size={14} /> Back to ecosystem
        </Link>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <EcoIcon ecoId={eco.id} color={eco.color} size={150} />
        </div>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: eco.color,
          marginBottom: '0.75rem',
        }}>
          {eco.subtitle}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          letterSpacing: '-1px',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          lineHeight: 1.1,
          marginBottom: '1.5rem',
        }}>
          {eco.name}
        </h1>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '18px',
          color: 'rgb(149, 149, 176)',
          maxWidth: '640px',
          margin: '0 auto 2rem',
          lineHeight: 1.7,
        }}>
          {eco.desc}
        </p>
        {eco.examples.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
            {eco.examples.map(ex => (
              <span
                key={ex}
                style={{
                  display: 'inline-flex',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  background: hexToRgba(eco.color, 0.12),
                  color: eco.color,
                }}
              >{ex}</span>
            ))}
          </div>
        )}
        {/* Color accent bar */}
        <div style={{
          width: '80px',
          height: '3px',
          background: eco.color,
          borderRadius: '2px',
          margin: '2.5rem auto 0',
          opacity: 0.6,
        }} />
      </section>

      {dividerLine}

      {/* ─── TOPICS ─── */}
      {topics.length > 0 && (
        <section style={{ padding: '80px 32px', maxWidth: '1100px', margin: '0 auto' }}>
          <p style={sectionLabel}>How tokenization fuels this industry</p>
          <h2 style={sectionHeading}>
            Key & emerging <span style={{ color: eco.color }}>topics</span>
          </h2>

          {keyTopics.length > 0 && (
            <>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgb(90, 90, 117)',
                marginBottom: '1rem',
              }}>Key topics</p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '2.5rem',
              }} className="vertical-topics-grid">
                {keyTopics.map(t => (
                  <TopicCard key={t.label} topic={t} color={eco.color} />
                ))}
              </div>
            </>
          )}

          {emergingTopics.length > 0 && (
            <>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: '11px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgb(90, 90, 117)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}>
                <Sparkles size={12} style={{ color: eco.color }} /> Emerging
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
              }} className="vertical-topics-grid">
                {emergingTopics.map(t => (
                  <TopicCard key={t.label} topic={t} color={eco.color} emerging />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {dividerLine}

      {/* ─── RESOURCE FEED ─── */}
      <section style={{ padding: '80px 32px', maxWidth: '900px', margin: '0 auto' }}>
        <p style={sectionLabel}>Resources</p>
        <h2 style={sectionHeading}>
          Latest on <span style={{ color: eco.color }}>{eco.name.toLowerCase()}</span>
        </h2>

        {/* Resource list */}
        {resources.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {resources.map((r, i) => (
              <ResourceCard key={i} resource={r} color={eco.color} />
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: 'center',
            fontFamily: 'var(--font-body)',
            fontSize: '15px',
            color: 'rgb(90, 90, 117)',
            padding: '3rem 0',
          }}>
            Resources coming soon — check back as we build out this vertical.
          </p>
        )}
      </section>

      {dividerLine}

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 32px 100px', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 3.5vw, 36px)',
          fontWeight: 700,
          letterSpacing: '-0.5px',
          textTransform: 'uppercase',
          color: 'var(--color-text)',
          marginBottom: '1rem',
        }}>
          Speak on <span style={{ color: eco.color }}>{eco.name.toLowerCase()}</span>
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '16px',
          color: 'rgb(149, 149, 176)',
          maxWidth: '480px',
          margin: '0 auto 2rem',
          lineHeight: 1.6,
        }}>
          Share your expertise at NFT.NYC 2026. Submit a talk proposal for the {eco.name} track.
        </p>
        <a
          href="https://sessionize.com/nft-nyc-2026/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: '16px',
            color: '#fff',
            background: eco.color,
            border: 'none',
            borderRadius: '50px',
            padding: '14px 36px',
            textDecoration: 'none',
            cursor: 'pointer',
            transition: 'transform 180ms ease, box-shadow 180ms ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${hexToRgba(eco.color, 0.35)}`; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
        >
          Submit to speak
        </a>
      </section>

      <SiteFooter />

      <style>{`
        @media (max-width: 768px) {
          .vertical-topics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

/* ─── Sub-components ─── */

function TopicCard({ topic, color, emerging }: { topic: VerticalTopic; color: string; emerging?: boolean }) {
  return (
    <div
      style={{
        ...cardStyle,
        borderStyle: emerging ? 'dashed' : 'solid',
        borderColor: emerging ? 'rgba(255,255,255,0.08)' : hexToRgba(color, 0.15),
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = hexToRgba(color, 0.3))}
      onMouseLeave={e => (e.currentTarget.style.borderColor = emerging ? 'rgba(255,255,255,0.08)' : hexToRgba(color, 0.15))}
    >
      {emerging && (
        <span style={{
          display: 'inline-block',
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color,
          background: hexToRgba(color, 0.1),
          padding: '2px 8px',
          borderRadius: '4px',
          marginBottom: '0.75rem',
        }}>Emerging</span>
      )}
      <h3 style={{
        fontFamily: 'var(--font-display)',
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--color-text)',
        textTransform: 'uppercase',
        letterSpacing: '-0.01em',
        marginBottom: '0.5rem',
      }}>{topic.label}</h3>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: '14px',
        color: 'rgb(149, 149, 176)',
        lineHeight: 1.6,
      }}>{topic.description}</p>
    </div>
  );
}

function FilterPill({ label, active, color, onClick }: { label: string; active: boolean; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        fontWeight: 500,
        padding: '0.4rem 1rem',
        borderRadius: '50px',
        border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
        background: active ? hexToRgba(color, 0.15) : 'transparent',
        color: active ? color : 'rgb(149, 149, 176)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
      }}
    >
      {label}
    </button>
  );
}

