import { env } from '@/src/lib/env';
import type { CompanionBreedSpecies } from '@/src/types/breed';

export type QuizBreed = {
  id: string;
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
    name: 'Labrador Retriever',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/B1uW7l5VX.jpg',
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
    name: 'Siberian Husky',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/S17ZilChm.jpg',
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
    name: 'Pembroke Welsh Corgi',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/BJF-llzqV.jpg',
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
    name: 'Beagle',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/SydP1xeE7.jpg',
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
      // Catalog often omits nested image.url; reference_image_id is enough.
      if (!imageUrl) continue;
      const temperament = clean(b.temperament);
      const origin = clean(b.origin);
      const bredFor = clean(b.bred_for);
      const breedGroup = clean(b.breed_group);
      const lifeSpan = clean(b.life_span);
      const weightMetric = clean(b.weight?.metric);
      const heightMetric = clean(b.height?.metric);
      mapped.push({
        id: `dog-${b.id}`,
        name: b.name,
        species: 'dog',
        imageUrl,
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
      if (!imageUrl) continue;
      const temperament = clean(b.temperament);
      const origin = clean(b.origin);
      const description = clean(b.description);
      const lifeSpan = clean(b.life_span);
      const weightMetric = clean(b.weight?.metric);
      mapped.push({
        id: `cat-${b.id}`,
        name: b.name,
        species: 'cat',
        imageUrl,
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

export async function createBreedQuizRound(
  species: CompanionBreedSpecies,
  avoidCorrectIds: string[] = [],
): Promise<BreedQuizRound> {
  const catalog = await loadQuizCatalog(species);
  const withImage = catalog.filter((b) => Boolean(b.imageUrl));
  const informative = informativePool(
    withImage.length >= 8 ? withImage : catalog,
  );
  const base =
    informative.filter((b) => !avoidCorrectIds.includes(b.id)).length >= 4
      ? informative.filter((b) => !avoidCorrectIds.includes(b.id))
      : informative.length >= 4
        ? informative
        : catalog;

  const ranked = [...base].sort((a, b) => b.richness - a.richness);
  const top = ranked.slice(0, Math.max(12, Math.floor(ranked.length * 0.6)));
  const correct = pickDistinct(top.length >= 1 ? top : ranked, 1)[0];

  const distractors = pickDistinct(
    base.filter((b) => b.id !== correct.id),
    3,
  );
  while (distractors.length < 3) {
    const extra = catalog.find(
      (b) =>
        b.id !== correct.id && !distractors.some((d) => d.id === b.id),
    );
    if (!extra) break;
    distractors.push(extra);
  }

  const picks = [correct, ...distractors].slice(0, 4);
  // Always the breed's official catalog image — never an untagged random photo.
  const imageUrl = correct.imageUrl;
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
