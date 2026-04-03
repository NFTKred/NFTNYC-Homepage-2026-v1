import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { FileText } from 'lucide-react';

interface BlogPost {
  title: string;
  description: string;
  slug: string;
  date: string;
  image?: string;
  tag?: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: 'What are XP and Kr?',
    description: 'How hub-branded points and Kredits work — earning XP, graduating to Kredits, and redeeming collectible NFTs.',
    slug: 'xp-and-kredits',
    date: '2026-04-01',
    tag: 'Platform',
  },
];

const ACCENT = '#3B82F6';

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '16px',
  transition: 'border-color 200ms ease',
};

export default function Blogs() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  return (
    <div data-theme={theme} style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      <section style={{ padding: '160px 32px 80px', maxWidth: '900px', margin: '0 auto' }}>
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: '12px',
            letterSpacing: '4px',
            textTransform: 'uppercase',
            color: 'rgb(90, 90, 117)',
            marginBottom: '0.75rem',
          }}>Latest Updates</p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.5px',
            textTransform: 'uppercase',
          }}>Blog</h1>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {BLOG_POSTS.map(post => (
            <Link
              to={`/blog/${post.slug}`}
              key={post.slug}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  ...cardStyle,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  padding: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = hexToRgba(ACCENT, 0.25))}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                {/* Image or gradient header */}
                {post.image ? (
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '200px',
                    overflow: 'hidden',
                    background: `linear-gradient(135deg, ${hexToRgba(ACCENT, 0.08)}, ${hexToRgba(ACCENT, 0.02)})`,
                  }}>
                    <img
                      src={post.image}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
                    }}>Blog</div>
                  </div>
                ) : null}

                {/* Content area */}
                <div style={{ padding: '20px 24px', flex: 1, display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {!post.image && (
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: hexToRgba(ACCENT, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}>
                      <FileText size={18} style={{ color: ACCENT }} />
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h2 style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '15px',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      lineHeight: 1.4,
                      marginBottom: '0.25rem',
                    }}>{post.title}</h2>
                    <p style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '13px',
                      color: 'rgb(149, 149, 176)',
                      lineHeight: 1.5,
                      marginBottom: '0.5rem',
                    }}>{post.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontSize: '11px',
                        color: 'rgb(90, 90, 117)',
                      }}>{formatDate(post.date)}</span>
                      {post.tag && (
                        <>
                          <span style={{ fontSize: '11px', color: 'rgb(60, 60, 80)' }}>·</span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 500,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: hexToRgba(ACCENT, 0.1),
                            color: ACCENT,
                          }}>{post.tag}</span>
                        </>
                      )}
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        color: 'rgb(90, 90, 117)',
                      }}>Blog</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter stage={stage} />
    </div>
  );
}
