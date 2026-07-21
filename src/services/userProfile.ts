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

async function readAll(): Promise<Record<string, UserProfile>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, UserProfile>;
  } catch {
    return {};
  }
}

async function writeAll(map: Record<string, UserProfile>) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function emptyProfile(userId: string): UserProfile {
  return {
    user_id: userId,
    display_name: null,
    gender: 'unspecified',
    avatar_key: 'person-1',
    avatar_uri: null,
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
      // Keep previous URI if image persist fails — don't block name/gender saves
      if (input.avatar_uri === undefined) {
        avatar_uri = prev.avatar_uri;
      }
    }
  }

  const next: UserProfile = {
    user_id: user.id,
    display_name:
      input.display_name !== undefined
        ? input.display_name?.trim() || null
        : prev.display_name,
    gender,
    avatar_key,
    avatar_uri,
    updated_at: new Date().toISOString(),
  };

  all[user.id] = next;
  await writeAll(all);
  return next;
}

function tSaveError() {
  return 'Увійди знову, щоб зберегти профіль';
}
