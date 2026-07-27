/**
 * Wikidata-backed quiz rounds (SPARQL).
 * Attribution: https://www.wikidata.org/ — CC0 data.
 */

export type WikiQuizCategory = 'breed_origin' | 'animal_group';

export type WikiQuizChoice = { id: string; label: string };

export type WikiQuizRound = {
  id: string;
  category: WikiQuizCategory;
  subject: string;
  promptKey: 'quiz.wikiOriginPrompt' | 'quiz.wikiGroupPrompt';
  choices: WikiQuizChoice[];
  correctId: string;
  learn: {
    title: string;
    detail: string;
    wikidataUrl: string;
  };
};

export type BreedEnrichment = {
  description: string | null;
  origin: string | null;
  wikidataUrl: string;
};

type SparqlBinding = Record<string, { type: string; value: string }>;

type OriginRow = {
  breedId: string;
  breedLabel: string;
  countryId: string;
  countryLabel: string;
};

type GroupRow = {
  animalId: string;
  animalLabel: string;
  groupId: string;
  groupLabel: string;
  description: string | null;
};

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const UA =
  'KnowSnout/1.0 (https://knowsnout.com; educational pet quiz; contact via site)';

let originCache: OriginRow[] | null = null;
let groupCache: GroupRow[] | null = null;

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

function qidFromUri(uri: string): string {
  const parts = uri.split('/');
  return parts[parts.length - 1] ?? uri;
}

function wikidataEntityUrl(idOrUri: string): string {
  const id = idOrUri.includes('/') ? qidFromUri(idOrUri) : idOrUri;
  return `https://www.wikidata.org/wiki/${id}`;
}

async function runSparql(query: string): Promise<SparqlBinding[]> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  const res = await fetch(url, {
    headers: {
      Accept: 'application/sparql-results+json',
      'User-Agent': UA,
    },
  });
  if (!res.ok) {
    throw new Error(`Wikidata SPARQL ${res.status}`);
  }
  const json = (await res.json()) as {
    results?: { bindings?: SparqlBinding[] };
  };
  return json.results?.bindings ?? [];
}

const FALLBACK_ORIGIN: OriginRow[] = [
  {
    breedId: 'Q26934',
    breedLabel: 'Labrador Retriever',
    countryId: 'Q16',
    countryLabel: 'Канада',
  },
  {
    breedId: 'Q26926',
    breedLabel: 'German Shepherd',
    countryId: 'Q183',
    countryLabel: 'Німеччина',
  },
  {
    breedId: 'Q38062',
    breedLabel: 'Siberian Husky',
    countryId: 'Q159',
    countryLabel: 'Росія',
  },
  {
    breedId: 'Q38686',
    breedLabel: 'Beagle',
    countryId: 'Q145',
    countryLabel: 'Велика Британія',
  },
  {
    breedId: 'Q40159',
    breedLabel: 'Siamese cat',
    countryId: 'Q869',
    countryLabel: 'Таїланд',
  },
  {
    breedId: 'Q41784',
    breedLabel: 'Persian cat',
    countryId: 'Q794',
    countryLabel: 'Іран',
  },
  {
    breedId: 'Q653',
    breedLabel: 'Maine Coon',
    countryId: 'Q30',
    countryLabel: 'Сполучені Штати Америки',
  },
  {
    breedId: 'Q31206',
    breedLabel: 'Bengal cat',
    countryId: 'Q30',
    countryLabel: 'Сполучені Штати Америки',
  },
];

