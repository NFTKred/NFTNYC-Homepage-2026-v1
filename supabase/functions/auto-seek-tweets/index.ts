// auto-seek-tweets — sibling of auto-seek-resources, but Perplexity-only and
// per-speaker. Given a vertical, finds up to 3 QRT-worthy recent tweets per
// qrt_eligible speaker in that vertical. Scores each per an adapted rubric
// (Perplexity can't give us reliable engagement metrics, so the rubric weighs
// substance and topic-match more heavily than the original spec).
//
// Auth: ANON + user JWT, like auto-seek-resources.
// Inserts: service role, like auto-seek-resources.
// Idempotency: per (speaker_id, tweet_url) UNIQUE; stale candidates older
// than 7 days are deleted before reinsert; approved/used candidates are
// preserved.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Map vertical_id → human-readable name and topic keywords for prompt building.
// Mirrors what the client passes to auto-seek-resources, but kept inline here
// so the cron job (future) doesn't need a client to invoke this function.
const VERTICAL_META: Record<string, { name: string; keywords: string[] }> = {
  ai:          { name: 'AI Identity Tokenization',     keywords: ['AI agents','agent identity','autonomous wallets','ERC-8004','AI x crypto'] },
  gaming:      { name: 'Game Tokenization',            keywords: ['Web3 gaming','metaverse','virtual land','play-to-own','game NFTs'] },
  infra:       { name: 'On-Chain Infrastructure',      keywords: ['L2','rollup','wallet infrastructure','onchain identity','account abstraction'] },
  social:      { name: 'Social NFTs',                  keywords: ['Farcaster','Lens','social tokens','onchain social','community NFTs'] },
  creator:     { name: 'Creator Economy',              keywords: ['creator monetization','editions','tokengated content','music NFTs','creator royalties'] },
  defi:        { name: 'DeFi',                         keywords: ['DeFi','tokenization','stablecoins','RWA','liquid staking'] },
  rwa:         { name: 'RWA Tokenization',             keywords: ['real-world assets','tokenized treasuries','tokenized real estate','onchain bonds','RWA'] },
  brands:      { name: 'Brands & Engagement',          keywords: ['brand NFTs','digital collectibles','loyalty NFTs','brand activation','consumer crypto'] },
  culture:     { name: 'Culture, Art & Music',         keywords: ['NFT art','generative art','music NFTs','digital art','onchain culture'] },
  domains:     { name: 'DNS / ENS Domain Tokens',      keywords: ['ENS','crypto domains','domain tokenization','onchain identity','namespaces'] },
  desci:       { name: 'DeSci / Longevity Tokenization', keywords: ['DeSci','longevity','science tokens','research funding','biotech crypto'] },
  marketplaces:{ name: 'NFT Marketplaces',             keywords: ['NFT marketplace','OpenSea','Blur','marketplace fees','NFT trading'] },
};

// Hard disqualifiers — applied BEFORE scoring. Any match → tweet rejected.
const DISQUALIFIER_PATTERNS = [
  /^gm[!.\s]*$/i,
  /^gn[!.\s]*$/i,
  /^[\p{Emoji}\s]+$/u,                      // pure-emoji tweet
  /^RT[\s:@]/i,                              // explicit retweet marker
  /\bRT\s+to\s+win\b/i,
  /\bfollow\s+to\s+enter\b/i,
  /\bgiveaway\b/i,
  /\bairdrop\s+(promo|drop|alert)\b/i,
];

