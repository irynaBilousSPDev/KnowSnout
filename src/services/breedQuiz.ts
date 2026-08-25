import { env } from '@/src/lib/env';
import type { CompanionBreedSpecies } from '@/src/types/breed';

export type QuizBreed = {
  id: string;
  /** Raw API breed id for /images/search (number for dogs, string for cats). */
  apiBreedId: string;
  name: string;
  species: CompanionBreedSpecies;
  imageUrl: string;
  temperament: string | null;
  origin: string | null;
  bredFor: string | null;
  breedGroup: string | null;
  lifeSpan: string | null;
  weightMetric: string | null;
  heightMetric: string | null;
  description: string | null;
  /** Completeness 0–1 for picking informative rounds */
  richness: number;
};

export type BreedQuizFact = {
  name: string;
  temperament: string | null;
  origin: string | null;
  bredFor: string | null;
  breedGroup: string | null;
  lifeSpan: string | null;
  weightMetric: string | null;
  heightMetric: string | null;
  description: string | null;
  sourceLabel: 'thedogapi' | 'thecatapi';
};

export type BreedQuizRound = {
  id: string;
  species: CompanionBreedSpecies;
  imageUrl: string;
  correctId: string;
  choices: { id: string; name: string }[];
  fact: BreedQuizFact;
};

type MetricRange = { imperial?: string; metric?: string };

type DogApiBreed = {
  id: number;
  name: string;
  temperament?: string;
  bred_for?: string;
  breed_group?: string;
  life_span?: string;
  origin?: string;
  weight?: MetricRange;
  height?: MetricRange;
  reference_image_id?: string;
  image?: { url?: string };
};

type CatApiBreed = {
  id: string;
  name: string;
  temperament?: string;
  origin?: string;
  description?: string;
  life_span?: string;
  weight?: MetricRange;
  reference_image_id?: string;
  image?: { url?: string };
};

function clean(value?: string | null): string | null {
  const v = value?.trim();
  return v ? v : null;
}

function richnessScore(fields: Array<string | null | undefined>): number {
  const filled = fields.filter((f) => Boolean(clean(f ?? null))).length;
  return filled / Math.max(fields.length, 1);
}

function toFact(breed: QuizBreed): BreedQuizFact {
  return {
    name: breed.name,
    temperament: breed.temperament,
    origin: breed.origin,
    bredFor: breed.bredFor,
    breedGroup: breed.breedGroup,
    lifeSpan: breed.lifeSpan,
    weightMetric: breed.weightMetric,
    heightMetric: breed.heightMetric,
    description: breed.description,
    sourceLabel: breed.species === 'dog' ? 'thedogapi' : 'thecatapi',
  };
}

const FALLBACK_DOG: QuizBreed[] = [
  {
    id: 'dog-fallback-lab',
    apiBreedId: '149',
    name: 'Labrador Retriever',
    species: 'dog',
    imageUrl: 'https://images.dog.ceo/breeds/labrador/n02099712_1384.jpg',
    temperament: 'Friendly, Active, Outgoing',
    origin: 'Canada / UK',
    bredFor: 'Water retrieving',
    breedGroup: 'Sporting',
    lifeSpan: '10 - 13 years',
    weightMetric: '25 - 36',
    heightMetric: '55 - 62',
    description: null,
    richness: 0.9,
  },
  {
    id: 'dog-fallback-husky',
    apiBreedId: '250',
    name: 'Siberian Husky',
    species: 'dog',
    imageUrl: 'https://images.dog.ceo/breeds/husky/n02110185_10047.jpg',
    temperament: 'Outgoing, Friendly, Alert',
    origin: 'Russia',
    bredFor: 'Sled pulling',
    breedGroup: 'Working',
    lifeSpan: '12 - 14 years',
    weightMetric: '16 - 27',
    heightMetric: '51 - 60',
    description: null,
    richness: 0.9,
  },
  {
    id: 'dog-fallback-corgi',
    apiBreedId: '201',
    name: 'Pembroke Welsh Corgi',
    species: 'dog',
    imageUrl: 'https://images.dog.ceo/breeds/corgi-pembroke/n02113023_1205.jpg',
    temperament: 'Playful, Outgoing, Friendly',
    origin: 'United Kingdom',
    bredFor: 'Cattle herding',
    breedGroup: 'Herding',
    lifeSpan: '12 - 14 years',
    weightMetric: '11 - 14',
    heightMetric: '25 - 30',
    description: null,
    richness: 0.9,
  },
  {
    id: 'dog-fallback-beagle',
    apiBreedId: '28',
    name: 'Beagle',
    species: 'dog',
    imageUrl: 'https://images.dog.ceo/breeds/beagle/n02088364_11136.jpg',
    temperament: 'Amiable, Even Tempered, Excitable',
    origin: 'United Kingdom',
    bredFor: 'Rabbit hunting',
    breedGroup: 'Hound',
    lifeSpan: '13 - 16 years',
    weightMetric: '9 - 11',
    heightMetric: '33 - 41',
    description: null,
    richness: 0.9,
  },
];

