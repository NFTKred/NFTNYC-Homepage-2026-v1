#!/usr/bin/env node
/**
 * Post-build prerender for industry verticals AND non-vertical site pages.
 *
 * React-helmet-async only injects meta tags client-side, but most social
 * crawlers (Twitter/X, Facebook, LinkedIn, Slack, Discord) don't execute JS.
 * They need the og:* / twitter:* tags to be present in the initial HTML
 * response — or the shared URL will unfurl to a generic homepage preview.
 *
 * This script runs after `vite build`. For each entry it:
 *   1. Reads the built dist/index.html
 *   2. Injects per-page <title>, <meta name="description">, canonical, and
 *      full Open Graph + Twitter Card tags into <head>
 *   3. Writes dist/<route>/index.html
 *
 * Vercel will serve the prerendered file directly for `/ai`, `/speak`,
 * `/sponsor/ts-challenge`, etc. (nested index.html takes priority over the
 * SPA catch-all rewrite). The React app hydrates on top and continues to
 * work normally; Helmet keeps tags in sync during client-side navigation.
 *
 * Adding a route: add an entry to VERTICALS or PAGES below. The PAGES list
 * mirrors src/data/pageMeta.ts — keep them in sync.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = dirname(__dirname);
const DIST = join(ROOT, "dist");
const INDEX = join(DIST, "index.html");

// Mirror of the ECOSYSTEMS data — keeping this duplicated here rather than
// importing from src/ because this script runs in plain Node and doesn't
// want to spin up a TS pipeline just to read data. If you add a vertical,
// add it in both places.
const VERTICALS = [
  { id: "ai",           name: "AI Identity Tokenization",       desc: "NFTs provide authenticity, ownership, and monetization rails for AI-generated and agent-driven systems. Autonomous agents with wallets use ERC-8004 for on-chain identity and portable reputation." },
  { id: "gaming",       name: "Game Tokenization",              desc: "Web3 gaming studios, fully on-chain games, virtual assets, digital fashion, interoperable items, and player-owned economies." },
  { id: "infra",        name: "On-Chain Infrastructure",        desc: "Layer 1 and Layer 2 blockchains, rollups, wallets, ZK identity, NFT liquidity layers, and fully on-chain systems." },
  { id: "social",       name: "Social NFTs",                    desc: "Collaborative and community-driven digital art projects merging social interaction with generative AI and on-chain provenance." },
  { id: "creator",      name: "Creator Economy",                desc: "Community-owned IP, NFT membership models, music and film ownership, token-gated media, and revitalized brands." },
  { id: "defi",         name: "DeFi",                           desc: "NFT lending, fractionalization, DeFi infrastructure, and meme coins as community capital." },
  { id: "rwa",          name: "RWA Tokenization",               desc: "Tokenized real estate, treasuries, commodities, and securities. Bringing trillions in traditional assets onchain with programmable compliance and 24/7 settlement." },
  { id: "brands",       name: "Brands & Engagement",            desc: "NFT-based loyalty programs, phygital authentication, NFT ticketing, digital collectibles, and retail integrations." },
  { id: "culture",      name: "Culture, Art & Music",           desc: "Digital art, generative art, and AI-generated art with on-chain attribution. Music royalty ownership. Internet-native communities, NFT-native media, creator-led ecosystems, and meme culture." },
  { id: "domains",      name: "DNS ENS Domain Tokens",          desc: "Human-readable names for wallets, websites, and agents. ENS, DNS integrations, and domain NFTs serve as the identity layer for the onchain economy." },
  { id: "desci",        name: "DeSci · Longevity Tokenization", desc: "Decentralized science funding, longevity research, tokenized IP for biotech breakthroughs, and patient-owned health data. A new model for accelerating research." },
  { id: "marketplaces", name: "NFT Marketplaces",               desc: "Marketplace infrastructure, royalty systems, creator coin models, and new distribution mechanisms." },
];

// Non-vertical site pages. Mirrors src/data/pageMeta.ts — keep in sync.
// `route` is the URL path (used for canonical + dist directory layout);
// `slug` is the OG image filename stem (/og/<slug>.png).
const PAGES = [
  { route: "/speak",                slug: "speak",                title: "Speak at NFT.NYC 2026 — Share your voice",                       desc: "Round 1 closed 30 April. Round 2 opens soon — follow @NFT_NYC on X to be the first to know. Keynotes, panels, and fireside chats across 12 industry tracks." },
  { route: "/sponsor",              slug: "sponsor",              title: "Partner with NFT.NYC 2026",                                       desc: "Branded stages, speaking slots, activations, and Times Square billboards. Build your perfect partnership package across every industry track." },
  { route: "/sponsor/ts-challenge", slug: "sponsor-ts-challenge", title: "Times Square Challenge — NFT.NYC 2026 Partnerships",              desc: "Showcase your brand on Times Square's biggest screens during NFT.NYC 2026. 1.5M daily impressions, integrated into the on-chain art exhibition." },
  { route: "/ts-challenge",         slug: "ts-challenge",         title: "Times Square Challenge — NFT.NYC 2026",                           desc: "An on-chain art exhibition broadcasting from Times Square's iconic screens. Collect limited-edition art, earn T-XP, climb the leaderboard." },
  { route: "/blog",                 slug: "blog",                 title: "Blog — NFT.NYC 2026",                                              desc: "Industry analysis, event updates, and stories from the on-chain frontier." },
  { route: "/blog/xp-and-kredits",  slug: "blog-xp-kredits",      title: "What are XP & Kredits? — NFT.NYC Blog",                            desc: "How hub-branded points and Kredits power the NFT.NYC community and reward builders, brands, and creators." },
  { route: "/blog/ts-challenge",    slug: "blog-ts-challenge",    title: "What is the Times Square Challenge? — NFT.NYC Blog",               desc: "How collectors, artists, and fans worldwide engage with limited-edition NFT.NYC art on Times Square's biggest screens." },
  { route: "/journey",              slug: "journey",              title: "Our Story — NFT.NYC",                                              desc: "Eight years and 200,000+ alumni building the world's leading NFT and Web3 community." },
  { route: "/origins",              slug: "journey",              title: "NFT.NYC origins and rise: the world's largest NFT conference",       desc: "From a 2018 OpenSea dinner to eight editions, 200,000+ alumni, and the 12-Mission Times Square Challenge at NFT.NYC 2026." },
];

const ORIGIN = "https://www.nft.nyc";

function clamp(s, n = 160) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildHead({ title, desc, url, ogImage, alt }) {
  const cleanDesc = clamp(desc);
  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(cleanDesc)}">`,
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="NFT.NYC">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(cleanDesc)}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:image" content="${ogImage}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${escapeHtml(alt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escapeHtml(title)}">`,
    `<meta name="twitter:description" content="${escapeHtml(cleanDesc)}">`,
    `<meta name="twitter:image" content="${ogImage}">`,
  ].join("\n    ");
}

function injectJsonLd(html, ...blocks) {
  const tags = blocks.map(b => `<script type="application/ld+json">${JSON.stringify(b)}</script>`).join('\n    ');
  return html.replace(/<\/head>/i, `    ${tags}\n  </head>`);
}

function injectMeta(html, headBlock) {
  // Strip the global homepage <title> and og: meta tags so ours replace them,
  // then inject our block immediately before </head>.
  let out = html;

  // Remove existing <title>
  out = out.replace(/<title>[\s\S]*?<\/title>/i, "");

  // Remove existing generic meta (description, og:*, twitter:*) so the
  // page-specific ones in our injected block don't collide with the
  // homepage defaults from index.html.
  out = out.replace(
    /<meta\s+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi,
    ""
  );
  // Also remove any existing canonical link
  out = out.replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");

  // Inject before </head>
  out = out.replace(/<\/head>/i, `    ${headBlock}\n  </head>`);

  return out;
}

function main() {
  if (!existsSync(INDEX)) {
    console.error(`✗ ${INDEX} not found — did you run 'vite build' first?`);
    process.exit(1);
  }
  const base = readFileSync(INDEX, "utf8");
  let written = 0;

  // ── Industry verticals ───────────────────────────────────────────
  for (const v of VERTICALS) {
    const head = buildHead({
      title:   `${v.name} · NFT.NYC 2026`,
      desc:    v.desc,
      url:     `${ORIGIN}/${v.id}`,
      ogImage: `${ORIGIN}/og/${v.id}.png`,
      alt:     `${v.name} — NFT.NYC 2026`,
    });
    const outDir = join(DIST, v.id);
    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, "index.html"), injectMeta(base, head));
    written++;
  }

  // ── Non-vertical pages (/speak, /sponsor, /journey, etc.) ────────
  for (const p of PAGES) {
    const head = buildHead({
      title:   p.title,
      desc:    p.desc,
      url:     `${ORIGIN}${p.route}`,
      ogImage: `${ORIGIN}/og/${p.slug}.png`,
      alt:     p.title,
    });
    const outDir = join(DIST, p.route.replace(/^\//, ""));
    mkdirSync(outDir, { recursive: true });
    let pageHtml = injectMeta(base, head);

    // Inject page-specific JSON-LD blocks for routes that need them
    if (p.route === "/origins") {
      const article = {
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${ORIGIN}/origins#article`,
        "headline": "NFT.NYC origins and rise: the world's largest NFT conference",
        "description": "From a 2018 OpenSea dinner to eight editions, 200,000+ alumni, and the 12-Mission Times Square Challenge at NFT.NYC 2026.",
        "datePublished": "2026-04-05",
        "dateModified": "2026-05-14",
        "version": "5.0",
        "inLanguage": "en",
        "author": [
          {
            "@type": "Person",
            "name": "Cameron Bale",
            "url": "https://www.nft.nyc",
            "sameAs": ["https://x.com/cameronbale", "https://www.linkedin.com/in/cameronbale"]
          },
          {
            "@type": "Person",
            "name": "Jodee Rich",
            "url": "https://www.nft.nyc",
            "sameAs": ["https://x.com/jodeerich"]
          }
        ],
        "publisher": { "@id": `${ORIGIN}/#organization` },
        "url": `${ORIGIN}/origins`,
        "mainEntityOfPage": { "@type": "WebPage", "@id": `${ORIGIN}/origins` }
      };
      const faqPage = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${ORIGIN}/origins#faq`,
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is NFT.NYC?",
            "acceptedAnswer": { "@type": "Answer", "text": "NFT.NYC is the world's largest NFT conference, a live in-person event held in Times Square, New York City since February 20, 2019. Eight editions, 200,000+ alumni. The event is HUMANS ONLY, operated by PeopleBrowsr, Inc." }
          },
          {
            "@type": "Question",
            "name": "When is the next NFT.NYC event?",
            "acceptedAnswer": { "@type": "Answer", "text": "NFT.NYC 2026 is scheduled for September 1-3, 2026 at The Edison Times Square in New York City. 211 speaking slots across twelve industry verticals." }
          },
          {
            "@type": "Question",
            "name": "How did NFT.NYC start?",
            "acceptedAnswer": { "@type": "Answer", "text": "NFT.NYC started with an August 2018 dinner between Jodee Rich (CEO of PeopleBrowsr) and Devin Finzer and Alex Atallah (co-founders of OpenSea). Cameron Bale registered the NFT.NYC domain. First event: February 20, 2019 at the PlayStation Theater with 462 attendees." }
          },
          {
            "@type": "Question",
            "name": "Who runs NFT.NYC?",
            "acceptedAnswer": { "@type": "Answer", "text": "NFT.NYC is co-founded and produced by Jodee Rich and Cameron Bale, both of PeopleBrowsr. The event is operated under PeopleBrowsr, Inc., a San Francisco company self-funded since 2007." }
          },
          {
            "@type": "Question",
            "name": "What does 'proof of presence over proof of stake' mean?",
            "acceptedAnswer": { "@type": "Answer", "text": "The founding philosophy of NFT.NYC: physical, in-person attendance is the criterion that matters, not wallet holdings. The event is deliberately HUMANS ONLY, reframing crypto consensus vocabulary toward community presence." }
          },
          {
            "@type": "Question",
            "name": "What is the Times Square Challenge?",
            "acceptedAnswer": { "@type": "Answer", "text": "A 12-Mission showcase of tokenization across Art, Collectibles, Certifications, Gameplay, Identity, and DeFi on an interactive NYC map. Participants earn T-XP, build a Passport (.Kred domain), and compete on a global leaderboard. Hosted on OneHub.NFT.NYC." }
          },
          {
            "@type": "Question",
            "name": "What is the Tokenization Universe?",
            "acceptedAnswer": { "@type": "Answer", "text": "NFT.NYC's framing for the full landscape of real-world tokenization. Twelve categories: on-chain infrastructure, identity, social NFTs, DeFi, brands, DNS/ENS domains, marketplaces, IP tokenization, culture/art/music, crypto ecosystem, DeSci/longevity, and digital tokenization." }
          },
          {
            "@type": "Question",
            "name": "What patent protects the NFT.Kred technology that powers NFT.NYC?",
            "acceptedAnswer": { "@type": "Answer", "text": "PeopleBrowsr holds U.S. Patent No. 12,038,911, covering the association of social actions with NFTs - on-chain assets linked to real-world human behavior. This underpins NFT.Kred's approach of connecting physical presence, social interaction, and verifiable digital credentials." }
          }
        ]
      };
      pageHtml = injectJsonLd(pageHtml, article, faqPage);
    }

    writeFileSync(join(outDir, "index.html"), pageHtml);
    written++;
  }
  console.log(`✔ prerendered ${written} pages (${VERTICALS.length} verticals + ${PAGES.length} site pages)`);

  // ── Sitemap.xml ─────────────────────────────────────────────────
  // Generated alongside the prerender so the URL list stays in sync.
  // Homepage gets priority 1.0; high-traffic pages 0.9; verticals 0.8;
  // blog + secondary pages 0.7. lastmod stamped at build time.
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${ORIGIN}/`, priority: "1.0", changefreq: "weekly" },
    { loc: `${ORIGIN}/speak`,                priority: "0.9", changefreq: "weekly" },
    { loc: `${ORIGIN}/sponsor`,              priority: "0.9", changefreq: "weekly" },
    { loc: `${ORIGIN}/sponsor/ts-challenge`, priority: "0.8", changefreq: "weekly" },
    { loc: `${ORIGIN}/ts-challenge`,         priority: "0.8", changefreq: "weekly" },
    { loc: `${ORIGIN}/origins`,              priority: "0.7", changefreq: "monthly" },
    { loc: `${ORIGIN}/journey`,              priority: "0.6", changefreq: "monthly" },
    { loc: `${ORIGIN}/blog`,                 priority: "0.7", changefreq: "weekly" },
    { loc: `${ORIGIN}/blog/xp-and-kredits`,  priority: "0.5", changefreq: "monthly" },
    { loc: `${ORIGIN}/blog/ts-challenge`,    priority: "0.5", changefreq: "monthly" },
    ...VERTICALS.map(v => ({
      loc: `${ORIGIN}/${v.id}`,
      priority: "0.8",
      changefreq: "weekly",
    })),
  ];
  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`),
    '</urlset>',
    '',
  ].join("\n");
  writeFileSync(join(DIST, "sitemap.xml"), sitemap);
  console.log(`✔ sitemap.xml written with ${urls.length} URLs`);
}

main();
