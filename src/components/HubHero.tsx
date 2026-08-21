import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandLogo } from '@/src/components/BrandLogo';
import { brand, fonts } from '@/src/theme/brand';

type Props = {
  title: string;
  lead?: string;
  brandMark?: boolean;
  right?: ReactNode;
  stats?: ReactNode;
};

/** PDF hub hero: Caprasimo title + Figtree lead. */
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
    fontFamily: fonts.display,
    fontSize: 34,
    lineHeight: 40,
    color: brand.ink,
    letterSpacing: -0.4,
  },
  lead: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  stats: { marginTop: 14 },
});
