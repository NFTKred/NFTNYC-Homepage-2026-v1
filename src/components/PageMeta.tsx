import { Helmet } from "react-helmet-async";
import { PAGE_META, type PageMetaKey } from "@/data/pageMeta";

const ORIGIN = "https://www.nft.nyc";

interface PageMetaProps {
  /** Key into PAGE_META — see src/data/pageMeta.ts. */
  page: PageMetaKey;
}

/**
 * Drop into any non-vertical page to emit the right title + description +
 * og/twitter tags during client-side navigation. The same metadata is also
 * baked into the initial HTML response by scripts/prerender-pages.mjs so
 * social crawlers (which don't run JS) see it on first byte.
 */
export default function PageMeta({ page }: PageMetaProps) {
  const meta = PAGE_META[page];
  if (!meta) return null;

  const url = `${ORIGIN}${meta.path}`;
  const ogImage = `${ORIGIN}${meta.ogImage}`;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="NFT.NYC 2026" />
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
    </Helmet>
  );
}
