import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  useAdminBlogPost,
  useUpdateBlogPost,
  type BlogPostPatch,
} from '@/lib/blog/mutations';
import { uploadBlogMedia } from '@/lib/blog/media';
import { importPostFile, slugify, type ImportedPost } from '@/lib/blog/import';
import type {
  BeforeAfterBlock,
  BlogBlock,
  CalloutBlock,
  CtaBlock,
  CustomHtmlBlock,
  DividerBlock,
  FaqBlock,
  HeadingBlock,
  ImageBlock,
  ListBlock,
  ParagraphBlock,
  QuoteBlock,
  TableBlock,
  VideoBlock,
} from '@/data/blog/types';
import {
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  Globe,
  ExternalLink,
  Upload,
  FileUp,
  Loader2,
  X,
} from 'lucide-react';

/* ============================================================
   Styles (same tokens as src/pages/Admin.tsx)
   ============================================================ */

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

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-body)',
  fontSize: '11px',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: 'rgb(90, 90, 117)',
  marginBottom: '0.35rem',
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
  color: 'rgb(149, 149, 176)',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: '8px',
  padding: '1rem',
};

const STATUS_COLORS: Record<string, string> = {
  draft: '#F59E0B',
  scheduled: '#A78BFA',
  published: '#10B981',
};

/* ============================================================
   Small form field helpers
   ============================================================ */

function TextField({
  label,
  value,
  onChange,
  placeholder,
  onBlur,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  onBlur?: () => void;
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows = 4,
  mono = false,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        style={{
          ...inputStyle,
          resize: 'vertical',
          fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'var(--font-body)',
          lineHeight: 1.5,
        }}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={labelStyle}>{label}</label>
      <select
        style={{ ...inputStyle, cursor: 'pointer' }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: '#1a1a2e', color: '#fff' }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        fontFamily: 'var(--font-body)',
        fontSize: '13px',
        color: 'rgba(255,255,255,0.8)',
        cursor: 'pointer',
        marginRight: '1rem',
        marginBottom: '0.75rem',
      }}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/**
 * URL input + file-upload button backed by the blog-media bucket.
 * Uploading replaces the field value with the resulting public URL.
 */
