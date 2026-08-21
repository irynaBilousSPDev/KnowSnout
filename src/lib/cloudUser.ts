import { env } from '@/src/lib/env';
import { isUuid } from '@/src/lib/uuid';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';

/** Signed-in user with real UUID — required for cloud tables. */
export async function getCloudUser() {
  if (env.isDemoMode || !supabase) return null;
  const user = await getCurrentUser();
  if (!user || !isUuid(user.id)) return null;
  return user;
}

export function orderedFriendPair(
  a: string,
  b: string,
): { user_a: string; user_b: string } | null {
  if (!isUuid(a) || !isUuid(b) || a === b) return null;
  return a < b ? { user_a: a, user_b: b } : { user_a: b, user_b: a };
}
