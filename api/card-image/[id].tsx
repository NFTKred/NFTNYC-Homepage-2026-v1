// Vercel Edge function — renders the "Latest on <Vertical>" card image used
// in outreach email drafts. No external screenshot services, no storage:
// the image is generated from live Supabase data on every request.
//
// Route: /api/card-image/<resourceId>
//
// Public-anon Supabase access is fine here — the resources table is already
// readable by anonymous users (it powers the public ecosystem pages).

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

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

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

async function fetchResource(id: string): Promise<Resource | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/resources?id=eq.${id}&select=id,vertical_id,title,url,type,date,source,topic_tag,description,image`,
    {
      headers: {
        apikey: SUPABASE_ANON,
        Authorization: `Bearer ${SUPABASE_ANON}`,
      },
    }
  );
  if (!res.ok) return null;
  const rows = (await res.json()) as Resource[];
  return rows[0] ?? null;
}

function deriveHeroImage(resource: Resource): string | null {
  // YouTube: always use the proper video thumbnail; ignore any saved image.
  if (resource.type === 'youtube') {
    const ytId = getYouTubeId(resource.url);
    if (ytId) return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  if (resource.image && resource.image.trim()) return resource.image;
  return null;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    const id = parts[parts.length - 1];
    if (!id) return new Response('Missing resource id', { status: 400 });

    const resource = await fetchResource(id);
    if (!resource) return new Response('Resource not found', { status: 404 });

    const meta = VERTICAL_META[resource.vertical_id] ?? { name: resource.vertical_id, color: '#FFFFFF' };
    const heroImage = deriveHeroImage(resource);
    const typeLabel = TYPE_LABEL[resource.type] ?? resource.type.toUpperCase();
    const dateLabel = formatDate(resource.date);

    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '900px',
            display: 'flex',
            flexDirection: 'column',
            background: '#0A0A0F',
            padding: '48px 56px',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Top label */}
          <div
            style={{
              display: 'flex',
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '4px',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              marginBottom: '8px',
              justifyContent: 'center',
            }}
          >
            Resources
          </div>
          {/* Heading */}
          <div
            style={{
              display: 'flex',
              fontSize: '52px',
              fontWeight: 900,
              color: '#FFFFFF',
              textTransform: 'uppercase',
              letterSpacing: '-1px',
              lineHeight: 1.05,
              marginBottom: '32px',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <span>Latest on&nbsp;</span>
            <span style={{ color: meta.color }}>{meta.name}</span>
          </div>

          {/* Hero card */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${meta.color}33`,
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
            }}
          >
            {/* Hero image area */}
            <div
              style={{
                width: '100%',
                height: heroImage ? '460px' : '120px',
                display: 'flex',
                position: 'relative',
                background: heroImage ? '#000' : `linear-gradient(135deg, ${meta.color}33, ${meta.color}11)`,
              }}
            >
              {heroImage && (
                <img
                  src={heroImage}
                  width={1200 - 56 * 2}
                  height={460}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
              {/* Type chip */}
              <div
                style={{
                  position: 'absolute',
                  top: '20px',
                  left: '20px',
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

            {/* Card body */}
            <div
              style={{
                padding: '28px 32px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                  marginBottom: '16px',
                }}
              >
                {resource.title}
              </div>
              {resource.description && (
                <div
                  style={{
                    fontSize: '18px',
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.4,
                    marginBottom: 'auto',
                  }}
                >
                  {resource.description.length > 200
                    ? resource.description.slice(0, 200) + '…'
                    : resource.description}
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  fontSize: '15px',
                  color: 'rgba(255,255,255,0.55)',
                  marginTop: '20px',
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
                        padding: '4px 12px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      {resource.topic_tag}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '24px',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            <div style={{ display: 'flex', fontWeight: 700, letterSpacing: '2px', color: '#FFFFFF' }}>NFT.NYC 2026</div>
            <div style={{ display: 'flex' }}>Sept 1–3 · The Edison · Times Square</div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 900,
        // Short cache: each Copy Draft click in the admin appends ?v=<timestamp>
        // so the URL is unique anyway, but this keeps Vercel's edge cache from
        // holding a stale render in the rare case the same URL is hit twice.
        // 60s edge / 60s browser is enough to deduplicate concurrent fetches
        // by an email client opening the same image multiple times.
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=60',
        },
      }
    );
  } catch (err) {
    console.error('card-image error:', err);
    return new Response(`Error: ${(err as Error).message}`, { status: 500 });
  }
}
