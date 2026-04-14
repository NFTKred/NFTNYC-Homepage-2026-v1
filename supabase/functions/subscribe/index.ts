/**
 * subscribe — anti-spam proxy for the newsletter signup.
 *
 * Flow:
 *   1. Reject if honeypot field is filled (dumb bots).
 *   2. Reject if name fields look like random-character spam.
 *   3. Validate the Cloudflare Turnstile token (smart bots / headless browsers).
 *   4. Forward the clean payload to the existing add-contact Edge Function.
 *
 * Environment variables (set via Supabase Dashboard → Edge Functions → Secrets):
 *   TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret key
 *   ADD_CONTACT_URL      — the existing add-contact endpoint URL
 *   ADD_CONTACT_SECRET   — the x-webhook-secret for add-contact
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// A name is suspicious if >50% of chars are non-letter or it has no spaces
// and is longer than 15 chars (like "MlHKBbjLhjjUFwlTUtro").
function looksSpammy(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length === 0) return true;
  const letters = trimmed.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ\s'-]/g, '');
  const ratio = letters.length / trimmed.length;
  if (ratio < 0.6) return true;
  // A single "name" token longer than 20 chars with no spaces is unlikely.
  if (trimmed.length > 20 && !trimmed.includes(' ')) return true;
  return false;
}

Deno.serve(async (req) => {
  // Handle CORS preflight.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  const TURNSTILE_SECRET = Deno.env.get('TURNSTILE_SECRET_KEY');
  const ADD_CONTACT_URL  = Deno.env.get('ADD_CONTACT_URL');
  const ADD_CONTACT_SECRET = Deno.env.get('ADD_CONTACT_SECRET');

  if (!TURNSTILE_SECRET || !ADD_CONTACT_URL || !ADD_CONTACT_SECRET) {
    console.error('Missing env vars');
    return new Response(
      JSON.stringify({ error: 'Server misconfiguration' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON' }),
      { status: 400, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  const { firstName, lastName, email, listId, turnstileToken, website } = body as Record<string, string>;

  // ── Layer 1: Honeypot ────────────────────────────────────────────────
  // The "website" field is hidden via CSS. Humans never fill it.
  if (website) {
    // Silently accept so bots don't know they were caught.
    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  // ── Layer 2: Name heuristics ─────────────────────────────────────────
  if (looksSpammy(firstName ?? '') || looksSpammy(lastName ?? '')) {
    return new Response(
      JSON.stringify({ error: 'Please enter a valid name.' }),
      { status: 422, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  // ── Layer 3: Turnstile verification ──────────────────────────────────
  if (!turnstileToken) {
    return new Response(
      JSON.stringify({ error: 'Bot verification required. Please try again.' }),
      { status: 422, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      secret: TURNSTILE_SECRET,
      response: turnstileToken,
    }),
  });
  const cfData = await cfRes.json();

  if (!cfData.success) {
    console.warn('Turnstile rejected:', JSON.stringify(cfData));
    return new Response(
      JSON.stringify({ error: 'Bot verification failed. Please refresh and try again.' }),
      { status: 403, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }

  // ── Layer 4: Forward to existing add-contact ─────────────────────────
  const forward = async (targetListId: string) => {
    const res = await fetch(ADD_CONTACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-secret': ADD_CONTACT_SECRET,
      },
      body: JSON.stringify({ firstName, lastName, email, listId: targetListId }),
    });
    return res.ok;
  };

  const GENERAL_LIST_ID = '24950fb1-4d98-4b3c-94b1-ea0ebc28141f';

  try {
    const [personaOk, generalOk] = await Promise.all([
      forward(listId),
      forward(GENERAL_LIST_ID),
    ]);

    if (!personaOk && !generalOk) {
      return new Response(
        JSON.stringify({ error: 'Subscription service error. Please try again.' }),
        { status: 502, headers: { ...corsHeaders, 'content-type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  } catch (err) {
    console.error('Forward error:', err);
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { ...corsHeaders, 'content-type': 'application/json' } }
    );
  }
});
