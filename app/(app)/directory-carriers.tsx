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
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  listCarrierCities,
  listCarriers,
  type DirectoryPlace,
} from '@/src/services/directories';
import { brand } from '@/src/theme/brand';

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
          <ScreenHeader
            title={t('directories.carriersTitle')}
            subtitle={t('directories.carriersSubtitle')}
          />
          <Text style={styles.label}>{t('directories.cityFilter')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('directories.cityPlaceholder')}
            placeholderTextColor="#8AA8A0"
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
                <Ionicons
                  name="car-outline"
                  size={22}
                  color={brand.navy}
                />
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
  label: {
    marginBottom: 6,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#5A6B7D',
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    borderColor: brand.navy,
    backgroundColor: brand.mist,
  },
  chipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: '#5A6B7D',
  },
  chipTextActive: { color: brand.navy },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