interface CandidateTweet {
  tweet_url?: string;
  tweet_id?: string;
  posted_at?: string;
  text?: string;
  media_type?: string;
  is_thread?: boolean;
  topic_match?: string;
  engagement?: { likes?: number; reposts?: number; replies?: number; views?: number };
  has_take?: boolean;                        // Perplexity's own assessment
  is_reply?: boolean;
  is_pure_rt?: boolean;
  is_controversy_reply?: boolean;
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractJsonArray(text: string): any[] | null {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const arrMatch = candidate.match(/\[[\s\S]*\]/);
  if (!arrMatch) return null;
  try { return JSON.parse(arrMatch[0]); } catch { return null; }
}

function buildPrompt(speaker: { name: string; role: string | null; handle: string | null }, verticalName: string, keywords: string[]): string {
  const handleHint = speaker.handle ? `@${speaker.handle}` : '(handle unknown — search by name)';
  const today = new Date();
  const cutoff = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  return `Find up to 3 recent, substantive tweets from ${speaker.name} (${speaker.role ?? 'unknown role'}) on X/Twitter. Handle: ${handleHint}.

HARD REQUIREMENTS:
1. Original tweets posted by this person — NOT retweets without commentary, NOT replies (unless the reply IS the first post in the speaker's own thread).
2. Posted on or after ${cutoff} (last 30 days).
3. Tweet must contain a take, claim, argument, or substantive observation — NOT "gm", "gn", single emojis, single-link announcements with no commentary, or generic praise.
4. Topic must relate to ${verticalName} or these adjacent themes: ${keywords.join(', ')}, or broader NFT / Web3 / digital ownership.
5. NOT a giveaway, airdrop promo, "RT to win", or a reply to a callout/controversy.

For each qualifying tweet, return JSON with EXACTLY these fields:
{
  "tweet_url": "https://x.com/<handle>/status/<id>",
  "tweet_id": "<the numeric status id>",
  "posted_at": "YYYY-MM-DD",
  "text": "the full tweet text, verbatim",
  "media_type": "text" | "image" | "video" | "link" | "thread",
  "is_thread": true | false,
  "topic_match": "which keyword/topic from the list this best aligns with",
  "engagement": { "likes": N, "reposts": N, "replies": N, "views": N } | null,
  "has_take": true | false,
  "is_reply": true | false,
  "is_pure_rt": true | false,
  "is_controversy_reply": true | false
}

Return ONLY a JSON array (possibly empty). No markdown fences, no prose.`;
}

// Adapted scoring rubric — see migration / plan file for rationale.
// 0–100, reject if < 40 OR any hard disqualifier hits.
function scoreTweet(t: CandidateTweet, vertical: { name: string; keywords: string[] }): { score: number; reason: string; reject: boolean } {
  const text = String(t.text ?? '').trim();
  if (text.length < 40) return { score: 0, reason: `Text too short (${text.length} chars)`, reject: true };
  if (t.is_pure_rt) return { score: 0, reason: 'Pure retweet', reject: true };
  if (t.is_reply && !t.is_thread) return { score: 0, reason: 'Reply (not thread starter)', reject: true };
  if (t.is_controversy_reply) return { score: 0, reason: 'Reply to a controversy/drama', reject: true };
  for (const re of DISQUALIFIER_PATTERNS) {
    if (re.test(text)) return { score: 0, reason: `Hard disqualifier matched: ${re}`, reject: true };
  }
  // Recency
  const postedMs = t.posted_at ? Date.parse(t.posted_at) : NaN;
  if (!Number.isNaN(postedMs) && postedMs < Date.now() - 30 * 24 * 60 * 60 * 1000) {
    return { score: 0, reason: 'Older than 30 days', reject: true };
  }

  let score = 0;
  const reasons: string[] = [];

  if (t.has_take) { score += 30; reasons.push('substantive take'); }
  if (!Number.isNaN(postedMs) && postedMs > Date.now() - 14 * 24 * 60 * 60 * 1000) {
    score += 15; reasons.push('posted within last 14d');
  }
  // Topic match — keyword string overlap with vertical name + keywords
  const topicHay = `${t.topic_match ?? ''} ${text}`.toLowerCase();
  const matchedKeyword = [vertical.name, ...vertical.keywords].find(k => topicHay.includes(k.toLowerCase()));
  if (matchedKeyword) { score += 25; reasons.push(`matches "${matchedKeyword}"`); }
  if (t.is_thread) { score += 15; reasons.push('thread'); }
  if (t.media_type === 'image' || t.media_type === 'video') { score += 10; reasons.push(`original ${t.media_type}`); }

  return {
    score: Math.min(100, score),
    reason: reasons.join('; ') + ' [Perplexity-sourced; engagement metrics unverified]',
    reject: score < 40,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return jsonResponse({ error: 'Missing authorization' }, 401);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return jsonResponse({ error: 'Unauthorized' }, 401);

    const { verticalId } = await req.json();
    if (!verticalId || typeof verticalId !== 'string') {
      return jsonResponse({ error: 'Missing verticalId' }, 400);
    }
    const meta = VERTICAL_META[verticalId];
    if (!meta) return jsonResponse({ error: `Unknown verticalId: ${verticalId}` }, 400);

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) return jsonResponse({ error: 'PERPLEXITY_API_KEY not configured' }, 500);

    // Fetch eligible speakers in this vertical
    const { data: speakers, error: spkErr } = await supabase
      .from('speakers')
      .select('id, name, role, handle, vertical_id, qrt_eligible')
      .eq('vertical_id', verticalId)
      .eq('qrt_eligible', true);

    if (spkErr) return jsonResponse({ error: 'Failed to load speakers', details: spkErr.message }, 500);
    if (!speakers || speakers.length === 0) {
      return jsonResponse({ success: true, speakerCount: 0, tweetCount: 0, message: 'No QRT-eligible speakers in this vertical' });
    }

    // Service-role client for the deletes/inserts on speaker_tweets.
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    async function callPerplexity(prompt: string): Promise<string> {
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${perplexityKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: 'You are a research assistant finding QRT-worthy recent tweets. Return ONLY a valid JSON array, no markdown, no prose.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.2,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Perplexity ${res.status}: ${errText.slice(0, 300)}`);
      }
      const data = await res.json();
      return (data?.choices?.[0]?.message?.content ?? '').trim();
    }

    // Per-speaker fetch + score. Run with a concurrency cap so we don't blow
    // the Perplexity API. 5 in flight is plenty for a vertical of ~50 speakers.
    const CONCURRENCY = 5;
    const errors: { speakerId: string; error: string }[] = [];
    const candidatesBySpeaker: Record<string, { tweet: CandidateTweet; score: number; reason: string }[]> = {};

    async function processSpeaker(speaker: typeof speakers[number]) {
      try {
        const text = await callPerplexity(buildPrompt(speaker, meta.name, meta.keywords));
        const arr = extractJsonArray(text) ?? [];
        const scored = arr
          .map((t: CandidateTweet) => ({ tweet: t, ...scoreTweet(t, meta) }))
          .filter(s => !s.reject && s.tweet.tweet_url)
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);                       // top 3 per spec
        candidatesBySpeaker[speaker.id] = scored;
      } catch (err: any) {
        errors.push({ speakerId: speaker.id, error: err?.message ?? String(err) });
      }
    }

