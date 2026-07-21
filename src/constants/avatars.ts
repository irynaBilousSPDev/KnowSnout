import type { CompanionSpecies } from '@/src/types/pet';

export type AvatarKey =
  | 'dog-1'
  | 'dog-2'
  | 'dog-3'
  | 'dog-4'
  | 'dog-5'
  | 'dog-6'
  | 'cat-1'
  | 'cat-2'
  | 'cat-3'
  | 'cat-4'
  | 'cat-5'
  | 'cat-6'
  | 'other-1'
  | 'other-2'
  | 'other-3';

export type AvatarOption = {
  key: AvatarKey;
  emoji: string;
  bg: string;
  species: CompanionSpecies;
};

/**
 * Face / snout icons only (no paws, bones, full-body).
 * More species packs can be added later the same way.
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  { key: 'dog-1', emoji: '🐶', bg: '#00E0C7', species: 'dog' },
  { key: 'dog-2', emoji: '🐕', bg: '#72ED2F', species: 'dog' },
  { key: 'dog-3', emoji: '🦮', bg: '#7FD9C9', species: 'dog' },
  { key: 'dog-4', emoji: '🐶', bg: '#B7EBE0', species: 'dog' },
  { key: 'dog-5', emoji: '🐕', bg: '#3FC4B0', species: 'dog' },
  { key: 'dog-6', emoji: '🦮', bg: '#DFF7F1', species: 'dog' },
  { key: 'cat-1', emoji: '🐱', bg: '#00E0C7', species: 'cat' },
  { key: 'cat-2', emoji: '😺', bg: '#72ED2F', species: 'cat' },
  { key: 'cat-3', emoji: '😸', bg: '#7FD9C9', species: 'cat' },
  { key: 'cat-4', emoji: '😻', bg: '#B7EBE0', species: 'cat' },
  { key: 'cat-5', emoji: '😼', bg: '#16324A', species: 'cat' },
  { key: 'cat-6', emoji: '😽', bg: '#DFF7F1', species: 'cat' },
  { key: 'other-1', emoji: '🐰', bg: '#DFF7F1', species: 'other' },
  { key: 'other-2', emoji: '🐹', bg: '#7FD9C9', species: 'other' },
  { key: 'other-3', emoji: '🦊', bg: '#B7EBE0', species: 'other' },
];

export function avatarsForSpecies(species: CompanionSpecies): AvatarOption[] {
  return AVATAR_OPTIONS.filter((a) => a.species === species);
}

export function getAvatarOption(
  key?: string | null,
  species?: CompanionSpecies | null,
): AvatarOption {
  const found = AVATAR_OPTIONS.find((a) => a.key === key);
  if (found) return found;
  const fallbackSpecies = species ?? 'dog';
  return avatarsForSpecies(fallbackSpecies)[0] ?? AVATAR_OPTIONS[0];
}

export function defaultAvatarKey(species: CompanionSpecies): AvatarKey {
  return avatarsForSpecies(species)[0]?.key ?? 'dog-1';
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function pickUniqueAvatarKey(
  species: CompanionSpecies,
  usedKeys: Array<string | null | undefined>,
  options?: { prefer?: AvatarKey | null; excludeKey?: string | null },
): AvatarKey {
  const pool = avatarsForSpecies(species).map((a) => a.key);
  const used = new Set(
    usedKeys.filter((k): k is string => Boolean(k && pool.includes(k as AvatarKey))),
  );

  if (options?.prefer && pool.includes(options.prefer) && !used.has(options.prefer)) {
    return options.prefer;
  }

  const free = shuffle(pool.filter((key) => !used.has(key)));
  if (free.length > 0) return free[0];

  const rotated = shuffle(pool.filter((key) => key !== options?.excludeKey));
  return rotated[0] ?? pool[0] ?? 'dog-1';
}

export function usedAvatarKeysFromPets(
  pets: Array<{
    id?: string;
    avatar_key?: string | null;
    avatar_uri?: string | null;
  }>,
  options?: { exceptPetId?: string },
): string[] {
  return pets
    .filter((pet) => pet.id !== options?.exceptPetId)
    .filter((pet) => !pet.avatar_uri)
    .map((pet) => pet.avatar_key)
    .filter((k): k is string => Boolean(k));
}
