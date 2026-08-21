import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  listCarrierCities,
  listCarriers,
  type DirectoryPlace,
} from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “F4b · Перевізники”. */
export default function DirectoryCarriersScreen() {
  const params = useLocalSearchParams<{ city?: string }>();
  const initialCity =
    typeof params.city === 'string' ? params.city.trim() : '';

  const [city, setCity] = useState(initialCity);
  const [places, setPlaces] = useState<DirectoryPlace[]>([]);
  const cities = useMemo(() => listCarrierCities(), []);

  useEffect(() => {
    let alive = true;
    void listCarriers(city).then((rows) => {
      if (alive) setPlaces(rows);
    });
    return () => {
      alive = false;
    };
  }, [city]);

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
            {(
              [
                ['route', 'directories.filterRoute', true],
                ['species', 'directories.filterSpecies', false],
                ['rating', 'directories.filterRating', false],
              ] as const
            ).map(([id, key, active]) => (
              <View key={id} style={[styles.chip, active && styles.chipGood]}>
                <Text
                  style={[styles.chipText, active && styles.chipTextGood]}
                >
                  {t(key)}
                </Text>
              </View>
            ))}
          </ScrollView>

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('directories.cityPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />

          <View style={styles.cityChips}>
            <Pressable
              onPress={() => setCity('')}
              style={[styles.cityChip, !city && styles.cityChipOn]}
            >
              <Text
                style={[styles.cityChipText, !city && styles.cityChipTextOn]}
              >
                {t('directories.carriersAllCities')}
              </Text>
            </Pressable>
            {cities.map((c) => {
              const on = city === c;
              return (
                <Pressable
                  key={c}
                  onPress={() => setCity(c)}
                  style={[styles.cityChip, on && styles.cityChipOn]}
                >
                  <Text
                    style={[styles.cityChipText, on && styles.cityChipTextOn]}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {places.map((place) => {
            const verified = place.verification === 'verified';
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
                <View style={styles.thumb}>
                  <Ionicons name="car-outline" size={22} color={brand.ink} />
                </View>
                <View style={styles.copy}>
                  <View style={styles.top}>
                    <Text style={styles.name} numberOfLines={1}>
                      {place.name}
                    </Text>
                    <Text
                      style={[
                        styles.badge,
                        verified ? styles.badgeGood : styles.badgeWarn,
                      ]}
                    >
                      {verified
                        ? t('directories.verifiedCheck')
                        : t('directories.unverifiedShort')}
                    </Text>
                  </View>
                  <Text style={styles.meta} numberOfLines={2}>
                    {place.routes?.join(' · ') || place.city}
                    {place.vehicleType ? ` · ${place.vehicleType}` : ''}
                  </Text>
                  <View style={styles.metaChips}>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>
                        ★ {place.rating.toFixed(1)}
                      </Text>
                    </View>
                    <View style={styles.metaChip}>
                      <Text style={styles.metaChipText}>
                        {place.reviewCount}
                      </Text>
                    </View>
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
  input: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  cityChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cityChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cityChipOn: { backgroundColor: brand.accentTint },
  cityChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.ink,
  },
  cityChipTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.accentDark,
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
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  metaChips: { flexDirection: 'row', gap: 6, marginTop: 6 },
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
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
