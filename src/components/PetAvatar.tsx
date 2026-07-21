import { Image, Text, View } from 'react-native';

import { getAvatarOption } from '@/src/constants/avatars';
import type { CompanionSpecies } from '@/src/types/pet';

type Props = {
  avatarKey?: string | null;
  avatarUri?: string | null;
  size?: number;
  name?: string;
  species?: CompanionSpecies | null;
};

export function PetAvatar({
  avatarKey,
  avatarUri,
  size = 56,
  name,
  species,
}: Props) {
  if (avatarUri) {
    return (
      <Image
        source={{ uri: avatarUri }}
        accessibilityLabel={name ?? 'Pet photo'}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#DFF7F1',
        }}
      />
    );
  }

  const option = getAvatarOption(avatarKey, species);
  const textColor = option.bg === '#16324A' ? '#F7FAF9' : undefined;
  return (
    <View
      accessibilityLabel={name ?? 'Pet avatar'}
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
