import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { persistCheckPhoto } from '@/src/services/checkImages';
import { supabase } from '@/src/services/supabase';
import type {
  BreedCheckResult,
  BreedGuess,
  CompanionBreedSpecies,
} from '@/src/types/breed';

const HISTORY_KEY = 'knowsnout.breed_checks.v1';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_DOG: BreedGuess = {
  id: 'mock-labrador',
  name: 'Labrador Retriever',
  nameUk: 'Лабрадор-ретривер',
  species: 'dog',
  confidence: 0.74,
  temperament: 'Friendly, Active, Outgoing',
  bredFor: 'Water retrieving',
  origin: 'Canada / UK',
  source: 'mock',
};

const MOCK_CAT: BreedGuess = {
  id: 'mock-british',
  name: 'British Shorthair',
  nameUk: 'Британська короткошерста',
  species: 'cat',
  confidence: 0.71,
  temperament: 'Calm, Loyal, Easy Going',
  origin: 'United Kingdom',
  source: 'mock',
};

type DogApiBreed = {
  id: number;
  name: string;
  temperament?: string;
  bred_for?: string;
  origin?: string;
  reference_image_id?: string;
};

type CatApiBreed = {
  id: string;
  name: string;
  temperament?: string;
  origin?: string;
  reference_image_id?: string;
};

type VisionRemote = {
  breedName?: string;
  confidence?: number;
  alternatives?: { breedName?: string; confidence?: number }[];
};

async function fetchDogBreeds(): Promise<BreedGuess[]> {
  const res = await fetch('https://api.thedogapi.com/v1/breeds', {
    headers: { 'User-Agent': 'KnowSnout/1.0 (breed lookup)' },
  });
  if (!res.ok) throw new Error('TheDogAPI request failed');
  const data = (await res.json()) as DogApiBreed[];
  return data.slice(0, 120).map((b) => ({
    id: `dog-${b.id}`,
    name: b.name,
    species: 'dog' as const,
    confidence: 0.55,
    temperament: b.temperament ?? null,
    bredFor: b.bred_for ?? null,
    origin: b.origin ?? null,
    referenceImageUrl: b.reference_image_id
      ? `https://cdn2.thedogapi.com/images/${b.reference_image_id}.jpg`
      : null,
    source: 'thedogapi' as const,
  }));
}

async function fetchCatBreeds(): Promise<BreedGuess[]> {
  const res = await fetch('https://api.thecatapi.com/v1/breeds', {
    headers: { 'User-Agent': 'KnowSnout/1.0 (breed lookup)' },
  });
  if (!res.ok) throw new Error('TheCatAPI request failed');
  const data = (await res.json()) as CatApiBreed[];
  return data.slice(0, 120).map((b) => ({
    id: `cat-${b.id}`,
    name: b.name,
    species: 'cat' as const,
    confidence: 0.55,
    temperament: b.temperament ?? null,
    origin: b.origin ?? null,
    referenceImageUrl: b.reference_image_id
      ? `https://cdn2.thecatapi.com/images/${b.reference_image_id}.jpg`
      : null,
    source: 'thecatapi' as const,
  }));
}

function scoreName(name: string, query: string) {
  const n = name.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  if (n === q) return 1;
  if (n.includes(q) || q.includes(n)) return 0.85;
  const parts = q.split(/\s+/).filter(Boolean);
  const hits = parts.filter((p) => n.includes(p)).length;
  return hits ? 0.5 + hits * 0.1 : 0;
}

async function loadCatalog(
  species: CompanionBreedSpecies,
): Promise<BreedGuess[]> {
  return species === 'dog' ? fetchDogBreeds() : fetchCatBreeds();
}

function enrichFromCatalog(
  breedName: string,
  confidence: number,
  species: CompanionBreedSpecies,
  catalog: BreedGuess[],
): BreedGuess {
  const ranked = catalog
    .map((b) => ({ b, score: scoreName(b.name, breedName) }))
    .filter((x) => x.score >= 0.5)
    .sort((a, b) => b.score - a.score);
  const hit = ranked[0]?.b;
  if (hit) {
    return {
      ...hit,
      confidence: Math.max(0, Math.min(1, confidence)),
    };
  }
  return {
    id: `vision-${species}-${Date.now()}`,
    name: breedName || 'Unknown',
    species,
    confidence: Math.max(0, Math.min(1, confidence)),
    temperament: null,
    bredFor: null,
    origin: null,
    referenceImageUrl: null,
    source: species === 'dog' ? 'thedogapi' : 'thecatapi',
  };
}

