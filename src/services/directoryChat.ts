import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Local-first chat with a directory establishment (per placeId).
 * Cloud mirror: see supabase/migrations/20260321242000_directories_trust.sql
 * (places/reviews only for now — chat stays device-local until a later slice).
 */

const STORAGE_KEY = 'knowsnout.directory_chat.v1';

export type DirectoryChatMessage = {
  id: string;
  placeId: string;
  body: string;
  /** true = current user; false = mock establishment reply */
  mine: boolean;
  createdAt: string;
};

type ThreadMap = Record<string, DirectoryChatMessage[]>;

async function readMap(): Promise<ThreadMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as ThreadMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeMap(map: ThreadMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

export async function listDirectoryChatMessages(
  placeId: string,
): Promise<DirectoryChatMessage[]> {
  const map = await readMap();
  const rows = map[placeId] ?? [];
  return [...rows].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function sendDirectoryChatMessage(
  placeId: string,
  body: string,
): Promise<DirectoryChatMessage> {
  const text = body.trim();
  if (!text) throw new Error('EMPTY_BODY');
  if (!placeId.trim()) throw new Error('NO_PLACE');

  const map = await readMap();
  const thread = map[placeId] ?? [];
  const now = new Date().toISOString();
  const mine: DirectoryChatMessage = {
    id: `dcm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    placeId,
    body: text,
    mine: true,
    createdAt: now,
  };
  thread.push(mine);

  // Lightweight mock auto-reply so the thread feels alive offline.
  const reply: DirectoryChatMessage = {
    id: `dcm-${Date.now() + 1}-${Math.random().toString(36).slice(2, 8)}`,
    placeId,
    body: 'Дякуємо за повідомлення! Відповімо найближчим часом (демо).',
    mine: false,
    createdAt: new Date(Date.now() + 400).toISOString(),
  };
  thread.push(reply);

  map[placeId] = thread;
  await writeMap(map);
  return mine;
}
