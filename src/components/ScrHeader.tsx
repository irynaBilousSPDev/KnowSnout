import type { ReactNode } from 'react';
import { router } from 'expo-router';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand, fonts } from '@/src/theme/brand';

type Props = {
  title: string;
  titleSize?: number;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** HTML `.scr-hd` — back circle + centered Manrope title. */
export function ScrHeader({
  title,
  titleSize = 22,
  showBack = true,
  onBack,
  right,
  style,
}: Props) {
  return (
    <View style={[styles.row, style]}>
      {showBack ? (
        <Pressable
          onPress={onBack ?? (() => router.back())}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Назад"
        >
          <Ionicons name="chevron-back" size={18} color={brand.ink} />
        </Pressable>
      ) : (
        <View style={styles.spacer} />
      )}
      <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={1}>
        {title}
      </Text>
      {right ?? <View style={styles.spacer} />}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spacer: { width: 34, height: 34 },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    color: brand.ink,
    lineHeight: 28,
  },
});
