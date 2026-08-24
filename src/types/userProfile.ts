import type { UserAvatarKey, UserGender } from '@/src/constants/userAvatars';

export type UserProfile = {
  user_id: string;
  display_name: string | null;
  /** City / region for profile card (UA/PL later) */
  city: string | null;
  gender: UserGender;
  avatar_key: UserAvatarKey;
  avatar_uri: string | null;
  cover_uri: string | null;
  handle: string | null;
  bio: string | null;
  languages: string | null;
  privacy_friends_only: boolean;
  updated_at: string;
};

export type UserProfileInput = {
  display_name?: string | null;
  city?: string | null;
  gender?: UserGender;
  avatar_key?: UserAvatarKey;
  avatar_uri?: string | null;
  cover_uri?: string | null;
  handle?: string | null;
  bio?: string | null;
  languages?: string | null;
  privacy_friends_only?: boolean;
};
