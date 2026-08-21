import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/BrandLogo';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  title?: string;
  subtitle?: string;
  logo?: 'full' | 'icon' | 'none';
  showProfile?: boolean;
  right?: ReactNode;
};

/** HTML kit screen title — Manrope 22. */
export function ScreenHeader({
  title,
  subtitle,
  logo = 'none',
  showProfile = false,
  right,
}: Props) {
  const showTop = logo !== 'none' || right || showProfile;
  return (
    <View style={styles.wrap}>
      {showTop ? (
        <View style={styles.topRow}>
          <View style={styles.logoCol}>
            {logo === 'full' ? <BrandLogo variant="full" size="sm" /> : null}
            {logo === 'icon' ? <BrandLogo variant="icon" size="sm" /> : null}
          </View>
          {right ?? (showProfile ? <ProfileEntry /> : null)}
        </View>
      ) : null}
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  topRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoCol: { flex: 1, paddingRight: 12 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
});
