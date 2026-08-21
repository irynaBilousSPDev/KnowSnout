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

/** Organic PDF CTA — sage pill (primary), soft bordered (secondary). */
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
            color={variant === 'primary' ? '#FFFFFF' : brand.sage}
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
    borderRadius: brand.radius.pill,
    width: '100%',
  },
  sizeMd: { minHeight: 52, paddingHorizontal: 20, paddingVertical: 14 },
  sizeLg: { minHeight: 56, paddingHorizontal: 22, paddingVertical: 16 },
  sizeSm: { minHeight: 42, paddingHorizontal: 16, paddingVertical: 10 },
  primary: { backgroundColor: brand.sage },
  secondary: {
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1.5,
    borderColor: brand.mistBorder,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  danger: {
    backgroundColor: brand.terracottaTint,
    borderWidth: 1,
    borderColor: 'rgba(196, 92, 62, 0.28)',
  },
  dimmed: { opacity: 0.5 },
  pressed: { opacity: 0.9 },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 0.15,
    color: brand.ink,
  },
  labelSm: { fontSize: 13 },
  labelPrimary: { color: '#FFFFFF' },
  labelSecondary: { color: brand.ink },
  labelGhost: { color: brand.sage },
  labelDanger: { color: brand.terracotta },
});
