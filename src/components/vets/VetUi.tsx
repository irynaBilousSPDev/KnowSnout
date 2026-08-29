import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand, fonts } from '@/src/theme/brand';

type DashedCircleProps = {
  label: string;
  browse?: string;
  size?: number;
};

export function VetDashedPhoto({
  label,
  browse = 'or browse files',
  size = 88,
}: DashedCircleProps) {
  return (
    <View style={[styles.dashedCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={styles.dashedLabel}>{label}</Text>
      <Text style={styles.dashedBrowse}>{browse}</Text>
    </View>
  );
}

export function VetDashedHero({ label }: { label: string }) {
  return (
    <View style={styles.hero}>
      <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
      <Text style={styles.heroLabel}>{label}</Text>
      <Text style={styles.heroBrowse}>or browse files</Text>
    </View>
  );
}

export function VetPill({
  label,
  active,
  tint,
}: {
  label: string;
  active?: boolean;
  tint?: 'green' | 'grey';
}) {
  const green = tint === 'green' || active;
  return (
    <View style={[styles.pill, green ? styles.pillGreen : styles.pillGrey]}>
      <Text style={[styles.pillText, green && styles.pillTextGreen]}>{label}</Text>
    </View>
  );
}

export function VetSkillBar({
  label,
  rating,
  count,
}: {
  label: string;
  rating: number;
  count: number;
}) {
  const pct = Math.min(100, (rating / 5) * 100);
  return (
    <View style={styles.skillRow}>
      <Text style={styles.skillLbl} numberOfLines={1}>
        {label} · {count} відгуків
      </Text>
      <View style={styles.skillTrack}>
        <View style={[styles.skillFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.skillNum}>{rating.toFixed(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  dashedCircle: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: brand.surfaceElevated,
  },
  dashedLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: brand.muted,
    textAlign: 'center',
  },
  dashedBrowse: {
    fontFamily: fonts.body,
    fontSize: 8.5,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  hero: {
    height: 170,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderColor: brand.mistBorder,
  },
  heroLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  heroBrowse: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  pill: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pillGreen: { backgroundColor: brand.successTint },
  pillGrey: { backgroundColor: brand.creamDeep },
  pillText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  pillTextGreen: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  skillLbl: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  skillTrack: {
    width: 72,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.creamDeep,
    overflow: 'hidden',
  },
  skillFill: {
    height: '100%',
    backgroundColor: brand.accentDark,
    borderRadius: 3,
  },
  skillNum: {
    width: 28,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.accentDark,
    textAlign: 'right',
  },
});
