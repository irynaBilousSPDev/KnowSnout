/**
 * Wikidata-backed quiz rounds.
 * Fast path: curated local catalog (+ AsyncStorage cache).
 * Slow path: optional SPARQL refresh in background (never blocks first paint).
 * Attribution: https://www.wikidata.org/ — CC0 data.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

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
const ORIGIN_CACHE_KEY = 'knowsnout.wiki_origin_v2';
const GROUP_CACHE_KEY = 'knowsnout.wiki_group_v2';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SPARQL_TIMEOUT_MS = 2800;

let originCache: OriginRow[] | null = null;
let groupCache: GroupRow[] | null = null;
let originRefreshInFlight: Promise<void> | null = null;
let groupRefreshInFlight: Promise<void> | null = null;

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

async function runSparql(
  query: string,
  timeoutMs = SPARQL_TIMEOUT_MS,
): Promise<SparqlBinding[]> {
  const url = `${SPARQL_ENDPOINT}?query=${encodeURIComponent(query)}&format=json`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
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
  } finally {
    clearTimeout(timer);
  }
}

/** Curated pool — first paint never waits on Wikidata. */
const LOCAL_ORIGIN: OriginRow[] = [
  { breedId: 'Q26934', breedLabel: 'Лабрадор-ретривер', countryId: 'Q16', countryLabel: 'Канада' },
  { breedId: 'Q26926', breedLabel: 'Німецька вівчарка', countryId: 'Q183', countryLabel: 'Німеччина' },
  { breedId: 'Q38062', breedLabel: 'Сибірський хаскі', countryId: 'Q159', countryLabel: 'Росія' },
  { breedId: 'Q38686', breedLabel: 'Бігль', countryId: 'Q145', countryLabel: 'Велика Британія' },
  { breedId: 'Q38180', breedLabel: 'Золотистий ретривер', countryId: 'Q145', countryLabel: 'Велика Британія' },
  { breedId: 'Q37402', breedLabel: 'Пудель', countryId: 'Q142', countryLabel: 'Франція' },
  { breedId: 'Q38884', breedLabel: 'Боксер', countryId: 'Q183', countryLabel: 'Німеччина' },
  { breedId: 'Q38904', breedLabel: 'Далматин', countryId: 'Q224', countryLabel: 'Хорватія' },
  { breedId: 'Q37432', breedLabel: 'Чихуахуа', countryId: 'Q96', countryLabel: 'Мексика' },
  { breedId: 'Q37431', breedLabel: 'Ши-тцу', countryId: 'Q148', countryLabel: 'Китай' },
  { breedId: 'Q38164', breedLabel: 'Бульдог', countryId: 'Q145', countryLabel: 'Велика Британія' },
  { breedId: 'Q38280', breedLabel: 'Доберман', countryId: 'Q183', countryLabel: 'Німеччина' },
  { breedId: 'Q38386', breedLabel: 'Ротвейлер', countryId: 'Q183', countryLabel: 'Німеччина' },
  { breedId: 'Q38923', breedLabel: 'Акіта-іну', countryId: 'Q17', countryLabel: 'Японія' },
  { breedId: 'Q38157', breedLabel: 'Самоед', countryId: 'Q159', countryLabel: 'Росія' },
  { breedId: 'Q38155', breedLabel: 'Шпіц', countryId: 'Q183', countryLabel: 'Німеччина' },
  { breedId: 'Q39201', breedLabel: 'Коргі', countryId: 'Q25', countryLabel: 'Уельс' },
  { breedId: 'Q40159', breedLabel: 'Сіамський кіт', countryId: 'Q869', countryLabel: 'Таїланд' },
  { breedId: 'Q41784', breedLabel: 'Перський кіт', countryId: 'Q794', countryLabel: 'Іран' },
  { breedId: 'Q653', breedLabel: 'Мейн-кун', countryId: 'Q30', countryLabel: 'США' },
  { breedId: 'Q31206', breedLabel: 'Бенгальський кіт', countryId: 'Q30', countryLabel: 'США' },
  { breedId: 'Q21687', breedLabel: 'Британська короткошерста', countryId: 'Q145', countryLabel: 'Велика Британія' },
  { breedId: 'Q21693', breedLabel: 'Сфінкс', countryId: 'Q16', countryLabel: 'Канада' },
  { breedId: 'Q83506', breedLabel: 'Регдолл', countryId: 'Q30', countryLabel: 'США' },
  { breedId: 'Q45585', breedLabel: 'Абіссинський кіт', countryId: 'Q145', countryLabel: 'Велика Британія' },
  { breedId: 'Q46057', breedLabel: 'Російська блакитна', countryId: 'Q159', countryLabel: 'Росія' },
  { breedId: 'Q30608', breedLabel: 'Норвезька лісова', countryId: 'Q20', countryLabel: 'Норвегія' },
  { breedId: 'Q20989', breedLabel: 'Шотландська висловуха', countryId: 'Q22', countryLabel: 'Шотландія' },
  { breedId: 'Q24598', breedLabel: 'Бірманський кіт', countryId: 'Q836', countryLabel: 'М\'янма' },
  { breedId: 'Q48219', breedLabel: 'Турецька ангора', countryId: 'Q43', countryLabel: 'Туреччина' },
];