const FALLBACK_GROUP: GroupRow[] = [
  {
    animalId: 'Q144',
    animalLabel: 'собака',
    groupId: 'Q7377',
    groupLabel: 'ссавці',
    description: null,
  },
  {
    animalId: 'Q146',
    animalLabel: 'домашній кіт',
    groupId: 'Q7377',
    groupLabel: 'ссавці',
    description: null,
  },
  {
    animalId: 'Q726',
    animalLabel: 'кінь',
    groupId: 'Q7377',
    groupLabel: 'ссавці',
    description: null,
  },
  {
    animalId: 'Q2092297',
    animalLabel: 'курка',
    groupId: 'Q5113',
    groupLabel: 'птахи',
    description: null,
  },
  {
    animalId: 'Q25326',
    animalLabel: 'орел',
    groupId: 'Q5113',
    groupLabel: 'птахи',
    description: null,
  },
  {
    animalId: 'Q32059',
    animalLabel: 'ящірка',
    groupId: 'Q10811',
    groupLabel: 'плазуни',
    description: null,
  },
  {
    animalId: 'Q169330',
    animalLabel: 'золота рибка',
    groupId: 'Q152',
    groupLabel: 'риби',
    description: null,
  },
  {
    animalId: 'Q1134124',
    animalLabel: 'лосось',
    groupId: 'Q152',
    groupLabel: 'риби',
    description: null,
  },
];

/** Dog + cat breeds with country of origin (P495). Labels from Wikidata. */
const ORIGIN_QUERY = `
SELECT DISTINCT ?breed ?breedLabel ?country ?countryLabel WHERE {
  ?breed wdt:P31/wdt:P279* ?type .
  VALUES ?type { wd:Q39367 wd:Q43576 }
  ?breed wdt:P495 ?country .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "uk,en". }
}
LIMIT 120
`;

/**
 * Curated animal→group pairs for correctness; labels/descriptions from Wikidata.
 */
const GROUP_QUERY = `
SELECT ?animal ?animalLabel ?animalDescription ?group ?groupLabel WHERE {
  VALUES (?animal ?group) {
    (wd:Q144 wd:Q7377)
    (wd:Q146 wd:Q7377)
    (wd:Q726 wd:Q7377)
    (wd:Q42569 wd:Q7377)
    (wd:Q7368 wd:Q7377)
    (wd:Q83332 wd:Q7377)
    (wd:Q2092297 wd:Q5113)
    (wd:Q25326 wd:Q5113)
    (wd:Q32059 wd:Q10811)
    (wd:Q83364 wd:Q10811)
    (wd:Q169330 wd:Q152)
    (wd:Q1134124 wd:Q152)
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "uk,en". }
}
`;

