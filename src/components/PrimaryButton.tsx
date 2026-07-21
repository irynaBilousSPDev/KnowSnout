import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
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

/** Minimal button set — clear hierarchy, no heavy chrome. */
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
        styles.base,
        sizeStyle,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        dim && styles.dimmed,
        pressed && !dim && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? brand.surface : brand.tealPressed}
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
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%' },
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  sizeMd: { minHeight: 50, paddingHorizontal: 18, paddingVertical: 13 },
  sizeLg: { minHeight: 54, paddingHorizontal: 20, paddingVertical: 15 },
  sizeSm: { minHeight: 42, paddingHorizontal: 14, paddingVertical: 10 },
  primary: { backgroundColor: brand.tealPressed },
  secondary: {
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  ghost: { backgroundColor: 'transparent' },
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
  },
  labelSm: { fontSize: 13 },
  labelPrimary: { color: brand.surface },
  labelSecondary: { color: brand.ink },
  labelGhost: { color: brand.tealPressed },
  labelDanger: { color: brand.score.poor },
});
