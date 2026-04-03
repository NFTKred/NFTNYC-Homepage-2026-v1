import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Supabase client with the user's JWT
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { verticalId, verticalName, topics } = await req.json();
    if (!verticalId || !verticalName || !topics?.length) {
      return new Response(JSON.stringify({ error: 'Missing verticalId, verticalName, or topics' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!perplexityKey) {
      return new Response(JSON.stringify({ error: 'Perplexity API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Perplexity API
    const topicList = topics.slice(0, 5).join(', ');
    const perplexityResponse = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content: `You are a research assistant finding recent, high-quality resources about NFTs and tokenization in the ${verticalName} ecosystem. Every resource MUST clearly relate to NFTs, digital ownership, or tokenization. Only return resources published in the last 6 months. Return ONLY a valid JSON array, no other text.`,
          },
          {
            role: 'user',
            content: `Find 5 recent articles, blog posts, or YouTube videos about NFTs and tokenization related to these topics: ${topicList}.

CRITICAL: Each resource MUST have a specific person associated with it — either the author, a person interviewed, quoted, or prominently mentioned. If you cannot identify a specific person for a resource, DO NOT include that resource.

For each resource, return a JSON object with these exact fields:
- "title": the article/video title
- "url": the full URL
- "type": one of "blog", "youtube", "podcast", "tweet", "paper", "news"
- "date": publication date as YYYY-MM-DD (must be within the last 6 months)
- "source": publisher name (e.g. "CoinDesk", "Forbes")
- "topicTag": which topic from the list above it relates to
- "description": 1-2 sentences explaining the NFT angle — how this relates to NFTs or tokenization
- "speakerName": full name of the person associated (author, interviewee, or person mentioned)
- "speakerRole": their title and company (e.g. "CEO, OpenSea")
- "speakerHandle": their Twitter/X handle without @ (or null if unknown)
- "speakerRelationship": one of "authored", "mentioned", "interviewed", "quoted"

Return ONLY a JSON array of objects. No markdown, no explanation.`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.1,
      }),
    });

    if (!perplexityResponse.ok) {
      const errText = await perplexityResponse.text();
      console.error('Perplexity API error:', errText);
      return new Response(JSON.stringify({ error: 'Perplexity API error', details: errText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const perplexityData = await perplexityResponse.json();
    const content = perplexityData.choices?.[0]?.message?.content ?? '';

    // Parse the JSON array from the response
    let resources: any[] = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        resources = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.error('Failed to parse Perplexity response:', content);
      return new Response(JSON.stringify({ error: 'Failed to parse AI response', raw: content }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Filter out resources without a speaker
    const withSpeakers = Array.isArray(resources) ? resources.filter((r: any) => r.speakerName) : [];

    if (withSpeakers.length === 0) {
      return new Response(JSON.stringify({ error: 'No resources found with identifiable speakers', raw: content }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use service role to bypass RLS for inserts
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const insertedResources: any[] = [];
    const insertedSpeakers: any[] = [];

    for (const r of withSpeakers) {
      // Insert the resource
      const resourceRow = {
        vertical_id: verticalId,
        title: String(r.title || '').slice(0, 500),
        url: String(r.url || ''),
        type: ['blog', 'youtube', 'podcast', 'tweet', 'paper', 'news'].includes(r.type) ? r.type : 'blog',
        date: r.date || new Date().toISOString().slice(0, 10),
        source: String(r.source || 'Unknown'),
        topic_tag: String(r.topicTag || r.topic_tag || topics[0] || ''),
        description: String(r.description || '').slice(0, 1000),
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
        continue;
      }

      insertedResources.push(resData);

      // Insert the associated speaker
      const speakerRow = {
        vertical_id: verticalId,
        name: String(r.speakerName).slice(0, 200),
        role: String(r.speakerRole || 'Unknown').slice(0, 200),
        handle: r.speakerHandle || null,
        related_resource_id: resData.id,
        resource_relationship: ['authored', 'mentioned', 'interviewed', 'quoted'].includes(r.speakerRelationship) ? r.speakerRelationship : 'mentioned',
        outreach_channel: r.speakerHandle ? 'twitter_dm' : 'email',
        outreach_status: 'not_started',
      };

      const { data: spkData, error: spkErr } = await serviceClient
        .from('speakers')
        .insert(speakerRow)
        .select()
        .single();

      if (spkErr) {
        console.error('Speaker insert error:', spkErr);
      } else if (spkData) {
        insertedSpeakers.push(spkData);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      resourceCount: insertedResources.length,
      speakerCount: insertedSpeakers.length,
      resources: insertedResources,
      speakers: insertedSpeakers,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error', details: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