const LOCAL_GROUP: GroupRow[] = [
  { animalId: 'Q144', animalLabel: 'собака', groupId: 'Q7377', groupLabel: 'ссавці', description: null },
  { animalId: 'Q146', animalLabel: 'кіт', groupId: 'Q7377', groupLabel: 'ссавці', description: null },
  { animalId: 'Q726', animalLabel: 'кінь', groupId: 'Q7377', groupLabel: 'ссавці', description: null },
  { animalId: 'Q7368', animalLabel: 'вівця', groupId: 'Q7377', groupLabel: 'ссавці', description: null },
  { animalId: 'Q9394', animalLabel: 'кріль', groupId: 'Q7377', groupLabel: 'ссавці', description: null },
  { animalId: 'Q42569', animalLabel: 'коза', groupId: 'Q7377', groupLabel: 'ссавці', description: null },
  { animalId: 'Q123141', animalLabel: 'золота рибка', groupId: 'Q152', groupLabel: 'риби', description: null },
  { animalId: 'Q188879', animalLabel: 'атлантичний лосось', groupId: 'Q152', groupLabel: 'риби', description: null },
  { animalId: 'Q2102', animalLabel: 'змія', groupId: 'Q10811', groupLabel: 'плазуни', description: null },
  { animalId: 'Q168745', animalLabel: 'нільський крокодил', groupId: 'Q10811', groupLabel: 'плазуни', description: null },
  { animalId: 'Q121076461', animalLabel: 'домашня курка', groupId: 'Q5113', groupLabel: 'птахи', description: null },
  { animalId: 'Q16876322', animalLabel: 'крижень', groupId: 'Q5113', groupLabel: 'птахи', description: null },
  { animalId: 'Q29907051', animalLabel: 'беркут', groupId: 'Q5113', groupLabel: 'птахи', description: null },
];

/** Fast SPARQL: only known QIDs + P495 (no expensive P279* crawl). */
const ORIGIN_QUERY = `
SELECT DISTINCT ?breed ?breedLabel ?country ?countryLabel WHERE {
  VALUES ?breed {
    wd:Q26934 wd:Q26926 wd:Q38062 wd:Q38686 wd:Q38180 wd:Q37402 wd:Q38884
    wd:Q38904 wd:Q37432 wd:Q37431 wd:Q38164 wd:Q38280 wd:Q38386 wd:Q38923
    wd:Q38157 wd:Q39201 wd:Q40159 wd:Q41784 wd:Q653 wd:Q31206 wd:Q21687
    wd:Q83506 wd:Q45585 wd:Q46057 wd:Q30608 wd:Q20989 wd:Q24598 wd:Q48219
  }
  ?breed wdt:P495 ?country .
  SERVICE wikibase:label { bd:serviceParam wikibase:language "uk,en". }
}
`;

const GROUP_QUERY = `
SELECT ?animal ?animalLabel ?animalDescription ?group ?groupLabel WHERE {
  VALUES (?animal ?group) {
    (wd:Q144 wd:Q7377) (wd:Q146 wd:Q7377) (wd:Q726 wd:Q7377)
    (wd:Q42569 wd:Q7377) (wd:Q7368 wd:Q7377) (wd:Q9394 wd:Q7377)
    (wd:Q121076461 wd:Q5113) (wd:Q16876322 wd:Q5113) (wd:Q29907051 wd:Q5113)
    (wd:Q2102 wd:Q10811) (wd:Q168745 wd:Q10811)
    (wd:Q123141 wd:Q152) (wd:Q188879 wd:Q152)
  }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "uk,en". }
}
`;

