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

/** HTML kit hub title — Manrope 22–28. */
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
  wrap: { marginBottom: 16 },
  topRow: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  lead: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  stats: { marginTop: 12 },
});
