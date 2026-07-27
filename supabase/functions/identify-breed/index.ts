import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type Alt = { breedName: string; confidence: number };

type IdentifyResult = {
  breedName: string;
  confidence: number;
  alternatives: Alt[];
};

const SYSTEM_PROMPT = `You identify dog or cat breeds from photos for a pet companion app.
The user will tell you whether the animal is a dog or a cat — respect that species.
Return ONLY valid JSON (no markdown) with this exact shape:
{
  "breedName": "string — best-effort English breed name matching common kennel/registry names when possible",
  "confidence": number between 0 and 1,
  "alternatives": [
    { "breedName": "string", "confidence": number between 0 and 1 }
  ]
}
Rules:
- alternatives: 0–3 other plausible breeds, lower confidence than the primary.
- If mixed / unclear, still pick the closest breed name and lower confidence (e.g. 0.35–0.55).
- If the image is not a dog/cat, set confidence below 0.25 and breedName to "Unknown".
- Never claim pedigree, DNA, or veterinary diagnosis.
- Prefer widely used English names (e.g. "Labrador Retriever", "British Shorthair").`;

function isValidAlt(value: unknown): value is Alt {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.breedName === 'string' && typeof v.confidence === 'number';
}

function isValidResult(value: unknown): value is IdentifyResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.breedName !== 'string' || typeof v.confidence !== 'number') {
    return false;
  }
  if (v.alternatives === undefined) return true;
  return Array.isArray(v.alternatives) && v.alternatives.every(isValidAlt);
}

function extractJson(content: string): unknown {
  const trimmed = content.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model did not return JSON');
    return JSON.parse(match[0]);
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY is not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const imageBase64 = body?.imageBase64 as string | undefined;
    const mimeType = (body?.mimeType as string | undefined) ?? 'image/jpeg';
    const species = body?.species === 'cat' ? 'cat' : 'dog';

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'imageBase64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const openaiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          temperature: 0.15,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `This photo is a ${species}. Identify the breed and return the JSON object.`,
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:${mimeType};base64,${imageBase64}`,
                  },
                },
              ],
            },
          ],
        }),
      },
    );

    if (!openaiResponse.ok) {
      const details = await openaiResponse.text();
      return new Response(
        JSON.stringify({ error: 'OpenAI request failed', details }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const openaiJson = await openaiResponse.json();
    const content = openaiJson?.choices?.[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Empty model response' }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const parsed = extractJson(content);
    if (!isValidResult(parsed)) {
      return new Response(
        JSON.stringify({ error: 'Invalid model JSON shape', parsed }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    const result: IdentifyResult = {
      breedName: parsed.breedName.trim(),
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      alternatives: (parsed.alternatives ?? [])
        .slice(0, 3)
        .map((a) => ({
          breedName: a.breedName.trim(),
          confidence: Math.max(0, Math.min(1, a.confidence)),
        })),
    };

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
