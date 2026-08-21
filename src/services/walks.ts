import AsyncStorage from '@react-native-async-storage/async-storage';

import { listFriends, type FriendUser } from '@/src/services/friends';

const WALKS_KEY = 'knowsnout.walks.v1';

export type WalkPlan = {
  id: string;
  friendId: string;
  friendName: string;
  whenIso: string;
  place: string;
  note: string;
  createdAt: string;
};

async function readWalks(): Promise<WalkPlan[]> {
  try {
    const raw = await AsyncStorage.getItem(WALKS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WalkPlan[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeWalks(list: WalkPlan[]) {
  await AsyncStorage.setItem(WALKS_KEY, JSON.stringify(list));
}

export async function listWalkPlans(): Promise<WalkPlan[]> {
  const list = await readWalks();
  return list.sort((a, b) => a.whenIso.localeCompare(b.whenIso));
}

export async function createWalkPlan(input: {
  friendId: string;
  whenIso: string;
  place: string;
  note?: string;
}): Promise<WalkPlan> {
  const friends = await listFriends();
  const friend =
    friends.find((f) => f.id === input.friendId) ??
    ({
      id: input.friendId,
      name: 'Друг',
      handle: '@friend',
      bio: '',
      avatarKey: 'paw',
    } satisfies FriendUser);

  const plan: WalkPlan = {
    id: `walk-${Date.now()}`,
    friendId: friend.id,
    friendName: friend.name,
    whenIso: input.whenIso,
    place: input.place.trim() || 'Парк біля дому',
    note: input.note?.trim() ?? '',
    createdAt: new Date().toISOString(),
  };
  const list = await readWalks();
  list.unshift(plan);
  await writeWalks(list);
  return plan;
}

export async function cancelWalkPlan(id: string): Promise<void> {
  const list = await readWalks();
  await writeWalks(list.filter((w) => w.id !== id));
}

/** Suggested slots for the mock scheduler UI */
export function suggestedWalkSlots(): { label: string; whenIso: string }[] {
  const base = new Date();
  base.setMinutes(0, 0, 0);
  const mk = (days: number, hour: number, label: string) => {
    const d = new Date(base);
    d.setDate(d.getDate() + days);
    d.setHours(hour);
    return { label, whenIso: d.toISOString() };
  };
  return [
    mk(0, 18, 'Сьогодні 18:00'),
    mk(1, 9, 'Завтра 09:00'),
    mk(1, 19, 'Завтра 19:00'),
    mk(2, 10, 'Післязавтра 10:00'),
  ];
}
