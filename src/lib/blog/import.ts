import type {
  BlogBlock,
  CalloutBlock,
  HeadingBlock,
  ListBlock,
} from "@/data/blog/types";

/**
 * Import a Markdown or HTML file as blog blocks + metadata.
 *
 * HTML is the canonical path: the document is walked with DOMParser
 * and each top-level element maps to the closest block type, with
 * custom_html as the escape hatch for anything bespoke. Markdown is
 * parsed directly (headings, paragraphs, lists, GFM tables, quotes,
 * callouts, images, fences, dividers, raw HTML islands) - no
 * markdown dependency, so the bun.lock stays untouched.
 *
 * Content is admin-authored, matching the trust model documented on
 * CustomHtmlBlock in src/data/blog/types.ts - nothing is sanitized.
 */

export interface ImportedPost {
  title?: string;
  subtitle?: string;
  description?: string;
  author?: string;
  tag?: string;
  hero_image_url?: string;
  hero_image_alt?: string;
  read_minutes?: number;
  blocks: BlogBlock[];
}

/** Kebab-case a title into a /blog/:slug segment. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Dispatch on file extension. Throws on unsupported types. */
export function importPostFile(fileName: string, text: string): ImportedPost {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (ext === "md" || ext === "markdown") return markdownToPost(text);
  if (ext === "html" || ext === "htm") return htmlToPost(text);
  throw new Error(`Unsupported file type ".${ext}" - use .md or .html`);
}

/* ============================================================
   Shared helpers
   ============================================================ */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clampHeading(level: number): HeadingBlock["level"] {
  return Math.min(4, Math.max(2, level)) as HeadingBlock["level"];
}

