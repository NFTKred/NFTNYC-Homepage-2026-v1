# NFT.NYC 2026 — marketing site

The React + Vite SPA that powers [https://www.nft.nyc/](https://www.nft.nyc/) — homepage, industry vertical pages, speak / sponsor / blog routes, and the Times Square Challenge landing. Deployed on Vercel.

The Times Square Challenge platform itself (collecting + voting on TS art) lives in a separate project at [https://onehub.nft.nyc/](https://onehub.nft.nyc/). Speaker voting lives at [https://vote.nft.nyc/](https://vote.nft.nyc/).

## Stack

- **Vite** + **React 18** + **TypeScript** (`tsconfig.app.json` covers `src/`; `api/tsconfig.json` covers Vercel edge functions)
- **Tailwind CSS** + **shadcn/ui** primitives
- **react-router-dom** for client routing
- **react-helmet-async** for per-route SEO/OG meta tags at runtime
- **Supabase** for the resources / speakers / sponsors data (public anon key in `.env.local`)
- **Vercel** for hosting + edge functions (`api/`)

## Local development

```bash
npm install
npm run dev                # vite dev server on :8080
npm run build              # vite build + sitemap.xml + prerendered HTML
npm run preview            # serve the production build locally
npm run lint               # eslint
```

## Routes

- `/` — homepage
- `/speak` — speaker submissions
- `/sponsor` — partnership packages
- `/sponsor/ts-challenge` — TS Challenge sponsorship
- `/ts-challenge` — TS Challenge event landing
- `/blog`, `/blog/xp-and-kredits`, `/blog/ts-challenge` — blog
- `/journey`, `/origins` — about / history
- `/<vertical>` — industry vertical pages (`/ai`, `/defi`, `/gaming`, `/culture`, `/infra`, `/social`, `/creator`, `/rwa`, `/brands`, `/domains`, `/desci`, `/marketplaces`)
- `/admin/login`, `/admin` — internal CMS (auth-gated)
- `/ts-optout` — TS Challenge art opt-out form
- `/card/:resourceId` — card preview surface used by the screenshot pipeline

## SEO + social

Every route emits its own `<title>`, description, canonical, Open Graph, and Twitter Card tags via:

- **Build time** (`scripts/prerender-verticals.mjs`) — generates `dist/<route>/index.html` per vertical/page with meta tags baked in so non-JS crawlers (Twitter, Slack, Discord, LinkedIn, Facebook) see them on first byte.
- **Runtime** (`src/components/PageMeta.tsx` + `src/pages/VerticalPage.tsx` Helmet block) — keeps meta tags in sync during client-side navigation.

OG images live in `public/og/<slug>.png` (1200×630) and `public/og/<slug>-square.png` (1080×1080). Render them via:

```bash
npm run generate:og        # uses puppeteer + the template at public/og-render/
```

The 12-hour speak countdown video lives in `public/og-videos/`. Regenerate with `node scripts/generate-og-video.mjs`.

`dist/sitemap.xml` is written at build time. LLM crawlers can find a structured site summary at `public/llms.txt`.

## Vercel redirects

Vanity URLs (e.g. `/book` → Calendly, `/billing` → HubSpot form, `/discord` → Discord invite) live in `vercel.json`.

## Edge functions (`api/`)

- `api/card-image/[id].tsx` — generates a card preview image used in outreach emails.
- `api/card-section/[id].tsx` — section-scoped card variant.

Both use `@vercel/og` and run on the Edge runtime. JSX in these files is type-checked via `api/tsconfig.json`.

## Supabase

The `subscribe`, `partnership-inquiry`, `add-contact`, `fetch-og-image`, `find-resource-for-speaker`, and `auto-seek-resources` edge functions live under `supabase/functions/`. Deploy with:

```bash
supabase functions deploy <name> --no-verify-jwt --project-ref zgryfbuoarrlmocavodo
```

Schema lives in `supabase-schema.sql`. Seed files in the repo root.

## Contact

- Press / partnerships: team@nft.nyc
- Engineering: contact via repo issues or PeopleBrowsr internal channels.
