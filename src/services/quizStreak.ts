import AsyncStorage from '@react-native-async-storage/async-storage';

import type { QuizCategory } from '@/src/services/quizResults';

const STREAK_KEY = 'knowsnout.quiz_streak.v1';

export type QuizStreakState = {
  currentStreak: number;
  bestStreak: number;
  /** Local calendar date YYYY-MM-DD last counted */
  lastPlayDate: string | null;
};

export type DailyQuizChallenge = {
  category: QuizCategory;
  href: string;
  titleKey: string;
  bodyKey: string;
};

const DAILY_ROTATION: DailyQuizChallenge[] = [
  {
    category: 'breed',
    href: '/(app)/breed-quiz?daily=1',
    titleKey: 'quizHub.breedTitle',
    bodyKey: 'quizStreak.dailyBreedBody',
  },
  {
    category: 'breed_origin',
    href: '/(app)/wiki-quiz?category=breed_origin&daily=1',
    titleKey: 'quizHub.originTitle',
    bodyKey: 'quizStreak.dailyOriginBody',
  },
  {
    category: 'animal_group',
    href: '/(app)/wiki-quiz?category=animal_group&daily=1',
    titleKey: 'quizHub.groupTitle',
    bodyKey: 'quizStreak.dailyGroupBody',
  },
  {
    category: 'animals_trivia',
    href: '/(app)/trivia-quiz?daily=1',
    titleKey: 'quizHub.triviaTitle',
    bodyKey: 'quizStreak.dailyTriviaBody',
  },
];

export function emptyQuizStreak(): QuizStreakState {
  return { currentStreak: 0, bestStreak: 0, lastPlayDate: null };
}

/** Local calendar date YYYY-MM-DD */
export function localDateKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

function daysBetween(a: string, b: string): number {
  const ms =
    parseDateKey(b).getTime() - parseDateKey(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

/** Deterministic quiz-of-the-day from calendar date. */
export function getDailyQuizChallenge(date = new Date()): DailyQuizChallenge {
  const key = localDateKey(date);
  const [y, m, d] = key.split('-').map(Number);
  const utcDay = Math.floor(
    Date.UTC(y!, (m ?? 1) - 1, d ?? 1) / (1000 * 60 * 60 * 24),
  );
  return DAILY_ROTATION[Math.abs(utcDay) % DAILY_ROTATION.length]!;
}

async function readStreak(): Promise<QuizStreakState> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return emptyQuizStreak();
    const parsed = JSON.parse(raw) as Partial<QuizStreakState>;
    return {
      currentStreak: Number(parsed.currentStreak) || 0,
      bestStreak: Number(parsed.bestStreak) || 0,
      lastPlayDate:
        typeof parsed.lastPlayDate === 'string' ? parsed.lastPlayDate : null,
    };
  } catch {
    return emptyQuizStreak();
  }
}

async function writeStreak(state: QuizStreakState) {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(state));
}

export async function getQuizStreak(): Promise<QuizStreakState> {
  const state = await readStreak();
  const today = localDateKey();
  if (!state.lastPlayDate) return state;

  const gap = daysBetween(state.lastPlayDate, today);
  // Missed a day → streak broken until next play (show 0 current until they play)
  if (gap > 1) {
    return {
      ...state,
      currentStreak: 0,
    };
  }
  return state;
}

export function playedQuizToday(state: QuizStreakState, today = localDateKey()) {
  return state.lastPlayDate === today;
}

/**
 * Call after a finished quiz session. Idempotent within the same local day.
 */
export async function recordQuizDayPlayed(
  when = new Date(),
): Promise<QuizStreakState> {
  const today = localDateKey(when);
  const prev = await readStreak();

  if (prev.lastPlayDate === today) {
    return getQuizStreak();
  }

  let currentStreak = 1;
  if (prev.lastPlayDate) {
    const gap = daysBetween(prev.lastPlayDate, today);
    if (gap === 1) currentStreak = prev.currentStreak + 1;
    else if (gap === 0) currentStreak = Math.max(1, prev.currentStreak);
  }

  const next: QuizStreakState = {
    currentStreak,
    bestStreak: Math.max(prev.bestStreak, currentStreak),
    lastPlayDate: today,
  };
  await writeStreak(next);
  return next;
}
