import {
  Image,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

type Variant = 'full' | 'icon' | 'wordmark';
type Size = 'sm' | 'md' | 'lg' | 'hero';

type Props = {
  variant?: Variant;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

const logoEmerald = require('../../assets/images/logo_emerald.png');

const SIZES: Record<
  Size,
  { icon: number; fontSize: number; gap: number }
> = {
  sm: { icon: 28, fontSize: 15, gap: -2 },
  md: { icon: 40, fontSize: 19, gap: -4 },
  lg: { icon: 48, fontSize: 22, gap: -4 },
  hero: { icon: 56, fontSize: 26, gap: -4 },
};

/** HTML `.app-brand` — emerald mark + Know(ink) / Snout(logoGreen). */
export function BrandLogo({ variant = 'full', size = 'md', style }: Props) {
  const dims = SIZES[size];

  const mark = (
    <Image
      source={logoEmerald}
      style={{ width: dims.icon, height: dims.icon, marginRight: dims.gap }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );

  const word = (
    <Text
      style={{
        fontFamily: fonts.titleExtra,
        fontSize: dims.fontSize,
        lineHeight: dims.fontSize + 3,
        letterSpacing: -0.5,
      }}
    >
      <Text style={{ color: brand.ink }}>Know</Text>
      <Text style={{ color: brand.logoGreen }}>Snout</Text>
    </Text>
  );

  if (variant === 'icon') {
    return (
      <View accessibilityRole="image" accessibilityLabel="KnowSnout" style={style}>
        {mark}
      </View>
    );
  }

  if (variant === 'wordmark') {
    return (
      <View accessibilityRole="image" accessibilityLabel="KnowSnout" style={style}>
        {word}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel="KnowSnout"
      style={[
        { flexDirection: 'row', alignItems: 'center' },
        style,
      ]}
    >
      {mark}
      {word}
    </View>
  );
}
