/**
 * Marketplace score lookup (Allegro PL first).
 * Returns score + outbound URL only — never review bodies.
 *
 * Secrets (optional):
 *   ALLEGRO_CLIENT_ID
 *   ALLEGRO_CLIENT_SECRET
 * Without secrets → deterministic mock + Allegro search URL.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

type StoreScore = {
  store: 'allegro';
  scoreOutOf5: number | null;
  reviewCount: number | null;
  url: string;
  label: string;
  source: 'mock' | 'allegro';
};

function allegroSearchUrl(phrase: string) {
  const q = encodeURIComponent(phrase.trim() || 'karma dla psa');
  return `https://allegro.pl/listing?string=${q}`;
}

function mockScore(productName: string, barcode: string | null): StoreScore {
  const seed = `${barcode ?? ''}|${productName}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return {
    store: 'allegro',
    scoreOutOf5: Math.round((3.2 + (h % 160) / 100) * 10) / 10,
    reviewCount: 40 + (h % 900),
    url: allegroSearchUrl(productName),
    label: productName.trim() || 'Allegro',
    source: 'mock',
  };
}

async function allegroToken(
  clientId: string,
  clientSecret: string,
): Promise<string> {
  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch('https://allegro.pl/auth/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    throw new Error(`Allegro token ${res.status}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error('Allegro token missing');
  return json.access_token;
}

type AllegroOffer = {
  id?: string;
  name?: string;
  url?: string;
  product?: { id?: string };
};

async function allegroLookup(
  token: string,
  productName: string,
): Promise<StoreScore | null> {
  const phrase = encodeURIComponent(productName.slice(0, 80));
  const searchRes = await fetch(
    `https://api.allegro.pl/offers?phrase=${phrase}&limit=5`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.allegro.public.v1+json',
      },
    },
  );
  if (!searchRes.ok) {
    throw new Error(`Allegro search ${searchRes.status}`);
  }
  const searchJson = (await searchRes.json()) as { offers?: AllegroOffer[] };
  const offers = searchJson.offers ?? [];
  if (offers.length === 0) {
    return {
      store: 'allegro',
      scoreOutOf5: null,
      reviewCount: null,
      url: allegroSearchUrl(productName),
      label: productName,
      source: 'allegro',
    };
  }

  const first = offers[0]!;
  const offerUrl =
    typeof first.url === 'string' && first.url
      ? first.url
      : allegroSearchUrl(productName);

  let scoreOutOf5: number | null = null;
  let reviewCount: number | null = null;
  const productId = first.product?.id;
  if (productId) {
    const productRes = await fetch(
      `https://api.allegro.pl/sale/products/${encodeURIComponent(productId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.allegro.public.v1+json',
        },
      },
    );
    if (productRes.ok) {
      const product = (await productRes.json()) as {
        rating?: { averageStarRate?: number; rateCount?: number };
      };
      const avg = product.rating?.averageStarRate;
      if (typeof avg === 'number' && Number.isFinite(avg)) {
        scoreOutOf5 = Math.round(avg * 10) / 10;
      }
      const count = product.rating?.rateCount;
      if (typeof count === 'number' && Number.isFinite(count)) {
        reviewCount = Math.round(count);
      }
    }
  }

  return {
    store: 'allegro',
    scoreOutOf5,
    reviewCount,
    url: offerUrl,
    label: (first.name ?? productName).trim() || productName,
    source: 'allegro',
  };
}

Deno.serve(async (req) => {
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

    const body = (await req.json()) as {
      productName?: string;
      barcode?: string | null;
    };
    const productName =
      typeof body.productName === 'string' ? body.productName.trim() : '';
    if (!productName) {
      return new Response(JSON.stringify({ error: 'productName required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const clientId = Deno.env.get('ALLEGRO_CLIENT_ID')?.trim();
    const clientSecret = Deno.env.get('ALLEGRO_CLIENT_SECRET')?.trim();
    const barcode =
      typeof body.barcode === 'string' ? body.barcode : null;

    if (!clientId || !clientSecret) {
      return new Response(
        JSON.stringify(mockScore(productName, barcode)),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    try {
      const token = await allegroToken(clientId, clientSecret);
      const result = await allegroLookup(token, productName);
      return new Response(JSON.stringify(result ?? mockScore(productName, barcode)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      console.error('Allegro lookup failed', err);
      return new Response(JSON.stringify(mockScore(productName, barcode)), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : 'store-rating failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
