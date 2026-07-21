import { ActivityIndicator, Text, View } from 'react-native';

import { brand } from '@/src/theme/brand';

type Props = {
  message?: string;
};

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <View className="flex-1 items-center justify-center bg-sand-50 px-6">
      <ActivityIndicator size="large" color={brand.tealDeep} />
      <Text className="mt-4 font-body text-base text-forest-700">{message}</Text>
    </View>
  );
}
