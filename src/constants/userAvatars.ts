export type UserGender = 'woman' | 'man' | 'unspecified';

export type UserAvatarKey =
  | 'woman-1'
  | 'woman-2'
  | 'woman-3'
  | 'man-1'
  | 'man-2'
  | 'man-3'
  | 'person-1'
  | 'person-2';

export type UserAvatarOption = {
  key: UserAvatarKey;
  emoji: string;
  bg: string;
  gender: UserGender;
};

/** Face-only human marks (same spirit as pet snout avatars). */
export const USER_AVATAR_OPTIONS: UserAvatarOption[] = [
  { key: 'woman-1', emoji: '👩', bg: '#122A4C', gender: 'woman' },
  { key: 'woman-2', emoji: '👱‍♀️', bg: '#2F5233', gender: 'woman' },
  { key: 'woman-3', emoji: '👩‍🦰', bg: '#E8879A', gender: 'woman' },
  { key: 'man-1', emoji: '👨', bg: '#122A4C', gender: 'man' },
  { key: 'man-2', emoji: '👱‍♂️', bg: '#2F5233', gender: 'man' },
  { key: 'man-3', emoji: '🧔', bg: '#E8879A', gender: 'man' },
  { key: 'person-1', emoji: '🙂', bg: '#E3E9DF', gender: 'unspecified' },
  { key: 'person-2', emoji: '😊', bg: '#F4DADF', gender: 'unspecified' },
];

export function userAvatarsForGender(gender: UserGender): UserAvatarOption[] {
  return USER_AVATAR_OPTIONS.filter((a) => a.gender === gender);
}

export function getUserAvatarOption(
  key?: string | null,
  gender?: UserGender | null,
): UserAvatarOption {
  const found = USER_AVATAR_OPTIONS.find((a) => a.key === key);
  if (found) return found;
  const pool = userAvatarsForGender(gender ?? 'unspecified');
  return pool[0] ?? USER_AVATAR_OPTIONS[6];
}

export function defaultAvatarKeyForGender(gender: UserGender): UserAvatarKey {
  return userAvatarsForGender(gender)[0]?.key ?? 'person-1';
}
