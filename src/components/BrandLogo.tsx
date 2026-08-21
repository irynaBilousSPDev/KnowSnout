import {
  Image,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

type Variant = 'full' | 'icon';
type Size = 'sm' | 'md' | 'lg' | 'hero';

type Props = {
  variant?: Variant;
  size?: Size;
  style?: StyleProp<ViewStyle>;
};

/** Proven bundled mark (same snout icon). Wordmark is text → KnowSnout. */
const logoIcon = require('../../assets/images/brand-logo-icon.png');

const SIZES: Record<
  Size,
  { icon: number; fontSize: number; gap: number; tracking: number }
> = {
  sm: { icon: 36, fontSize: 17, gap: 8, tracking: -0.3 },
  md: { icon: 48, fontSize: 22, gap: 10, tracking: -0.4 },
  lg: { icon: 64, fontSize: 30, gap: 12, tracking: -0.5 },
  hero: { icon: 76, fontSize: 34, gap: 14, tracking: -0.6 },
};

export function BrandLogo({ variant = 'full', size = 'md', style }: Props) {
  const dims = SIZES[size];
  const name = t('brand.name');

  const mark = (
    <Image
      source={logoIcon}
      style={{ width: dims.icon, height: dims.icon }}
      resizeMode="contain"
      accessibilityIgnoresInvertColors
    />
  );

  if (variant === 'icon') {
    return (
      <View accessibilityRole="image" accessibilityLabel={name} style={style}>
        {mark}
      </View>
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={name}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          columnGap: dims.gap,
        },
        style,
      ]}
    >
      {mark}
      <Text
        style={{
          color: brand.sageDeep,
          fontSize: dims.fontSize,
          letterSpacing: dims.tracking,
          fontFamily: 'Caprasimo_400Regular',
          includeFontPadding: false,
        }}
      >
        {name}
      </Text>
    </View>
  );
}
