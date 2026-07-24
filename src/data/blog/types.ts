/**
 * Blog content model.
 *
 * A post's body is a JSONB `content` column on the `blog_posts` table:
 * an ordered array of typed blocks. Every block has a discriminator
 * `type` and a payload specific to that type. Renderers switch on the
 * type; the admin editor renders a matching form per type.
 *
 * When we add a new visual pattern, we add a new block type here, a
 * matching renderer in `src/components/blog/blocks/`, and (in Commit
 * B) a matching editor in `src/components/blog/editor/`. That's the
 * only place drift can happen, which is exactly the point of the
 * block model.
 */

export type BlockAlign = "left" | "center" | "right";

export type ParagraphBlock = {
  type: "paragraph";
  html: string; // inline markup allowed: <strong>, <em>, <a>, <br>
};

export type HeadingBlock = {
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
  eyebrow?: string; // optional small uppercase kicker above
};

export type ImageBlock = {
  type: "image";
  url: string;
  alt: string;
  caption?: string;
  attribution?: string;
  align?: BlockAlign;
};

export type VideoBlock = {
  type: "video";
  url: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  caption?: string;
};

export type QuoteBlock = {
  type: "quote";
  text: string;
  attribution?: string;
};

export type ListItem = { html: string };
export type ListBlock = {
  type: "list";
  style: "bullet" | "ordered";
  items: ListItem[];
};

export type TableBlock = {
  type: "table";
  headers: string[];
  rows: string[][]; // rows[r][c] is a plain-text cell
  caption?: string;
};

export type CalloutBlock = {
  type: "callout";
  kind: "info" | "warning" | "takeaway" | "note";
  title?: string;
  html: string;
};

export type BeforeAfterBlock = {
  type: "before_after";
  before: { url: string; label?: string; alt?: string };
  after: { url: string; label?: string; alt?: string };
  caption?: string;
  tall?: boolean;
};

export type CtaBlock = {
  type: "cta";
  label: string;
  href: string;
  style?: "primary" | "secondary";
  align?: BlockAlign;
};

export type DividerBlock = {
  type: "divider";
  kind?: "line" | "space";
};

/**
 * Escape hatch for one-off article-specific markup. Content is
 * treated as trusted HTML (admin-authored). We do NOT sanitize it,
 * because these blocks are how we preserve the rich interactive
 * pieces on articles like History of Remix. Only admins can create
 * blog posts (RLS enforces this), so the trust boundary is the
 * admin login.
 */
export type CustomHtmlBlock = {
  type: "custom_html";
  html: string;
  /** Optional class hook so renderer can scope styles to the raw
   *  markup - matches the class already used in the article's
   *  standalone CSS file, e.g. `blog-remix`. */
  wrapperClass?: string;
};

export type FaqItem = { q: string; a: string };
export type FaqBlock = {
  type: "faq";
  items: FaqItem[];
};

export type BlogBlock =
  | ParagraphBlock
  | HeadingBlock
  | ImageBlock
  | VideoBlock
  | QuoteBlock
  | ListBlock
  | TableBlock
  | CalloutBlock
  | BeforeAfterBlock
  | CtaBlock
  | DividerBlock
  | CustomHtmlBlock
  | FaqBlock;

/** The row shape returned from Supabase / passed to renderers. */
export interface BlogPostRecord {
  id: string;
  slug: string;
  status: "draft" | "scheduled" | "published";
  title: string;
  subtitle: string | null;
  description: string | null;
  author: string | null;
  tag: string | null;
  hero_image_url: string | null;
  hero_image_alt: string | null;
  og_image_url: string | null;
  read_minutes: number | null;
  content: BlogBlock[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Lightweight shape for list/card surfaces. */
export type BlogPostSummary = Pick<
  BlogPostRecord,
  | "id"
  | "slug"
  | "title"
  | "description"
  | "hero_image_url"
  | "hero_image_alt"
  | "tag"
  | "published_at"
  | "author"
  | "read_minutes"
>;