const FALLBACK_CAT: QuizBreed[] = [
  {
    id: 'cat-fallback-siamese',
    apiBreedId: 'siam',
    name: 'Siamese',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg',
    temperament: 'Active, Agile, Clever, Sociable',
    origin: 'Thailand',
    bredFor: null,
    breedGroup: null,
    lifeSpan: '12 - 15',
    weightMetric: '3 - 5',
    heightMetric: null,
    description:
      'Talkative, people-oriented cats with a sleek body and striking blue eyes.',
    richness: 0.95,
  },
  {
    id: 'cat-fallback-persian',
    apiBreedId: 'pers',
    name: 'Persian',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg',
    temperament: 'Affectionate, Loyal, Quiet, Sweet',
    origin: 'Iran',
    bredFor: null,
    breedGroup: null,
    lifeSpan: '14 - 15',
    weightMetric: '3 - 6',
    heightMetric: null,
    description: 'Calm longhair breed known for a gentle, companionable nature.',
    richness: 0.95,
  },
  {
    id: 'cat-fallback-bengal',
    apiBreedId: 'beng',
    name: 'Bengal',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/O3btzLlsO.jpg',
    temperament: 'Alert, Agile, Energetic, Curious',
    origin: 'United States',
    bredFor: null,
    breedGroup: null,
    lifeSpan: '12 - 16',
    weightMetric: '4 - 7',
    heightMetric: null,
    description:
      'Athletic spotted cats that enjoy play and climbing; high energy.',
    richness: 0.95,
  },
  {
    id: 'cat-fallback-maine',
    apiBreedId: 'mcoo',
    name: 'Maine Coon',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/OOD3VSYVX.jpg',
    temperament: 'Gentle, Independent, Intelligent',
    origin: 'United States',
    bredFor: null,
    breedGroup: null,
    lifeSpan: '12 - 15',
    weightMetric: '5 - 8',
    heightMetric: null,
    description: 'Large friendly breed with a dog-like, social personality.',
    richness: 0.95,
  },
];

let dogCache: QuizBreed[] | null = null;
let catCache: QuizBreed[] | null = null;

export function clearBreedQuizCatalogCache() {
  dogCache = null;
  catCache = null;
}

function apiHeaders(apiKey: string): HeadersInit {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (apiKey) headers['x-api-key'] = apiKey;
  return headers;
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function pickDistinct<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count);
}

/** Prefer breeds with enough curated fields so the round teaches something. */
function informativePool(catalog: QuizBreed[]): QuizBreed[] {
  const rich = catalog.filter((b) => b.richness >= 0.45 && b.temperament);
  return rich.length >= 8 ? rich : catalog.filter((b) => b.temperament);
}