    for (let i = 0; i < speakers.length; i += CONCURRENCY) {
      await Promise.all(speakers.slice(i, i + CONCURRENCY).map(processSpeaker));
    }

    // Persist: for each speaker, delete stale candidate/rejected rows older
    // than 7 days, then upsert the new top-N. Approved/used rows are preserved.
    let totalInserted = 0;
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    for (const speaker of speakers) {
      const found = candidatesBySpeaker[speaker.id] ?? [];

      // Clean up stale candidates only (don't touch approved/used).
      await serviceClient
        .from('speaker_tweets')
        .delete()
        .eq('speaker_id', speaker.id)
        .in('qrt_status', ['candidate', 'rejected'])
        .lt('created_at', sevenDaysAgo);

      for (const { tweet, score, reason } of found) {
        const row = {
          speaker_id: speaker.id,
          tweet_url: tweet.tweet_url!,
          tweet_id: tweet.tweet_id ?? null,
          posted_at: tweet.posted_at ? new Date(tweet.posted_at).toISOString() : null,
          text: String(tweet.text ?? '').slice(0, 4000),
          media_type: ['text','image','video','link','thread'].includes(String(tweet.media_type)) ? tweet.media_type : 'text',
          is_thread: Boolean(tweet.is_thread),
          engagement: tweet.engagement
            ? { ...tweet.engagement, verified: false }   // explicit: not verified against X API
            : null,
          qrt_score: score,
          qrt_reason: reason.slice(0, 500),
          topic_match: tweet.topic_match ? String(tweet.topic_match).slice(0, 100) : null,
          qrt_status: 'candidate',
        };
        // Upsert by (speaker_id, tweet_url): leave previously-inserted rows alone.
        const { error: insErr } = await serviceClient
          .from('speaker_tweets')
          .upsert(row, { onConflict: 'speaker_id,tweet_url', ignoreDuplicates: true });
        if (insErr) {
          errors.push({ speakerId: speaker.id, error: `Insert failed: ${insErr.message}` });
        } else {
          totalInserted++;
        }
      }
    }

    return jsonResponse({
      success: true,
      speakerCount: speakers.length,
      tweetCount: totalInserted,
      errors: errors.slice(0, 20),               // cap response size
      verticalId,
    });

  } catch (err: any) {
    console.error('auto-seek-tweets unexpected error:', err);
    return jsonResponse({ error: 'Internal server error', details: String(err) }, 500);
  }
});
