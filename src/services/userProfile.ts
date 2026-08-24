import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  defaultAvatarKeyForGender,
  type UserAvatarKey,
  type UserGender,
} from '@/src/constants/userAvatars';
import { persistLocalImage } from '@/src/lib/image';
import { getCurrentUser } from '@/src/services/auth';
import type { UserProfile, UserProfileInput } from '@/src/types/userProfile';

const STORAGE_KEY = 'snoutscore.user_profiles';
const STORAGE_KEY_NEW = 'knowsnout.user_profiles.v1';

async function readAll(): Promise<Record<string, UserProfile>> {
  const raw =
    (await AsyncStorage.getItem(STORAGE_KEY_NEW)) ??
    (await AsyncStorage.getItem(STORAGE_KEY));
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, Partial<UserProfile>>;
    const out: Record<string, UserProfile> = {};
    for (const [id, value] of Object.entries(parsed)) {
      if (!value?.user_id) continue;
      out[id] = normalizeProfile(value as Partial<UserProfile> & { user_id: string });
    }
    return out;
  } catch {
    return {};
  }
}

async function writeAll(map: Record<string, UserProfile>) {
  await AsyncStorage.setItem(STORAGE_KEY_NEW, JSON.stringify(map));
}

function normalizeProfile(
  raw: Partial<UserProfile> & { user_id: string },
): UserProfile {
  return {
    user_id: raw.user_id,
    display_name: raw.display_name ?? null,
    city: raw.city ?? null,
    gender: raw.gender ?? 'unspecified',
    avatar_key: raw.avatar_key ?? 'person-1',
    avatar_uri: raw.avatar_uri ?? null,
    cover_uri: raw.cover_uri ?? null,
    handle: raw.handle ?? null,
    bio: raw.bio ?? null,
    languages: raw.languages ?? 'UA укр • PL пол',
    privacy_friends_only: raw.privacy_friends_only ?? false,
    updated_at: raw.updated_at ?? new Date().toISOString(),
  };
}

function emptyProfile(userId: string): UserProfile {
  return {
    user_id: userId,
    display_name: 'Марта Ковальчук',
    city: 'Варшава',
    gender: 'woman',
    avatar_key: 'woman-1',
    avatar_uri: null,
    cover_uri: null,
    handle: 'marta.k',
    bio: null,
    languages: 'Українська',
    privacy_friends_only: false,
    updated_at: new Date().toISOString(),
  };
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const all = await readAll();
  return all[user.id] ?? emptyProfile(user.id);
}

export async function saveUserProfile(
  input: UserProfileInput,
): Promise<UserProfile> {
  const user = await getCurrentUser();
  if (!user) throw new Error(tSaveError());

  const all = await readAll();
  const prev = all[user.id] ?? emptyProfile(user.id);
  const gender: UserGender = input.gender ?? prev.gender;
  let avatar_key: UserAvatarKey = input.avatar_key ?? prev.avatar_key;

  if (input.gender && input.gender !== prev.gender && !input.avatar_key) {
    avatar_key = defaultAvatarKeyForGender(gender);
  }

  let avatar_uri =
    input.avatar_uri !== undefined ? input.avatar_uri : prev.avatar_uri;
  if (avatar_uri) {
    try {
      avatar_uri = await persistLocalImage(avatar_uri, 'user-avatar');
    } catch {
      if (input.avatar_uri === undefined) {
        avatar_uri = prev.avatar_uri;
      }
    }
  }

  let cover_uri =
    input.cover_uri !== undefined ? input.cover_uri : prev.cover_uri;
  if (cover_uri) {
    try {
      cover_uri = await persistLocalImage(cover_uri, 'user-cover');
    } catch {
      if (input.cover_uri === undefined) {
        cover_uri = prev.cover_uri;
      }
    }
  }

  const next: UserProfile = {
    user_id: user.id,
    display_name:
      input.display_name !== undefined
        ? input.display_name?.trim() || null
        : prev.display_name,
    city:
      input.city !== undefined ? input.city?.trim() || null : prev.city,
    gender,
    avatar_key,
    avatar_uri,
    cover_uri,
    handle:
      input.handle !== undefined
        ? input.handle?.trim().replace(/^@/, '') || null
        : prev.handle,
    bio: input.bio !== undefined ? input.bio?.trim() || null : prev.bio,
    languages:
      input.languages !== undefined
        ? input.languages?.trim() || null
        : prev.languages,
    privacy_friends_only:
      input.privacy_friends_only ?? prev.privacy_friends_only,
    updated_at: new Date().toISOString(),
  };

  all[user.id] = next;
  await writeAll(all);
  return next;
}

function tSaveError() {
  return 'Увійди знову, щоб зберегти профіль';
}