async function loadDogCatalog(): Promise<QuizBreed[]> {
  if (dogCache && dogCache.length >= 4) return dogCache;
  try {
    const res = await fetch('https://api.thedogapi.com/v1/breeds', {
      headers: apiHeaders(env.dogApiKey),
    });
    if (!res.ok) throw new Error(`dog api ${res.status}`);
    const data = (await res.json()) as DogApiBreed[];
    const mapped: QuizBreed[] = [];
    for (const b of data) {
      const imageUrl =
        clean(b.image?.url) ??
        (b.reference_image_id
          ? `https://cdn2.thedogapi.com/images/${b.reference_image_id}.jpg`
          : null);
      // Keep breeds even without a nested image — we resolve a live URL per round.
      if (!imageUrl && !b.id) continue;
      const temperament = clean(b.temperament);
      const origin = clean(b.origin);
      const bredFor = clean(b.bred_for);
      const breedGroup = clean(b.breed_group);
      const lifeSpan = clean(b.life_span);
      const weightMetric = clean(b.weight?.metric);
      const heightMetric = clean(b.height?.metric);
      mapped.push({
        id: `dog-${b.id}`,
        apiBreedId: String(b.id),
        name: b.name,
        species: 'dog',
        imageUrl: imageUrl ?? '',
        temperament,
        origin,
        bredFor,
        breedGroup,
        lifeSpan,
        weightMetric,
        heightMetric,
        description: null,
        richness: richnessScore([
          temperament,
          origin,
          bredFor,
          breedGroup,
          lifeSpan,
          weightMetric,
          heightMetric,
        ]),
      });
    }
    dogCache = mapped.length >= 4 ? mapped : FALLBACK_DOG;
  } catch {
    dogCache = FALLBACK_DOG;
  }
  return dogCache;
}

async function loadCatCatalog(): Promise<QuizBreed[]> {
  if (catCache && catCache.length >= 4) return catCache;
  try {
    const res = await fetch('https://api.thecatapi.com/v1/breeds', {
      headers: apiHeaders(env.catApiKey),
    });
    if (!res.ok) throw new Error(`cat api ${res.status}`);
    const data = (await res.json()) as CatApiBreed[];
    const mapped: QuizBreed[] = [];
    for (const b of data) {
      const imageUrl =
        clean(b.image?.url) ??
        (b.reference_image_id
          ? `https://cdn2.thecatapi.com/images/${b.reference_image_id}.jpg`
          : null);
      if (!b.id) continue;
      const temperament = clean(b.temperament);
      const origin = clean(b.origin);
      const description = clean(b.description);
      const lifeSpan = clean(b.life_span);
      const weightMetric = clean(b.weight?.metric);
      mapped.push({
        id: `cat-${b.id}`,
        apiBreedId: b.id,
        name: b.name,
        species: 'cat',
        imageUrl: imageUrl ?? '',
        temperament,
        origin,
        bredFor: null,
        breedGroup: null,
        lifeSpan,
        weightMetric,
        heightMetric: null,
        description,
        richness: richnessScore([
          temperament,
          origin,
          description,
          lifeSpan,
          weightMetric,
        ]),
      });
    }
    catCache = mapped.length >= 4 ? mapped : FALLBACK_CAT;
  } catch {
    catCache = FALLBACK_CAT;
  }
  return catCache;
}

export async function loadQuizCatalog(
  species: CompanionBreedSpecies,
): Promise<QuizBreed[]> {
  return species === 'dog' ? loadDogCatalog() : loadCatCatalog();
}

