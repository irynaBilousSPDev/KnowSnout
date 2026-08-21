import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'knowsnout.admin_moderation.v1';

export type ModerationItemType = 'place' | 'post' | 'rule';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type ModerationItem = {
  id: string;
  type: ModerationItemType;
  title: string;
  summary: string;
  status: ModerationStatus;
  createdAt: string;
};

const SEED: ModerationItem[] = [
  {
    id: 'mod-place-1',
    type: 'place',
    title: 'Клініка «Лапка»',
    summary: 'Заявка на верифікацію клініки в Києві',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
  },
  {
    id: 'mod-post-1',
    type: 'post',
    title: 'Пост у стрічці',
    summary: 'Скарга на спам у SnoutStories',
    status: 'pending',
    createdAt: new Date(Date.now() - 14_400_000).toISOString(),
  },
  {
    id: 'mod-rule-1',
    type: 'rule',
    title: 'Правило форуму v2',
    summary: 'Оновлення правил спільноти — потрібне схвалення',
    status: 'pending',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
  },
];

async function readQueue(): Promise<ModerationItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) {
      await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    const parsed = JSON.parse(raw) as ModerationItem[];
    return Array.isArray(parsed) ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

async function writeQueue(items: ModerationItem[]) {
  await AsyncStorage.setItem(KEY, JSON.stringify(items));
}

export async function listModerationQueue(): Promise<ModerationItem[]> {
  return readQueue();
}

export async function getModerationItem(
  id: string,
): Promise<ModerationItem | null> {
  return (await readQueue()).find((i) => i.id === id) ?? null;
}

export async function decideModerationItem(
  id: string,
  status: 'approved' | 'rejected',
): Promise<ModerationItem | null> {
  const items = await readQueue();
  const idx = items.findIndex((i) => i.id === id);
  if (idx < 0) return null;
  items[idx] = { ...items[idx], status };
  await writeQueue(items);
  return items[idx];
}
