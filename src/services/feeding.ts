import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import {
  friendlyDbError,
  isMissingSchemaError,
} from '@/src/lib/schemaErrors';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import type { FeedingLogRow } from '@/src/types/scan';

const LOCAL_FEEDING_KEY = 'snoutscore.demo.feeding_logs';

async function readLocal(): Promise<FeedingLogRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_FEEDING_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as FeedingLogRow[];
  } catch {
    return [];
  }
}

async function writeLocal(rows: FeedingLogRow[]) {
  await AsyncStorage.setItem(LOCAL_FEEDING_KEY, JSON.stringify(rows));
}

function mapRow(row: Record<string, unknown>): FeedingLogRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    pet_id: String(row.pet_id),
    scan_id: row.scan_id ? String(row.scan_id) : null,
    product_id: row.product_id ? String(row.product_id) : null,
    product_name: String(row.product_name),
    ate_fully:
      typeof row.ate_fully === 'boolean'
        ? row.ate_fully
        : row.ate_fully == null
          ? null
          : Boolean(row.ate_fully),
    note: row.note ? String(row.note) : null,
    fed_at: String(row.fed_at ?? row.created_at),
    created_at: String(row.created_at),
  };
}

export async function listFeedingLogs(petId: string): Promise<FeedingLogRow[]> {
  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    return rows
      .filter((r) => r.pet_id === petId)
      .sort((a, b) => b.fed_at.localeCompare(a.fed_at));
  }

  const { data, error } = await supabase
    .from('feeding_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('fed_at', { ascending: false })
    .limit(30);

  if (error) {
    // Profile should still open before the feeding migration is applied.
    if (isMissingSchemaError(error.message)) {
      console.warn('feeding_logs unavailable', error.message);
      return [];
    }
    throw new Error(friendlyDbError(error.message));
  }
  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function addFeedingLog(input: {
  petId: string;
  productName: string;
  scanId?: string | null;
  productId?: string | null;
  ateFully?: boolean | null;
  note?: string | null;
}): Promise<FeedingLogRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in');

  const now = new Date().toISOString();
  const payload = {
    user_id: user.id,
    pet_id: input.petId,
    scan_id: input.scanId ?? null,
    product_id: input.productId ?? null,
    product_name: input.productName.trim(),
    ate_fully: input.ateFully ?? null,
    note: input.note?.trim() || null,
    fed_at: now,
  };

  if (!payload.product_name) throw new Error('Product name is required');

  if (env.isDemoMode || !supabase) {
    const row: FeedingLogRow = {
      id: `local-feed-${Date.now()}`,
      ...payload,
      created_at: now,
    };
    const rows = await readLocal();
    rows.unshift(row);
    await writeLocal(rows);
    return row;
  }

  const { data, error } = await supabase
    .from('feeding_logs')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(
      friendlyDbError(error?.message) || 'Failed to save feeding log',
    );
  }

  return mapRow(data as Record<string, unknown>);
}

export async function deleteFeedingLog(id: string): Promise<void> {
  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    await writeLocal(rows.filter((r) => r.id !== id));
    return;
  }

  const { error } = await supabase.from('feeding_logs').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
