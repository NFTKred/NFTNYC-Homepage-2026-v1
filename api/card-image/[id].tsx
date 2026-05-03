// Vercel Edge function — renders the "Latest on <Vertical>" section preview
// used in outreach email drafts. Layout matches the original card_screenshot
// pipeline: small "RESOURCES" eyebrow, big "LATEST ON <vertical>" heading,
// then the speaker's resource as the top card followed by two other
// approved resources from the same vertical. No external screenshot
// services, no storage — image renders from live Supabase data on every
// request.
//
// Route: /api/card-image/<resourceId>

import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = 'https://zgryfbuoarrlmocavodo.supabase.co';
// Public anon key — already shipped in the client bundle, safe to embed.
const SUPABASE_ANON =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpncnlmYnVvYXJybG1vY2F2b2RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNjA4MzEsImV4cCI6MjA5MDczNjgzMX0.xDGlhaIKm_6sArOQnU8mUIDdpeVbX3Iwh5rVDRkvD_g';

const VERTICAL_META: Record<string, { name: string; color: string }> = {
  ai:           { name: 'AI Identity Tokenization',     color: '#3B82F6' },
  gaming:       { name: 'Game Tokenization',            color: '#8B5CF6' },
  infra:        { name: 'On-Chain Infrastructure',      color: '#06B6D4' },
  social:       { name: 'Social NFTs',                  color: '#EC4899' },
  creator:      { name: 'Creator Economy',              color: '#F59E0B' },
  defi:         { name: 'DeFi',                         color: '#10B981' },
  rwa:          { name: 'RWA Tokenization',             color: '#EF4444' },
  brands:       { name: 'Brands & Engagement',          color: '#F97316' },
  culture:      { name: 'Culture, Art & Music',         color: '#D946EF' },
  domains:      { name: 'DNS ENS Domain Tokens',        color: '#14B8A6' },
  desci:        { name: 'DeSci · Longevity',            color: '#84CC16' },
  marketplaces: { name: 'NFT Marketplaces',             color: '#38BDF8' },
};

const TYPE_LABEL: Record<string, string> = {
  blog: 'BLOG', youtube: 'VIDEO', podcast: 'PODCAST',
  tweet: 'TWEET', paper: 'PAPER', news: 'NEWS',
};

interface Resource {
  id: string;
  vertical_id: string;
  title: string;
  url: string;
  type: string;
  date: string;
  source: string;
  topic_tag: string;
  description: string | null;
  image: string | null;
}

const RESOURCE_FIELDS = 'id,vertical_id,title,url,type,date,source,topic_tag,description,image';

async function supaFetch(path: string): Promise<unknown> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_ANON,
      Authorization: `Bearer ${SUPABASE_ANON}`,
    },
  });
  if (!res.ok) return null;
  return res.json();
}

async function fetchResource(id: string): Promise<Resource | null> {
  const rows = (await supaFetch(`resources?id=eq.${id}&select=${RESOURCE_FIELDS}`)) as Resource[] | null;
  return rows?.[0] ?? null;
}

async function fetchNeighbors(verticalId: string, excludeId: string): Promise<Resource[]> {
  // Only neighbors with images so the section preview reads well visually.
  const rows = (await supaFetch(
    `resources?vertical_id=eq.${verticalId}&status=eq.approved&id=neq.${excludeId}&image=not.is.null&order=display_order.asc.nullslast,date.desc&limit=2&select=${RESOURCE_FIELDS}`
  )) as Resource[] | null;
  return rows ?? [];
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

function deriveHero(r: Resource): string | null {
  if (r.type === 'youtube') {
    const ytId = getYouTubeId(r.url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  return r.image && r.image.trim() ? r.image : null;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n) + '…' : s;
}

const CARD_WIDTH = 1080;
const HERO_HEIGHT = Math.round(CARD_WIDTH / 1.91); // 565

function ResourceCardJSX({
  resource,
  meta,
}: {
  resource: Resource;
  meta: { name: string; color: string };
}) {
  const hero = deriveHero(resource);
  const typeLabel = TYPE_LABEL[resource.type] ?? resource.type.toUpperCase();
  const dateLabel = formatDate(resource.date);

  return (
    <div
      style={{
        width: `${CARD_WIDTH}px`,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '24px',
      }}
    >
      {/* Hero */}
      <div
        style={{
          width: '100%',
          height: `${HERO_HEIGHT}px`,
          display: 'flex',
          position: 'relative',
          background: hero ? '#000' : `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
        }}
      >
        {hero && (
          <img
            src={hero}
            width={CARD_WIDTH}
            height={HERO_HEIGHT}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            display: 'flex',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '2px',
            color: '#FFFFFF',
            background: 'rgba(0,0,0,0.6)',
            padding: '6px 14px',
            borderRadius: '6px',
          }}
        >
          {typeLabel}
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          padding: '24px 28px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '12px',
          }}
        >
          {resource.title}
        </div>
        {resource.description && (
          <div
            style={{
              fontSize: '16px',
              color: 'rgba(255,255,255,0.7)',
              lineHeight: 1.4,
              marginBottom: '16px',
            }}
          >
            <span style={{ color: meta.color, fontWeight: 700, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>
              The NFT angle:&nbsp;
            </span>
            {truncate(resource.description, 220)}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'center',
            fontSize: '14px',
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          <div style={{ display: 'flex' }}>{resource.source}</div>
          <div style={{ display: 'flex' }}>·</div>
          <div style={{ display: 'flex' }}>{dateLabel}</div>
          {resource.topic_tag && (
            <>
              <div style={{ display: 'flex' }}>·</div>
              <div
                style={{
                  display: 'flex',
                  background: `${meta.color}33`,
                  color: meta.color,
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              >
                {resource.topic_tag}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return new Response('Missing resource id', { status: 400 });

    const target = await fetchResource(id);
    if (!target) return new Response('Resource not found', { status: 404 });

    const meta = VERTICAL_META[target.vertical_id] ?? { name: target.vertical_id, color: '#FFFFFF' };
    const neighbors = await fetchNeighbors(target.vertical_id, target.id);

    // Total height: header (~160) + 3 cards × ~880 each + bottom padding
    const totalHeight = 160 + (HERO_HEIGHT + 200) * 3 + 80;

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: `${totalHeight}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#0A0A0F',
            padding: '40px 60px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Eyebrow */}
          <div
            style={{
              display: 'flex',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '4px',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              marginBottom: '12px',
              justifyContent: 'center',
            }}
          >
            Resources
          </div>
          {/* Heading */}
          <div
            style={{
              display: 'flex',
              fontSize: '54px',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '-1px',
              lineHeight: 1.05,
              marginBottom: '36px',
              justifyContent: 'center',
              textAlign: 'center',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ color: '#FFFFFF' }}>Latest on&nbsp;</span>
            <span style={{ color: meta.color }}>{meta.name}</span>
          </div>

          {/* Cards */}
          <ResourceCardJSX resource={target} meta={meta} />
          {neighbors.map((n) => (
            <ResourceCardJSX key={n.id} resource={n} meta={meta} />
          ))}
        </div>
      ),
      {
        width: 1200,
        height: totalHeight,
        headers: {
          // Short cache; the admin appends ?v=<timestamp> per Copy Draft so
          // each request is a unique URL anyway. 60s here just dedupes
          // concurrent fetches from a single email render.
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        },
      }
    );
  } catch (err) {
    console.error('card-image error:', err);
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }
}