function UploadField({
  label,
  value,
  onChange,
  folder = 'uploads',
  accept = 'image/*',
  preview = true,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  folder?: string;
  accept?: string;
  preview?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const url = await uploadBlogMedia(file, folder);
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={value}
          placeholder="https://… or upload"
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#3B82F6', flexShrink: 0 }}
        >
          {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
          {uploading ? 'Uploading…' : 'Upload'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {uploadError && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: '#EF4444', marginTop: '0.35rem' }}>
          Upload failed: {uploadError}
        </p>
      )}
      {preview && value && accept.startsWith('image') && (
        <img
          src={value}
          alt=""
          style={{
            marginTop: '0.5rem',
            maxHeight: '120px',
            maxWidth: '100%',
            borderRadius: '6px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />
      )}
    </div>
  );
}

/* ============================================================
   Per-type block edit forms
   ============================================================ */

type BlockFormProps<T extends BlogBlock> = { block: T; onChange: (b: T) => void };

function ParagraphForm({ block, onChange }: BlockFormProps<ParagraphBlock>) {
  return (
    <TextAreaField
      label="HTML (inline markup allowed: <strong>, <em>, <a>, <br>)"
      value={block.html}
      onChange={(html) => onChange({ ...block, html })}
      rows={4}
    />
  );
}

function HeadingForm({ block, onChange }: BlockFormProps<HeadingBlock>) {
  return (
    <>
      <SelectField
        label="Level"
        value={String(block.level)}
        onChange={(v) => onChange({ ...block, level: Number(v) as HeadingBlock['level'] })}
        options={[
          { value: '2', label: 'H2' },
          { value: '3', label: 'H3' },
          { value: '4', label: 'H4' },
        ]}
      />
      <TextField label="Text" value={block.text} onChange={(text) => onChange({ ...block, text })} />
      <TextField
        label="Eyebrow (optional kicker above)"
        value={block.eyebrow ?? ''}
        onChange={(eyebrow) => onChange({ ...block, eyebrow: eyebrow || undefined })}
      />
    </>
  );
}

function ImageForm({ block, onChange }: BlockFormProps<ImageBlock>) {
  return (
    <>
      <UploadField label="Image" value={block.url} onChange={(url) => onChange({ ...block, url })} folder="images" />
      <TextField label="Alt text" value={block.alt} onChange={(alt) => onChange({ ...block, alt })} />
      <TextField
        label="Caption (optional)"
        value={block.caption ?? ''}
        onChange={(caption) => onChange({ ...block, caption: caption || undefined })}
      />
      <TextField
        label="Attribution (optional)"
        value={block.attribution ?? ''}
        onChange={(attribution) => onChange({ ...block, attribution: attribution || undefined })}
      />
      <SelectField
        label="Align"
        value={block.align ?? 'center'}
        onChange={(v) => onChange({ ...block, align: v as ImageBlock['align'] })}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
    </>
  );
}

function VideoForm({ block, onChange }: BlockFormProps<VideoBlock>) {
  return (
    <>
      <UploadField
        label="Video"
        value={block.url}
        onChange={(url) => onChange({ ...block, url })}
        folder="videos"
        accept="video/*"
        preview={false}
      />
      <UploadField
        label="Poster image (optional)"
        value={block.poster ?? ''}
        onChange={(poster) => onChange({ ...block, poster: poster || undefined })}
        folder="videos"
      />
      <div>
        <CheckboxField
          label="Autoplay"
          checked={block.autoplay ?? true}
          onChange={(autoplay) => onChange({ ...block, autoplay })}
        />
        <CheckboxField label="Loop" checked={block.loop ?? true} onChange={(loop) => onChange({ ...block, loop })} />
        <CheckboxField label="Muted" checked={block.muted ?? true} onChange={(muted) => onChange({ ...block, muted })} />
        <CheckboxField
          label="Controls"
          checked={block.controls ?? false}
          onChange={(controls) => onChange({ ...block, controls })}
        />
      </div>
      <TextField
        label="Caption (optional)"
        value={block.caption ?? ''}
        onChange={(caption) => onChange({ ...block, caption: caption || undefined })}
      />
    </>
  );
}

function QuoteForm({ block, onChange }: BlockFormProps<QuoteBlock>) {
  return (
    <>
      <TextAreaField label="Quote text" value={block.text} onChange={(text) => onChange({ ...block, text })} rows={3} />
      <TextField
        label="Attribution (optional)"
        value={block.attribution ?? ''}
        onChange={(attribution) => onChange({ ...block, attribution: attribution || undefined })}
      />
    </>
  );
}

function ListForm({ block, onChange }: BlockFormProps<ListBlock>) {
  const setItem = (i: number, html: string) => {
    const items = block.items.map((item, idx) => (idx === i ? { html } : item));
    onChange({ ...block, items });
  };
  return (
    <>
      <SelectField
        label="Style"
        value={block.style}
        onChange={(v) => onChange({ ...block, style: v as ListBlock['style'] })}
        options={[
          { value: 'bullet', label: 'Bullet' },
          { value: 'ordered', label: 'Ordered (numbered)' },
        ]}
      />
      <label style={labelStyle}>Items (inline HTML allowed)</label>
      {block.items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <input style={{ ...inputStyle, flex: 1 }} value={item.html} onChange={(e) => setItem(i, e.target.value)} />
          <button
            type="button"
            title="Remove item"
            onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
            style={{ ...iconBtnStyle, color: '#EF4444' }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...block, items: [...block.items, { html: '' }] })}
        style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', padding: '0.35rem 0.75rem' }}
      >
        <Plus size={13} /> Add item
      </button>
    </>
  );
}

function TableForm({ block, onChange }: BlockFormProps<TableBlock>) {
  // Local text state so typing isn't fought by the parse/serialize
  // round trip. Cells are separated by | and rows by newlines.
  const [headersText, setHeadersText] = useState(block.headers.join(' | '));
  const [rowsText, setRowsText] = useState(block.rows.map((r) => r.join(' | ')).join('\n'));

  const push = (h: string, r: string) => {
    onChange({
      ...block,
      headers: h.split('|').map((s) => s.trim()),
      rows: r
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => line.split('|').map((s) => s.trim())),
    });
  };

  return (
    <>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Headers (separate columns with |)</label>
        <input
          style={inputStyle}
          value={headersText}
          onChange={(e) => {
            setHeadersText(e.target.value);
            push(e.target.value, rowsText);
          }}
        />
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Rows (one per line, cells separated with |)</label>
        <textarea
          style={{ ...inputStyle, resize: 'vertical', fontFamily: 'ui-monospace, Menlo, monospace', lineHeight: 1.5 }}
          rows={5}
          value={rowsText}
          onChange={(e) => {
            setRowsText(e.target.value);
            push(headersText, e.target.value);
          }}
        />
      </div>
      <TextField
        label="Caption (optional)"
        value={block.caption ?? ''}
        onChange={(caption) => onChange({ ...block, caption: caption || undefined })}
      />
    </>
  );
}

