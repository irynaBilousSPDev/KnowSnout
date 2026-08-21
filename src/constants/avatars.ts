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
  | 'bird-1'
  | 'bird-2'
  | 'bird-3'
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
  { key: 'dog-1', emoji: '🐶', bg: '#122A4C', species: 'dog' },
  { key: 'dog-2', emoji: '🐕', bg: '#2F5233', species: 'dog' },
  { key: 'dog-3', emoji: '🦮', bg: '#E8879A', species: 'dog' },
  { key: 'dog-4', emoji: '🐶', bg: '#E3E9DF', species: 'dog' },
  { key: 'dog-5', emoji: '🐕', bg: '#F4DADF', species: 'dog' },
  { key: 'dog-6', emoji: '🦮', bg: '#C8D2C4', species: 'dog' },
  { key: 'cat-1', emoji: '🐱', bg: '#122A4C', species: 'cat' },
  { key: 'cat-2', emoji: '😺', bg: '#2F5233', species: 'cat' },
  { key: 'cat-3', emoji: '😸', bg: '#E8879A', species: 'cat' },
  { key: 'cat-4', emoji: '😻', bg: '#E3E9DF', species: 'cat' },
  { key: 'cat-5', emoji: '😼', bg: '#0C1C33', species: 'cat' },
  { key: 'cat-6', emoji: '😽', bg: '#F4DADF', species: 'cat' },
  { key: 'bird-1', emoji: '🦜', bg: '#122A4C', species: 'bird' },
  { key: 'bird-2', emoji: '🐦', bg: '#2F5233', species: 'bird' },
  { key: 'bird-3', emoji: '🐤', bg: '#E8879A', species: 'bird' },
  { key: 'other-1', emoji: '🐰', bg: '#E3E9DF', species: 'other' },
  { key: 'other-2', emoji: '🐹', bg: '#E8879A', species: 'other' },
  { key: 'other-3', emoji: '🦊', bg: '#2F5233', species: 'other' },
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
