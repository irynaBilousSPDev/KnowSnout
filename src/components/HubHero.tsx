import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/BrandLogo';
import { brand } from '@/src/theme/brand';

type Props = {
  title: string;
  lead?: string;
  /** Show brand lockup above title */
  brandMark?: boolean;
  right?: ReactNode;
  stats?: ReactNode;
};

/** Tab-hub first viewport: brand + one title + short lead + optional stats. */
export function HubHero({
  title,
  lead,
  brandMark = false,
  right,
  stats,
}: Props) {
  return (
    <View style={styles.wrap}>
      {(brandMark || right) && (
        <View style={styles.topRow}>
          {brandMark ? <BrandLogo variant="full" size="sm" /> : <View />}
          {right}
        </View>
      )}
      <Text style={styles.title}>{title}</Text>
      {lead ? <Text style={styles.lead}>{lead}</Text> : null}
      {stats ? <View style={styles.stats}>{stats}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  topRow: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    lineHeight: 34,
    color: brand.ink,
    letterSpacing: -0.4,
  },
  lead: {
    marginTop: 6,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  stats: { marginTop: 14 },
});
