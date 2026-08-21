import AsyncStorage from '@react-native-async-storage/async-storage';

const XP_KEY = 'knowsnout.gamification.v1';

export type Badge = {
  id: string;
  title: string;
  body: string;
  unlocked: boolean;
};

export type LeaderboardRow = {
  id: string;
  name: string;
  xp: number;
  rank: number;
  me?: boolean;
};

export type GamificationState = {
  xp: number;
  badges: Badge[];
};

const SEED_BADGES: Badge[] = [
  {
    id: 'b-first',
    title: 'Перший квіз',
    body: 'Пройди будь-який квіз',
    unlocked: true,
  },
  {
    id: 'b-streak3',
    title: 'Серія 3',
    body: 'Грати 3 дні поспіль',
    unlocked: true,
  },
  {
    id: 'b-zoom',
    title: 'Зумівець',
    body: 'Пройди Zoom-квіз',
    unlocked: false,
  },
  {
    id: 'b-myth',
    title: 'Міфобастер',
    body: 'Розвіяй 5 міфів',
    unlocked: false,
  },
  {
    id: 'b-heavy',
    title: 'Важковаговик',
    body: 'Пройди складний квіз без помилок',
    unlocked: false,
  },
];

const LEADERBOARD: Omit<LeaderboardRow, 'rank'>[] = [
  { id: 'lb-1', name: 'Катя', xp: 2480 },
  { id: 'lb-2', name: 'Максим', xp: 2110 },
  { id: 'lb-me', name: 'Ти', xp: 1860, me: true },
  { id: 'lb-3', name: 'Ірина', xp: 1720 },
  { id: 'lb-4', name: 'Оля', xp: 1540 },
  { id: 'lb-5', name: 'Діма', xp: 1320 },
];

async function readState(): Promise<GamificationState> {
  try {
    const raw = await AsyncStorage.getItem(XP_KEY);
    if (!raw) {
      const seed: GamificationState = { xp: 1860, badges: SEED_BADGES };
      await AsyncStorage.setItem(XP_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as GamificationState;
  } catch {
    return { xp: 1860, badges: SEED_BADGES };
  }
}

async function writeState(state: GamificationState) {
  await AsyncStorage.setItem(XP_KEY, JSON.stringify(state));
}

export async function getGamification(): Promise<GamificationState> {
  return readState();
}

export async function addQuizXp(
  amount: number,
  unlockBadgeId?: string,
): Promise<GamificationState> {
  const state = await readState();
  state.xp += amount;
  if (unlockBadgeId) {
    state.badges = state.badges.map((b) =>
      b.id === unlockBadgeId ? { ...b, unlocked: true } : b,
    );
  }
  await writeState(state);
  return state;
}

export function listLeaderboard(): LeaderboardRow[] {
  return [...LEADERBOARD]
    .sort((a, b) => b.xp - a.xp)
    .map((row, i) => ({ ...row, rank: i + 1 }));
}
