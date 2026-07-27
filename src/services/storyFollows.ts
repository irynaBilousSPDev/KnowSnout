import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { isUuid } from '@/src/lib/uuid';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';

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

async function cloudUser() {
  if (env.isDemoMode || !supabase) return null;
  const user = await getCurrentUser();
  if (!user || !isUuid(user.id)) return null;
  return user;
}

async function fetchCloudFollowingIds(followerId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('story_follows')
    .select('following_id')
    .eq('follower_id', followerId);
  if (error || !data) return [];
  return data.map((row) => String(row.following_id)).filter(Boolean);
}

/** Merge cloud follows into local cache when online. */
export async function listFollowingIds(): Promise<string[]> {
  const local = await readIds();
  const user = await cloudUser();
  if (!user) return local;

  try {
    const cloud = await fetchCloudFollowingIds(user.id);
    if (!cloud.length) return local;
    return writeIds([...local, ...cloud]);
  } catch {
    return local;
  }
}

export async function isFollowing(userId: string): Promise<boolean> {
  if (!userId) return false;
  const ids = await listFollowingIds();
  return ids.includes(userId);
}

export async function followUser(userId: string): Promise<string[]> {
  if (!userId) return readIds();
  const ids = await readIds();
  const next = ids.includes(userId) ? ids : await writeIds([...ids, userId]);

  const user = await cloudUser();
  if (user && isUuid(userId) && supabase) {
    await supabase.from('story_follows').upsert(
      { follower_id: user.id, following_id: userId },
      { onConflict: 'follower_id,following_id', ignoreDuplicates: true },
    );
  }
  return next;
}

export async function unfollowUser(userId: string): Promise<string[]> {
  const next = await writeIds((await readIds()).filter((id) => id !== userId));

  const user = await cloudUser();
  if (user && isUuid(userId) && supabase) {
    await supabase
      .from('story_follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId);
  }
  return next;
}

export async function toggleFollow(userId: string): Promise<{
  following: boolean;
  ids: string[];
}> {
  const ids = await readIds();
  if (ids.includes(userId)) {
    const next = await unfollowUser(userId);
    return { following: false, ids: next };
  }
  const next = await followUser(userId);
  return { following: true, ids: next };
}

/** Push local follows that look like UUIDs up to Supabase (once per session ok). */
export async function syncLocalFollowsToCloud(): Promise<void> {
  const user = await cloudUser();
  if (!user || !supabase) return;
  const local = await readIds();
  const cloudable = local.filter(isUuid);
  if (!cloudable.length) return;
  await supabase.from('story_follows').upsert(
    cloudable.map((following_id) => ({
      follower_id: user.id,
      following_id,
    })),
    { onConflict: 'follower_id,following_id', ignoreDuplicates: true },
  );
}
