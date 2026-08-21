import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'knowsnout.admin_moderation.v1';

export type ModerationItemType = 'place' | 'post' | 'rule' | 'complaint';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type ModerationItem = {
  id: string;
  type: ModerationItemType;
  title: string;
  summary: string;
  source?: string;
  status: ModerationStatus;
  createdAt: string;
};

const SEED: ModerationItem[] = [
  {
    id: 'mod-place-1',
    type: 'place',
    title: '«ВетКлінік Плюс», Краків',
    summary: 'Новий заклад · Ветеринари',
    source: 'Форма користувача',
    status: 'pending',
    createdAt: new Date(Date.now() - 600_000).toISOString(),
  },
  {
    id: 'mod-complaint-1',
    type: 'complaint',
    title: 'Перевізник «Приватний водій (Устилуг)»',
    summary: 'Скарга · 2 користувачі',
    source: '2 користувачі',
    status: 'pending',
    createdAt: new Date(Date.now() - 3_600_000).toISOString(),
  },
  {
    id: 'mod-place-2',
    type: 'place',
    title: '«Toy Poodle Варшава» — скан родоводу',
    summary: 'Заводчик FCI',
    source: 'Форма заводчика',
    status: 'pending',
    createdAt: new Date(Date.now() - 10_800_000).toISOString(),
  },
  {
    id: 'mod-post-1',
    type: 'post',
    title: 'Пост у форумі — сумнівна порада про ліки',
    summary: 'Скарга на контент',
    source: '1 користувач',
    status: 'pending',
    createdAt: new Date(Date.now() - 14_400_000).toISOString(),
  },
  {
    id: 'mod-rule-1',
    type: 'rule',
    title: 'Чек-лист паспорта ЄС — оновились вимоги',
    summary: 'Контент ревʼю',
    source: 'Авто-нагадування (12 міс)',
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
    if (!Array.isArray(parsed) || parsed.length === 0) return [...SEED];
    // Refresh seed once if old stub titles still present
    if (parsed.some((i) => i.title === 'Клініка «Лапка»')) {
      await AsyncStorage.setItem(KEY, JSON.stringify(SEED));
      return [...SEED];
    }
    return parsed;
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
