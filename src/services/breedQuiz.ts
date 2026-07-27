import type { CompanionBreedSpecies } from '@/src/types/breed';

export type QuizBreed = {
  id: string;
  name: string;
  species: CompanionBreedSpecies;
  imageUrl: string;
  temperament: string | null;
  origin: string | null;
  bredFor: string | null;
};

export type BreedQuizRound = {
  id: string;
  species: CompanionBreedSpecies;
  imageUrl: string;
  correctId: string;
  choices: { id: string; name: string }[];
  fact: {
    temperament: string | null;
    origin: string | null;
    bredFor: string | null;
  };
};

type DogApiBreed = {
  id: number;
  name: string;
  temperament?: string;
  bred_for?: string;
  origin?: string;
  reference_image_id?: string;
  image?: { url?: string };
};

type CatApiBreed = {
  id: string;
  name: string;
  temperament?: string;
  origin?: string;
  reference_image_id?: string;
  image?: { url?: string };
};

const FALLBACK_DOG: QuizBreed[] = [
  {
    id: 'dog-fallback-lab',
    name: 'Labrador Retriever',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/B1uW7l5VX.jpg',
    temperament: 'Friendly, Active, Outgoing',
    origin: 'Canada / UK',
    bredFor: 'Water retrieving',
  },
  {
    id: 'dog-fallback-husky',
    name: 'Siberian Husky',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/S17ZilChm.jpg',
    temperament: 'Outgoing, Friendly, Alert',
    origin: 'Russia',
    bredFor: 'Sled pulling',
  },
  {
    id: 'dog-fallback-corgi',
    name: 'Pembroke Welsh Corgi',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/BJF-llzqV.jpg',
    temperament: 'Playful, Outgoing, Friendly',
    origin: 'United Kingdom',
    bredFor: 'Cattle herding',
  },
  {
    id: 'dog-fallback-beagle',
    name: 'Beagle',
    species: 'dog',
    imageUrl: 'https://cdn2.thedogapi.com/images/SydP1xeE7.jpg',
    temperament: 'Amiable, Even Tempered, Excitable',
    origin: 'United Kingdom',
    bredFor: 'Rabbit hunting',
  },
];

const FALLBACK_CAT: QuizBreed[] = [
  {
    id: 'cat-fallback-siamese',
    name: 'Siamese',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/ai6Jps4sx.jpg',
    temperament: 'Active, Agile, Clever',
    origin: 'Thailand',
    bredFor: null,
  },
  {
    id: 'cat-fallback-persian',
    name: 'Persian',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/0XYvRd7oD.jpg',
    temperament: 'Affectionate, Loyal, Quiet',
    origin: 'Iran',
    bredFor: null,
  },
  {
    id: 'cat-fallback-bengal',
    name: 'Bengal',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/O3btzLlsO.jpg',
    temperament: 'Alert, Agile, Energetic',
    origin: 'United States',
    bredFor: null,
  },
  {
    id: 'cat-fallback-maine',
    name: 'Maine Coon',
    species: 'cat',
    imageUrl: 'https://cdn2.thecatapi.com/images/OOD3VSYVX.jpg',
    temperament: 'Gentle, Independent, Intelligent',
    origin: 'United States',
    bredFor: null,
  },
];

let dogCache: QuizBreed[] | null = null;
let catCache: QuizBreed[] | null = null;

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

async function loadDogCatalog(): Promise<QuizBreed[]> {
  if (dogCache && dogCache.length >= 4) return dogCache;
  try {
    const res = await fetch('https://api.thedogapi.com/v1/breeds', {
      headers: { 'User-Agent': 'KnowSnout/1.0 (breed quiz)' },
    });
    if (!res.ok) throw new Error('dog api');
    const data = (await res.json()) as DogApiBreed[];
    const mapped: QuizBreed[] = [];
    for (const b of data) {
      const imageUrl =
        b.image?.url ??
        (b.reference_image_id
          ? `https://cdn2.thedogapi.com/images/${b.reference_image_id}.jpg`
          : null);
      if (!imageUrl) continue;
      mapped.push({
        id: `dog-${b.id}`,
        name: b.name,
        species: 'dog',
        imageUrl,
        temperament: b.temperament ?? null,
        origin: b.origin ?? null,
        bredFor: b.bred_for ?? null,
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
      headers: { 'User-Agent': 'KnowSnout/1.0 (breed quiz)' },
    });
    if (!res.ok) throw new Error('cat api');
    const data = (await res.json()) as CatApiBreed[];
    const mapped: QuizBreed[] = [];
    for (const b of data) {
      const imageUrl =
        b.image?.url ??
        (b.reference_image_id
          ? `https://cdn2.thecatapi.com/images/${b.reference_image_id}.jpg`
          : null);
      if (!imageUrl) continue;
      mapped.push({
        id: `cat-${b.id}`,
        name: b.name,
        species: 'cat',
        imageUrl,
        temperament: b.temperament ?? null,
        origin: b.origin ?? null,
        bredFor: null,
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

async function fetchFreshImage(
  breed: QuizBreed,
): Promise<string> {
  try {
    if (breed.species === 'dog') {
      const numericId = breed.id.replace(/^dog-/, '');
      const res = await fetch(
        `https://api.thedogapi.com/v1/images/search?breed_ids=${numericId}&limit=1`,
        { headers: { 'User-Agent': 'KnowSnout/1.0 (breed quiz)' } },
      );
      if (res.ok) {
        const data = (await res.json()) as { url?: string }[];
        if (data[0]?.url) return data[0].url;
      }
    } else {
      const catId = breed.id.replace(/^cat-/, '');
      const res = await fetch(
        `https://api.thecatapi.com/v1/images/search?breed_ids=${catId}&limit=1`,
        { headers: { 'User-Agent': 'KnowSnout/1.0 (breed quiz)' } },
      );
      if (res.ok) {
        const data = (await res.json()) as { url?: string }[];
        if (data[0]?.url) return data[0].url;
      }
    }
  } catch {
    // Fall back to catalog image.
  }
  return breed.imageUrl;
}

export async function createBreedQuizRound(
  species: CompanionBreedSpecies,
  avoidCorrectIds: string[] = [],
): Promise<BreedQuizRound> {
  const catalog = await loadQuizCatalog(species);
  const pool =
    catalog.filter((b) => !avoidCorrectIds.includes(b.id)).length >= 4
      ? catalog.filter((b) => !avoidCorrectIds.includes(b.id))
      : catalog;

  const picks = pickDistinct(pool, 4);
  const correct = picks[0];
  const imageUrl = await fetchFreshImage(correct);
  const choices = shuffle(
    picks.map((b) => ({ id: b.id, name: b.name })),
  );

  return {
    id: `round-${Date.now()}-${correct.id}`,
    species,
    imageUrl,
    correctId: correct.id,
    choices,
    fact: {
      temperament: correct.temperament,
      origin: correct.origin,
      bredFor: correct.bredFor,
    },
  };
}
