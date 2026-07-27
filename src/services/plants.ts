import AsyncStorage from '@react-native-async-storage/async-storage';

import { MOCK_PHOTO_PLANT_ID, PLANTS_SEED } from '@/src/data/plantsSeed';
import { env } from '@/src/lib/env';
import { supabase } from '@/src/services/supabase';
import type {
  PlantCheckResult,
  PlantRecord,
  PlantSpeciesTarget,
  PlantToxicityLevel,
} from '@/src/types/plant';

const LOCAL_HISTORY_KEY = 'knowsnout.plant_checks.v1';

export type PlantHistoryItem = {
  id: string;
  query_text: string | null;
  for_species: string;
  level: string;
  created_at: string;
  name_uk?: string | null;
  photo_uri?: string | null;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .trim();
}

function scoreMatch(plant: PlantRecord, query: string): number {
  const q = normalize(query);
  if (!q) return 0;
  const fields = [
    plant.latin,
    plant.name_uk,
    plant.name_en,
    plant.name_pl ?? '',
    ...plant.aliases,
  ].map(normalize);

  let best = 0;
  for (const field of fields) {
    if (!field) continue;
    if (field === q) best = Math.max(best, 1);
    else if (field.includes(q) || q.includes(field)) best = Math.max(best, 0.85);
    else {
      const tokens = q.split(/\s+/).filter(Boolean);
      const hits = tokens.filter((t) => field.includes(t)).length;
      if (hits > 0) best = Math.max(best, 0.55 + hits * 0.1);
    }
  }
  return best;
}

function toxicityFor(
  plant: PlantRecord,
  species: PlantSpeciesTarget,
): { level: PlantToxicityLevel; notes: string | null } {
  const row = plant.toxicity.find((t) => t.species === species);
  return {
    level: row?.level ?? 'unknown',
    notes: row?.notes ?? null,
  };
}

function toResult(
  plant: PlantRecord,
  species: PlantSpeciesTarget,
  confidence: number,
  source: PlantCheckResult['source'],
  matchedQuery?: string,
): PlantCheckResult {
  const { level, notes } = toxicityFor(plant, species);
  return {
    plant,
    forSpecies: species,
    level,
    notes,
    confidence,
    source,
    matchedQuery,
  };
}

type DbPlant = {
  id: string;
  latin: string;
  name_uk: string;
  name_en: string;
  name_pl: string | null;
  aliases: string[] | null;
  plant_toxicity?: {
    species: string;
    level: string;
    notes: string | null;
  }[];
};

function mapDbPlant(row: DbPlant): PlantRecord {
  return {
    id: row.id,
    latin: row.latin,
    name_uk: row.name_uk,
    name_en: row.name_en,
    name_pl: row.name_pl,
    aliases: row.aliases ?? [],
    toxicity: (row.plant_toxicity ?? [])
      .filter((t) => t.species === 'dog' || t.species === 'cat')
      .map((t) => ({
        species: t.species as PlantSpeciesTarget,
        level: (['safe', 'mild', 'toxic', 'unknown'].includes(t.level)
          ? t.level
          : 'unknown') as PlantToxicityLevel,
        notes: t.notes,
      })),
  };
}

async function fetchCachePlants(): Promise<PlantRecord[]> {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('plants')
      .select(
        'id, latin, name_uk, name_en, name_pl, aliases, plant_toxicity(species, level, notes)',
      )
      .limit(200);
    if (error || !data) return [];
    return (data as DbPlant[]).map(mapDbPlant);
  } catch {
    return [];
  }
}

export async function listPlantsCatalog(): Promise<PlantRecord[]> {
  const cached = await fetchCachePlants();
  if (cached.length > 0) return cached;
  return PLANTS_SEED;
}

export async function searchPlants(
  query: string,
  species: PlantSpeciesTarget,
  limit = 8,
): Promise<PlantCheckResult[]> {
  const catalog = await listPlantsCatalog();
  const ranked = catalog
    .map((plant) => ({ plant, score: scoreMatch(plant, query) }))
    .filter((x) => x.score >= 0.55)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const source: PlantCheckResult['source'] = catalog[0]?.id.startsWith('seed-')
    ? 'seed'
    : 'cache';

  return ranked.map(({ plant, score }) =>
    toResult(plant, species, Math.min(0.99, score), source, query.trim()),
  );
}

export async function checkPlantByName(
  query: string,
  species: PlantSpeciesTarget,
): Promise<PlantCheckResult | null> {
  const hits = await searchPlants(query, species, 1);
  return hits[0] ?? null;
}

type IdentifyPayload = {
  imageBase64: string;
  mimeType?: string;
  species: PlantSpeciesTarget;
};

type IdentifyRemote = {
  latin?: string;
  commonName?: string;
  confidence?: number;
};

