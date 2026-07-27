import AsyncStorage from '@react-native-async-storage/async-storage';

import { localDateKey } from '@/src/services/quizStreak';

const STREAK_KEY = 'knowsnout.care_streak.v1';

export type CareStreakState = {
  currentStreak: number;
  bestStreak: number;
  /** Local calendar date YYYY-MM-DD last counted */
  lastCareDate: string | null;
};

export function emptyCareStreak(): CareStreakState {
  return { currentStreak: 0, bestStreak: 0, lastCareDate: null };
}

function parseDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0, 0);
}

function daysBetween(a: string, b: string): number {
  const ms = parseDateKey(b).getTime() - parseDateKey(a).getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

async function readStreak(): Promise<CareStreakState> {
  try {
    const raw = await AsyncStorage.getItem(STREAK_KEY);
    if (!raw) return emptyCareStreak();
    const parsed = JSON.parse(raw) as Partial<CareStreakState>;
    return {
      currentStreak: Number(parsed.currentStreak) || 0,
      bestStreak: Number(parsed.bestStreak) || 0,
      lastCareDate:
        typeof parsed.lastCareDate === 'string' ? parsed.lastCareDate : null,
    };
  } catch {
    return emptyCareStreak();
  }
}

async function writeStreak(state: CareStreakState) {
  await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(state));
}

export async function getCareStreak(): Promise<CareStreakState> {
  const state = await readStreak();
  const today = localDateKey();
  if (!state.lastCareDate) return state;
  const gap = daysBetween(state.lastCareDate, today);
  if (gap > 1) {
    return { ...state, currentStreak: 0 };
  }
  return state;
}

/**
 * Call when a pet finishes a full care day (3/3). Idempotent per local day.
 */
export async function recordCareDayComplete(
  when = new Date(),
): Promise<CareStreakState> {
  const today = localDateKey(when);
  const prev = await readStreak();

  if (prev.lastCareDate === today) {
    return getCareStreak();
  }

  let currentStreak = 1;
  if (prev.lastCareDate) {
    const gap = daysBetween(prev.lastCareDate, today);
    if (gap === 1) currentStreak = prev.currentStreak + 1;
    else if (gap === 0) currentStreak = Math.max(1, prev.currentStreak);
  }

  const next: CareStreakState = {
    currentStreak,
    bestStreak: Math.max(prev.bestStreak, currentStreak),
    lastCareDate: today,
  };
  await writeStreak(next);
  return next;
}
