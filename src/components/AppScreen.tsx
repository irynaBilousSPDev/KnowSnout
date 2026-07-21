import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { brand } from '@/src/theme/brand';

type Props = {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  /** Kept for API compat — ignored in minimal mode */
  atmosphere?: boolean;
};

/** Minimal screen shell — flat brand surface. */
export function AppScreen({ children, edges = ['top'] }: Props) {
  return (
    <View style={styles.root}>
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
  safe: {
    flex: 1,
  },
});