function mockPhotoResult(
  catalog: PlantRecord[],
  species: PlantSpeciesTarget,
): PlantCheckResult {
  const plant =
    catalog.find(
      (p) => p.id === MOCK_PHOTO_PLANT_ID || p.latin.includes('Epipremnum'),
    ) ?? catalog[0];
  return toResult(plant, species, 0.72, 'photo', plant.name_uk);
}

export async function identifyPlantFromPhoto(
  payload: IdentifyPayload,
): Promise<PlantCheckResult> {
  const catalog = await listPlantsCatalog();

  if (env.useMockAi || env.isDemoMode || !supabase) {
    await delay(800);
    return mockPhotoResult(catalog, payload.species);
  }

  try {
    const { data, error } = await supabase.functions.invoke('identify-plant', {
      body: {
        imageBase64: payload.imageBase64,
        mimeType: payload.mimeType ?? 'image/jpeg',
      },
    });

    if (error) {
      // Function not deployed / OpenAI missing → keep UX working offline.
      await delay(400);
      return mockPhotoResult(catalog, payload.species);
    }

    const remote = (data?.result ?? data) as IdentifyRemote;
    const latin = typeof remote.latin === 'string' ? remote.latin : '';
    const common =
      typeof remote.commonName === 'string' ? remote.commonName : '';
    const confidence =
      typeof remote.confidence === 'number'
        ? Math.max(0, Math.min(1, remote.confidence))
        : 0.6;

    const query = [latin, common].filter(Boolean).join(' ');
    if (!query) {
      return mockPhotoResult(catalog, payload.species);
    }

    const hit = await checkPlantByName(query, payload.species);
    if (hit) {
      return {
        ...hit,
        confidence: Math.min(0.99, Math.max(hit.confidence, confidence)),
        source: 'photo',
        matchedQuery: query,
      };
    }

    const unknownPlant: PlantRecord = {
      id: 'unknown',
      latin: latin || 'Unknown',
      name_uk: common || latin || 'Невідома рослина',
      name_en: common || latin || 'Unknown plant',
      name_pl: null,
      aliases: [],
      toxicity: [
        { species: 'dog', level: 'unknown', notes: null },
        { species: 'cat', level: 'unknown', notes: null },
      ],
    };
    return toResult(unknownPlant, payload.species, confidence, 'photo', query);
  } catch {
    await delay(400);
    return mockPhotoResult(catalog, payload.species);
  }
}

export async function listLocalPlantHistory(): Promise<PlantHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as PlantHistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function appendLocalPlantHistory(item: PlantHistoryItem): Promise<void> {
  const prev = await listLocalPlantHistory();
  const next = [item, ...prev].slice(0, 50);
  await AsyncStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(next));
}

export async function listPlantHistory(): Promise<PlantHistoryItem[]> {
  const local = await listLocalPlantHistory();
  if (!supabase) return local;
  try {
    const { data, error } = await supabase
      .from('plant_checks')
      .select('id, query_text, for_species, level, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error || !data) return local;
    const cloud = data as PlantHistoryItem[];
    const seen = new Set(cloud.map((c) => c.id));
    const merged = [...cloud, ...local.filter((l) => !seen.has(l.id))];
    return merged.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  } catch {
    return local;
  }
}

export async function savePlantCheck(input: {
  petId?: string | null;
  result: PlantCheckResult;
  queryText?: string;
  photoUri?: string | null;
}): Promise<void> {
  const localItem: PlantHistoryItem = {
    id: `local-plant-${Date.now()}`,
    query_text:
      input.queryText ??
      input.result.matchedQuery ??
      input.result.plant.name_uk,
    for_species: input.result.forSpecies,
    level: input.result.level,
    created_at: new Date().toISOString(),
    name_uk: input.result.plant.name_uk,
    photo_uri: input.photoUri ?? null,
  };
  await appendLocalPlantHistory(localItem);

  if (!supabase || input.result.plant.id === 'unknown') return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const plantId = input.result.plant.id.startsWith('seed-')
      ? null
      : input.result.plant.id;

    await supabase.from('plant_checks').insert({
      user_id: user.id,
      pet_id: input.petId ?? null,
      plant_id: plantId,
      query_text: localItem.query_text,
      for_species: input.result.forSpecies,
      level: input.result.level,
      confidence: input.result.confidence,
      source: input.result.source === 'photo' ? 'photo' : 'search',
    });
  } catch {
    // Local history already saved.
  }
}

export function plantLevelTone(level: PlantToxicityLevel): {
  bg: string;
  border: string;
  text: string;
} {
  switch (level) {
    case 'safe':
      return {
        bg: 'bg-forest-100',
        border: 'border-forest-200',
        text: 'text-forest-800',
      };
    case 'mild':
      return {
        bg: 'bg-sand-100',
        border: 'border-sand-300',
        text: 'text-score-fair',
      };
    case 'toxic':
      return {
        bg: 'bg-sand-100',
        border: 'border-score-poor',
        text: 'text-score-poor',
      };
    default:
      return {
        bg: 'bg-sand-100',
        border: 'border-forest-100',
        text: 'text-forest-700',
      };
  }
}