function estimateReadMinutes(text: string): number {
  const words = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

function deriveDescription(blocks: BlogBlock[]): string | undefined {
  const p = blocks.find((b) => b.type === "paragraph");
  if (!p || p.type !== "paragraph") return undefined;
  const text = p.html.replace(/<[^>]+>/g, "").trim();
  if (!text) return undefined;
  if (text.length <= 200) return text;
  return text.slice(0, 200).replace(/\s+\S*$/, "") + "…";
}

function plainTextOfBlocks(blocks: BlogBlock[]): string {
  return blocks
    .map((b) => JSON.stringify(b).replace(/<[^>]+>/g, " "))
    .join(" ");
}

/* ============================================================
   Markdown
   ============================================================ */

/** Inline markdown -> inline HTML (code, images, links, bold, italic). */
export function mdInline(src: string): string {
  // Pull code spans out first so their contents are never formatted.
  const codeSpans: string[] = [];
  let s = src.replace(/`([^`]+)`/g, (_, code: string) => {
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return `\uE000${codeSpans.length - 1}\uE000`;
  });
  s = escapeHtml(s);
  s = s.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, alt: string, url: string) => `<img src="${url}" alt="${alt}">`,
  );
  s = s.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, label: string, url: string) => `<a href="${url}">${label}</a>`,
  );
  s = s.replace(/(\*\*|__)(?!\s)(.+?)(?<!\s)\1/g, "<strong>$2</strong>");
  s = s.replace(/(\*|_)(?!\s)([^*_]+?)(?<!\s)\1/g, "<em>$2</em>");
  s = s.replace(/\uE000(\d+)\uE000/g, (_, i: string) => codeSpans[Number(i)]);
  return s.trim();
}

/** Inline markdown -> plain text (for quote text and table cells). */
export function mdInlineText(src: string): string {
  return src
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)([^*_]+?)\1/g, "$2")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

const CALLOUT_KINDS: Record<string, CalloutBlock["kind"]> = {
  NOTE: "note",
  WARNING: "warning",
  CAUTION: "warning",
  TIP: "takeaway",
  TAKEAWAY: "takeaway",
  IMPORTANT: "info",
  INFO: "info",
};

function parseFrontmatter(md: string): { meta: Record<string, string>; body: string } {
  const meta: Record<string, string> = {};
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta, body: md };
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.+)$/);
    if (kv) meta[kv[1].toLowerCase().replace(/-/g, "_")] = kv[2].trim().replace(/^["']|["']$/g, "");
  }
  return { meta, body: md.slice(m[0].length) };
}

export function markdownToPost(md: string): ImportedPost {
  const { meta, body } = parseFrontmatter(md.replace(/\r\n/g, "\n"));
  const lines = body.split("\n");
  const blocks: BlogBlock[] = [];
  let title: string | undefined = meta.title;

  const isTableRow = (l: string) => /^\s*\|.*\|\s*$/.test(l);
  const isTableSep = (l: string) => /^\s*\|?\s*:?-{2,}[-:\s|]*\|?\s*$/.test(l) && l.includes("-");
  const splitCells = (l: string) =>
    l.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => mdInlineText(c.trim()));

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Blank
    if (trimmed === "") { i++; continue; }

    // Fenced code -> custom_html preserving a <pre>
    const fence = trimmed.match(/^```(\w*)/);
    if (fence) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      blocks.push({
        type: "custom_html",
        html: `<pre><code${fence[1] ? ` class="language-${fence[1]}"` : ""}>${escapeHtml(code.join("\n"))}</code></pre>`,
      });
      continue;
    }

    // Divider
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      blocks.push({ type: "divider", kind: "line" });
      i++;
      continue;
    }

    // Heading
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const text = mdInlineText(h[2].replace(/\s#+\s*$/, ""));
      if (h[1].length === 1 && !title && blocks.length === 0) {
        title = text; // first H1 becomes the post title, not a block
      } else {
        blocks.push({ type: "heading", level: clampHeading(h[1].length), text });
      }
      i++;
      continue;
    }

    // Blockquote (plain quote, or GitHub-style [!NOTE] callout)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const calloutMatch = quoteLines[0]?.match(/^\[!(\w+)\]\s*(.*)$/);
      if (calloutMatch && CALLOUT_KINDS[calloutMatch[1].toUpperCase()]) {
        const rest = [calloutMatch[2], ...quoteLines.slice(1)].filter((l) => l.trim() !== "");
        blocks.push({
          type: "callout",
          kind: CALLOUT_KINDS[calloutMatch[1].toUpperCase()],
          html: rest.map((l) => `<p>${mdInline(l)}</p>`).join(""),
        });
      } else {
        let attribution: string | undefined;
        const last = quoteLines[quoteLines.length - 1]?.trim() ?? "";
        const attr = last.match(/^[-–—]\s*(.+)$/);
        if (attr && quoteLines.length > 1) {
          attribution = mdInlineText(attr[1]);
          quoteLines.pop();
        }
        const text = quoteLines
          .filter((l) => l.trim() !== "")
          .map((l) => mdInlineText(l))
          .join(" ");
        if (text) blocks.push({ type: "quote", text, attribution });
      }
      continue;
    }

    // GFM table
    if (isTableRow(line) && i + 1 < lines.length && isTableSep(lines[i + 1])) {
      const headers = splitCells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        const cells = splitCells(lines[i]);
        while (cells.length < headers.length) cells.push("");
        rows.push(cells.slice(0, headers.length));
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // List (bullet or ordered, one nesting level)
    const listMatch = trimmed.match(/^([-*+]|\d+[.)])\s+/);
    if (listMatch) {
      const ordered = /^\d/.test(listMatch[1]);
      const items: { html: string }[] = [];
      let nested: { ordered: boolean; items: string[] } | null = null;
      const flushNested = () => {
        if (nested && items.length > 0) {
          const tag = nested.ordered ? "ol" : "ul";
          items[items.length - 1].html +=
            `<${tag}>` + nested.items.map((n) => `<li>${n}</li>`).join("") + `</${tag}>`;
        }
        nested = null;
      };
      while (i < lines.length) {
        const l = lines[i];
        const top = l.match(/^([-*+]|\d+[.)])\s+(.*)$/);
        const sub = l.match(/^\s{2,}([-*+]|\d+[.)])\s+(.*)$/);
        const cont = l.match(/^\s{2,}(\S.*)$/);
        if (top) {
          if (/^\d/.test(top[1]) !== ordered) break; // style change = new list
          flushNested();
          items.push({ html: mdInline(top[2]) });
        } else if (sub && items.length > 0) {
          if (!nested) nested = { ordered: /^\d/.test(sub[1]), items: [] };
          nested.items.push(mdInline(sub[2]));
        } else if (cont && items.length > 0 && !nested) {
          items[items.length - 1].html += " " + mdInline(cont[1]);
        } else if (l.trim() === "") {
          // A blank line ends the list unless the next line is another
          // item of the same style.
          const next = (lines[i + 1] ?? "").trim().match(/^([-*+]|\d+[.)])\s+/);
          if (!next || /^\d/.test(next[1]) !== ordered) break;
        } else {
          break;
        }
        i++;
      }
      flushNested();
      blocks.push({ type: "list", style: ordered ? "ordered" : "bullet", items });
      continue;
    }

    // Standalone image line
    const img = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/);
    if (img) {
      blocks.push({ type: "image", url: img[2], alt: img[1], caption: img[3] || undefined });
      i++;
      continue;
    }

    // Raw HTML island -> reuse the HTML converter
    if (/^<([a-zA-Z][\w-]*)/.test(trimmed)) {
      const htmlLines: string[] = [];
      while (i < lines.length && lines[i].trim() !== "") htmlLines.push(lines[i++]);
      blocks.push(...htmlFragmentToBlocks(htmlLines.join("\n")));
      continue;
    }

    // Paragraph (soft-wrapped lines joined with spaces)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,6}\s|>|```|([-*+]|\d+[.)])\s|(-{3,}|\*{3,}|_{3,})$)/.test(lines[i].trim()) &&
      !(isTableRow(lines[i]) && isTableSep(lines[i + 1] ?? ""))
    ) {
      para.push(lines[i].trim());
      i++;
    }
    const html = mdInline(para.join(" "));
    if (html) blocks.push({ type: "paragraph", html });
  }

  return {
    title,
    subtitle: meta.subtitle,
    description: meta.description ?? deriveDescription(blocks),
    author: meta.author,
    tag: meta.tag,
    hero_image_url: meta.hero_image_url ?? meta.hero ?? meta.image,
    hero_image_alt: meta.hero_image_alt,
    read_minutes: meta.read_minutes
      ? parseInt(meta.read_minutes, 10) || undefined
      : estimateReadMinutes(plainTextOfBlocks(blocks)),
    blocks,
  };
}