/** Dog CEO breed path heuristics from English display name. */
function dogCeoPaths(name: string): string[] {
  const words = name
    .toLowerCase()
    .replace(/[^a-z\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return [];
  const paths: string[] = [];
  if (words.length === 1) paths.push(words[0]);
  if (words.length >= 2) {
    // golden retriever → retriever/golden ; siberian husky → husky
    paths.push(`${words[words.length - 1]}/${words.slice(0, -1).join('-')}`);
    paths.push(words[words.length - 1]);
    paths.push(words.join('-'));
  }
  return [...new Set(paths)];
}

async function fetchJsonOk<T>(url: string, headers?: HeadersInit): Promise<T | null> {
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Prefer a fresh /images/search URL (cdn4 / GCS) — catalog cdn2 reference links
 * often 404. Dogs also fall back to dog.ceo.
 */
export async function resolveBreedImageUrl(
  breed: QuizBreed,
): Promise<string | null> {
  if (breed.species === 'dog') {
    const found = await fetchJsonOk<{ url?: string }[]>(
      `https://api.thedogapi.com/v1/images/search?breed_ids=${encodeURIComponent(breed.apiBreedId)}&limit=1`,
      apiHeaders(env.dogApiKey),
    );
    const live = clean(found?.[0]?.url);
    if (live) return live;

    for (const path of dogCeoPaths(breed.name)) {
      const ceo = await fetchJsonOk<{ message?: string; status?: string }>(
        `https://dog.ceo/api/breed/${path}/images/random`,
      );
      if (ceo?.status === 'success' && clean(ceo.message)) return ceo.message!;
    }
  } else {
    const found = await fetchJsonOk<{ url?: string }[]>(
      `https://api.thecatapi.com/v1/images/search?breed_ids=${encodeURIComponent(breed.apiBreedId)}&limit=1`,
      apiHeaders(env.catApiKey),
    );
    const live = clean(found?.[0]?.url);
    if (live) return live;
  }

  return clean(breed.imageUrl);
}

export async function createBreedQuizRound(
  species: CompanionBreedSpecies,
  avoidCorrectIds: string[] = [],
): Promise<BreedQuizRound> {
  const catalog = await loadQuizCatalog(species);
  const informative = informativePool(catalog);
  const base =
    informative.filter((b) => !avoidCorrectIds.includes(b.id)).length >= 4
      ? informative.filter((b) => !avoidCorrectIds.includes(b.id))
      : informative.length >= 4
        ? informative
        : catalog.filter((b) => !avoidCorrectIds.includes(b.id)).length >= 4
          ? catalog.filter((b) => !avoidCorrectIds.includes(b.id))
          : catalog;

  const ranked = shuffle(
    [...base].sort((a, b) => b.richness - a.richness).slice(0, Math.max(16, Math.floor(base.length * 0.5))),
  );

  let correct: QuizBreed | null = null;
  let imageUrl: string | null = null;
  const tried = new Set<string>();

  for (const candidate of ranked) {
    if (tried.has(candidate.id)) continue;
    tried.add(candidate.id);
    const resolved = await resolveBreedImageUrl(candidate);
    if (resolved) {
      correct = candidate;
      imageUrl = resolved;
      break;
    }
  }

  if (!correct || !imageUrl) {
    // Last resort: offline fallbacks with known-good dog.ceo / cat CDN URLs.
    const fallbacks = species === 'dog' ? FALLBACK_DOG : FALLBACK_CAT;
    for (const fb of fallbacks) {
      if (avoidCorrectIds.includes(fb.id)) continue;
      const resolved = (await resolveBreedImageUrl(fb)) ?? fb.imageUrl;
      if (resolved) {
        correct = fb;
        imageUrl = resolved;
        break;
      }
    }
  }

  if (!correct || !imageUrl) {
    throw new Error('BREED_IMAGE_UNAVAILABLE');
  }

  const distractors = pickDistinct(
    base.filter((b) => b.id !== correct!.id),
    3,
  );
  while (distractors.length < 3) {
    const extra = catalog.find(
      (b) =>
        b.id !== correct!.id && !distractors.some((d) => d.id === b.id),
    );
    if (!extra) break;
    distractors.push(extra);
  }

  const picks = [correct, ...distractors].slice(0, 4);
  const choices = shuffle(picks.map((b) => ({ id: b.id, name: b.name })));

  return {
    id: `round-${Date.now()}-${correct.id}`,
    species,
    imageUrl,
    correctId: correct.id,
    choices,
    fact: toFact(correct),
  };
}
