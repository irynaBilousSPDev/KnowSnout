import { env } from '@/src/lib/env';
import { supabase } from '@/src/services/supabase';
import type { StoreScore } from '@/src/types/storeScore';

export type StoreScoreQuery = {
  productName: string;
  barcode?: string | null;
  productId?: string | null;
};

const useMockStoreScores =
  process.env.EXPO_PUBLIC_USE_MOCK_STORE_SCORES !== 'false';

function allegroSearchUrl(phrase: string) {
  const q = encodeURIComponent(phrase.trim() || 'karma dla psa');
  return `https://allegro.pl/listing?string=${q}`;
}

/** Deterministic demo rating from product identity (no network). */
export function mockAllegroScore(query: StoreScoreQuery): StoreScore {
  const seed = `${query.barcode ?? ''}|${query.productId ?? ''}|${query.productName}`;
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const scoreOutOf5 = Math.round((3.2 + (h % 160) / 100) * 10) / 10;
  const reviewCount = 40 + (h % 900);
  return {
    store: 'allegro',
    scoreOutOf5,
    reviewCount,
    url: allegroSearchUrl(query.productName),
    label: query.productName.trim() || 'Allegro',
    source: 'mock',
  };
}

function asStoreScore(value: unknown): StoreScore | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  if (v.store !== 'allegro') return null;
  if (typeof v.url !== 'string' || !v.url) return null;
  const scoreOutOf5 =
    typeof v.scoreOutOf5 === 'number' && Number.isFinite(v.scoreOutOf5)
      ? v.scoreOutOf5
      : null;
  const reviewCount =
    typeof v.reviewCount === 'number' && Number.isFinite(v.reviewCount)
      ? Math.round(v.reviewCount)
      : null;
  const source = v.source === 'allegro' ? 'allegro' : 'mock';
  return {
    store: 'allegro',
    scoreOutOf5,
    reviewCount,
    url: v.url,
    label: typeof v.label === 'string' && v.label.trim() ? v.label.trim() : 'Allegro',
    source,
  };
}

/**
 * Store marketplace score badge data (Allegro first).
 * Default: mock (no keys). Optional Edge `store-rating` when mock is off.
 * Scores + outbound link only — never scrapes review text.
 */
export async function fetchStoreScore(
  query: StoreScoreQuery,
): Promise<StoreScore> {
  const name = query.productName.trim();
  if (!name) {
    return mockAllegroScore({ ...query, productName: 'karma' });
  }

  if (useMockStoreScores || env.isDemoMode || !supabase) {
    return mockAllegroScore(query);
  }

  try {
    const { data, error } = await supabase.functions.invoke('store-rating', {
      body: {
        productName: name,
        barcode: query.barcode ?? null,
        productId: query.productId ?? null,
      },
    });
    if (error) throw error;
    const parsed = asStoreScore(data);
    if (parsed) return parsed;
  } catch (err) {
    console.warn('store-rating unavailable, using mock', err);
  }

  return mockAllegroScore(query);
}
