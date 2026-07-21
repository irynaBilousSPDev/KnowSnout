import type { UserAvatarKey, UserGender } from '@/src/constants/userAvatars';

export type UserProfile = {
  user_id: string;
  display_name: string | null;
  gender: UserGender;
  avatar_key: UserAvatarKey;
  avatar_uri: string | null;
  updated_at: string;
};

export type UserProfileInput = {
  display_name?: string | null;
  gender?: UserGender;
  avatar_key?: UserAvatarKey;
  avatar_uri?: string | null;
};
