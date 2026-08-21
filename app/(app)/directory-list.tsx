import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
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
  listDirectoryPlaces,
  type DirectoryCategoryId,
  type DirectoryPlace,
} from '@/src/services/directories';
import { brand, fonts } from '@/src/theme/brand';

function isCategory(v: string | undefined): v is DirectoryCategoryId {
  return (
    v === 'vets' ||
    v === 'breeders' ||
    v === 'transport' ||
    v === 'sitters' ||
    v === 'insurance' ||
    v === 'lodging'
  );
}

/** HTML kit · Довідник список. */
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

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t(`directories.cat.${cat}`)}
            lead={t('directories.listSubtitle')}
          />
          <Text style={styles.label}>{t('directories.cityFilter')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('directories.cityPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          {places.map((place) => (
            <ListRow
              key={place.id}
              title={place.name}
              subtitle={`${place.city}${place.specialty ? ` · ${place.specialty}` : ''}`}
              meta={`${place.rating.toFixed(1)} · ${place.reviewCount}`}
              leading={
                <Ionicons
                  name="location-outline"
                  size={22}
                  color={brand.accent}
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
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  input: {
    marginBottom: 14,
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
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
