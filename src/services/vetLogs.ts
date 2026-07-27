import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import {
  friendlyDbError,
  isMissingSchemaError,
} from '@/src/lib/schemaErrors';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import type {
  PetVetLogInput,
  PetVetLogRow,
  VetLogEntryType,
} from '@/src/types/vetLog';

const LOCAL_KEY = 'snoutscore.local.pet_vet_logs';

async function readLocal(): Promise<PetVetLogRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PetVetLogRow[];
  } catch {
    return [];
  }
}

async function writeLocal(rows: PetVetLogRow[]) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

function asEntryType(value: unknown): VetLogEntryType {
  if (value === 'meds' || value === 'visit' || value === 'note') return value;
  return 'note';
}

function mapRow(row: Record<string, unknown>): PetVetLogRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    pet_id: String(row.pet_id),
    entry_type: asEntryType(row.entry_type),
    title: String(row.title ?? '').trim() || '—',
    logged_on: row.logged_on
      ? String(row.logged_on).slice(0, 10)
      : new Date().toISOString().slice(0, 10),
    notes: row.notes ? String(row.notes) : null,
    next_due_on: row.next_due_on
      ? String(row.next_due_on).slice(0, 10)
      : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export async function listPetVetLogs(petId: string): Promise<PetVetLogRow[]> {
  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    return rows
      .filter((r) => r.pet_id === petId)
      .sort((a, b) => b.logged_on.localeCompare(a.logged_on));
  }

  const { data, error } = await supabase
    .from('pet_vet_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('logged_on', { ascending: false });

  if (error) {
    if (isMissingSchemaError(error.message)) {
      console.warn('pet_vet_logs unavailable', error.message);
      const rows = await readLocal();
      return rows
        .filter((r) => r.pet_id === petId)
        .sort((a, b) => b.logged_on.localeCompare(a.logged_on));
    }
    throw new Error(friendlyDbError(error.message));
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function addPetVetLog(
  input: PetVetLogInput,
): Promise<PetVetLogRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in');

  const title = input.title.trim();
  if (!title) throw new Error('Title is required');

  const now = new Date().toISOString();
  const payload = {
    user_id: user.id,
    pet_id: input.petId,
    entry_type: input.entryType,
    title,
    logged_on:
      input.loggedOn?.trim() || new Date().toISOString().slice(0, 10),
    notes: input.notes?.trim() || null,
    next_due_on: input.nextDueOn?.trim() || null,
  };

  if (env.isDemoMode || !supabase) {
    const row: PetVetLogRow = {
      id: `local-vet-${Date.now()}`,
      ...payload,
      created_at: now,
      updated_at: now,
    };
    const rows = await readLocal();
    rows.unshift(row);
    await writeLocal(rows);
    return row;
  }

  const { data, error } = await supabase
    .from('pet_vet_logs')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    if (error && isMissingSchemaError(error.message)) {
      const row: PetVetLogRow = {
        id: `local-vet-${Date.now()}`,
        ...payload,
        created_at: now,
        updated_at: now,
      };
      const rows = await readLocal();
      rows.unshift(row);
      await writeLocal(rows);
      return row;
    }
    throw new Error(friendlyDbError(error?.message) || 'Failed to save vet log');
  }

  return mapRow(data as Record<string, unknown>);
}

export async function deletePetVetLog(id: string): Promise<void> {
  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    await writeLocal(rows.filter((r) => r.id !== id));
    return;
  }

  const { error } = await supabase.from('pet_vet_logs').delete().eq('id', id);
  if (error) {
    if (isMissingSchemaError(error.message)) {
      const rows = await readLocal();
      await writeLocal(rows.filter((r) => r.id !== id));
      return;
    }
    throw new Error(friendlyDbError(error.message));
  }
}
