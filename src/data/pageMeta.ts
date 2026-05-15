/**
 * Per-page social-preview / SEO metadata for non-vertical site pages.
 *
 * The keys here are matched in:
 *   - src/components/PageMeta.tsx        — runtime <Helmet> injection so the
 *                                          tags stay correct during SPA navigation
 *   - scripts/prerender-pages.mjs        — build-time HTML prerender so social
 *                                          crawlers (Twitter, Slack, Discord, FB,
 *                                          LinkedIn — none execute JS) see the
 *                                          tags in the initial HTML response
 *   - public/og-render/index.html        — visual template that produced the
 *                                          /og/<key>.png images at build time
 *   - scripts/generate-og-images.mjs     — image generator
 *
 * Adding a page: add an entry here, regenerate images via `npm run generate:og`,
 * and rebuild — the prerender script picks it up automatically.
 */
export interface PageMetaEntry {
  /** Visible <title> tag content. */
  title: string;
  /** <meta name="description"> + og/twitter description (≤ 160 chars). */
  description: string;
  /** URL path on www.nft.nyc — used to build canonical + og:url. */
  path: string;
  /** OG image filename under /og/. */
  ogImage: string;
}

export const PAGE_META: Record<string, PageMetaEntry> = {
  speak: {
    title: "Speak at NFT.NYC 2026 — Share your voice",
    description: "Round 1 closed 30 April. Round 2 opens soon — follow @NFT_NYC on X to be the first to know. Keynotes, panels, and fireside chats across 12 industry tracks.",
    path: "/speak",
    ogImage: "/og/speak.png",
  },
  sponsor: {
    title: "Partner with NFT.NYC 2026",
    description: "Branded stages, speaking slots, activations, and Times Square billboards. Build your perfect partnership package across every industry track.",
    path: "/sponsor",
    ogImage: "/og/sponsor.png",
  },
  "sponsor-ts-challenge": {
    title: "Times Square Challenge — NFT.NYC 2026 Partnerships",
    description: "Showcase your brand on Times Square's biggest screens during NFT.NYC 2026. 1.5M daily impressions, integrated into the on-chain art exhibition.",
    path: "/sponsor/ts-challenge",
    ogImage: "/og/sponsor-ts-challenge.png",
  },
  "ts-challenge": {
    title: "Times Square Challenge — NFT.NYC 2026",
    description: "An on-chain art exhibition broadcasting from Times Square's iconic screens. Collect limited-edition art, earn T-XP, climb the leaderboard.",
    path: "/ts-challenge",
    ogImage: "/og/ts-challenge.png",
  },
  blog: {
    title: "Blog — NFT.NYC 2026",
    description: "Industry analysis, event updates, and stories from the on-chain frontier.",
    path: "/blog",
    ogImage: "/og/blog.png",
  },
  "blog-xp-kredits": {
    title: "What are XP & Kredits? — NFT.NYC Blog",
    description: "How hub-branded points and Kredits power the NFT.NYC community and reward builders, brands, and creators.",
    path: "/blog/xp-and-kredits",
    ogImage: "/og/blog-xp-kredits.png",
  },
  "blog-ts-challenge": {
    title: "What is the Times Square Challenge? — NFT.NYC Blog",
    description: "How collectors, artists, and fans worldwide engage with limited-edition NFT.NYC art on Times Square's biggest screens.",
    path: "/blog/ts-challenge",
    ogImage: "/og/blog-ts-challenge.png",
  },
  journey: {
    title: "Our Story — NFT.NYC",
    description: "Eight years and 200,000+ alumni building the world's leading NFT and Web3 community.",
    path: "/journey",
    ogImage: "/og/journey.png",
  },
  origins: {
    title: "NFT.NYC origins and rise: the world's largest NFT conference",
    description: "From a 2018 OpenSea dinner to eight editions, 200,000+ alumni, and the 12-Mission Times Square Challenge at NFT.NYC 2026. The full origin story.",
    path: "/origins",
    ogImage: "/og/journey.png",
  },
};

export type PageMetaKey = keyof typeof PAGE_META;
