import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import {
  friendlyDbError,
  isMissingSchemaError,
} from '@/src/lib/schemaErrors';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import type {
  PetVaccineInput,
  PetVaccineRow,
  VaccineDueStatus,
} from '@/src/types/vaccine';

const LOCAL_KEY = 'snoutscore.local.pet_vaccines';

let warnedMissingVaccinesTable = false;

async function readLocal(): Promise<PetVaccineRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PetVaccineRow[];
  } catch {
    return [];
  }
}

async function writeLocal(rows: PetVaccineRow[]) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
}

function mapRow(row: Record<string, unknown>): PetVaccineRow {
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    pet_id: String(row.pet_id),
    vaccine_key: row.vaccine_key ? String(row.vaccine_key) : null,
    custom_name: row.custom_name ? String(row.custom_name) : null,
    given_on: row.given_on ? String(row.given_on).slice(0, 10) : null,
    next_due_on: row.next_due_on ? String(row.next_due_on).slice(0, 10) : null,
    notes: row.notes ? String(row.notes) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function vaccineDisplayName(row: PetVaccineRow): string {
  if (row.custom_name?.trim()) return row.custom_name.trim();
  return row.vaccine_key ?? 'Vaccine';
}

export function vaccineDueStatus(
  nextDueOn: string | null | undefined,
  today = new Date(),
): VaccineDueStatus {
  if (!nextDueOn) return 'none';
  const due = new Date(`${nextDueOn}T12:00:00`);
  if (Number.isNaN(due.getTime())) return 'none';
  const start = new Date(today);
  start.setHours(12, 0, 0, 0);
  const diffDays = Math.round(
    (due.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 30) return 'soon';
  return 'ok';
}

export async function listPetVaccines(petId: string): Promise<PetVaccineRow[]> {
  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    return rows
      .filter((r) => r.pet_id === petId)
      .sort((a, b) =>
        (b.next_due_on ?? b.given_on ?? '').localeCompare(
          a.next_due_on ?? a.given_on ?? '',
        ),
      );
  }

  const { data, error } = await supabase
    .from('pet_vaccines')
    .select('*')
    .eq('pet_id', petId)
    .order('next_due_on', { ascending: true, nullsFirst: false });

  if (error) {
    if (isMissingSchemaError(error.message)) {
      if (!warnedMissingVaccinesTable) {
        warnedMissingVaccinesTable = true;
        console.warn(
          'pet_vaccines table missing — using local storage. Run supabase/migrations/20260321210000_pet_vaccines.sql',
        );
      }
      const rows = await readLocal();
      return rows.filter((r) => r.pet_id === petId);
    }
    throw new Error(friendlyDbError(error.message));
  }

  return (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
}

export async function addPetVaccine(
  input: PetVaccineInput,
): Promise<PetVaccineRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in');

  const vaccine_key =
    input.vaccineKey && input.vaccineKey !== 'other'
      ? input.vaccineKey
      : null;
  const custom_name = input.customName?.trim() || null;
  if (!vaccine_key && !custom_name) {
    throw new Error('Vaccine name is required');
  }

  const now = new Date().toISOString();
  const payload = {
    user_id: user.id,
    pet_id: input.petId,
    vaccine_key,
    custom_name,
    given_on: input.givenOn?.trim() || null,
    next_due_on: input.nextDueOn?.trim() || null,
    notes: input.notes?.trim() || null,
  };

  if (env.isDemoMode || !supabase) {
    const row: PetVaccineRow = {
      id: `local-vax-${Date.now()}`,
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
    .from('pet_vaccines')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    if (error && isMissingSchemaError(error.message)) {
      const row: PetVaccineRow = {
        id: `local-vax-${Date.now()}`,
        ...payload,
        created_at: now,
        updated_at: now,
      };
      const rows = await readLocal();
      rows.unshift(row);
      await writeLocal(rows);
      return row;
    }
    throw new Error(friendlyDbError(error?.message) || 'Failed to save vaccine');
  }

  return mapRow(data as Record<string, unknown>);
}

export async function updatePetVaccine(
  id: string,
  input: Omit<PetVaccineInput, 'petId'> & { petId?: string },
): Promise<PetVaccineRow> {
  const now = new Date().toISOString();
  const patch = {
    vaccine_key:
      input.vaccineKey && input.vaccineKey !== 'other'
        ? input.vaccineKey
        : input.vaccineKey === 'other'
          ? null
          : undefined,
    custom_name:
      input.customName !== undefined
        ? input.customName?.trim() || null
        : undefined,
    given_on:
      input.givenOn !== undefined ? input.givenOn?.trim() || null : undefined,
    next_due_on:
      input.nextDueOn !== undefined
        ? input.nextDueOn?.trim() || null
        : undefined,
    notes: input.notes !== undefined ? input.notes?.trim() || null : undefined,
    updated_at: now,
  };

  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    const index = rows.findIndex((r) => r.id === id);
    if (index < 0) throw new Error('Vaccine not found');
    const updated: PetVaccineRow = {
      ...rows[index],
      ...(patch.vaccine_key !== undefined
        ? { vaccine_key: patch.vaccine_key }
        : {}),
      ...(patch.custom_name !== undefined
        ? { custom_name: patch.custom_name }
        : {}),
      ...(patch.given_on !== undefined ? { given_on: patch.given_on } : {}),
      ...(patch.next_due_on !== undefined
        ? { next_due_on: patch.next_due_on }
        : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      updated_at: now,
    };
    rows[index] = updated;
    await writeLocal(rows);
    return updated;
  }

  const { data, error } = await supabase
    .from('pet_vaccines')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(friendlyDbError(error?.message) || 'Failed to update vaccine');
  }
  return mapRow(data as Record<string, unknown>);
}

export async function deletePetVaccine(id: string): Promise<void> {
  if (env.isDemoMode || !supabase) {
    const rows = await readLocal();
    await writeLocal(rows.filter((r) => r.id !== id));
    return;
  }

  const { error } = await supabase.from('pet_vaccines').delete().eq('id', id);
  if (error) {
    if (isMissingSchemaError(error.message)) {
      const rows = await readLocal();
      await writeLocal(rows.filter((r) => r.id !== id));
      return;
    }
    throw new Error(friendlyDbError(error.message));
  }
}
