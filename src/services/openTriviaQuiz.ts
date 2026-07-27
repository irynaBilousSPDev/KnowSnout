/**
 * Open Trivia DB — Animals category (id 27).
 * https://opentdb.com/ — CC BY-SA 4.0
 */

export type TriviaQuizRound = {
  id: string;
  subject: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
  learn: {
    title: string;
    detail: string;
    sourceUrl: string;
  };
};

type OtdbItem = {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const OTDB_URL =
  'https://opentdb.com/api.php?amount=10&category=27&type=multiple&encode=url3986';

const FALLBACK_ROUNDS: TriviaQuizRound[] = [
  {
    id: 'otdb-fallback-1',
    subject: 'Animals',
    prompt: 'How many legs does a spider have?',
    choices: [
      { id: 'a', label: '6' },
      { id: 'b', label: '8' },
      { id: 'c', label: '10' },
      { id: 'd', label: '4' },
    ],
    correctId: 'b',
    learn: {
      title: 'Spider',
      detail: 'Spiders are arachnids and have eight legs.',
      sourceUrl: 'https://opentdb.com/',
    },
  },
  {
    id: 'otdb-fallback-2',
    subject: 'Animals',
    prompt: 'What is the fastest land animal?',
    choices: [
      { id: 'a', label: 'Lion' },
      { id: 'b', label: 'Cheetah' },
      { id: 'c', label: 'Horse' },
      { id: 'd', label: 'Greyhound' },
    ],
    correctId: 'b',
    learn: {
      title: 'Cheetah',
      detail: 'The cheetah can reach roughly 100+ km/h in short bursts.',
      sourceUrl: 'https://opentdb.com/',
    },
  },
  {
    id: 'otdb-fallback-3',
    subject: 'Animals',
    prompt: 'Which bird is known for mimicking human speech?',
    choices: [
      { id: 'a', label: 'Eagle' },
      { id: 'b', label: 'Parrot' },
      { id: 'c', label: 'Owl' },
      { id: 'd', label: 'Penguin' },
    ],
    correctId: 'b',
    learn: {
      title: 'Parrot',
      detail: 'Many parrot species can imitate sounds, including speech.',
      sourceUrl: 'https://opentdb.com/',
    },
  },
  {
    id: 'otdb-fallback-4',
    subject: 'Animals',
    prompt: 'A group of lions is called a…',
    choices: [
      { id: 'a', label: 'Herd' },
      { id: 'b', label: 'Pack' },
      { id: 'c', label: 'Pride' },
      { id: 'd', label: 'Flock' },
    ],
    correctId: 'c',
    learn: {
      title: 'Pride',
      detail: 'Lions typically live in social groups known as prides.',
      sourceUrl: 'https://opentdb.com/',
    },
  },
];

let poolCache: TriviaQuizRound[] | null = null;

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value.replace(/\+/g, ' '));
  } catch {
    return value;
  }
}

function toRound(item: OtdbItem, index: number): TriviaQuizRound | null {
  const correct = decode(item.correct_answer);
  const incorrect = item.incorrect_answers.map(decode);
  const prompt = decode(item.question);
  // Drop obviously broken / empty payloads.
  if (prompt.length < 8 || correct.length < 1 || incorrect.length < 2) {
    return null;
  }
  const labels = shuffle([correct, ...incorrect]).slice(0, 4);
  if (labels.length < 4) return null;
  const choices = labels.map((label, i) => ({
    id: `c${i}`,
    label,
  }));
  const correctId =
    choices.find((c) => c.label === correct)?.id ?? choices[0]?.id ?? 'c0';
  return {
    id: `otdb-${Date.now()}-${index}`,
    subject: decode(item.category || 'Animals'),
    prompt,
    choices,
    correctId,
    learn: {
      title: correct,
      detail: prompt,
      sourceUrl: 'https://opentdb.com/',
    },
  };
}

async function loadPool(): Promise<TriviaQuizRound[]> {
  if (poolCache && poolCache.length >= 4) return poolCache;
  try {
    const res = await fetch(OTDB_URL, {
      headers: { 'User-Agent': 'KnowSnout/1.0 (https://knowsnout.com; quiz)' },
    });
    if (!res.ok) throw new Error('opentdb');
    const json = (await res.json()) as {
      response_code: number;
      results?: OtdbItem[];
    };
    if (json.response_code !== 0 || !json.results?.length) {
      throw new Error('opentdb empty');
    }
    poolCache = json.results
      .map(toRound)
      .filter((r): r is TriviaQuizRound => Boolean(r));
    if (poolCache.length < 4) throw new Error('opentdb thin');
  } catch {
    poolCache = FALLBACK_ROUNDS;
  }
  return poolCache;
}

export async function createTriviaQuizRound(
  avoidPrompts: string[] = [],
): Promise<TriviaQuizRound> {
  const pool = await loadPool();
  const available = pool.filter((r) => !avoidPrompts.includes(r.prompt));
  const use = available.length > 0 ? available : pool;
  const pick = shuffle(use)[0];
  // Fresh shuffle of choices each time
  return {
    ...pick,
    id: `otdb-round-${Date.now()}`,
    choices: shuffle(pick.choices),
  };
}

/** Drop cache so a new session can fetch fresh questions. */
export function resetTriviaPool() {
  poolCache = null;
}