/* ============================================================
   HTML
   ============================================================ */
const WIDGET_SELECTOR =
  "script,style,canvas,iframe,svg,form,input,select,textarea,button,object,embed";

// Semantic block-level content the normalizer knows how to convert.
const SEMANTIC_SELECTOR =
  "h1,h2,h3,h4,h5,h6,p,ul,ol,table,blockquote,pre,figure,details";

// Inline tags kept (normalized) inside paragraph/list content. Legacy
// synonyms map to the standard tag; everything else is unwrapped to
// its children and all class/style/id attributes are dropped.
const INLINE_TAG_MAP: Record<string, string> = {
  strong: "strong",
  b: "strong",
  em: "em",
  i: "em",
  code: "code",
  sup: "sup",
  sub: "sub",
  mark: "mark",
};

const collapse = (s: string) => s.replace(/\s+/g, " ").trim();

/**
 * Rebuild an element's inline content as clean, standard markup:
 * text, <strong>, <em>, <code>, <a href>, <img src alt>, <br>.
 * Spans, fonts, styled wrappers, and all attributes are stripped.
 */
function normalizeInline(el: Element): string {
  let out = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      out += escapeHtml((node.textContent ?? "").replace(/\s+/g, " "));
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const child = node as Element;
    const tag = child.tagName.toLowerCase();
    if (tag === "br") {
      out += "<br>";
      continue;
    }
    if (tag === "img") {
      const src = child.getAttribute("src");
      if (src) {
        out += `<img src="${escapeHtml(src)}" alt="${escapeHtml(child.getAttribute("alt") ?? "")}">`;
      }
      continue;
    }
    if (tag === "a") {
      const href = child.getAttribute("href");
      const inner = normalizeInline(child);
      out += href ? `<a href="${escapeHtml(href)}">${inner}</a>` : inner;
      continue;
    }
    const mapped = INLINE_TAG_MAP[tag];
    if (mapped) out += `<${mapped}>${normalizeInline(child)}</${mapped}>`;
    else out += normalizeInline(child);
  }
  return out;
}

/** <li> content normalized, preserving nested lists. */
function listItemHtml(li: Element): string {
  const clone = li.cloneNode(true) as Element;
  Array.from(clone.children).forEach((c) => {
    if (c.tagName === "UL" || c.tagName === "OL") c.remove();
  });
  let html = normalizeInline(clone).trim();
  for (const c of Array.from(li.children)) {
    if (c.tagName !== "UL" && c.tagName !== "OL") continue;
    const tag = c.tagName.toLowerCase();
    const inner = Array.from(c.children)
      .filter((n) => n.tagName === "LI")
      .map((n) => `<li>${listItemHtml(n)}</li>`)
      .join("");
    html += `<${tag}>${inner}</${tag}>`;
  }
  return html;
}