async function loadOriginRows(): Promise<OriginRow[]> {
  if (originCache && originCache.length >= 8) return originCache;
  try {
    const bindings = await runSparql(ORIGIN_QUERY);
    const rows: OriginRow[] = [];
    const seen = new Set<string>();
    for (const b of bindings) {
      const breedId = b.breed?.value;
      const breedLabel = b.breedLabel?.value;
      const countryId = b.country?.value;
      const countryLabel = b.countryLabel?.value;
      if (!breedId || !breedLabel || !countryId || !countryLabel) continue;
      if (breedLabel.startsWith('Q') || countryLabel.startsWith('Q')) continue;
      const key = `${qidFromUri(breedId)}|${qidFromUri(countryId)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        breedId: qidFromUri(breedId),
        breedLabel,
        countryId: qidFromUri(countryId),
        countryLabel,
      });
    }
    originCache = rows.length >= 8 ? rows : FALLBACK_ORIGIN;
  } catch {
    originCache = FALLBACK_ORIGIN;
  }
  return originCache;
}

async function loadGroupRows(): Promise<GroupRow[]> {
  if (groupCache && groupCache.length >= 6) return groupCache;
  try {
    const bindings = await runSparql(GROUP_QUERY);
    const rows: GroupRow[] = [];
    const seen = new Set<string>();
    for (const b of bindings) {
      const animalId = b.animal?.value;
      const animalLabel = b.animalLabel?.value;
      const groupId = b.group?.value;
      const groupLabel = b.groupLabel?.value;
      if (!animalId || !animalLabel || !groupId || !groupLabel) continue;
      if (animalLabel.startsWith('Q') || groupLabel.startsWith('Q')) continue;
      const key = qidFromUri(animalId);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        animalId: key,
        animalLabel,
        groupId: qidFromUri(groupId),
        groupLabel,
        description: b.animalDescription?.value ?? null,
      });
    }
    groupCache = rows.length >= 6 ? rows : FALLBACK_GROUP;
  } catch {
    groupCache = FALLBACK_GROUP;
  }
  return groupCache;
}

function uniqueByLabel<T extends { label: string; id: string }>(
  items: T[],
): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const k = item.label.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

export async function createWikiQuizRound(
  category: WikiQuizCategory,
  avoidSubjects: string[] = [],
): Promise<WikiQuizRound> {
  if (category === 'breed_origin') {
    const rows = await loadOriginRows();
    const pool = rows.filter((r) => !avoidSubjects.includes(r.breedLabel));
    const use = pool.length >= 4 ? pool : rows;
    const correct = pickDistinct(use, 1)[0];
    const otherCountries = uniqueByLabel(
      use
        .filter((r) => r.countryId !== correct.countryId)
        .map((r) => ({ id: r.countryId, label: r.countryLabel })),
    );
    const distractors = pickDistinct(otherCountries, 3);
    while (distractors.length < 3) {
      const fb = FALLBACK_ORIGIN.find(
        (r) =>
          r.countryId !== correct.countryId &&
          !distractors.some((d) => d.id === r.countryId),
      );
      if (!fb) break;
      distractors.push({ id: fb.countryId, label: fb.countryLabel });
    }
    const choices = shuffle([
      { id: correct.countryId, label: correct.countryLabel },
      ...distractors.slice(0, 3),
    ]);
    return {
      id: `wiki-origin-${Date.now()}-${correct.breedId}`,
      category,
      subject: correct.breedLabel,
      promptKey: 'quiz.wikiOriginPrompt',
      choices,
      correctId: correct.countryId,
      learn: {
        title: correct.breedLabel,
        detail: `${correct.breedLabel} · ${correct.countryLabel}`,
        wikidataUrl: wikidataEntityUrl(correct.breedId),
      },
    };
  }

  const rows = await loadGroupRows();
  const pool = rows.filter((r) => !avoidSubjects.includes(r.animalLabel));
  const use = pool.length >= 4 ? pool : rows;
  const correct = pickDistinct(use, 1)[0];
  const groups = uniqueByLabel([
    { id: 'Q7377', label: 'ссавці' },
    { id: 'Q5113', label: 'птахи' },
    { id: 'Q10811', label: 'плазуни' },
    { id: 'Q152', label: 'риби' },
    ...use.map((r) => ({ id: r.groupId, label: r.groupLabel })),
  ]);
  const distractors = pickDistinct(
    groups.filter((g) => g.id !== correct.groupId),
    3,
  );
  const choices = shuffle([
    { id: correct.groupId, label: correct.groupLabel },
    ...distractors,
  ]);
  const detail = correct.description
    ? `${correct.animalLabel} → ${correct.groupLabel}. ${correct.description}`
    : `${correct.animalLabel} → ${correct.groupLabel}`;
  return {
    id: `wiki-group-${Date.now()}-${correct.animalId}`,
    category: 'animal_group',
    subject: correct.animalLabel,
    promptKey: 'quiz.wikiGroupPrompt',
    choices,
    correctId: correct.groupId,
    learn: {
      title: correct.animalLabel,
      detail,
      wikidataUrl: wikidataEntityUrl(correct.animalId),
    },
  };
}

/** Enrich a Dog/Cat API breed name with Wikidata description + origin. */
export async function enrichBreedFromWikidata(
  breedName: string,
): Promise<BreedEnrichment | null> {
  const safe = breedName.replace(/"/g, '').trim();
  if (safe.length < 2) return null;
  const query = `
SELECT ?item ?itemLabel ?itemDescription ?countryLabel WHERE {
  ?item rdfs:label "${safe}"@en .
  ?item wdt:P31/wdt:P279* ?type .
  VALUES ?type { wd:Q39367 wd:Q43576 }
  OPTIONAL { ?item wdt:P495 ?country . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "uk,en". }
}
LIMIT 1
`;
  try {
    const bindings = await runSparql(query);
    const b = bindings[0];
    if (!b?.item?.value) return null;
    return {
      description: b.itemDescription?.value ?? null,
      origin: b.countryLabel?.value ?? null,
      wikidataUrl: wikidataEntityUrl(b.item.value),
    };
  } catch {
    return null;
  }
}
