import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET = 'resource-card-screenshots';
const MIN_BLOB_BYTES = 40_000;
const THUMIO_WAIT = 15;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Capture the card preview at https://www.nft.nyc/card/<resourceId> via thum.io
 * (primary) or Microlink (fallback), then upload to Supabase Storage and persist
 * the public URL on the resource row.
 *
 * Server-side equivalent of `lib/cardScreenshot.ts` — used so we don't depend
 * on the admin's browser running html2canvas correctly. Called after every
 * resource insert/update from the admin form, after auto-discovery via
 * find-resource-for-speaker, and during one-off backfills.
 */
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

    const { resourceId, force } = await req.json();
    if (!resourceId || typeof resourceId !== 'string') {
      return jsonResponse({ error: 'Missing resourceId' }, 400);
    }

    const targetUrl = `https://www.nft.nyc/card/${resourceId}`;

    let blob: Uint8Array | null = null;
    let provider = '';
    const errors: Record<string, string> = {};

    // 1. thum.io (server-side headless screenshot, free tier)
    try {
      const thumUrl =
        `https://image.thum.io/get/width/960/png/viewportWidth/960` +
        `/noanimate/wait/${THUMIO_WAIT}/noCache/${targetUrl}`;
      const res = await fetch(thumUrl);
      if (res.ok) {
        const buf = new Uint8Array(await res.arrayBuffer());
        if (buf.byteLength >= MIN_BLOB_BYTES) {
          blob = buf;
          provider = 'thum.io';
        } else {
          errors.thumio = `blob too small (${buf.byteLength} bytes)`;
        }
      } else {
        errors.thumio = `HTTP ${res.status}`;
      }
    } catch (e) {
      errors.thumio = String(e);
    }

    // 2. Microlink fallback (different infra; helps when thum.io rate-limits)
    if (!blob) {
      try {
        const mlApi =
          'https://api.microlink.io/?' +
          new URLSearchParams({
            url: targetUrl,
            screenshot: 'true',
            meta: 'false',
            'viewport.width': '960',
            'viewport.height': '1600',
            'viewport.deviceScaleFactor': '2',
            waitUntil: 'networkidle0',
            wait: '5000',
            type: 'png',
            ...(force ? { force: 'true' } : {}),
          }).toString();
        const mlRes = await fetch(mlApi);
        if (mlRes.ok) {
          const mlData = await mlRes.json();
          const shotUrl = mlData?.data?.screenshot?.url;
          if (shotUrl) {
            const imgRes = await fetch(shotUrl);
            if (imgRes.ok) {
              const buf = new Uint8Array(await imgRes.arrayBuffer());
              if (buf.byteLength >= MIN_BLOB_BYTES) {
                blob = buf;
                provider = 'microlink';
              } else {
                errors.microlink = `blob too small (${buf.byteLength} bytes)`;
              }
            } else {
              errors.microlink = `image fetch HTTP ${imgRes.status}`;
            }
          } else {
            errors.microlink = 'no screenshot URL in response';
          }
        } else {
          errors.microlink = `HTTP ${mlRes.status}`;
        }
      } catch (e) {
        errors.microlink = String(e);
      }
    }

    if (!blob) {
      console.error('Both providers failed:', errors);
      return jsonResponse({
        error: 'All screenshot providers failed',
        details: errors,
      }, 502);
    }

    // Upload to Supabase Storage with service-role client.
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const path = `${resourceId}.png`;
    const { error: uploadErr } = await serviceClient.storage
      .from(BUCKET)
      .upload(path, blob, { contentType: 'image/png', upsert: true });
    if (uploadErr) {
      console.error('Storage upload error:', uploadErr);
      return jsonResponse({ error: 'Storage upload failed', details: uploadErr.message }, 500);
    }

    const { data: publicData } = serviceClient.storage.from(BUCKET).getPublicUrl(path);
    const publicUrl = `${publicData.publicUrl}?v=${Date.now()}`;

    const { error: updateErr } = await serviceClient
      .from('resources')
      .update({ card_screenshot: publicUrl })
      .eq('id', resourceId);
    if (updateErr) {
      console.error('Resource update error:', updateErr);
      return jsonResponse({ error: 'Failed to save card_screenshot URL', details: updateErr.message }, 500);
    }

    return jsonResponse({
      status: 'ok',
      resourceId,
      provider,
      url: publicUrl,
      bytes: blob.byteLength,
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return jsonResponse({ error: 'Internal server error', details: String(err) }, 500);
  }
});
