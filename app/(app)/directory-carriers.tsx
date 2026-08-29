import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import {
  DirectoryComplaintsBadge,
  DirectoryDashedThumb,
  DirectoryRatingChip,
  DirectoryTripsChip,
  verificationBadgeLabel,
} from '@/src/components/directories/DirectoryUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { listCarriers, type DirectoryPlace } from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

const CARRIER_FILTERS = [
  { id: 'route', labelKey: 'directories.filterRoute', active: true },
  { id: 'species', labelKey: 'directories.filterSpecies', active: false },
  { id: 'rating', labelKey: 'directories.filterRating', active: false },
] as const;

/** 06.05 · Перевізники — список */
export default function DirectoryCarriersScreen() {
  const [places, setPlaces] = useState<DirectoryPlace[]>([]);

  useEffect(() => {
    let alive = true;
    void listCarriers().then((rows) => {
      if (alive) setPlaces(rows);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('directories.carriersTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.warn}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={brand.accentDark}
            />
            <Text style={styles.warnText}>{t('directories.carriersWarn')}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {CARRIER_FILTERS.map((f) => (
              <View
                key={f.id}
                style={[styles.chip, f.active && styles.chipGood]}
              >
                <Text
                  style={[styles.chipText, f.active && styles.chipTextGood]}
                >
                  {t(f.labelKey)}
                </Text>
              </View>
            ))}
          </ScrollView>

          {places.map((place) => {
            const verified = place.verification === 'verified';
            const hasComplaints =
              place.complaintCount != null && place.complaintCount > 0;
            const badge = hasComplaints
              ? null
              : verificationBadgeLabel(place, 'transport');

            return (
              <Pressable
                key={place.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/directory-detail',
                    params: { id: place.id },
                  } as never)
                }
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <DirectoryDashedThumb
                  label={place.thumbLabel ?? t('directories.thumbCar')}
                />
                <View style={styles.copy}>
                  <View style={styles.top}>
                    <Text style={styles.name} numberOfLines={1}>
                      {place.name}
                    </Text>
                    {hasComplaints ? (
                      <DirectoryComplaintsBadge count={place.complaintCount!} />
                    ) : badge ? (
                      <Text
                        style={[
                          styles.badge,
                          verified ? styles.badgeGood : styles.badgeWarn,
                        ]}
                      >
                        {badge}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.meta} numberOfLines={2}>
                    {place.listSubtitle ?? place.specialty ?? place.city}
                  </Text>
                  <View style={styles.metaRow}>
                    <DirectoryRatingChip rating={place.rating} />
                    {place.tripCount != null && place.tripCount > 0 ? (
                      <DirectoryTripsChip count={place.tripCount} />
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}

          {places.length === 0 ? (
            <Text style={styles.empty}>{t('directories.listEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },
  warn: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 12,
  },
  warnText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.accentDark,
  },
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  chipTextGood: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  copy: { flex: 1 },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  badge: { fontFamily: fonts.bodyBold, fontSize: 10.5 },
  badgeGood: { color: brand.successDark },
  badgeWarn: { color: brand.terracotta },
  meta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