const NONSENSE_LABEL_RE =
  /vegetarian|вегетар|веган|diet|дієт|list|список|red list|червон|concept|понятт|ideology|ідеолог|religion|реліг|city|місто|ulna|generalitat/i;

function isPlausibleAnimalLabel(label: string, description?: string | null) {
  const text = `${label} ${description ?? ''}`.trim();
  if (text.length < 2 || text.length > 60) return false;
  if (label.startsWith('Q')) return false;
  if (NONSENSE_LABEL_RE.test(text)) return false;
  return true;
}

type CacheEnvelope<T> = { savedAt: number; rows: T[] };

async function readPersisted<T>(key: string): Promise<T[] | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed?.rows?.length || !parsed.savedAt) return null;
    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    return parsed.rows;
  } catch {
    return null;
  }
}

async function writePersisted<T>(key: string, rows: T[]) {
  try {
    const payload: CacheEnvelope<T> = { savedAt: Date.now(), rows };
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

async function refreshOriginFromWikidata() {
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
      if (!isPlausibleAnimalLabel(breedLabel)) continue;
      if (countryLabel.startsWith('Q')) continue;
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
    if (rows.length >= 8) {
      originCache = rows;
      await writePersisted(ORIGIN_CACHE_KEY, rows);
    }
  } catch {
    /* keep local / previous cache */
  }
}

async function refreshGroupFromWikidata() {
  try {
    const bindings = await runSparql(GROUP_QUERY);
    const rows: GroupRow[] = [];
    const seen = new Set<string>();
    for (const b of bindings) {
      const animalId = b.animal?.value;
      const animalLabel = b.animalLabel?.value;
      const groupId = b.group?.value;
      const groupLabel = b.groupLabel?.value;
      const description = b.animalDescription?.value ?? null;
      if (!animalId || !animalLabel || !groupId || !groupLabel) continue;
      if (!isPlausibleAnimalLabel(animalLabel, description)) continue;
      if (groupLabel.startsWith('Q')) continue;
      const key = qidFromUri(animalId);
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push({
        animalId: key,
        animalLabel,
        groupId: qidFromUri(groupId),
        groupLabel,
        description,
      });
    }
    if (rows.length >= 6) {
      groupCache = rows;
      await writePersisted(GROUP_CACHE_KEY, rows);
    }
  } catch {
    /* keep local */
  }
}

function scheduleOriginRefresh() {
  if (originRefreshInFlight) return;
  originRefreshInFlight = refreshOriginFromWikidata().finally(() => {
    originRefreshInFlight = null;
  });
}

function scheduleGroupRefresh() {
  if (groupRefreshInFlight) return;
  groupRefreshInFlight = refreshGroupFromWikidata().finally(() => {
    groupRefreshInFlight = null;
  });
}

async function loadOriginRows(): Promise<OriginRow[]> {
  if (originCache && originCache.length >= 8) {
    scheduleOriginRefresh();
    return originCache;
  }
  const persisted = await readPersisted<OriginRow>(ORIGIN_CACHE_KEY);
  if (persisted && persisted.length >= 8) {
    originCache = persisted;
    scheduleOriginRefresh();
    return persisted;
  }
  originCache = LOCAL_ORIGIN;
  scheduleOriginRefresh();
  return LOCAL_ORIGIN;
}

async function loadGroupRows(): Promise<GroupRow[]> {
  if (groupCache && groupCache.length >= 6) {
    scheduleGroupRefresh();
    return groupCache;
  }
  const persisted = await readPersisted<GroupRow>(GROUP_CACHE_KEY);
  if (persisted && persisted.length >= 6) {
    groupCache = persisted;
    scheduleGroupRefresh();
    return persisted;
  }
  groupCache = LOCAL_GROUP;
  scheduleGroupRefresh();
  return LOCAL_GROUP;
}

/** Warm caches when opening the quiz hub (non-blocking). */
export function prefetchWikiQuizData() {
  void loadOriginRows();
  void loadGroupRows();
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
    const correct = pickDistinct(use, 1)[0]!;
    const otherCountries = uniqueByLabel(
      use
        .filter((r) => r.countryId !== correct.countryId)
        .map((r) => ({ id: r.countryId, label: r.countryLabel })),
    );
    const distractors = pickDistinct(otherCountries, 3);
    while (distractors.length < 3) {
      const fb = LOCAL_ORIGIN.find(
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
  const correct = pickDistinct(use, 1)[0]!;
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
    const bindings = await runSparql(query, 4000);
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
