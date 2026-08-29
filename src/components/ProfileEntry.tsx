import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { getUserProfile } from '@/src/services/userProfile';
import type { UserProfile } from '@/src/types/userProfile';

type Props = {
  /** Show label under the avatar */
  showLabel?: boolean;
  size?: number;
};

export function ProfileEntry({ showLabel = true, size = 44 }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getUserProfile().then(setProfile);
    }, []),
  );

  return (
    <Pressable
      onPress={() => router.push('/(app)/my-profile' as never)}
      accessibilityRole="button"
      accessibilityLabel={t('profile.mine')}
      className="items-center active:opacity-75"
    >
      <UserAvatar
        avatarKey={profile?.avatar_key}
        avatarUri={profile?.avatar_uri}
        gender={profile?.gender}
        size={size}
        name={profile?.display_name ?? t('profile.mine')}
      />
      {showLabel ? (
        <Text className="mt-1 max-w-[72px] text-center font-body-medium text-[10px] text-forest-700">
          {profile?.display_name?.trim() || t('profile.mine')}
        </Text>
      ) : null}
    </Pressable>
  );
}
