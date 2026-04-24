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
    const systemPrompt = `You are a research assistant finding a single high-quality resource about NFTs, digital ownership, tokenization, or Web3 that prominently features a specific person. Return ONLY a valid JSON object, or the literal word null. No markdown, no prose.`;
    const today = new Date();
    const maxAgeDays = 365;
    const oldestAllowed = new Date(today.getTime() - maxAgeDays * 24 * 60 * 60 * 1000);
    const oldestAllowedISO = oldestAllowed.toISOString().slice(0, 10);
    const todayISO = today.toISOString().slice(0, 10);

    const userPrompt = `Find the single best, credible resource about NFTs, digital ownership, tokenization, or Web3 that is AUTHORED BY, INTERVIEWING, QUOTING, or PROMINENTLY FEATURING ${speaker.name} (${speaker.role})${handleHint}.

HARD DATE REQUIREMENT: The resource's publication date MUST be between ${oldestAllowedISO} and ${todayISO} (within the last 12 months). Prefer resources from the last 6 months when available. Do NOT return anything older than ${oldestAllowedISO} — if no qualifying recent resource exists, return null instead.

The person must appear clearly in the content — the resource should be about them or by them, not just a passing mention.

Return exactly ONE JSON object with this shape:

{
  "title": "string — article/video/podcast title",
  "url": "string — full URL",
  "type": "blog" | "youtube" | "podcast" | "tweet" | "paper" | "news",
  "date": "YYYY-MM-DD publication date (MUST be ${oldestAllowedISO} or later)",
  "source": "string — publisher name (e.g. CoinDesk, Forbes)",
  "topic_tag": "string — short tag describing the NFT/Web3 topic",
  "description": "string — 1-2 sentences on how this relates to NFTs/Web3 and the speaker's role in it",
  "resource_relationship": "authored" | "mentioned" | "interviewed" | "quoted" | "topic_expert"
}

If you cannot find a credible, specific resource published on or after ${oldestAllowedISO} that clearly features this person in an NFT/Web3 context, return exactly: null

Return ONLY the JSON object or the word null. No other text, no markdown.`;

    async function callGemini(): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
      if (!geminiKey) return { ok: false, status: 0, error: 'GEMINI_API_KEY not configured' };
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(geminiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          tools: [{ google_search: {} }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 1500 },
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

    async function callPerplexity(): Promise<{ ok: true; text: string } | { ok: false; status: number; error: string }> {
      if (!perplexityKey) return { ok: false, status: 0, error: 'PERPLEXITY_API_KEY not configured' };
      const res = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${perplexityKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'sonar',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.1,
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

    // Try Gemini first (free tier), fall back to Perplexity on any failure.
    let providerUsed = 'gemini';
    let result = await callGemini();
    if (!result.ok) {
      console.warn('Gemini failed, falling back to Perplexity:', result.status, result.error?.slice?.(0, 200));
      providerUsed = 'perplexity';
      result = await callPerplexity();
    }

    if (!result.ok) {
      console.error('Both providers failed. Perplexity:', result.status, result.error);
      return jsonResponse({
        error: 'Search provider error',
        provider: providerUsed,
        status: result.status,
        details: result.error,
      }, 502);
    }

    const responseText = result.text;

    const parsed = extractJsonObject(responseText);

    if (!parsed) {
      return jsonResponse({ status: 'not_found', reason: 'no_credible_match' });
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

    const resourceRow = {
      vertical_id: speaker.vertical_id,
      title: String(parsed.title).slice(0, 500),
      url: String(parsed.url),
      type: resourceType,
      date: parsed.date || new Date().toISOString().slice(0, 10),
      source: String(parsed.source || 'Unknown').slice(0, 200),
      topic_tag: String(parsed.topic_tag || '').slice(0, 200),
      description: String(parsed.description || '').slice(0, 1000),
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
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return jsonResponse({ error: 'Internal server error', details: String(err) }, 500);
  }
});
