import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/BrandLogo';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { brand } from '@/src/theme/brand';

type Props = {
  title?: string;
  subtitle?: string;
  logo?: 'full' | 'icon' | 'none';
  showProfile?: boolean;
  right?: ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  logo = 'full',
  showProfile = true,
  right,
}: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <View style={styles.logoCol}>
          {logo === 'full' ? <BrandLogo variant="full" size="sm" /> : null}
          {logo === 'icon' ? <BrandLogo variant="icon" size="sm" /> : null}
        </View>
        {right ?? (showProfile ? <ProfileEntry /> : null)}
      </View>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  topRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoCol: { flex: 1, paddingRight: 12 },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    lineHeight: 34,
    color: brand.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
});
