import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/src/theme/brand';

type Props = {
  message?: string;
};

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={brand.navy} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surface,
    paddingHorizontal: 24,
  },
  message: {
    marginTop: 16,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.muted,
  },
});
