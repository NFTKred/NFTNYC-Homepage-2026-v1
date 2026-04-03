import { useState, useMemo } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

interface BlogPost {
  title: string;
  description: string;
  slug: string;
}

const BLOG_POSTS: BlogPost[] = [
  {
    title: 'What are T-XP and T-Kr?',
    description: 'How hub-branded points and Kredits work on PeopleBrowsr — earning XP, graduating to Kredits, and redeeming collectible NFTs.',
    slug: 'xp-and-kredits',
  },
];

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

      <section style={{ padding: 'calc(4rem + 56px) 1.5rem 2rem' }}>
        <div className="max-w-[960px] mx-auto">
          <div className="text-center mb-12">
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: 'var(--color-text-faint)',
              marginBottom: '0.75rem',
            }}>Latest Updates</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.75rem, 1rem + 2.5vw, 3rem)',
              fontWeight: 700,
              color: 'var(--color-text)',
              letterSpacing: '-0.02em',
              textTransform: 'uppercase',
            }}>Blog</h1>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {BLOG_POSTS.map(post => (
              <a
                href={`/blogs/${post.slug}`}
                key={post.slug}
                className="blog-pill"
                style={{
                  textDecoration: 'none',
                  padding: '1.5rem 2rem',
                  borderRadius: '9999px',
                  border: '1px solid var(--card-border)',
                  background: 'var(--color-surface)',
                  transition: 'border-color var(--transition-interactive), transform 0.2s ease',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 'clamp(0.9rem, 0.7rem + 0.8vw, 1.1rem)',
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    textTransform: 'uppercase',
                    letterSpacing: '-0.01em',
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>{post.title}</h2>
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 1.5,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>{post.description}</p>
                </div>
                <span style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-primary)',
                  fontWeight: 500,
                  flexShrink: 0,
                }}>Read &rarr;</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .blog-pill:hover {
          border-color: var(--card-border-hover) !important;
          transform: translateY(-2px);
        }
        @media (max-width: 640px) {
          .blog-pill {
            border-radius: 1rem !important;
            padding: 1.25rem 1.5rem !important;
          }
          .blog-pill h2, .blog-pill p {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: unset !important;
          }
        }
      `}</style>

      <SiteFooter stage={stage} />
    </div>
  );
}
