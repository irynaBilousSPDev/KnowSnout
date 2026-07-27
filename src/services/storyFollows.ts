import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'knowsnout.story_follows.v1';

async function readIds(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function writeIds(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(unique));
  return unique;
}

export async function listFollowingIds(): Promise<string[]> {
  return readIds();
}

export async function isFollowing(userId: string): Promise<boolean> {
  if (!userId) return false;
  const ids = await readIds();
  return ids.includes(userId);
}

export async function followUser(userId: string): Promise<string[]> {
  if (!userId) return readIds();
  const ids = await readIds();
  if (ids.includes(userId)) return ids;
  return writeIds([...ids, userId]);
}

export async function unfollowUser(userId: string): Promise<string[]> {
  const ids = await readIds();
  return writeIds(ids.filter((id) => id !== userId));
}

export async function toggleFollow(userId: string): Promise<{
  following: boolean;
  ids: string[];
}> {
  const ids = await readIds();
  if (ids.includes(userId)) {
    const next = await writeIds(ids.filter((id) => id !== userId));
    return { following: false, ids: next };
  }
  const next = await writeIds([...ids, userId]);
  return { following: true, ids: next };
}
