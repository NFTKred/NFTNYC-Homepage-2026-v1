import { Helmet } from "react-helmet-async";
import { PAGE_META, type PageMetaKey } from "@/data/pageMeta";

const ORIGIN = "https://www.nft.nyc";

// Human labels for path segments that are otherwise ambiguous to render
// from the slug alone. Falls back to title-case otherwise.
const SEGMENT_LABELS: Record<string, string> = {
  sponsor: "Sponsor",
  "ts-challenge": "Times Square Challenge",
  speak: "Speak",
  blog: "Blog",
  "xp-and-kredits": "XP & Kredits",
  journey: "Our Story",
  origins: "Our Story",
};

function titleCase(seg: string) {
  return seg
    .split("-")
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

/**
 * Build a BreadcrumbList JSON-LD object for the given path. Always
 * includes "Home" at position 1, then one item per path segment.
 * Top-level routes ("/speak") emit a 2-item breadcrumb; nested routes
 * ("/sponsor/ts-challenge", "/blog/xp-and-kredits") emit 3 items.
 */
function buildBreadcrumb(path: string) {
  const segments = path.split("/").filter(Boolean); // strip leading "/"
  const itemListElement: Array<Record<string, unknown>> = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: `${ORIGIN}/`,
    },
  ];
  let acc = "";
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    itemListElement.push({
      "@type": "ListItem",
      position: i + 2,
      name: SEGMENT_LABELS[seg] ?? titleCase(seg),
      item: `${ORIGIN}${acc}`,
    });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement,
  };
}

interface PageMetaProps {
  /** Key into PAGE_META — see src/data/pageMeta.ts. */
  page: PageMetaKey;
}

/**
 * Drop into any non-vertical page to emit the right title + description +
 * og/twitter tags during client-side navigation. The same metadata is also
 * baked into the initial HTML response by scripts/prerender-verticals.mjs
 * so social crawlers (which don't run JS) see it on first byte.
 *
 * Also emits a BreadcrumbList JSON-LD block so Google's SERP can render
 * the nested-route breadcrumb path under the title.
 */
export default function PageMeta({ page }: PageMetaProps) {
  const meta = PAGE_META[page];
  if (!meta) return null;

  const url = `${ORIGIN}${meta.path}`;
  const ogImage = `${ORIGIN}${meta.ogImage}`;
  const breadcrumb = buildBreadcrumb(meta.path);

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="NFT.NYC" />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={meta.title} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={meta.title} />

      <script type="application/ld+json">{JSON.stringify(breadcrumb)}</script>
    </Helmet>
  );
}
