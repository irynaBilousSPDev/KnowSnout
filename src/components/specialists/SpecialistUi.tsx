import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { VetDashedPhoto, VetPill } from '@/src/components/vets/VetUi';
import { brand, fonts } from '@/src/theme/brand';

export function SpecialistFilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.filterChip, active && styles.filterChipActive]}
    >
      <Text style={[styles.filterText, active && styles.filterTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SpecialistPetCard({
  name,
  meta,
  selected,
  onPress,
}: {
  name: string;
  meta: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.petCard, selected && styles.petCardOn]}
    >
      <VetDashedPhoto label="Фото" size={44} />
      <View style={styles.petCopy}>
        <Text style={styles.petName}>{name}</Text>
        <Text style={styles.petMeta}>{meta}</Text>
      </View>
    </Pressable>
  );
}

export function ProblemRow({
  title,
  subtitle,
  iconTint,
  onPress,
}: {
  title: string;
  subtitle: string;
  iconTint: string;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.problemRow}>
      <View style={[styles.problemIcon, { backgroundColor: iconTint }]} />
      <View style={styles.problemCopy}>
        <Text style={styles.problemTitle}>{title}</Text>
        <Text style={styles.problemSub}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
    </Pressable>
  );
}

export function SpecialistListCard({
  name,
  subtitle,
  rating,
  reviewCount,
  badges,
  sponsored,
  onPress,
}: {
  name: string;
  subtitle: string;
  rating: number;
  reviewCount: number;
  badges?: { label: string; tint?: 'green' | 'grey' }[];
  sponsored?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.listCard}>
      <VetDashedPhoto label="Фото" browse="or browse" size={52} />
      <View style={styles.listCopy}>
        <View style={styles.listTop}>
          <Text style={styles.listName}>{name}</Text>
          {sponsored ? (
            <Text style={styles.adBadge}>РЕКЛАМА</Text>
          ) : null}
        </View>
        <Text style={styles.listSub}>{subtitle}</Text>
        <View style={styles.listBadges}>
          {reviewCount > 0 ? (
            <VetPill label={`★ ${rating.toFixed(1)} · ${reviewCount}`} tint="green" />
          ) : null}
          {badges?.map((b) => (
            <VetPill
              key={b.label}
              label={b.label}
              tint={b.tint === 'green' ? 'green' : 'grey'}
            />
          ))}
        </View>
      </View>
    </Pressable>
  );
}

export function ServiceOfferCard({
  title,
  subtitle,
  price,
  iconTint,
  selected,
  onPress,
}: {
  title: string;
  subtitle?: string;
  price: string;
  iconTint: string;
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.serviceCard, selected && styles.serviceCardOn]}
    >
      <View style={[styles.serviceIcon, { backgroundColor: iconTint }]} />
      <View style={styles.serviceCopy}>
        <Text style={styles.serviceTitle}>{title}</Text>
        {subtitle ? <Text style={styles.serviceSub}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.servicePrice}>{price}</Text>
    </Pressable>
  );
}

export function TopicRatingRow({
  label,
  count,
  rating,
}: {
  label: string;
  count: number;
  rating: number;
}) {
  const pct = Math.min(100, (rating / 5) * 100);
  return (
    <View style={styles.topicRow}>
      <View style={styles.topicHead}>
        <Text style={styles.topicLbl}>
          {label} · {count}
        </Text>
        <Text style={styles.topicNum}>{rating.toFixed(1)}</Text>
      </View>
      <View style={styles.topicTrack}>
        <View style={[styles.topicFill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterChipActive: {
    backgroundColor: brand.accentTint,
    borderWidth: 1,
    borderColor: brand.accentBorder,
  },
  filterText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.muted,
  },
  filterTextActive: { color: brand.accentDark },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 10,
    minWidth: 170,
  },
  petCardOn: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  petCopy: { flex: 1 },
  petName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  petMeta: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
    marginTop: 2,
  },
  problemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 12,
  },
  problemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
  },
  problemCopy: { flex: 1, gap: 2 },
  problemTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  problemSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.muted,
  },
  listCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 12,
  },
  listCopy: { flex: 1, gap: 4 },
  listTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  listName: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  adBadge: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: '#B8860B',
    letterSpacing: 0.4,
  },
  listSub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  listBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 12,
  },
  serviceCardOn: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  serviceIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  serviceCopy: { flex: 1, gap: 2 },
  serviceTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  serviceSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  servicePrice: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  topicRow: { gap: 6 },
  topicHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  topicLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
    flex: 1,
  },
  topicNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  topicTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.creamDeep,
    overflow: 'hidden',
  },
  topicFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: brand.accent,
  },
});