export async function searchBreeds(
  query: string,
  species: CompanionBreedSpecies,
): Promise<BreedGuess[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const catalog = await loadCatalog(species);
    return catalog
      .map((b) => ({ ...b, confidence: scoreName(b.name, q) }))
      .filter((b) => b.confidence >= 0.55)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  } catch {
    const mock = species === 'dog' ? MOCK_DOG : MOCK_CAT;
    if (
      scoreName(mock.name, q) >= 0.5 ||
      scoreName(mock.nameUk ?? '', q) >= 0.5
    ) {
      return [mock];
    }
    return [];
  }
}

function mockPhotoResult(species: CompanionBreedSpecies): BreedCheckResult {
  const primary = species === 'dog' ? MOCK_DOG : MOCK_CAT;
  return {
    species,
    primary,
    alternatives: [],
    disclaimer: true,
  };
}

/**
 * Photo ID: OpenAI Vision via Edge Function → enrich from TheDogAPI / TheCatAPI.
 * Falls back to mock when mock/demo mode or function unavailable.
 */
export async function identifyBreedFromPhoto(input: {
  species: CompanionBreedSpecies;
  imageBase64?: string;
  mimeType?: string;
}): Promise<BreedCheckResult> {
  if (env.useMockAi || env.isDemoMode || !supabase || !input.imageBase64) {
    await delay(800);
    return mockPhotoResult(input.species);
  }

  try {
    const { data, error } = await supabase.functions.invoke('identify-breed', {
      body: {
        imageBase64: input.imageBase64,
        mimeType: input.mimeType ?? 'image/jpeg',
        species: input.species,
      },
    });

    if (error) {
      await delay(400);
      return mockPhotoResult(input.species);
    }

    const remote = (data?.result ?? data) as VisionRemote;
    const breedName =
      typeof remote.breedName === 'string' ? remote.breedName.trim() : '';
    const confidence =
      typeof remote.confidence === 'number'
        ? Math.max(0, Math.min(1, remote.confidence))
        : 0.55;

    if (!breedName || breedName.toLowerCase() === 'unknown') {
      return mockPhotoResult(input.species);
    }

    let catalog: BreedGuess[] = [];
    try {
      catalog = await loadCatalog(input.species);
    } catch {
      catalog = [];
    }

    const primary = enrichFromCatalog(
      breedName,
      confidence,
      input.species,
      catalog,
    );
    const alternatives = (remote.alternatives ?? [])
      .filter((a) => typeof a.breedName === 'string' && a.breedName.trim())
      .slice(0, 3)
      .map((a) =>
        enrichFromCatalog(
          a.breedName!.trim(),
          typeof a.confidence === 'number' ? a.confidence : 0.4,
          input.species,
          catalog,
        ),
      )
      .filter((a) => a.name.toLowerCase() !== primary.name.toLowerCase());

    return {
      species: input.species,
      primary,
      alternatives,
      disclaimer: true,
    };
  } catch {
    await delay(400);
    return mockPhotoResult(input.species);
  }
}

export type BreedHistoryItem = {
  id: string;
  createdAt: string;
  species: CompanionBreedSpecies;
  breedName: string;
  breedNameUk?: string | null;
  confidence: number;
  photoUri?: string | null;
  temperament?: string | null;
  origin?: string | null;
  bredFor?: string | null;
};

export async function listBreedHistory(): Promise<BreedHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BreedHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function deleteBreedHistoryItem(id: string): Promise<void> {
  const prev = await listBreedHistory();
  await AsyncStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(prev.filter((item) => item.id !== id)),
  );
}

export async function getBreedHistoryItem(
  id: string,
): Promise<BreedHistoryItem | null> {
  const list = await listBreedHistory();
  return list.find((item) => item.id === id) ?? null;
}

export async function saveBreedHistoryItem(
  item: Omit<BreedHistoryItem, 'id' | 'createdAt'> & {
    id?: string;
    createdAt?: string;
  },
): Promise<BreedHistoryItem> {
  const photoUri = await persistCheckPhoto(item.photoUri, 'breeds');
  const next: BreedHistoryItem = {
    id: item.id ?? `breed-${Date.now()}`,
    createdAt: item.createdAt ?? new Date().toISOString(),
    species: item.species,
    breedName: item.breedName,
    breedNameUk: item.breedNameUk ?? null,
    confidence: item.confidence,
    photoUri,
    temperament: item.temperament ?? null,
    origin: item.origin ?? null,
    bredFor: item.bredFor ?? null,
  };
  const prev = await listBreedHistory();
  const list = [next, ...prev].slice(0, 50);
  await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  return next;
}
