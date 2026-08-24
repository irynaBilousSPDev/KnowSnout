import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type AnalysisResult = {
  identified: boolean;
  productName: string;
  species?: 'dog' | 'cat' | 'unknown';
  score: number;
  pros: string[];
  cons: string[];
  summary: string;
};

const SYSTEM_PROMPT = `You analyze commercial PET FOOD labels (dog/cat kibble, wet food, treats) for a pet app.
Return ONLY valid JSON (no markdown) with this exact shape:
{
  "identified": boolean,
  "productName": "string",
  "species": "dog" | "cat" | "unknown",
  "score": number between 0 and 100,
  "pros": ["string"],
  "cons": ["string"],
  "summary": "string"
}
Rules:
- identified=true ONLY if the photo clearly shows a pet food / treat package or ingredient label for dogs or cats.
- If the image is perfume, cosmetics, human food, a plant, a random object, unreadable, or not a pet-food label: identified=false, productName="", score=0, pros=[], cons=[], summary="not a pet food label". NEVER invent a pet food product name.
- Never guess a "closest" food. Honesty over completeness.
Species: dog / cat / unknown as on the pack.`;

function isValidResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (v.identified === false) return true;
  return (
    typeof v.productName === 'string' &&
    typeof v.score === 'number' &&
    Array.isArray(v.pros) &&
    Array.isArray(v.cons) &&
    typeof v.summary === 'string'
  );
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
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Is this a pet food label? If yes, score it. If not, identified=false. Never invent a product.',
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

    const identified = parsed.identified !== false && Boolean(parsed.productName?.trim());
    const result: AnalysisResult = {
      identified,
      productName: identified ? parsed.productName : '',
      species:
        parsed.species === 'dog' ||
        parsed.species === 'cat' ||
        parsed.species === 'unknown'
          ? parsed.species
          : 'unknown',
      score: identified
        ? Math.max(0, Math.min(100, Math.round(Number(parsed.score) || 0)))
        : 0,
      pros: identified && Array.isArray(parsed.pros) ? parsed.pros.map(String) : [],
      cons: identified && Array.isArray(parsed.cons) ? parsed.cons.map(String) : [],
      summary: parsed.summary || (identified ? '' : 'not a pet food label'),
    };

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unexpected error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
