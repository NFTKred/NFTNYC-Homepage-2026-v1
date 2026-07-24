import { useEffect, useRef } from "react";
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
} from "@/data/blog/types";

/**
 * Renders a single blog block by dispatching on `block.type`.
 * Every block component below is small and self-contained so the
 * admin-editor (Commit B) can render a matching form the same way.
 */
export default function BlockRenderer({ block }: { block: BlogBlock }) {
  switch (block.type) {
    case "paragraph":
      return <Paragraph block={block} />;
    case "heading":
      return <Heading block={block} />;
    case "image":
      return <Image block={block} />;
    case "video":
      return <Video block={block} />;
    case "quote":
      return <Quote block={block} />;
    case "list":
      return <List block={block} />;
    case "table":
      return <Table block={block} />;
    case "callout":
      return <Callout block={block} />;
    case "before_after":
      return <BeforeAfter block={block} />;
    case "cta":
      return <Cta block={block} />;
    case "divider":
      return <Divider block={block} />;
    case "faq":
      return <Faq block={block} />;
    case "custom_html":
      return <CustomHtml block={block} />;
    default: {
      // Exhaustiveness check - if a new block type is added to the
      // union without a case here, TS flags it at compile time.
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

/* ============================================================
   Block implementations
   ============================================================ */

function Paragraph({ block }: { block: ParagraphBlock }) {
  return (
    <p
      className="blog-block blog-block-paragraph"
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

function Heading({ block }: { block: HeadingBlock }) {
  const Tag = (`h${block.level}` as unknown) as keyof React.JSX.IntrinsicElements;
  return (
    <div className={`blog-block blog-block-heading level-${block.level}`}>
      {block.eyebrow && <span className="eyebrow">{block.eyebrow}</span>}
      <Tag className="h">{block.text}</Tag>
    </div>
  );
}

function Image({ block }: { block: ImageBlock }) {
  return (
    <div
      className={`blog-block blog-block-image${
        block.align && block.align !== "center" ? ` align-${block.align}` : ""
      }`}
    >
      <figure>
        <img src={block.url} alt={block.alt} loading="lazy" />
        {(block.caption || block.attribution) && (
          <figcaption>
            {block.caption}
            {block.attribution && (
              <span className="attribution">{block.attribution}</span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
}

function Video({ block }: { block: VideoBlock }) {
  return (
    <div className="blog-block blog-block-video">
      <figure>
        <video
          src={block.url}
          poster={block.poster}
          autoPlay={block.autoplay ?? true}
          loop={block.loop ?? true}
          muted={block.muted ?? true}
          controls={block.controls ?? false}
          playsInline
        />
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    </div>
  );
}

function Quote({ block }: { block: QuoteBlock }) {
  return (
    <blockquote className="blog-block blog-block-quote">
      {block.text}
      {block.attribution && (
        <span className="attribution">- {block.attribution}</span>
      )}
    </blockquote>
  );
}

function List({ block }: { block: ListBlock }) {
  const Tag = block.style === "ordered" ? "ol" : "ul";
  return (
    <Tag className="blog-block blog-block-list">
      {block.items.map((item, i) => (
        <li key={i} dangerouslySetInnerHTML={{ __html: item.html }} />
      ))}
    </Tag>
  );
}

function Table({ block }: { block: TableBlock }) {
  return (
    <div className="blog-block blog-block-table">
      <table>
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th key={i}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {block.caption && <caption>{block.caption}</caption>}
      </table>
    </div>
  );
}

function Callout({ block }: { block: CalloutBlock }) {
  return (
    <div className={`blog-block blog-block-callout kind-${block.kind}`}>
      {block.title && <div className="title">{block.title}</div>}
      <div className="body" dangerouslySetInnerHTML={{ __html: block.html }} />
    </div>
  );
}

function Cta({ block }: { block: CtaBlock }) {
  const isExternal = /^https?:\/\//.test(block.href);
  return (
    <div
      className={`blog-block blog-block-cta${
        block.align && block.align !== "left" ? ` align-${block.align}` : ""
      }`}
    >
      <a
        href={block.href}
        className={block.style ?? "primary"}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {block.label}
      </a>
    </div>
  );
}

function Divider({ block }: { block: DividerBlock }) {
  return <hr className={`blog-block blog-block-divider kind-${block.kind ?? "line"}`} />;
}

function Faq({ block }: { block: FaqBlock }) {
  return (
    <div className="blog-block blog-block-faq">
      {block.items.map((item, i) => (
        <details key={i}>
          <summary>{item.q}</summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function CustomHtml({ block }: { block: CustomHtmlBlock }) {
  return (
    <div
      className={`blog-block blog-block-custom_html${
        block.wrapperClass ? ` ${block.wrapperClass}` : ""
      }`}
      dangerouslySetInnerHTML={{ __html: block.html }}
    />
  );
}

/* ============================================================
   Drag-to-reveal slider (before/after)
   ============================================================ */
function BeforeAfter({ block }: { block: BeforeAfterBlock }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const gripRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const after = afterRef.current;
    const line = lineRef.current;
    const grip = gripRef.current;
    if (!wrap || !after || !line || !grip) return;

    let dragging = false;
    const set = (p: number) => {
      const v = Math.max(0, Math.min(100, p));
      after.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
      line.style.left = `${v}%`;
      grip.style.left = `${v}%`;
    };
    const pct = (x: number) => {
      const r = wrap.getBoundingClientRect();
      return ((x - r.left) / r.width) * 100;
    };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      dragging = true;
      set(pct(e.clientX));
    };
    const onMove = (e: PointerEvent) => {
      if (dragging) set(pct(e.clientX));
    };
    const onUp = () => {
      dragging = false;
    };
    wrap.addEventListener("pointerdown", onDown);
    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
    document.addEventListener("pointercancel", onUp);
    set(50);
    return () => {
      wrap.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div className={`blog-block blog-block-before_after${block.tall ? " tall" : ""}`}>
      <figure>
        <div className="ba-wrap" ref={wrapRef}>
          <img
            className="ba-base"
            src={block.before.url}
            alt={block.before.alt ?? ""}
          />
          <div className="ba-after" ref={afterRef}>
            <img src={block.after.url} alt={block.after.alt ?? ""} />
          </div>
          <div className="ba-line" ref={lineRef} />
          <div className="ba-grip" ref={gripRef} />
          {block.before.label && (
            <span className="ba-tag ba-tag-l">{block.before.label}</span>
          )}
          {block.after.label && (
            <span className="ba-tag ba-tag-r">{block.after.label}</span>
          )}
        </div>
        {block.caption && <figcaption>{block.caption}</figcaption>}
      </figure>
    </div>
  );
}