export function htmlToPost(html: string): ImportedPost {
  const doc = new DOMParser().parseFromString(html, "text/html");
  // Prefer the article/main content over full-page chrome (nav,
  // headers, footers around the actual post).
  const root =
    doc.body.querySelector("article") ??
    doc.body.querySelector("main") ??
    doc.body;
  const blocks = nodesToBlocks(Array.from(root.childNodes), true);

  const docTitle = doc.querySelector("title")?.textContent?.trim();
  const h1 = doc.body.querySelector("h1")?.textContent?.trim();
  // Drop a leading heading block that duplicates the derived title -
  // the post title field renders it already.
  const title = docTitle || h1 || undefined;
  if (title && blocks[0]?.type === "heading" && blocks[0].text.trim() === (h1 ?? "")) {
    blocks.shift();
  }

  const metaContent = (sel: string) =>
    doc.querySelector(sel)?.getAttribute("content")?.trim() || undefined;

  return {
    title,
    description: metaContent('meta[name="description"]') ?? deriveDescription(blocks),
    author: metaContent('meta[name="author"]'),
    hero_image_url: metaContent('meta[property="og:image"]'),
    read_minutes: estimateReadMinutes(root.textContent ?? ""),
    blocks,
  };
}

/** Convert an HTML fragment (no head/meta handling) to blocks. */
export function htmlFragmentToBlocks(fragment: string): BlogBlock[] {
  const doc = new DOMParser().parseFromString(fragment, "text/html");
  return nodesToBlocks(Array.from(doc.body.childNodes), false);
}

function nodesToBlocks(nodes: Node[], atRoot = false): BlogBlock[] {
  const blocks: BlogBlock[] = [];
  let faqRun: { q: string; a: string }[] = [];

  const flushFaq = () => {
    if (faqRun.length > 0) blocks.push({ type: "faq", items: faqRun });
    faqRun = [];
  };

  for (const node of nodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = collapse(node.textContent ?? "");
      if (text) {
        flushFaq();
        blocks.push({ type: "paragraph", html: escapeHtml(text) });
      }
      continue;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) continue;
    const el = node as Element;
    const tag = el.tagName.toLowerCase();

    // Site chrome: navigation is never post content; top-level
    // header/footer/aside (or any that wrap a nav) are page chrome.
    if (tag === "nav") continue;
    if (
      (tag === "header" || tag === "footer" || tag === "aside") &&
      (atRoot || el.querySelector("nav"))
    ) {
      continue;
    }

    // Consecutive <details> elements merge into one FAQ block.
    if (tag === "details") {
      const q = collapse(el.querySelector("summary")?.textContent ?? "");
      const clone = el.cloneNode(true) as Element;
      clone.querySelector("summary")?.remove();
      const a = collapse(clone.textContent ?? "");
      if (q || a) faqRun.push({ q, a });
      continue;
    }
    flushFaq();

    const block = elementToBlock(el, tag);
    if (Array.isArray(block)) blocks.push(...block);
    else if (block) blocks.push(block);
  }
  flushFaq();
  return blocks;
}

