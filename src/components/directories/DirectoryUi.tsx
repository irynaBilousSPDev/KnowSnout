import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { t } from '@/src/i18n';
import type { DirectoryLanguage, DirectoryPlace } from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

type DashedThumbProps = {
  label: string;
  size?: number;
};

/** 06.02 / 06.04 / 06.05 — dashed list thumbnail. */
export function DirectoryDashedThumb({ label, size = 52 }: DashedThumbProps) {
  return (
    <View style={[styles.thumb, { width: size, height: size }]}>
      <Text style={styles.thumbLabel}>{label}</Text>
      <Text style={styles.thumbBrowse}>{t('directories.browseShort')}</Text>
    </View>
  );
}

type DashedHeroProps = {
  label: string;
};

/** 06.03 / 06.06 — dashed hero photo slot. */
export function DirectoryDashedHero({ label }: DashedHeroProps) {
  return (
    <View style={styles.hero}>
      <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
      <Text style={styles.heroLabel}>{label}</Text>
      <Text style={styles.heroBrowse}>{t('directories.browseFiles')}</Text>
    </View>
  );
}

export function DirectoryLangBadge({ lang }: { lang: DirectoryLanguage }) {
  return (
    <View style={styles.langChip}>
      <Text style={styles.langChipText}>
        {lang.flag} {lang.label}
      </Text>
    </View>
  );
}

export function DirectoryRatingChip({ rating }: { rating: number }) {
  return (
    <View style={styles.ratingChip}>
      <Text style={styles.ratingChipText}>★ {rating.toFixed(1)}</Text>
    </View>
  );
}

export function DirectoryTripsChip({ count }: { count: number }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>
        {t('directories.tripsCount', { count: String(count) })}
      </Text>
    </View>
  );
}

export function DirectoryComplaintsBadge({ count }: { count: number }) {
  return (
    <View style={styles.complaintBadge}>
      <Text style={styles.complaintBadgeText}>
        ⚠ {t('directories.complaintsCount', { count: String(count) })}
      </Text>
    </View>
  );
}

export function verificationBadgeLabel(
  place: DirectoryPlace,
  category?: DirectoryPlace['category'],
): string | null {
  const cat = category ?? place.category;
  if (place.verification === 'verified') {
    return cat === 'breeders'
      ? t('directories.verifiedFci')
      : t('directories.verifiedCheck');
  }
  if (place.verification === 'unverified' && cat === 'breeders') {
    return t('directories.unverifiedShort');
  }
  if (place.complaintCount && place.complaintCount > 0) {
    return null;
  }
  if (place.verification === 'unverified' && cat === 'vets') {
    return null;
  }
  if (place.verification === 'pending') {
    return t('directories.pending');
  }
  return null;
}

export function priceLevelDisplay(level = 2): { filled: string; faded: string } {
  const n = Math.min(3, Math.max(1, level));
  return { filled: '₴'.repeat(n), faded: '₴'.repeat(3 - n) };
}

const styles = StyleSheet.create({
  thumb: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  thumbLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 9,
    color: brand.muted,
    textAlign: 'center',
  },
  thumbBrowse: {
    fontFamily: fonts.body,
    fontSize: 8,
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
  langChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  langChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: brand.ink,
  },
  ratingChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  ratingChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: brand.ink,
  },
  metaChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  metaChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: brand.ink,
  },
  complaintBadge: {
    borderRadius: brand.radius.pill,
    backgroundColor: '#FCEEE8',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  complaintBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: brand.terracotta,
  },
});
