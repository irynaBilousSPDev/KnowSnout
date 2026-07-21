import { Image, Text, View } from 'react-native';

import {
  getUserAvatarOption,
  type UserGender,
} from '@/src/constants/userAvatars';

type Props = {
  avatarKey?: string | null;
  avatarUri?: string | null;
  gender?: UserGender | null;
  size?: number;
  name?: string;
};

export function UserAvatar({
  avatarKey,
  avatarUri,
  gender,
  size = 40,
  name,
}: Props) {
  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        accessibilityLabel={name ?? 'Profile photo'}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#DFF7F1',
        }}
      />
    );
  }

  const option = getUserAvatarOption(avatarKey, gender);
  const textColor = option.bg === '#16324A' ? '#F7FAF9' : undefined;

  return (
    <View
      accessibilityLabel={name ?? 'Profile avatar'}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: option.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ fontSize: size * 0.48, color: textColor }}>{option.emoji}</Text>
    </View>
  );
}
