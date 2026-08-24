import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
  listDirectoryPlaces,
  type DirectoryCategoryId,
  type DirectoryPlace,
  type VerificationStatus,
} from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

function isCategory(v: string | undefined): v is DirectoryCategoryId {
  return (
    v === 'vets' ||
    v === 'breeders' ||
    v === 'transport' ||
    v === 'sitters' ||
    v === 'insurance' ||
    v === 'lodging' ||
    v === 'shops'
  );
}

function verificationLabel(v: VerificationStatus, cat: DirectoryCategoryId) {
  if (v === 'verified') {
    return cat === 'breeders'
      ? t('directories.verifiedFci')
      : t('directories.verifiedCheck');
  }
  if (v === 'pending') return t('directories.pending');
  return t('directories.unverifiedShort');
}

const FILTERS = [
  { id: 'specialty', labelKey: 'directories.filterSpecialty', active: true },
  { id: 'lang', labelKey: 'directories.filterLang', active: false },
  { id: 'city', labelKey: 'directories.filterCity', active: false },
  { id: '24h', labelKey: 'directories.filter24h', active: false },
] as const;

/** HTML phones F2 / F4 — list + chips. */
export default function DirectoryListScreen() {
  const { category } = useLocalSearchParams<{ category?: string }>();
  const cat = isCategory(category) ? category : 'vets';
  const [city, setCity] = useState('');
  const [places, setPlaces] = useState<DirectoryPlace[]>([]);

  useEffect(() => {
    let alive = true;
    void listDirectoryPlaces(cat, city).then((rows) => {
      if (alive) setPlaces(rows);
    });
    return () => {
      alive = false;
    };
  }, [cat, city]);

  const showBreedersWarn = cat === 'breeders';

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t(`directories.cat.${cat}`)} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {showBreedersWarn ? (
            <View style={styles.warn}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={brand.accentDark}
              />
              <Text style={styles.warnText}>{t('directories.breedersWarn')}</Text>
            </View>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {FILTERS.map((f) => (
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

          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('directories.cityPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />

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
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={brand.accentDark}
                  />
                </View>
                <View style={styles.cardCopy}>
                  <View style={styles.cardTop}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {place.name}
                    </Text>
                    {verified || place.verification === 'unverified' ? (
                      <Text
                        style={[
                          styles.badge,
                          verified ? styles.badgeGood : styles.badgeMuted,
                        ]}
                      >
                        {verificationLabel(place.verification, cat)}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={styles.cardMeta} numberOfLines={1}>
                    {place.specialty
                      ? `${place.specialty} · ${place.city}`
                      : place.city}
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
  chips: { flexDirection: 'row', gap: 6, paddingBottom: 2 },
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
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1 },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
  },
  badgeGood: { color: brand.successDark },
  badgeMuted: { color: brand.mutedSoft },
  cardMeta: {
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
