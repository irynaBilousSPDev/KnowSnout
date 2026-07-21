import AsyncStorage from '@react-native-async-storage/async-storage';

import type { TravelPackId } from '@/src/constants/travelChecklists';

const STORAGE_KEY = 'snoutscore.travel_checklist_progress';

type ProgressMap = Record<string, Record<string, boolean>>;

function progressKey(petId: string, packId: TravelPackId) {
  return `${petId}:${packId}`;
}

async function readAll(): Promise<ProgressMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ProgressMap;
  } catch {
    return {};
  }
}

async function writeAll(map: ProgressMap) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function getTravelProgress(
  petId: string,
  packId: TravelPackId,
): Promise<Record<string, boolean>> {
  const all = await readAll();
  return all[progressKey(petId, packId)] ?? {};
}

export async function setTravelItemDone(input: {
  petId: string;
  packId: TravelPackId;
  itemId: string;
  done: boolean;
}): Promise<Record<string, boolean>> {
  const all = await readAll();
  const key = progressKey(input.petId, input.packId);
  const current = { ...(all[key] ?? {}) };
  if (input.done) current[input.itemId] = true;
  else delete current[input.itemId];
  all[key] = current;
  await writeAll(all);
  return current;
}

export function travelProgressCount(
  progress: Record<string, boolean>,
  total: number,
): { done: number; total: number } {
  const done = Object.values(progress).filter(Boolean).length;
  return { done, total };
}
