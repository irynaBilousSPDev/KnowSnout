import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'lg' | 'sm';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
  block?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** HTML kit CTA — pill, accent teal, h~46–48. */
export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  block = true,
  style,
}: Props) {
  const dim = Boolean(disabled || loading);
  const sizeStyle =
    size === 'lg' ? styles.sizeLg : size === 'sm' ? styles.sizeSm : styles.sizeMd;

  return (
    <Pressable
      onPress={onPress}
      disabled={dim}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        block && styles.block,
        dim && styles.dimmed,
        pressed && !dim && styles.pressed,
        style,
      ]}
    >
      <View
        style={[
          styles.base,
          sizeStyle,
          variant === 'primary' && styles.primary,
          variant === 'secondary' && styles.secondary,
          variant === 'ghost' && styles.ghost,
          variant === 'danger' && styles.danger,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={variant === 'primary' ? '#FFFFFF' : brand.accent}
          />
        ) : (
          <Text
            style={[
              styles.label,
              size === 'sm' && styles.labelSm,
              variant === 'primary' && styles.labelPrimary,
              variant === 'secondary' && styles.labelSecondary,
              variant === 'ghost' && styles.labelGhost,
              variant === 'danger' && styles.labelDanger,
            ]}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%' },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: brand.radius.md,
    width: '100%',
  },
  sizeMd: { minHeight: 46, paddingHorizontal: 18, paddingVertical: 12 },
  sizeLg: { minHeight: 48, paddingHorizontal: 20, paddingVertical: 14 },
  sizeSm: { minHeight: 40, paddingHorizontal: 14, paddingVertical: 8 },
  primary: { backgroundColor: brand.accent },
  secondary: {
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.divider,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: brand.divider,
  },
  danger: {
    backgroundColor: brand.terracottaTint,
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.28)',
  },
  dimmed: { opacity: 0.45 },
  pressed: { opacity: 0.9 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    letterSpacing: 0.1,
    color: brand.ink,
  },
  labelSm: { fontSize: 13 },
  labelPrimary: { color: brand.canvas },
  labelSecondary: { color: brand.ink },
  labelGhost: { color: brand.accent },
  labelDanger: { color: brand.error },
});
