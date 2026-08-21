import AsyncStorage from '@react-native-async-storage/async-storage';

export type HabitKind = 'good' | 'bad';

export type PetHabit = {
  id: string;
  petId: string;
  label: string;
  kind: HabitKind;
  createdAt: string;
};

const STORAGE_KEY = 'knowsnout.pet_habits';

async function readAll(): Promise<PetHabit[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PetHabit[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: PetHabit[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export async function listHabits(petId: string): Promise<PetHabit[]> {
  const rows = await readAll();
  return rows
    .filter((r) => r.petId === petId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function addHabit(input: {
  petId: string;
  label: string;
  kind: HabitKind;
}): Promise<PetHabit> {
  const label = input.label.trim();
  if (!label) throw new Error('EMPTY_LABEL');
  const row: PetHabit = {
    id: `habit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    petId: input.petId,
    label,
    kind: input.kind,
    createdAt: new Date().toISOString(),
  };
  const rows = await readAll();
  rows.unshift(row);
  await writeAll(rows);
  return row;
}

export async function deleteHabit(id: string): Promise<void> {
  const rows = await readAll();
  await writeAll(rows.filter((r) => r.id !== id));
}
