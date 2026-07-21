import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand } from '@/src/theme/brand';

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
  name: IconName;
  onPress: () => void;
  color?: string;
  size?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  filled?: boolean;
};

export function IconButton({
  name,
  onPress,
  color = brand.ink,
  size = 22,
  disabled,
  accessibilityLabel,
  style,
  filled = false,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={10}
      style={({ pressed }) => [
        styles.base,
        filled && styles.filled,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.mist,
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.65 },
});
