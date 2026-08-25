import AsyncStorage from '@react-native-async-storage/async-storage';

const XP_KEY = 'knowsnout.gamification.v2';

export type BadgeIcon = 'ribbon' | 'scans' | 'chat' | 'trophy';

export type Badge = {
  id: string;
  title: string;
  body: string;
  unlocked: boolean;
  icon: BadgeIcon;
  /** Shown inside scans circle when icon === 'scans' */
  progressLabel?: string;
};

export type LeaderboardRow = {
  id: string;
  name: string;
  xp: number;
  rank: number;
  me?: boolean;
  streakDays?: number;
};

export type GamificationState = {
  xp: number;
  badges: Badge[];
};

const SEED_BADGES: Badge[] = [
  {
    id: 'b-streak30',
    title: 'Серія 30 днів',
    body: 'Заходь у застосунок 30 днів поспіль',
    unlocked: true,
    icon: 'ribbon',
  },
  {
    id: 'b-scans100',
    title: '100 сканів корму',
    body: 'Проскануй 100 етикеток корму',
    unlocked: true,
    icon: 'scans',
    progressLabel: '0',
  },
  {
    id: 'b-forum10',
    title: '10 відповідей на форумі',
    body: 'Напиши 10 відповідей на форумі',
    unlocked: false,
    icon: 'chat',
  },
  {
    id: 'b-spotlight',
    title: 'Переможець SnoutSpotlight',
    body: 'Виграй конкурс SnoutSpotlight',
    unlocked: false,
    icon: 'trophy',
  },
];

const LEADERBOARD: Omit<LeaderboardRow, 'rank'>[] = [
  { id: 'lb-1', name: 'Оксана', xp: 4820, streakDays: 21 },
  { id: 'lb-2', name: 'Ігор', xp: 3990, streakDays: 9 },
  { id: 'lb-3', name: 'Соломія', xp: 3610, streakDays: 14 },
  { id: 'lb-me', name: 'Марта', xp: 3340, me: true, streakDays: 12 },
  { id: 'lb-4', name: 'Дмитро', xp: 2980, streakDays: 5 },
];

function normalizeBadges(raw: Badge[]): Badge[] {
  const byId = new Map(raw.map((b) => [b.id, b]));
  return SEED_BADGES.map((seed) => {
    const prev = byId.get(seed.id);
    return prev ? { ...seed, unlocked: prev.unlocked } : seed;
  });
}

async function readState(): Promise<GamificationState> {
  try {
    const raw = await AsyncStorage.getItem(XP_KEY);
    if (!raw) {
      const seed: GamificationState = { xp: 1860, badges: SEED_BADGES };
      await AsyncStorage.setItem(XP_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as GamificationState;
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 1860,
      badges: normalizeBadges(parsed.badges ?? []),
    };
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