function CalloutForm({ block, onChange }: BlockFormProps<CalloutBlock>) {
  return (
    <>
      <SelectField
        label="Kind"
        value={block.kind}
        onChange={(v) => onChange({ ...block, kind: v as CalloutBlock['kind'] })}
        options={[
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'takeaway', label: 'Takeaway' },
          { value: 'note', label: 'Note' },
        ]}
      />
      <TextField
        label="Title (optional)"
        value={block.title ?? ''}
        onChange={(title) => onChange({ ...block, title: title || undefined })}
      />
      <TextAreaField
        label="Body HTML"
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        rows={3}
      />
    </>
  );
}

function BeforeAfterForm({ block, onChange }: BlockFormProps<BeforeAfterBlock>) {
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <UploadField
            label="Before image"
            value={block.before.url}
            onChange={(url) => onChange({ ...block, before: { ...block.before, url } })}
            folder="before-after"
          />
          <TextField
            label="Before label"
            value={block.before.label ?? ''}
            onChange={(label) => onChange({ ...block, before: { ...block.before, label: label || undefined } })}
          />
          <TextField
            label="Before alt"
            value={block.before.alt ?? ''}
            onChange={(alt) => onChange({ ...block, before: { ...block.before, alt: alt || undefined } })}
          />
        </div>
        <div>
          <UploadField
            label="After image"
            value={block.after.url}
            onChange={(url) => onChange({ ...block, after: { ...block.after, url } })}
            folder="before-after"
          />
          <TextField
            label="After label"
            value={block.after.label ?? ''}
            onChange={(label) => onChange({ ...block, after: { ...block.after, label: label || undefined } })}
          />
          <TextField
            label="After alt"
            value={block.after.alt ?? ''}
            onChange={(alt) => onChange({ ...block, after: { ...block.after, alt: alt || undefined } })}
          />
        </div>
      </div>
      <TextField
        label="Caption (optional)"
        value={block.caption ?? ''}
        onChange={(caption) => onChange({ ...block, caption: caption || undefined })}
      />
      <CheckboxField label="Tall layout" checked={block.tall ?? false} onChange={(tall) => onChange({ ...block, tall })} />
    </>
  );
}

function CtaForm({ block, onChange }: BlockFormProps<CtaBlock>) {
  return (
    <>
      <TextField label="Label" value={block.label} onChange={(label) => onChange({ ...block, label })} />
      <TextField
        label="Href (internal path or https:// URL)"
        value={block.href}
        onChange={(href) => onChange({ ...block, href })}
      />
      <SelectField
        label="Style"
        value={block.style ?? 'primary'}
        onChange={(v) => onChange({ ...block, style: v as CtaBlock['style'] })}
        options={[
          { value: 'primary', label: 'Primary' },
          { value: 'secondary', label: 'Secondary' },
        ]}
      />
      <SelectField
        label="Align"
        value={block.align ?? 'left'}
        onChange={(v) => onChange({ ...block, align: v as CtaBlock['align'] })}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
    </>
  );
}

function DividerForm({ block, onChange }: BlockFormProps<DividerBlock>) {
  return (
    <SelectField
      label="Kind"
      value={block.kind ?? 'line'}
      onChange={(v) => onChange({ ...block, kind: v as DividerBlock['kind'] })}
      options={[
        { value: 'line', label: 'Line' },
        { value: 'space', label: 'Space only' },
      ]}
    />
  );
}

function CustomHtmlForm({ block, onChange }: BlockFormProps<CustomHtmlBlock>) {
  return (
    <>
      <TextAreaField
        label="Raw HTML (trusted, rendered as-is)"
        value={block.html}
        onChange={(html) => onChange({ ...block, html })}
        rows={8}
        mono
      />
      <TextField
        label="Wrapper class (optional, scopes article-specific CSS, e.g. blog-remix)"
        value={block.wrapperClass ?? ''}
        onChange={(wrapperClass) => onChange({ ...block, wrapperClass: wrapperClass || undefined })}
      />
    </>
  );
}

