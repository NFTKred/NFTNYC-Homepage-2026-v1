import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { importPostFile, slugify } from '@/lib/blog/import';
import {
  useAdminBlogPosts,
  useCreateBlogPost,
  useDuplicateBlogPost,
  useSetBlogPostStatus,
  useDeleteBlogPost,
} from '@/lib/blog/mutations';
import type { BlogPostRecord } from '@/data/blog/types';
import {
  Plus,
  Pencil,
  Copy,
  Trash2,
  Globe,
  EyeOff,
  ExternalLink,
  FileUp,
  LogOut,
  Loader2,
} from 'lucide-react';

/* ─── Styles (same tokens as src/pages/Admin.tsx) ─── */
const cellStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  fontFamily: 'var(--font-body)',
  fontSize: '13px',
  color: 'rgba(255,255,255,0.8)',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'middle',
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

const iconBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px',
  display: 'inline-flex',
  alignItems: 'center',
};

const STATUS_COLORS: Record<BlogPostRecord['status'], string> = {
  draft: '#F59E0B',
  scheduled: '#A78BFA',
  published: '#10B981',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function BlogList() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const postsQuery = useAdminBlogPosts();
  const createPost = useCreateBlogPost();
  const duplicatePost = useDuplicateBlogPost();
  const setStatus = useSetBlogPostStatus();
  const deletePost = useDeleteBlogPost();

  const posts = postsQuery.data ?? [];
  const importInputRef = useRef<HTMLInputElement | null>(null);

  /** Create a new draft straight from an .md or .html file. */
  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    let imported;
    try {
      imported = importPostFile(file.name, await file.text());
    } catch (err) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
      return;
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
    if (imported.blocks.length === 0) {
      alert(`No content found in ${file.name}.`);
      return;
    }
    const title = imported.title ?? file.name.replace(/\.[^.]+$/, '');
    const input = {
      slug: slugify(title) || `imported-${Date.now().toString(36)}`,
      title,
      subtitle: imported.subtitle ?? null,
      description: imported.description ?? null,
      author: imported.author ?? 'NFT.NYC',
      tag: imported.tag ?? null,
      hero_image_url: imported.hero_image_url ?? null,
      hero_image_alt: imported.hero_image_alt ?? null,
      read_minutes: imported.read_minutes ?? null,
      content: imported.blocks,
    };
    createPost.mutate(input, {
      onSuccess: (post) => navigate(`/admin/blog/${post.id}/edit`),
      onError: (err: Error) => {
        // Slug collision: retry once with a unique suffix.
        if (/duplicate|23505/i.test(err.message)) {
          createPost.mutate(
            { ...input, slug: `${input.slug}-${Date.now().toString(36)}` },
            {
              onSuccess: (post) => navigate(`/admin/blog/${post.id}/edit`),
              onError: (err2: Error) => alert(`Import failed: ${err2.message}`),
            },
          );
        } else {
          alert(`Import failed: ${err.message}`);
        }
      },
    });
  };

  const handleNewPost = () => {
    createPost.mutate(
      {
        slug: `untitled-${Date.now().toString(36)}`,
        title: 'Untitled post',
        author: 'NFT.NYC',
        content: [],
      },
      {
        onSuccess: (post) => navigate(`/admin/blog/${post.id}/edit`),
        onError: (err: Error) => alert(`Could not create post: ${err.message}`),
      },
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(10, 10, 15)', color: '#fff' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          background: 'rgb(10, 10, 15)',
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '18px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Blog Admin
          </h1>
          <Link
            to="/admin"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              color: '#3B82F6',
              textDecoration: 'none',
            }}
          >
            ← Main Admin
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(149, 149, 176)' }}>
            {user?.email}
          </span>
          <button
            onClick={signOut}
            style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgb(149, 149, 176)' }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </header>

      <div style={{ padding: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Posts ({posts.length})
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => importInputRef.current?.click()}
              disabled={createPost.isPending}
              title="Create a draft from a Markdown or HTML file"
              style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}
            >
              <FileUp size={14} /> Import File
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".md,.markdown,.html,.htm,text/markdown,text/html"
              style={{ display: 'none' }}
              onChange={(e) => handleImportFile(e.target.files?.[0])}
            />
            <button
              onClick={handleNewPost}
              disabled={createPost.isPending}
              style={{ ...btnStyle, background: '#3B82F6', color: '#fff' }}
            >
              {createPost.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              New Post
            </button>
          </div>
        </div>

        {postsQuery.isError && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#EF4444', marginBottom: '1rem' }}>
            Could not load posts: {(postsQuery.error as Error).message}
          </p>
        )}

        <div style={{ overflow: 'auto', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 2 }}>
              <tr>
                <th style={headerCellStyle}>Title</th>
                <th style={headerCellStyle}>Slug</th>
                <th style={headerCellStyle}>Status</th>
                <th style={headerCellStyle}>Published</th>
                <th style={headerCellStyle}>Updated</th>
                <th style={{ ...headerCellStyle, width: '200px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {postsQuery.isLoading ? (
                <tr>
                  <td colSpan={6} style={{ ...cellStyle, textAlign: 'center', color: 'rgb(90, 90, 117)' }}>
                    Loading posts…
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ ...cellStyle, textAlign: 'center', color: 'rgb(90, 90, 117)' }}>
                    No posts yet. Create the first one.
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const isPublished = post.status === 'published';
                  return (
                    <tr key={post.id}>
                      <td style={{ ...cellStyle, fontWeight: 600, color: '#fff' }}>
                        <Link
                          to={`/admin/blog/${post.id}/edit`}
                          style={{ color: '#fff', textDecoration: 'none' }}
                        >
                          {post.title}
                        </Link>
                      </td>
                      <td style={{ ...cellStyle, color: 'rgb(149, 149, 176)' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          /blog/{post.slug}
                          {isPublished && (
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Open live post"
                              style={{ color: '#3B82F6', display: 'inline-flex' }}
                            >
                              <ExternalLink size={12} />
                            </a>
                          )}
                        </span>
                      </td>
                      <td style={cellStyle}>
                        <span
                          style={{
                            background: `${STATUS_COLORS[post.status]}1f`,
                            color: STATUS_COLORS[post.status],
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {post.status}
                        </span>
                      </td>
                      <td style={cellStyle}>{formatDate(post.published_at)}</td>
                      <td style={cellStyle}>{formatDate(post.updated_at)}</td>
                      <td style={cellStyle}>
                        <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                          <button
                            onClick={() => navigate(`/admin/blog/${post.id}/edit`)}
                            title="Edit"
                            style={{ ...iconBtnStyle, color: 'rgb(149, 149, 176)' }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() =>
                              duplicatePost.mutate(post, {
                                onError: (err: Error) => alert(`Duplicate failed: ${err.message}`),
                              })
                            }
                            title="Duplicate as draft"
                            style={{ ...iconBtnStyle, color: 'rgb(149, 149, 176)' }}
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setStatus.mutate(
                                { post, status: isPublished ? 'draft' : 'published' },
                                {
                                  onError: (err: Error) =>
                                    alert(`${isPublished ? 'Unpublish' : 'Publish'} failed: ${err.message}`),
                                },
                              )
                            }
                            title={isPublished ? 'Unpublish (back to draft)' : 'Publish'}
                            style={{ ...iconBtnStyle, color: isPublished ? '#F59E0B' : '#10B981' }}
                          >
                            {isPublished ? <EyeOff size={14} /> : <Globe size={14} />}
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete post "${post.title}"? This cannot be undone.`)) {
                                deletePost.mutate(post.id, {
                                  onError: (err: Error) => alert(`Delete failed: ${err.message}`),
                                });
                              }
                            }}
                            title="Delete"
                            style={{ ...iconBtnStyle, color: '#EF4444' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
