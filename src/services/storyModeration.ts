import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { isUuid } from '@/src/lib/uuid';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';

const BLOCKED_KEY = 'knowsnout.story_blocks.v1';
const REPORTS_KEY = 'knowsnout.story_reports.v1';

export type StoryReportReason =
  | 'spam'
  | 'abuse'
  | 'inappropriate'
  | 'other';

export type StoryReport = {
  id: string;
  targetUserId: string;
  postId?: string | null;
  reason: StoryReportReason;
  note?: string | null;
  createdAt: string;
};

async function readBlocked(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(BLOCKED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

async function writeBlocked(ids: string[]) {
  const unique = [...new Set(ids.filter(Boolean))];
  await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify(unique));
  return unique;
}

async function readReports(): Promise<StoryReport[]> {
  try {
    const raw = await AsyncStorage.getItem(REPORTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoryReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function cloudUser() {
  if (env.isDemoMode || !supabase) return null;
  const user = await getCurrentUser();
  if (!user || !isUuid(user.id)) return null;
  return user;
}

export async function listBlockedUserIds(): Promise<string[]> {
  const local = await readBlocked();
  const user = await cloudUser();
  if (!user || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from('story_blocks')
      .select('blocked_id')
      .eq('blocker_id', user.id);
    if (error || !data) return local;
    const cloud = data.map((row) => String(row.blocked_id)).filter(Boolean);
    if (!cloud.length) return local;
    return writeBlocked([...local, ...cloud]);
  } catch {
    return local;
  }
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  if (!userId) return false;
  const ids = await listBlockedUserIds();
  return ids.includes(userId);
}

export async function blockUser(userId: string): Promise<string[]> {
  if (!userId) return readBlocked();
  const ids = await readBlocked();
  const next = ids.includes(userId)
    ? ids
    : await writeBlocked([...ids, userId]);

  const user = await cloudUser();
  if (user && isUuid(userId) && supabase) {
    await supabase.from('story_blocks').upsert(
      { blocker_id: user.id, blocked_id: userId },
      { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true },
    );
  }
  return next;
}

export async function unblockUser(userId: string): Promise<string[]> {
  const next = await writeBlocked(
    (await readBlocked()).filter((id) => id !== userId),
  );

  const user = await cloudUser();
  if (user && isUuid(userId) && supabase) {
    await supabase
      .from('story_blocks')
      .delete()
      .eq('blocker_id', user.id)
      .eq('blocked_id', userId);
  }
  return next;
}

/**
 * Local cache + optional Supabase insert when both IDs are real UUIDs.
 */
export async function reportStoryTarget(input: {
  targetUserId: string;
  postId?: string | null;
  reason: StoryReportReason;
  note?: string | null;
}): Promise<StoryReport> {
  if (!input.targetUserId) {
    throw new Error('TARGET_REQUIRED');
  }
  const report: StoryReport = {
    id: `report-${Date.now()}`,
    targetUserId: input.targetUserId,
    postId: input.postId ?? null,
    reason: input.reason,
    note: input.note?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  const prev = await readReports();
  await AsyncStorage.setItem(
    REPORTS_KEY,
    JSON.stringify([report, ...prev].slice(0, 100)),
  );

  const user = await cloudUser();
  if (user && isUuid(input.targetUserId) && supabase) {
    const row: Record<string, unknown> = {
      reporter_id: user.id,
      target_user_id: input.targetUserId,
      reason: input.reason,
      note: report.note,
    };
    if (input.postId && isUuid(input.postId)) {
      row.post_id = input.postId;
    }
    const { data } = await supabase
      .from('story_reports')
      .insert(row)
      .select('id')
      .maybeSingle();
    if (data?.id) {
      report.id = String(data.id);
    }
  }

  return report;
}