function FaqForm({ block, onChange }: BlockFormProps<FaqBlock>) {
  const setItem = (i: number, patch: Partial<FaqBlock['items'][number]>) => {
    const items = block.items.map((item, idx) => (idx === i ? { ...item, ...patch } : item));
    onChange({ ...block, items });
  };
  return (
    <>
      {block.items.map((item, i) => (
        <div
          key={i}
          style={{
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '6px',
            padding: '0.75rem',
            marginBottom: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ ...labelStyle, marginBottom: 0 }}>Q&A {i + 1}</span>
            <button
              type="button"
              title="Remove Q&A"
              onClick={() => onChange({ ...block, items: block.items.filter((_, idx) => idx !== i) })}
              style={{ ...iconBtnStyle, color: '#EF4444' }}
            >
              <X size={14} />
            </button>
          </div>
          <TextField label="Question" value={item.q} onChange={(q) => setItem(i, { q })} />
          <TextAreaField label="Answer" value={item.a} onChange={(a) => setItem(i, { a })} rows={2} />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange({ ...block, items: [...block.items, { q: '', a: '' }] })}
        style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', padding: '0.35rem 0.75rem' }}
      >
        <Plus size={13} /> Add Q&A
      </button>
    </>
  );
}

/** Dispatch to the per-type form. Exhaustive over the BlogBlock union:
 *  adding a block type without a form here fails TS compilation. */
function BlockForm({ block, onChange }: { block: BlogBlock; onChange: (b: BlogBlock) => void }) {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphForm block={block} onChange={onChange} />;
    case 'heading':
      return <HeadingForm block={block} onChange={onChange} />;
    case 'image':
      return <ImageForm block={block} onChange={onChange} />;
    case 'video':
      return <VideoForm block={block} onChange={onChange} />;
    case 'quote':
      return <QuoteForm block={block} onChange={onChange} />;
    case 'list':
      return <ListForm block={block} onChange={onChange} />;
    case 'table':
      return <TableForm block={block} onChange={onChange} />;
    case 'callout':
      return <CalloutForm block={block} onChange={onChange} />;
    case 'before_after':
      return <BeforeAfterForm block={block} onChange={onChange} />;
    case 'cta':
      return <CtaForm block={block} onChange={onChange} />;
    case 'divider':
      return <DividerForm block={block} onChange={onChange} />;
    case 'custom_html':
      return <CustomHtmlForm block={block} onChange={onChange} />;
    case 'faq':
      return <FaqForm block={block} onChange={onChange} />;
    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

/* ============================================================
   Block palette
   ============================================================ */

const BLOCK_DEFAULTS: { [K in BlogBlock['type']]: () => BlogBlock } = {
  paragraph: () => ({ type: 'paragraph', html: '' }),
  heading: () => ({ type: 'heading', level: 2, text: '' }),
  image: () => ({ type: 'image', url: '', alt: '' }),
  video: () => ({ type: 'video', url: '' }),
  quote: () => ({ type: 'quote', text: '' }),
  list: () => ({ type: 'list', style: 'bullet', items: [{ html: '' }] }),
  table: () => ({ type: 'table', headers: ['Column 1', 'Column 2'], rows: [['', '']] }),
  callout: () => ({ type: 'callout', kind: 'info', html: '' }),
  before_after: () => ({ type: 'before_after', before: { url: '' }, after: { url: '' } }),
  cta: () => ({ type: 'cta', label: '', href: '' }),
  divider: () => ({ type: 'divider', kind: 'line' }),
  custom_html: () => ({ type: 'custom_html', html: '' }),
  faq: () => ({ type: 'faq', items: [{ q: '', a: '' }] }),
};

const BLOCK_TYPE_LABELS: { [K in BlogBlock['type']]: string } = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  image: 'Image',
  video: 'Video',
  quote: 'Quote',
  list: 'List',
  table: 'Table',
  callout: 'Callout',
  before_after: 'Before / After',
  cta: 'CTA',
  divider: 'Divider',
  custom_html: 'Custom HTML',
  faq: 'FAQ',
};

const BLOCK_TYPES = Object.keys(BLOCK_DEFAULTS) as BlogBlock['type'][];

/* ============================================================
   Editor page
   ============================================================ */

/** Blocks carry a client-side uid so React keys survive reordering
 *  and per-block local state (e.g. TableForm text) stays attached. */
type EditorBlock = { uid: string; block: BlogBlock };

type MetaState = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  author: string;
  tag: string;
  hero_image_url: string;
  hero_image_alt: string;
  og_image_url: string;
  read_minutes: string;
};

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const postQuery = useAdminBlogPost(id);
  const updatePost = useUpdateBlogPost();

  const post = postQuery.data;

  const [meta, setMeta] = useState<MetaState | null>(null);
  const [blocks, setBlocks] = useState<EditorBlock[]>([]);
  const [initializedId, setInitializedId] = useState<string | null>(null);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (post && post.id !== initializedId) {
      setMeta({
        slug: post.slug,
        title: post.title,
        subtitle: post.subtitle ?? '',
        description: post.description ?? '',
        author: post.author ?? '',
        tag: post.tag ?? '',
        hero_image_url: post.hero_image_url ?? '',
        hero_image_alt: post.hero_image_alt ?? '',
        og_image_url: post.og_image_url ?? '',
        read_minutes: post.read_minutes != null ? String(post.read_minutes) : '',
      });
      setBlocks(post.content.map((block) => ({ uid: crypto.randomUUID(), block })));
      setInitializedId(post.id);
    }
  }, [post, initializedId]);

  const setMetaField = (field: keyof MetaState, value: string) =>
    setMeta((m) => (m ? { ...m, [field]: value } : m));

  const updateBlock = (uid: string, block: BlogBlock) =>
    setBlocks((bs) => bs.map((b) => (b.uid === uid ? { ...b, block } : b)));

  const moveBlock = (uid: string, dir: -1 | 1) =>
    setBlocks((bs) => {
      const i = bs.findIndex((b) => b.uid === uid);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= bs.length) return bs;
      const next = bs.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const deleteBlock = (uid: string) => setBlocks((bs) => bs.filter((b) => b.uid !== uid));

  const addBlock = (type: BlogBlock['type']) =>
    setBlocks((bs) => [...bs, { uid: crypto.randomUUID(), block: BLOCK_DEFAULTS[type]() }]);

  /**
   * Import an .md or .html file: converted blocks replace (or append
   * to) the current block list, and any metadata found in the file
   * fills fields that are still empty. Nothing is saved until Save
   * Draft / Publish.
   */
  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setImportError(null);
    let imported: ImportedPost;
    try {
      imported = importPostFile(file.name, await file.text());
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
      return;
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
    if (imported.blocks.length === 0) {
      setImportError(`No content found in ${file.name}.`);
      return;
    }
    let replace = true;
    if (blocks.length > 0) {
      replace = window.confirm(
        `Replace the ${blocks.length} existing block(s) with ${imported.blocks.length} imported block(s) from ${file.name}?\n\nOK = replace, Cancel = append below the existing blocks.`,
      );
    }
    const importedBlocks = imported.blocks.map((block) => ({ uid: crypto.randomUUID(), block }));
    setBlocks((bs) => (replace ? importedBlocks : [...bs, ...importedBlocks]));
    setMeta((m) => {
      if (!m) return m;
      const next = { ...m };
      if (imported.title && (!next.title.trim() || next.title === 'Untitled post')) {
        next.title = imported.title;
        if (next.slug.startsWith('untitled-')) next.slug = slugify(imported.title);
      }
      if (imported.subtitle && !next.subtitle.trim()) next.subtitle = imported.subtitle;
      if (imported.description && !next.description.trim()) next.description = imported.description;
      if (imported.author && !next.author.trim()) next.author = imported.author;
      if (imported.tag && !next.tag.trim()) next.tag = imported.tag;
      if (imported.hero_image_url && !next.hero_image_url.trim()) next.hero_image_url = imported.hero_image_url;
      if (imported.hero_image_alt && !next.hero_image_alt.trim()) next.hero_image_alt = imported.hero_image_alt;
      if (imported.read_minutes && !next.read_minutes.trim()) next.read_minutes = String(imported.read_minutes);
      return next;
    });
    setSavedNote(`Imported ${imported.blocks.length} blocks from ${file.name} - review, then save`);
    setTimeout(() => setSavedNote(null), 6000);
  };

  const buildPatch = (status: BlogPostRecord['status']): BlogPostPatch => {
    const m = meta!;
    const readMinutes = parseInt(m.read_minutes, 10);
    const patch: BlogPostPatch = {
      slug: slugify(m.slug) || post!.slug,
      status,
      title: m.title.trim() || 'Untitled post',
      subtitle: m.subtitle.trim() || null,
      description: m.description.trim() || null,
      author: m.author.trim() || null,
      tag: m.tag.trim() || null,
      hero_image_url: m.hero_image_url.trim() || null,
      hero_image_alt: m.hero_image_alt.trim() || null,
      og_image_url: m.og_image_url.trim() || null,
      read_minutes: Number.isFinite(readMinutes) && readMinutes > 0 ? readMinutes : null,
      content: blocks.map((b) => b.block),
    };
    if (status === 'published' && !post!.published_at) {
      patch.published_at = new Date().toISOString();
    }
    return patch;
  };

  /**
   * Preview = save with the current status, then open /blog/:slug.
   * Drafts render there for logged-in admins (RLS gates everyone
   * else). The tab opens synchronously so popup blockers see it as
   * part of the click, and navigates once the save lands.
   */
  const handlePreview = () => {
    if (!post || !meta) return;
    const win = window.open('', '_blank');
    updatePost.mutate(
      { id: post.id, patch: buildPatch(post.status) },
      {
        onSuccess: (updated) => {
          setMetaField('slug', updated.slug);
          setSavedNote('Saved');
          setTimeout(() => setSavedNote(null), 3000);
          const url = `/blog/${updated.slug}`;
          if (win) win.location.href = url;
          else window.open(url, '_blank');
        },
        onError: (err: Error) => {
          win?.close();
          alert(`Could not save before preview: ${err.message}`);
        },
      },
    );
  };

  const save = (status: 'draft' | 'published') => {
    if (!post || !meta) return;
    updatePost.mutate(
      { id: post.id, patch: buildPatch(status) },
      {
        onSuccess: (updated) => {
          // Reflect any server-side normalization (slug) back into the form
          setMetaField('slug', updated.slug);
          setSavedNote(status === 'published' ? 'Published' : 'Draft saved');
          setTimeout(() => setSavedNote(null), 3000);
        },
        onError: (err: Error) => alert(`Save failed: ${err.message}`),
      },
    );
  };

  if (postQuery.isLoading || (post && !meta)) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgb(10, 10, 15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgb(149, 149, 176)', fontFamily: 'var(--font-body)' }}>
        Loading post…
      </div>
    );
  }

  if (postQuery.isError || !post || !meta) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgb(10, 10, 15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: 'rgb(149, 149, 176)', fontFamily: 'var(--font-body)' }}>
        <p>{postQuery.isError ? `Could not load post: ${(postQuery.error as Error).message}` : 'Post not found.'}</p>
        <Link to="/admin/blog" style={{ color: '#3B82F6' }}>← Back to posts</Link>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[post.status] ?? '#6B7280';

  return (
    <div style={{ minHeight: '100vh', background: 'rgb(10, 10, 15)', color: '#fff' }}>
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '1rem 2rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky',
          top: 0,
          background: 'rgb(10, 10, 15)',
          zIndex: 50,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: 0 }}>
          <Link
            to="/admin/blog"
            style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#3B82F6', textDecoration: 'none', flexShrink: 0 }}
          >
            ← Posts
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '16px',
              fontWeight: 700,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {meta.title || 'Untitled post'}
          </h1>
          <span
            style={{
              background: `${statusColor}1f`,
              color: statusColor,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontFamily: 'var(--font-body)',
              flexShrink: 0,
            }}
          >
            {post.status}
          </span>
          {savedNote && (
            <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#10B981', flexShrink: 0 }}>
              {savedNote}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button
            onClick={handlePreview}
            disabled={updatePost.isPending}
            title="Save, then open /blog/:slug in a new tab. Drafts are visible there to logged-in admins only."
            style={{ ...btnStyle, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
          >
            <ExternalLink size={14} /> Preview
          </button>
          <button
            onClick={() => save('draft')}
            disabled={updatePost.isPending}
            style={{ ...btnStyle, background: 'rgba(245,158,11,0.15)', color: '#F59E0B' }}
          >
            {updatePost.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button
            onClick={() => save('published')}
            disabled={updatePost.isPending}
            style={{ ...btnStyle, background: '#10B981', color: '#fff' }}
          >
            {updatePost.isPending ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
            Publish
          </button>
        </div>
      </header>

      <div style={{ padding: '2rem', maxWidth: '860px', margin: '0 auto' }}>
        {/* ─── Metadata ─── */}
        <section style={{ ...cardStyle, marginBottom: '1.5rem' }}>
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              marginBottom: '1rem',
            }}
          >
            Metadata
          </h2>
          <TextField label="Title" value={meta.title} onChange={(v) => setMetaField('title', v)} />
          <TextField
            label="Slug (/blog/…)"
            value={meta.slug}
            onChange={(v) => setMetaField('slug', v)}
            onBlur={() => setMetaField('slug', slugify(meta.slug))}
          />
          <TextField label="Subtitle" value={meta.subtitle} onChange={(v) => setMetaField('subtitle', v)} />
          <TextAreaField
            label="Description (meta / og:description / blog card)"
            value={meta.description}
            onChange={(v) => setMetaField('description', v)}
            rows={2}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <TextField label="Author" value={meta.author} onChange={(v) => setMetaField('author', v)} />
            <TextField label="Tag" value={meta.tag} onChange={(v) => setMetaField('tag', v)} placeholder="e.g. TS Challenge" />
            <TextField label="Read minutes" value={meta.read_minutes} onChange={(v) => setMetaField('read_minutes', v)} placeholder="e.g. 6" />
          </div>
          <UploadField label="Hero image" value={meta.hero_image_url} onChange={(v) => setMetaField('hero_image_url', v)} folder="heroes" />
          <TextField label="Hero image alt" value={meta.hero_image_alt} onChange={(v) => setMetaField('hero_image_alt', v)} />
          <UploadField label="OG image (social unfurls; falls back to hero)" value={meta.og_image_url} onChange={(v) => setMetaField('og_image_url', v)} folder="og" />
        </section>

        {/* ─── Blocks ─── */}
        <section>
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
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Content Blocks ({blocks.length})
            </h2>
            <button
              onClick={() => importInputRef.current?.click()}
              title="Import a Markdown or HTML file - headings, paragraphs, tables, lists, quotes, and images become matching blocks; anything bespoke lands in custom_html."
              style={{ ...btnStyle, background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}
            >
              <FileUp size={14} /> Import MD/HTML
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept=".md,.markdown,.html,.htm,text/markdown,text/html"
              style={{ display: 'none' }}
              onChange={(e) => handleImportFile(e.target.files?.[0])}
            />
          </div>

          {importError && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: '#EF4444', marginBottom: '1rem' }}>
              Import failed: {importError}
            </p>
          )}

          {blocks.length === 0 && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgb(90, 90, 117)', marginBottom: '1rem' }}>
              No blocks yet. Add the first one below.
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {blocks.map(({ uid, block }, i) => (
              <div key={uid} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: '#3B82F6',
                    }}
                  >
                    {i + 1}. {BLOCK_TYPE_LABELS[block.type]}
                  </span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => moveBlock(uid, -1)}
                      disabled={i === 0}
                      title="Move up"
                      style={{ ...iconBtnStyle, opacity: i === 0 ? 0.3 : 1, cursor: i === 0 ? 'default' : 'pointer' }}
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveBlock(uid, 1)}
                      disabled={i === blocks.length - 1}
                      title="Move down"
                      style={{ ...iconBtnStyle, opacity: i === blocks.length - 1 ? 0.3 : 1, cursor: i === blocks.length - 1 ? 'default' : 'pointer' }}
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      onClick={() => deleteBlock(uid)}
                      title="Delete block"
                      style={{ ...iconBtnStyle, color: '#EF4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <BlockForm block={block} onChange={(b) => updateBlock(uid, b)} />
              </div>
            ))}
          </div>

          {/* ─── Add block palette ─── */}
          <div style={{ marginTop: '1.5rem' }}>
            <label style={labelStyle}>Add block</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {BLOCK_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  style={{
                    ...btnStyle,
                    background: 'rgba(59,130,246,0.1)',
                    color: '#3B82F6',
                    border: '1px solid rgba(59,130,246,0.25)',
                    padding: '0.4rem 0.75rem',
                  }}
                >
                  <Plus size={13} /> {BLOCK_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
