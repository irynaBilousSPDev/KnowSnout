import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  avatarsForSpecies,
  pickUniqueAvatarKey,
  usedAvatarKeysFromPets,
  type AvatarKey,
} from '@/src/constants/avatars';
import { env } from '@/src/lib/env';
import { persistLocalImage } from '@/src/lib/image';
import {
  friendlyDbError,
  isMissingSchemaError,
  stripOptionalPetColumns,
} from '@/src/lib/schemaErrors';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import type {
  ActivityLevel,
  CoatType,
  CompanionSpecies,
  DietType,
  IndoorOutdoor,
  LifeStage,
  PetInput,
  PetOrigin,
  PetPhotoRow,
  PetRow,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';

const LOCAL_PETS_KEY = 'snoutscore.demo.pets';
const LOCAL_PHOTOS_KEY = 'snoutscore.demo.pet_photos';

async function readLocalPets(): Promise<PetRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_PETS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>[];
    return parsed.map((row) => mapRow(row));
  } catch {
    return [];
  }
}

async function writeLocalPets(pets: PetRow[]) {
  await AsyncStorage.setItem(LOCAL_PETS_KEY, JSON.stringify(pets));
}

async function readLocalPhotos(): Promise<PetPhotoRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_PHOTOS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PetPhotoRow[];
  } catch {
    return [];
  }
}

async function writeLocalPhotos(photos: PetPhotoRow[]) {
  await AsyncStorage.setItem(LOCAL_PHOTOS_KEY, JSON.stringify(photos));
}

function asSpecies(value: unknown): CompanionSpecies {
  if (
    value === 'dog' ||
    value === 'cat' ||
    value === 'bird' ||
    value === 'other'
  ) {
    return value;
  }
  return 'other';
}

function asSex(value: unknown): PetSex | null {
  if (value === 'female' || value === 'male' || value === 'unknown') return value;
  return null;
}

function asOrigin(value: unknown): PetOrigin {
  if (value === 'shelter') return 'shelter';
  if (value === 'breeder') return 'breeder';
  return 'home';
}

