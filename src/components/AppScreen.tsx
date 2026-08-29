import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/src/theme/AppThemeProvider';

type Props = {
  children: ReactNode;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
  atmosphere?: boolean;
};

/** HTML kit screen shell — warm stone canvas #F4F3F1. */
export function AppScreen({
  children,
  edges = ['top'],
}: Props) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.canvas }]}>
      <SafeAreaView style={styles.safe} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
});