function elementToBlock(el: Element, tag: string): BlogBlock | BlogBlock[] | null {
  const headingMatch = tag.match(/^h([1-6])$/);
  if (headingMatch) {
    const text = collapse(el.textContent ?? "");
    return text
      ? { type: "heading", level: clampHeading(Number(headingMatch[1])), text }
      : null;
  }

  switch (tag) {
    case "p": {
      const onlyImg =
        el.children.length === 1 &&
        el.children[0].tagName === "IMG" &&
        !collapse(el.textContent ?? "");
      if (onlyImg) return elementToBlock(el.children[0], "img");
      const html = normalizeInline(el).trim();
      return html ? { type: "paragraph", html } : null;
    }
    case "a": {
      // A standalone block-level anchor: button-styled ones become
      // CTAs, plain ones a paragraph with a normalized link.
      const href = el.getAttribute("href") ?? "";
      const label = collapse(el.textContent ?? "");
      if (!label || !href) return null;
      if (/\b(btn|button|cta)\b/i.test(el.getAttribute("class") ?? "")) {
        return { type: "cta", label, href };
      }
      return { type: "paragraph", html: `<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>` };
    }
    case "img": {
      const url = el.getAttribute("src") ?? "";
      if (!url) return null;
      return {
        type: "image",
        url,
        alt: el.getAttribute("alt") ?? "",
        caption: el.getAttribute("title") || undefined,
      };
    }
    case "figure": {
      const img = el.querySelector("img");
      const video = el.querySelector("video");
      const caption = collapse(el.querySelector("figcaption")?.textContent ?? "") || undefined;
      if (img) {
        return {
          type: "image",
          url: img.getAttribute("src") ?? "",
          alt: img.getAttribute("alt") ?? "",
          caption,
        };
      }
      if (video) {
        const src =
          video.getAttribute("src") ??
          video.querySelector("source")?.getAttribute("src") ??
          "";
        return src
          ? { type: "video", url: src, poster: video.getAttribute("poster") || undefined, caption }
          : null;
      }
      return { type: "custom_html", html: el.outerHTML };
    }
    case "video": {
      const src =
        el.getAttribute("src") ?? el.querySelector("source")?.getAttribute("src") ?? "";
      return src
        ? { type: "video", url: src, poster: el.getAttribute("poster") || undefined }
        : null;
    }
    case "ul":
    case "ol": {
      const items = Array.from(el.children)
        .filter((li) => li.tagName === "LI")
        .map((li) => ({ html: listItemHtml(li) }));
      if (items.length === 0) return null;
      const style: ListBlock["style"] = tag === "ol" ? "ordered" : "bullet";
      return { type: "list", style, items };
    }
    case "blockquote": {
      const cite = collapse(el.querySelector("cite")?.textContent ?? "");
      const clone = el.cloneNode(true) as Element;
      clone.querySelector("cite")?.remove();
      const text = collapse(clone.textContent ?? "");
      return text ? { type: "quote", text, attribution: cite || undefined } : null;
    }
    case "table": {
      const headerCells = el.querySelectorAll("thead th, thead td");
      const headerRow =
        headerCells.length > 0
          ? Array.from(headerCells)
          : Array.from(el.querySelector("tr")?.children ?? []);
      const headers = headerRow.map((c) => collapse(c.textContent ?? ""));
      const bodyRows = Array.from(el.querySelectorAll("tr")).filter(
        (tr) => !headerRow.length || tr !== headerRow[0]?.parentElement,
      );
      const rows = bodyRows.map((tr) =>
        Array.from(tr.children).map((c) => collapse(c.textContent ?? "")),
      );
      return { type: "table", headers, rows };
    }
    case "hr":
      return { type: "divider", kind: "line" };
    case "br":
      return null;
    case "pre":
      return { type: "custom_html", html: el.outerHTML };
    default: {
      const semanticCount = el.querySelectorAll(SEMANTIC_SELECTOR).length;
      const isWidget =
        el.matches(WIDGET_SELECTOR) || !!el.querySelector(WIDGET_SELECTOR);

      // Interactive/scripted subtree with little semantic content is
      // a self-contained widget (slider, chart, embed): preserve it
      // verbatim as its own custom_html block, in position.
      if (isWidget && semanticCount < 3) {
        return { type: "custom_html", html: el.outerHTML };
      }

      // Anything holding real content is a wrapper - descend and
      // normalize each child in place, regardless of class/style.
      // Widget subtrees nested deeper isolate themselves on the way
      // down via the rule above.
      if (semanticCount > 0) {
        return nodesToBlocks(Array.from(el.childNodes), false);
      }

      // No semantic content: a lone image wrapper unwraps to an
      // image block; multiple images with no text reads as a
      // gallery/slider and stays intact.
      const imgs = el.querySelectorAll("img");
      if (imgs.length === 1 && !collapse(el.textContent ?? "")) {
        return elementToBlock(imgs[0], "img");
      }
      if (imgs.length > 1) return { type: "custom_html", html: el.outerHTML };

      // Text in an unstyled wrapper reads as a paragraph; a classed
      // or styled container carries bespoke presentation, so it
      // survives verbatim.
      const html = normalizeInline(el).trim();
      if (!html) return null;
      if (!el.getAttribute("class") && !el.getAttribute("style")) {
        return { type: "paragraph", html };
      }
      return { type: "custom_html", html: el.outerHTML };
    }
  }
}