function asCoatType(value: unknown): CoatType | null {
  if (
    value === 'short' ||
    value === 'long' ||
    value === 'wire' ||
    value === 'curly' ||
    value === 'hairless' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function asSizeCategory(value: unknown): SizeCategory | null {
  if (
    value === 'toy' ||
    value === 'small' ||
    value === 'medium' ||
    value === 'large' ||
    value === 'giant' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function asActivity(value: unknown): ActivityLevel | null {
  if (value === 'low' || value === 'medium' || value === 'high' || value === 'unknown') {
    return value;
  }
  return null;
}

function asDiet(value: unknown): DietType | null {
  if (
    value === 'dry' ||
    value === 'wet' ||
    value === 'mixed' ||
    value === 'raw' ||
    value === 'homemade' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function asLifeStage(value: unknown): LifeStage | null {
  if (
    value === 'puppy' ||
    value === 'kitten' ||
    value === 'adult' ||
    value === 'senior' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function asIndoorOutdoor(value: unknown): IndoorOutdoor | null {
  if (
    value === 'indoor' ||
    value === 'outdoor' ||
    value === 'both' ||
    value === 'unknown'
  ) {
    return value;
  }
  return null;
}

function optionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s || null;
}

function mapRow(row: Record<string, unknown>): PetRow {
  const extras =
    row.extras && typeof row.extras === 'object'
      ? (row.extras as Record<string, unknown>)
      : {};
  const avatarUri =
    row.avatar_uri != null
      ? String(row.avatar_uri)
      : typeof extras.avatar_uri === 'string'
        ? extras.avatar_uri
        : null;

  return {
    id: String(row.id),
    user_id: String(row.user_id),
    name: String(row.name),
    species: asSpecies(row.species),
    breed: optionalText(row.breed),
    sex: asSex(row.sex),
    birth_date: optionalText(row.birth_date),
    weight_kg: optionalNumber(row.weight_kg),
    chip_code: optionalText(row.chip_code),
    notes: optionalText(row.notes),
    avatar_key: optionalText(row.avatar_key),
    avatar_path: optionalText(row.avatar_path),
    avatar_uri: avatarUri,
    favorite_food: optionalText(row.favorite_food),
    favorite_product_id: optionalText(row.favorite_product_id),
    origin: asOrigin(row.origin),
    color_coat: optionalText(row.color_coat),
    coat_type: asCoatType(row.coat_type),
    size_category: asSizeCategory(row.size_category),
    sterilized:
      typeof row.sterilized === 'boolean'
        ? row.sterilized
        : row.sterilized === null || row.sterilized === undefined
          ? null
          : Boolean(row.sterilized),
    allergies: optionalText(row.allergies),
    conditions: optionalText(row.conditions),
    medications: optionalText(row.medications),
    activity_level: asActivity(row.activity_level),
    diet_type: asDiet(row.diet_type),
    life_stage:
      asLifeStage(row.life_stage) ?? asLifeStage(extras.life_stage),
    indoor_outdoor: asIndoorOutdoor(row.indoor_outdoor),
    personality: optionalText(row.personality),
    distinctive_marks: optionalText(row.distinctive_marks),
    acquired_date: optionalText(row.acquired_date),
    passport_number: optionalText(row.passport_number),
    vet_name: optionalText(row.vet_name),
    vet_phone: optionalText(row.vet_phone),
    ideal_weight_kg: optionalNumber(row.ideal_weight_kg),
    extras,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at ?? row.created_at),
  };
}

function mapPhoto(row: Record<string, unknown>): PetPhotoRow {
  return {
    id: String(row.id),
    pet_id: String(row.pet_id),
    user_id: String(row.user_id),
    storage_path: row.storage_path ? String(row.storage_path) : null,
    local_uri: row.local_uri ? String(row.local_uri) : null,
    caption: row.caption ? String(row.caption) : null,
    sort_order: Number(row.sort_order ?? 0),
    created_at: String(row.created_at),
  };
}

function normalizeInput(input: PetInput, usedKeys: string[] = []) {
  const name = input.name.trim();
  if (!name) throw new Error('Pet name is required');

  const species = input.species;
  const hasPhoto = Boolean(input.avatar_uri);
  const preferred = input.avatar_key?.trim() as AvatarKey | undefined;

  return {
    name,
    species,
    breed: input.breed?.trim() || null,
    sex: input.sex ?? null,
    birth_date: input.birth_date?.trim() || null,
    weight_kg:
      input.weight_kg !== undefined &&
      input.weight_kg !== null &&
      Number.isFinite(input.weight_kg)
        ? input.weight_kg
        : null,
    chip_code: input.chip_code?.trim() || null,
    notes: input.notes?.trim() || null,
    avatar_key: hasPhoto
      ? null
      : pickUniqueAvatarKey(species, usedKeys, { prefer: preferred }),
    avatar_path: input.avatar_path ?? null,
    favorite_food: input.favorite_food?.trim() || null,
    favorite_product_id: input.favorite_product_id ?? null,
    origin: input.origin ?? 'home',
    color_coat: input.color_coat?.trim() || null,
    coat_type: input.coat_type ?? null,
    size_category: input.size_category ?? null,
    sterilized: input.sterilized ?? null,
    allergies: input.allergies?.trim() || null,
    conditions: input.conditions?.trim() || null,
    medications: input.medications?.trim() || null,
    activity_level: input.activity_level ?? null,
    diet_type: input.diet_type ?? null,
    life_stage: input.life_stage ?? null,
    indoor_outdoor: input.indoor_outdoor ?? null,
    personality: input.personality?.trim() || null,
    distinctive_marks: input.distinctive_marks?.trim() || null,
    acquired_date: input.acquired_date?.trim() || null,
    passport_number: input.passport_number?.trim() || null,
    vet_name: input.vet_name?.trim() || null,
    vet_phone: input.vet_phone?.trim() || null,
    ideal_weight_kg:
      input.ideal_weight_kg !== undefined &&
      input.ideal_weight_kg !== null &&
      Number.isFinite(input.ideal_weight_kg)
        ? input.ideal_weight_kg
        : null,
  };
}

export async function listPets(): Promise<PetRow[]> {
  if (env.isDemoMode || !supabase) {
    const pets = await readLocalPets();
    const fixed = await repairDuplicateAvatars(pets, async (id, avatar_key) => {
      const list = await readLocalPets();
      const index = list.findIndex((p) => p.id === id);
      if (index < 0) return;
      list[index] = { ...list[index], avatar_key };
      await writeLocalPets(list);
    });
    return fixed.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw new Error(error.message);
  const pets = (data ?? []).map((row) => mapRow(row as Record<string, unknown>));
  return repairDuplicateAvatars(pets, async (id, avatar_key) => {
    if (!supabase) return;
    await supabase.from('pets').update({ avatar_key }).eq('id', id);
  });
}

/** Reassign cartoon icons so pets without photos don't share the same mark. */
async function repairDuplicateAvatars(
  pets: PetRow[],
  persist: (id: string, avatar_key: AvatarKey) => Promise<void>,
): Promise<PetRow[]> {
  const seen = new Set<string>();
  const next = [...pets];

  for (let i = 0; i < next.length; i += 1) {
    const pet = next[i];
    if (pet.avatar_uri) continue;

    const current = pet.avatar_key;
    const validForSpecies = avatarsForSpecies(pet.species).some(
      (a) => a.key === current,
    );

    if (current && validForSpecies && !seen.has(current)) {
      seen.add(current);
      continue;
    }

    const replacement = pickUniqueAvatarKey(pet.species, [...seen]);
    seen.add(replacement);
    next[i] = { ...pet, avatar_key: replacement };
    try {
      await persist(pet.id, replacement);
    } catch (err) {
      console.warn('Avatar repair failed', err);
    }
  }

  return next;
}

export async function getPet(id: string): Promise<PetRow | null> {
  if (env.isDemoMode || !supabase) {
    const pets = await readLocalPets();
    return pets.find((p) => p.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapRow(data as Record<string, unknown>) : null;
}

export async function createPet(input: PetInput): Promise<PetRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in to add a pet');

  const siblings = await listPets();
  const usedKeys = usedAvatarKeysFromPets(siblings);
  const withStablePhoto: PetInput = {
    ...input,
    avatar_uri: input.avatar_uri
      ? await persistLocalImage(input.avatar_uri, 'pet-avatar')
      : input.avatar_uri,
  };
  const payload = normalizeInput(withStablePhoto, usedKeys);
  const now = new Date().toISOString();
  const extras: Record<string, unknown> = {
    ...(withStablePhoto.extras_patch ?? {}),
  };
  if (withStablePhoto.avatar_uri) extras.avatar_uri = withStablePhoto.avatar_uri;
  if (payload.life_stage) extras.life_stage = payload.life_stage;

  if (env.isDemoMode || !supabase) {
    const pet: PetRow = {
      id: `local-pet-${Date.now()}`,
      user_id: user.id,
      ...payload,
      avatar_uri: withStablePhoto.avatar_uri ?? null,
      extras,
      created_at: now,
      updated_at: now,
    };
    const pets = await readLocalPets();
    pets.unshift(pet);
    await writeLocalPets(pets);
    return pet;
  }

  const insertRow = {
    user_id: user.id,
    ...payload,
    extras,
  };

  let { data, error } = await supabase
    .from('pets')
    .insert(insertRow)
    .select('*')
    .single();

  if (error && isMissingSchemaError(error.message)) {
    const retry = await supabase
      .from('pets')
      .insert(stripOptionalPetColumns(insertRow))
      .select('*')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    throw new Error(friendlyDbError(error?.message) || 'Failed to create pet');
  }

  return mapRow({
    ...(data as Record<string, unknown>),
    avatar_uri: withStablePhoto.avatar_uri ?? null,
  });
}

export async function updatePet(id: string, input: PetInput): Promise<PetRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in to update a pet');

  const siblings = await listPets();
  const usedKeys = usedAvatarKeysFromPets(siblings, { exceptPetId: id });
  const stableAvatarUri =
    input.avatar_uri != null && input.avatar_uri !== ''
      ? await persistLocalImage(input.avatar_uri, 'pet-avatar')
      : input.avatar_uri;
  const normalizedInput: PetInput = { ...input, avatar_uri: stableAvatarUri };
  const payload = normalizeInput(normalizedInput, usedKeys);
  const now = new Date().toISOString();

  if (env.isDemoMode || !supabase) {
    const pets = await readLocalPets();
    const index = pets.findIndex((p) => p.id === id);
    if (index < 0) throw new Error('Pet not found');
    const extras: Record<string, unknown> = {
      ...pets[index].extras,
      ...(input.extras_patch ?? {}),
      ...(stableAvatarUri ? { avatar_uri: stableAvatarUri } : {}),
    };
    if (!stableAvatarUri && input.avatar_key) {
      delete extras.avatar_uri;
    }
    if (payload.life_stage) extras.life_stage = payload.life_stage;
    else delete extras.life_stage;
    const updated: PetRow = {
      ...pets[index],
      ...payload,
      avatar_uri:
        stableAvatarUri ??
        (input.avatar_key ? null : pets[index].avatar_uri),
      extras,
      updated_at: now,
    };
    pets[index] = updated;
    await writeLocalPets(pets);
    return updated;
  }

  const existing = await getPet(id);
  const extras: Record<string, unknown> = {
    ...(existing?.extras ?? {}),
    ...(input.extras_patch ?? {}),
    ...(stableAvatarUri ? { avatar_uri: stableAvatarUri } : {}),
  };
  if (!stableAvatarUri && input.avatar_key) {
    delete extras.avatar_uri;
  }
  if (payload.life_stage) extras.life_stage = payload.life_stage;
  else delete extras.life_stage;

  const updateRow = {
    ...payload,
    extras,
    updated_at: now,
  };

  let { data, error } = await supabase
    .from('pets')
    .update(updateRow)
    .eq('id', id)
    .select('*')
    .single();

  if (error && isMissingSchemaError(error.message)) {
    const retry = await supabase
      .from('pets')
      .update(stripOptionalPetColumns(updateRow))
      .eq('id', id)
      .select('*')
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    throw new Error(friendlyDbError(error?.message) || 'Failed to update pet');
  }

  return mapRow({
    ...(data as Record<string, unknown>),
    avatar_uri:
      stableAvatarUri ??
      (input.avatar_key ? null : existing?.avatar_uri ?? null),
  });
}

export async function deletePet(id: string): Promise<void> {
  if (!id) throw new Error('Pet id is required');

  if (env.isDemoMode || !supabase) {
    const pets = await readLocalPets();
    const next = pets.filter((p) => p.id !== id);
    if (next.length === pets.length) {
      throw new Error('Pet not found');
    }
    await writeLocalPets(next);
    const photos = await readLocalPhotos();
    await writeLocalPhotos(photos.filter((p) => p.pet_id !== id));
    return;
  }

  const { data, error } = await supabase
    .from('pets')
    .delete()
    .eq('id', id)
    .select('id');

  if (error) throw new Error(error.message);
  if (!data?.length) {
    throw new Error('NOT_OWNED');
  }
}

export async function listPetPhotos(petId: string): Promise<PetPhotoRow[]> {
  if (env.isDemoMode || !supabase) {
    const photos = await readLocalPhotos();
    return photos
      .filter((p) => p.pet_id === petId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  const { data, error } = await supabase
    .from('pet_photos')
    .select('*')
    .eq('pet_id', petId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => mapPhoto(row as Record<string, unknown>));
}

export async function addPetPhoto(
  petId: string,
  localUri: string,
  caption?: string,
): Promise<PetPhotoRow> {
  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in');

  const stableUri = await persistLocalImage(localUri, `pet-${petId}`);
  const now = new Date().toISOString();

  if (env.isDemoMode || !supabase) {
    const photo: PetPhotoRow = {
      id: `local-photo-${Date.now()}`,
      pet_id: petId,
      user_id: user.id,
      storage_path: null,
      local_uri: stableUri,
      caption: caption?.trim() || null,
      sort_order: 0,
      created_at: now,
    };
    const photos = await readLocalPhotos();
    photos.unshift(photo);
    await writeLocalPhotos(photos);
    return photo;
  }

  const { data, error } = await supabase
    .from('pet_photos')
    .insert({
      pet_id: petId,
      user_id: user.id,
      local_uri: stableUri,
      caption: caption?.trim() || null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to add photo');
  }

  return mapPhoto(data as Record<string, unknown>);
}

export async function deletePetPhoto(id: string): Promise<void> {
  if (env.isDemoMode || !supabase) {
    const photos = await readLocalPhotos();
    await writeLocalPhotos(photos.filter((p) => p.id !== id));
    return;
  }

  const { error } = await supabase.from('pet_photos').delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export async function setPetFavoriteFood(
  petId: string,
  options: {
    productName: string;
    productId?: string | null;
  },
): Promise<PetRow> {
  const pet = await getPet(petId);
  if (!pet) throw new Error('Pet not found');

  return updatePet(petId, {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    sex: pet.sex,
    birth_date: pet.birth_date,
    weight_kg: pet.weight_kg,
    chip_code: pet.chip_code,
    notes: pet.notes,
    avatar_key: pet.avatar_key,
    avatar_path: pet.avatar_path,
    avatar_uri: pet.avatar_uri,
    favorite_food: options.productName,
    favorite_product_id: options.productId ?? null,
    origin: pet.origin,
    color_coat: pet.color_coat,
    coat_type: pet.coat_type,
    size_category: pet.size_category,
    sterilized: pet.sterilized,
    allergies: pet.allergies,
    conditions: pet.conditions,
    medications: pet.medications,
    activity_level: pet.activity_level,
    diet_type: pet.diet_type,
    life_stage: pet.life_stage,
    indoor_outdoor: pet.indoor_outdoor,
    personality: pet.personality,
    distinctive_marks: pet.distinctive_marks,
    acquired_date: pet.acquired_date,
    passport_number: pet.passport_number,
    vet_name: pet.vet_name,
    vet_phone: pet.vet_phone,
    ideal_weight_kg: pet.ideal_weight_kg,
  });
}

export async function clearPetFavoriteFood(petId: string): Promise<PetRow> {
  return setPetFavoriteFood(petId, { productName: '', productId: null });
}
