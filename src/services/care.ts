import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  CareDayInput,
  CareDayLog,
  CareDayProgress,
} from '@/src/types/care';

const STORAGE_KEY = 'snoutscore.care_day_logs_v1';

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function emptyLog(petId: string, day: string): CareDayLog {
  return {
    pet_id: petId,
    day,
    water_done: false,
    water_at: null,
    water_note: null,
    play_done: false,
    play_at: null,
    play_minutes: null,
    play_note: null,
    feed_done: false,
    feed_at: null,
    feed_note: null,
  };
}

function normalizeLog(
  raw: Partial<CareDayLog> & { pet_id: string; day: string },
): CareDayLog {
  const base = emptyLog(raw.pet_id, raw.day);
  return {
    ...base,
    ...raw,
    water_done: Boolean(raw.water_done),
    play_done: Boolean(raw.play_done),
    feed_done: Boolean(raw.feed_done),
    water_at: raw.water_at ?? null,
    water_note: raw.water_note ?? null,
    play_at: raw.play_at ?? null,
    play_minutes: raw.play_minutes ?? null,
    play_note: raw.play_note ?? null,
    feed_at: raw.feed_at ?? null,
    feed_note: raw.feed_note ?? null,
  };
}

function storageId(petId: string, day: string) {
  return `${petId}:${day}`;
}

async function readAll(): Promise<Record<string, CareDayLog>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<CareDayLog>>;
    const out: Record<string, CareDayLog> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (!value?.pet_id || !value?.day) continue;
      out[key] = normalizeLog(
        value as Partial<CareDayLog> & { pet_id: string; day: string },
      );
    }
    return out;
  } catch {
    return {};
  }
}

async function writeAll(map: Record<string, CareDayLog>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function getCareToday(petId: string): Promise<CareDayLog> {
  const day = todayKey();
  const all = await readAll();
  return all[storageId(petId, day)] ?? emptyLog(petId, day);
}

export async function listCareTodayForPets(
  petIds: string[],
): Promise<Record<string, CareDayLog>> {
  const day = todayKey();
  const all = await readAll();
  const out: Record<string, CareDayLog> = {};
  for (const petId of petIds) {
    out[petId] = all[storageId(petId, day)] ?? emptyLog(petId, day);
  }
  return out;
}

export async function updateCareToday(
  petId: string,
  patch: CareDayInput,
): Promise<CareDayLog> {
  const day = todayKey();
  const all = await readAll();
  const key = storageId(petId, day);
  const prev = all[key] ?? emptyLog(petId, day);
  const now = new Date().toISOString();

  const next: CareDayLog = {
    ...prev,
    water_done: patch.water_done ?? prev.water_done,
    water_note:
      patch.water_note !== undefined ? patch.water_note : prev.water_note,
    play_done: patch.play_done ?? prev.play_done,
    play_minutes:
      patch.play_minutes !== undefined
        ? patch.play_minutes
        : prev.play_minutes,
    play_note:
      patch.play_note !== undefined ? patch.play_note : prev.play_note,
    feed_done: patch.feed_done ?? prev.feed_done,
    feed_note:
      patch.feed_note !== undefined ? patch.feed_note : prev.feed_note,
  };

  if (patch.water_done === true) next.water_at = now;
  if (patch.water_done === false) {
    next.water_at = null;
    next.water_note = null;
  }
  if (patch.play_done === true) next.play_at = now;
  if (patch.play_done === false) {
    next.play_at = null;
    next.play_minutes = null;
    next.play_note = null;
  }
  if (patch.feed_done === true) next.feed_at = now;
  if (patch.feed_done === false) {
    next.feed_at = null;
    next.feed_note = null;
  }

  all[key] = next;
  await writeAll(all);
  return next;
}

export function careProgress(
  log: CareDayLog,
  extras?: { fedFromLogs?: boolean },
): CareDayProgress {
  const feed = Boolean(log.feed_done || extras?.fedFromLogs);
  let done = 0;
  if (log.water_done) done += 1;
  if (log.play_done) done += 1;
  if (feed) done += 1;
  return {
    done,
    total: 3,
    water: log.water_done,
    play: log.play_done,
    feed,
  };
}
