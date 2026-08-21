import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brand } from '@/src/theme/brand';

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

/**
 * Styles live on an inner View — NativeWind on iOS sometimes drops
 * StyleSheet backgroundColor when applied directly to Pressable.
 */
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
            color={variant === 'primary' ? '#FFFFFF' : brand.navy}
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
    borderRadius: 16,
    width: '100%',
  },
  sizeMd: { minHeight: 50, paddingHorizontal: 18, paddingVertical: 13 },
  sizeLg: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 15 },
  sizeSm: { minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 },
  primary: { backgroundColor: brand.navy },
  secondary: {
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  danger: {
    backgroundColor: 'rgba(196, 92, 62, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(196, 92, 62, 0.22)',
  },
  dimmed: { opacity: 0.5 },
  pressed: { opacity: 0.88 },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    letterSpacing: 0.15,
    color: brand.ink,
  },
  labelSm: { fontSize: 13 },
  labelPrimary: { color: '#FFFFFF' },
  labelSecondary: { color: brand.ink },
  labelGhost: { color: brand.navy },
  labelDanger: { color: brand.score.poor },
});
