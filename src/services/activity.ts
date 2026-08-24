import AsyncStorage from '@react-native-async-storage/async-storage';

export type ActivityItem = {
  id: string;
  kind: 'like' | 'comment' | 'follow' | 'contest' | 'walk' | 'friend';
  title: string;
  body: string;
  createdAt: string;
};

const SEEN_KEY = 'knowsnout.activity.seenAt.v1';

const SEED: ActivityItem[] = [
  {
    id: 'act-1',
    kind: 'like',
    title: 'Ігор',
    body: 'вподобав твій пост',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    kind: 'comment',
    title: 'Оксана',
    body: 'прокоментувала твій пост',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-3',
    kind: 'follow',
    title: 'Марта',
    body: 'тепер підписана на тебе',
    createdAt: new Date().toISOString(),
  },
];

export async function listActivityFeed(): Promise<ActivityItem[]> {
  return [...SEED].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

async function getSeenAt(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_KEY);
    if (!raw) return 0;
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Unread social notifications for avatar paw indicator. */
export async function getActivityUnreadCount(): Promise<number> {
  const seenAt = await getSeenAt();
  const items = await listActivityFeed();
  return items.filter((i) => new Date(i.createdAt).getTime() > seenAt).length;
}

/** Call when opening Activity — clears paw + counter. */
export async function markActivitySeen(): Promise<void> {
  await AsyncStorage.setItem(SEEN_KEY, String(Date.now()));
}
