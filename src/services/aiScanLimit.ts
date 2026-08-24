import AsyncStorage from '@react-native-async-storage/async-storage';

/** Free tier: AI photo parses/day. Barcode lookup stays unlimited. */
export const AI_SCAN_DAILY_LIMIT = 5;

const STORAGE_KEY = 'knowsnout.aiScanLimit.v1';

type DayState = {
  /** YYYY-MM-DD local */
  day: string;
  used: number;
};

function todayKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function readState(): Promise<DayState> {
  const day = todayKey();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { day, used: 0 };
    const parsed = JSON.parse(raw) as DayState;
    if (parsed?.day !== day) return { day, used: 0 };
    return { day, used: Math.max(0, Number(parsed.used) || 0) };
  } catch {
    return { day, used: 0 };
  }
}

async function writeState(state: DayState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export async function getAiScanUsage(): Promise<{
  used: number;
  limit: number;
  remaining: number;
}> {
  const state = await readState();
  const used = Math.min(state.used, AI_SCAN_DAILY_LIMIT);
  return {
    used,
    limit: AI_SCAN_DAILY_LIMIT,
    remaining: Math.max(0, AI_SCAN_DAILY_LIMIT - used),
  };
}

export async function canUseAiScan(): Promise<boolean> {
  const { remaining } = await getAiScanUsage();
  return remaining > 0;
}

/** Call after a successful AI photo analysis (food label / plant / breed photo). */
export async function consumeAiScan(): Promise<{
  used: number;
  limit: number;
  remaining: number;
  blocked: boolean;
}> {
  const state = await readState();
  if (state.used >= AI_SCAN_DAILY_LIMIT) {
    return {
      used: AI_SCAN_DAILY_LIMIT,
      limit: AI_SCAN_DAILY_LIMIT,
      remaining: 0,
      blocked: true,
    };
  }
  const next = { day: state.day, used: state.used + 1 };
  await writeState(next);
  return {
    used: next.used,
    limit: AI_SCAN_DAILY_LIMIT,
    remaining: Math.max(0, AI_SCAN_DAILY_LIMIT - next.used),
    blocked: false,
  };
}
