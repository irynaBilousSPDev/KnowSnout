import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brand } from '@/src/theme/brand';

type Props = {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  /** Soft cream atmosphere (default on) */
  atmosphere?: boolean;
};

/** Organic PDF screen shell — warm cream surface. */
export function AppScreen({
  children,
  edges = ['top'],
  atmosphere = true,
}: Props) {
  return (
    <View style={[styles.root, atmosphere && styles.atmosphere]}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: brand.surface,
  },
  atmosphere: {
    backgroundColor: brand.cream,
  },
  safe: {
    flex: 1,
  },
});
