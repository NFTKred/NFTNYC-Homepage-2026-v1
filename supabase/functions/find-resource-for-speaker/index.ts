import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const VALID_TYPES = ['blog', 'youtube', 'podcast', 'tweet', 'paper', 'news'] as const;
const VALID_RELATIONSHIPS = ['authored', 'mentioned', 'interviewed', 'quoted', 'topic_expert'] as const;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function extractJsonObject(text: string): any | null {
  const trimmed = text.trim();
  if (trimmed === 'null' || trimmed.toLowerCase() === 'null') return null;
  // Prefer a JSON object wrapped in ```json ... ``` or just a bare object
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  if (candidate === 'null') return null;
  // Find the first { ... } block
  const objMatch = candidate.match(/\{[\s\S]*\}/);
  if (!objMatch) return null;
  try {
    return JSON.parse(objMatch[0]);
  } catch {
    return null;
  }
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

    const { speakerId } = await req.json();
    if (!speakerId || typeof speakerId !== 'string') {
      return jsonResponse({ error: 'Missing speakerId' }, 400);
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!geminiKey && !perplexityKey) {
      return jsonResponse({ error: 'No search API key configured (need GEMINI_API_KEY or PERPLEXITY_API_KEY)' }, 500);
    }

    const { data: speaker, error: spkErr } = await supabase
      .from('speakers')
      .select('id, name, role, handle, vertical_id, related_resource_id')
      .eq('id', speakerId)
      .single();

    if (spkErr || !speaker) return jsonResponse({ error: 'Speaker not found' }, 404);
    if (speaker.related_resource_id) {
      return jsonResponse({ status: 'already_linked', speakerId });
    }

    const handleHint = speaker.handle ? `, X/Twitter handle @${speaker.handle}` : '';
    // Extract company name from role. Role looks like "Co-Founder & CEO, BluWhale AI"
    // — everything after the first comma is usually the company. Used as an
    // additional search vector since many recent stories about a speaker are
    // company-driven announcements where they're the spokesperson.
    const company = (() => {
      if (!speaker.role) return null;
      const idx = speaker.role.indexOf(',');
      if (idx < 0) return null;
      return speaker.role.slice(idx + 1).trim().replace(/\s*\(.*$/, '').trim() || null;
    })();
    const companyHint = company ? `\nCOMPANY: "${company}" — search this name too. Recent announcements, press releases, podcast episodes, or news from this company often prominently feature ${speaker.name} as the spokesperson and qualify as good results.` : '';

    const systemPrompt = `You are a research assistant finding the single best resource featuring a specific person. Return ONLY a valid JSON object, or the literal word null. No markdown, no prose.`;
    const today = new Date();
    const maxAgeDays = 365;
    const oldestAllowed = new Date(today.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);
    const oldestAllowedISO = oldestAllowed.toISOString().slice(0, 10);
    const todayISO = today.toISOString().slice(0, 10);

    function buildPrompt(scope: 'strict' | 'broad'): string {
      const topics = scope === 'strict'
        ? 'NFTs, digital ownership, tokenization, or Web3'
        : 'crypto, blockchain, NFTs, Web3, digital ownership, tokenization, DeFi, decentralized infrastructure, on-chain identity, AI×crypto, or decentralized AI';
      const scopeNote = scope === 'broad'
        ? '\n\nThis is a BROADER scope retry — strict NFT/Web3 found nothing, so adjacent crypto/blockchain/DeFi/AI×crypto coverage is now acceptable as long as the topic is genuinely related to digital ownership, on-chain systems, or decentralized tech.'
        : '';
      return `Find the single best, credible resource about ${topics} that is AUTHORED BY, INTERVIEWING, QUOTING, or PROMINENTLY FEATURING ${speaker.name} (${speaker.role})${handleHint}.${companyHint}

SEARCH STRATEGY: try AT LEAST 3 different query phrasings before giving up. Examples:
  • "${speaker.name}" + topic
  • "${speaker.name}" + "${company ?? 'their company'}"
  • "${company ?? 'their company'}" + recent news / announcement / podcast
  • the X handle (if provided) + recent
Look beyond the first page of results. Click into podcast pages, YouTube channels, company blogs, and conference recap posts.

HARD DATE REQUIREMENT: Publication date MUST be between ${oldestAllowedISO} and ${todayISO} (within the last 12 months). Prefer the last 6 months. Do NOT return anything older than ${oldestAllowedISO}.

The person must appear clearly in the content — author, interviewee, prominent quote, or main subject. Passing-mention-only results don't count. Company announcements where this person is the named spokesperson DO count.${scopeNote}

Return exactly ONE JSON object:

{
  "title": "string",
  "url": "string — full URL",
  "type": "blog" | "youtube" | "podcast" | "tweet" | "paper" | "news",
  "date": "YYYY-MM-DD (MUST be ${oldestAllowedISO} or later)",
  "source": "string — publisher",
  "topic_tag": "string — short tag",
  "description": "string — 1-2 sentences on the angle and the speaker's role in it",
  "resource_relationship": "authored" | "mentioned" | "interviewed" | "quoted" | "topic_expert"
}

If nothing credible exists in this scope and date window, return exactly: null

Return ONLY the JSON object or the word null. No other text, no markdown.`;
    }

    async function callGemini(prompt: string): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
      if (!geminiKey) return { ok: false, status: 0, error: 'GEMINI_API_KEY not configured' };
      // Gemini 2.5 Flash has stronger tool-use / web-search reasoning than 2.0.
      // If the project's free tier doesn't include 2.5 yet, callers fall back to
      // Perplexity automatically.
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return { ok: false, status: res.status, error: errText };
      }
      const data = await res.json();
      const parts = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts.map((p: any) => p?.text ?? '').join('').trim();
      if (!text) return { ok: false, status: 200, error: 'empty_response' };
      return { ok: true, text };
    }

    async function callPerplexity(prompt: string): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
      if (!perplexityKey) return { ok: false, status: 0, error: 'PERPLEXITY_API_KEY not configured' };
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${perplexityKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.2,
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        return { ok: false, status: res.status, error: errText };
      }
      const data = await res.json();
      const text = (data?.choices?.[0]?.message?.content ?? '').trim();
      if (!text) return { ok: false, status: 200, error: 'empty_response' };
      return { ok: true, text };
    }

    // Two-pass strategy:
    //   Pass 1: strict NFT/Web3 scope. Most current taxonomy.
    //   Pass 2: broader crypto/blockchain/DeFi/AI×crypto if pass 1 found nothing.
    // Each pass tries Gemini first, falls back to Perplexity. Stop at the
    // first successful, non-null parse.
    async function searchOnce(prompt: string): Promise<{ provider: string; text: string } | { error: string; status: number }> {
      let r = await callGemini(prompt);
      if (r.ok) return { provider: 'gemini-2.5-flash', text: r.text };
      console.warn('Gemini failed, fallback Perplexity:', r.status, String(r.error).slice(0, 200));
      const p = await callPerplexity(prompt);
      if (p.ok) return { provider: 'perplexity-sonar', text: p.text };
      return { error: String(p.error), status: p.status };
    }

    let parsed: any = null;
    let providerUsed = '';
    let scopeUsed: 'strict' | 'broad' = 'strict';

    // Pass 1 — strict
    {
      const r1 = await searchOnce(buildPrompt('strict'));
      if ('error' in r1) {
        return jsonResponse({ error: 'Search provider error', status: r1.status, details: r1.error }, 502);
      }
      const p1 = extractJsonObject(r1.text);
      if (p1 && p1.url && p1.title) {
        parsed = p1;
        providerUsed = r1.provider;
        scopeUsed = 'strict';
      }
    }

    // Pass 2 — broader scope, only if pass 1 didn't return a usable result
    if (!parsed) {
      const r2 = await searchOnce(buildPrompt('broad'));
      if ('error' in r2) {
        return jsonResponse({ error: 'Search provider error', status: r2.status, details: r2.error }, 502);
      }
      const p2 = extractJsonObject(r2.text);
      if (p2 && p2.url && p2.title) {
        parsed = p2;
        providerUsed = r2.provider;
        scopeUsed = 'broad';
      }
    }

    if (!parsed) {
      return jsonResponse({
        status: 'not_found',
        reason: 'no_credible_match',
        note: 'Tried strict NFT/Web3 scope and broader crypto/blockchain/DeFi/AI×crypto scope. Nothing in the last 12 months prominently features this person at this company.',
      });
    }

    if (!parsed.url || !parsed.title) {
      return jsonResponse({ status: 'not_found', reason: 'incomplete_result', raw: parsed });
    }

    // Hard date guard: reject anything older than maxAgeDays. Perplexity sometimes
    // ignores date constraints in the prompt and returns stale content.
    const parsedDate = parsed.date ? new Date(parsed.date) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime()) || parsedDate < oldestAllowed) {
      return jsonResponse({
        status: 'not_found',
        reason: 'result_too_old',
        oldestAllowed: oldestAllowedISO,
        resultDate: parsed.date ?? null,
        raw: parsed,
      });
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const resourceType = VALID_TYPES.includes(parsed.type) ? parsed.type : 'blog';
    const relationship = VALID_RELATIONSHIPS.includes(parsed.resource_relationship)
      ? parsed.resource_relationship
      : 'mentioned';

    // Best-effort og:image fetch so the inserted row has a hero image from
    // the start. YouTube URLs short-circuit to the video thumbnail. For
    // everything else we fetch the page with a browser User-Agent and grep
    // out og:image / twitter:image / Microlink as a fallback. If all fail
    // we leave image null — better than blocking the insert on it.
    async function fetchOgImage(targetUrl: string): Promise<string | null> {
      const ytMatch = targetUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
      if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 10_000);
        const res = await fetch(targetUrl, {
          signal: ctrl.signal,
          headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' },
        });
        clearTimeout(t);
        if (res.ok) {
          const html = await res.text();
          const m = html.match(/(?:property|name)=["'](?:og:image|twitter:image)["'][^>]*content=["']([^"']+)["']/i);
          if (m && m[1]) return m[1].replace(/&amp;/g, '&');
        }
      } catch { /* fall through to Microlink */ }
      try {
        const ml = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(targetUrl)}`);
        if (ml.ok) {
          const j = await ml.json();
          const img = j?.data?.image?.url || j?.data?.logo?.url || null;
          if (img) return img;
        }
      } catch { /* ignore */ }
      return null;
    }
    const ogImage = await fetchOgImage(String(parsed.url));

    const resourceRow = {
      vertical_id: speaker.vertical_id,
      title: String(parsed.title).slice(0, 500),
      url: String(parsed.url),
      type: resourceType,
      date: parsed.date || new Date().toISOString().slice(0, 10),
      source: String(parsed.source || 'Unknown').slice(0, 200),
      topic_tag: String(parsed.topic_tag || '').slice(0, 200),
      description: String(parsed.description || '').slice(0, 1000),
      image: ogImage,
      status: 'pending',
      auto_found: true,
      created_by: user.id,
    };

    const { data: resData, error: resErr } = await serviceClient
      .from('resources')
      .insert(resourceRow)
      .select()
      .single();

    if (resErr || !resData) {
      console.error('Resource insert error:', resErr);
      return jsonResponse({ error: 'Failed to insert resource', details: resErr?.message }, 500);
    }

    // Only link if the speaker still has no related resource (avoids races with a manual link)
    const { data: updatedSpeaker, error: updErr } = await serviceClient
      .from('speakers')
      .update({ related_resource_id: resData.id, resource_relationship: relationship })
      .eq('id', speaker.id)
      .is('related_resource_id', null)
      .select()
      .single();

    if (updErr) {
      console.error('Speaker link update error:', updErr);
      // Resource was inserted but speaker was concurrently linked. Return info so UI can reconcile.
      return jsonResponse({
        status: 'linked_resource_only',
        resource: resData,
        speakerId: speaker.id,
        note: 'Resource inserted; speaker was already linked by another process.',
      });
    }

    return jsonResponse({
      status: 'linked',
      resource: resData,
      speaker: updatedSpeaker,
      speakerId: speaker.id,
      provider: providerUsed,
      scope: scopeUsed,
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return jsonResponse({ error: 'Internal server error', details: String(err) }, 500);
  }
});
