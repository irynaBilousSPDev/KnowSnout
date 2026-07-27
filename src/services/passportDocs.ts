import AsyncStorage from '@react-native-async-storage/async-storage';

import type { PassportPackId } from '@/src/constants/passportChecklists';

const STORAGE_KEY = 'knowsnout.passport_checklist_progress.v1';

type ProgressMap = Record<string, Record<string, boolean>>;

function progressKey(petId: string, packId: PassportPackId) {
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

export async function getPassportProgress(
  petId: string,
  packId: PassportPackId,
): Promise<Record<string, boolean>> {
  const all = await readAll();
  return all[progressKey(petId, packId)] ?? {};
}

export async function setPassportItemDone(input: {
  petId: string;
  packId: PassportPackId;
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

export function passportProgressCount(
  progress: Record<string, boolean>,
  total: number,
): { done: number; total: number } {
  const done = Object.values(progress).filter(Boolean).length;
  return { done, total };
}
