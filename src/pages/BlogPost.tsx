import { useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BlockRenderer from "@/components/blog/BlockRenderer";
import { useBlogPost } from "@/hooks/useBlogPost";
import "@/styles/blog.css";
// Keep the History-of-Remix stylesheet available - its `custom_html`
// blocks use those class names. Every article that ships bespoke
// markup should add its own stylesheet import the same way.
import "@/styles/blog-history-of-remix.css";

/**
 * Dynamic blog post renderer. One page for every slug. Content comes
 * from Supabase; every visual pattern renders through the shared
 * BlockRenderer so layout is consistent between posts.
 */
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError } = useBlogPost(slug);
  const [theme, setTheme] = useState<"dark" | "light">(
    () =>
      (document.documentElement.getAttribute("data-theme") as "dark" | "light") ||
      "dark",
  );
  const stage = useMemo(
    () => Number(localStorage.getItem("nftnyc-stage") ?? 0),
    [],
  );

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  if (isError) return <Navigate to="/blog" replace />;
  if (isLoading) {
    return (
      <div data-theme={theme} className="blog-shell">
        <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />
        <div style={{ padding: "8rem 1.5rem", textAlign: "center", color: "var(--color-text-muted)" }}>
          Loading article…
        </div>
        <SiteFooter stage={stage} />
      </div>
    );
  }
  if (!post) return <Navigate to="/blog" replace />;

  const canonical = `https://www.nft.nyc/blog/${post.slug}`;
  const publishedLabel = post.published_at
    ? new Date(post.published_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description ?? undefined,
    url: canonical,
    mainEntityOfPage: canonical,
    image: post.hero_image_url ?? post.og_image_url ?? undefined,
    author: {
      "@type": "Organization",
      name: post.author ?? "NFT.NYC",
      url: "https://www.nft.nyc",
    },
    publisher: {
      "@type": "Organization",
      name: "NFT.NYC",
      logo: {
        "@type": "ImageObject",
        url: "https://www.nft.nyc/favicon.jpg",
      },
    },
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at,
    inLanguage: "en",
  };

  return (
    <div data-theme={theme} className="blog-shell">
      <Helmet>
        <title>{post.title} - NFT.NYC Blog</title>
        {post.description && (
          <meta name="description" content={post.description} />
        )}
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        {post.description && (
          <meta property="og:description" content={post.description} />
        )}
        <meta property="og:url" content={canonical} />
        {(post.og_image_url || post.hero_image_url) && (
          <meta
            property="og:image"
            content={post.og_image_url || post.hero_image_url || ""}
          />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header theme={theme} onToggleTheme={toggleTheme} stage={stage} />
      <article className="blog-post">
        <div className="blog-post-inner">
          <a href="/blog" className="blog-post-back">
            ← Back to Blog
          </a>
          {post.tag && <div className="blog-post-tag">{post.tag}</div>}
          <h1 className="blog-post-title">{post.title}</h1>
          {post.subtitle && (
            <p className="blog-post-subtitle">{post.subtitle}</p>
          )}
          <p className="blog-post-meta">
            {publishedLabel && <>Published: {publishedLabel}</>}
            {post.author && <> | Author: {post.author}</>}
            {post.read_minutes && <> | {post.read_minutes} min read</>}
          </p>
          {post.hero_image_url && (
            <img
              className="blog-post-hero"
              src={post.hero_image_url}
              alt={post.hero_image_alt ?? ""}
            />
          )}
          {post.content.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>
      </article>
      <SiteFooter stage={stage} />
    </div>
  );
}
