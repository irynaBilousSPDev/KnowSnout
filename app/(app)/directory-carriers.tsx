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

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { t } from '@/src/i18n';
import {
  listCarrierCities,
  listCarriers,
  type DirectoryPlace,
} from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Перевізники. */
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
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('directories.carriersTitle')}
            lead={t('directories.carriersSubtitle')}
          />
          <View style={styles.warn}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={brand.accentDark}
            />
            <Text style={styles.warnText}>
              {t('directories.carriersSubtitle')}
            </Text>
          </View>
          <Text style={styles.label}>{t('directories.cityFilter')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('directories.cityPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          <View style={styles.chips}>
            <Pressable
              onPress={() => setCity('')}
              style={[styles.chip, !city ? styles.chipActive : null]}
            >
              <Text
                style={[styles.chipText, !city ? styles.chipTextActive : null]}
              >
                {t('directories.carriersAllCities')}
              </Text>
            </Pressable>
            {cities.map((c) => {
              const active = city.trim().toLowerCase() === c.toLowerCase();
              return (
                <Pressable
                  key={c}
                  onPress={() => setCity(c)}
                  style={[styles.chip, active ? styles.chipActive : null]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      active ? styles.chipTextActive : null,
                    ]}
                  >
                    {c}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {places.map((place) => (
            <ListRow
              key={place.id}
              title={place.name}
              subtitle={`${place.city}${
                place.vehicleType ? ` · ${place.vehicleType}` : ''
              }`}
              meta={`${place.rating.toFixed(1)} · ${place.reviewCount}`}
              leading={
                <Ionicons name="car-outline" size={22} color={brand.accent} />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/directory-detail',
                  params: { id: place.id },
                } as never)
              }
            />
          ))}
          {places.length === 0 ? (
            <Text style={styles.empty}>{t('directories.listEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  warn: {
    marginBottom: 14,
    flexDirection: 'row',
    gap: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 12,
  },
  warnText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brand.accentDark,
  },
  label: {
    marginBottom: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  chipTextActive: { color: brand.accentDark },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
