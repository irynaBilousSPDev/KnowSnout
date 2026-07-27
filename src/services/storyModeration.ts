import AsyncStorage from '@react-native-async-storage/async-storage';

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

export async function listBlockedUserIds(): Promise<string[]> {
  return readBlocked();
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  if (!userId) return false;
  const ids = await readBlocked();
  return ids.includes(userId);
}

export async function blockUser(userId: string): Promise<string[]> {
  if (!userId) return readBlocked();
  const ids = await readBlocked();
  if (ids.includes(userId)) return ids;
  return writeBlocked([...ids, userId]);
}

export async function unblockUser(userId: string): Promise<string[]> {
  const ids = await readBlocked();
  return writeBlocked(ids.filter((id) => id !== userId));
}

/**
 * Local report log only (scaffold). No server review queue yet.
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
  return report;
}
