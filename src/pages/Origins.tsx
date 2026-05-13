import { useState, useMemo, useEffect } from 'react';
import Header from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import PageMeta from '@/components/PageMeta';
import './Origins.css';

export default function Origins() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    (document.documentElement.getAttribute('data-theme') as 'dark' | 'light') || 'dark'
  );
  const stage = useMemo(() => Number(localStorage.getItem('nftnyc-stage') ?? 0), []);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  };

  useEffect(() => {
    fetch('/origins/content.html')
      .then(r => r.text())
      .then(html => {
        setContent(html);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div
      data-theme={theme}
      style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <PageMeta page="origins" />
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />

      {/* Push content below the fixed site header (banner 36px + header ~56px) */}
      <main style={{ paddingTop: 'calc(56px + 36px)' }}>
        {loading ? (
          <div style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-text-muted)',
            fontSize: 'var(--text-sm)',
          }}>
            Loading&hellip;
          </div>
        ) : (
          <div
            className="origins-article"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
