import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { IconButton } from '@/src/components/IconButton';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { Section } from '@/src/components/Section';
import {
  getScoreTone,
  SCORE_COLORS,
} from '@/src/constants/analysis';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { setPendingAnalysis } from '@/src/lib/resultStore';
import {
  listBreedHistory,
  deleteBreedHistoryItem,
  type BreedHistoryItem,
} from '@/src/services/breedId';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { listPets } from '@/src/services/pets';
import {
  listPlantHistory,
  deletePlantHistoryItem,
  plantLevelTone,
  type PlantHistoryItem,
} from '@/src/services/plants';
import { deleteScan, listScans } from '@/src/services/scans';
import { brand } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { PetSpecies, ScanRow } from '@/src/types/scan';
import type { PlantToxicityLevel } from '@/src/types/plant';

type JournalKind = 'food' | 'plant' | 'breed';
type FoodFilter = 'all' | PetSpecies;

async function withResolvedPhotoUri<T extends { photo_uri?: string | null }>(
  item: T,
): Promise<T> {
  if (!item.photo_uri) return item;
  const url = await resolveCheckImageUrl(item.photo_uri);
  return { ...item, photo_uri: url ?? item.photo_uri };
}

async function withResolvedBreedPhoto(
  item: BreedHistoryItem,
): Promise<BreedHistoryItem> {
  if (!item.photoUri) return item;
  const url = await resolveCheckImageUrl(item.photoUri);
  return { ...item, photoUri: url ?? item.photoUri };
}

async function withResolvedScanImage(item: ScanRow): Promise<ScanRow> {
  if (!item.image_path) return item;
  const url = await resolveCheckImageUrl(item.image_path);
  return { ...item, image_path: url ?? item.image_path };
}

function speciesLabel(species?: PetSpecies | null) {
  if (species === 'dog') return t('history.speciesDog');
  if (species === 'cat') return t('history.speciesCat');
  return null;
}

function plantLevelLabel(level: string) {
  switch (level as PlantToxicityLevel) {
    case 'safe':
      return t('plants.levelSafe');
    case 'mild':
      return t('plants.levelMild');
    case 'toxic':
      return t('plants.levelToxic');
    default:
      return t('plants.levelUnknown');
  }
}

function JournalThumb({
  uri,
  large,
}: {
  uri?: string | null;
  large?: boolean;
}) {
  if (!uri || !isNativeSafeImageUri(uri)) return null;
  return (
    <Image
      source={{ uri }}
      className={
        large
          ? 'mb-3 h-40 w-full rounded-2xl bg-forest-100'
          : 'mr-3 h-16 w-16 rounded-xl bg-forest-100'
      }
      resizeMode="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

function petsForScan(scan: ScanRow, pets: PetRow[]) {
  return pets.filter((pet) => {
    if (!pet.favorite_food && !pet.favorite_product_id) return false;
    if (
      pet.favorite_product_id &&
      scan.product_id &&
      pet.favorite_product_id === scan.product_id
    ) {
      return true;
    }
    return (
      Boolean(pet.favorite_food) &&
      pet.favorite_food!.toLowerCase() === scan.product_name.toLowerCase()
    );
  });
}

async function listPlantChecks(): Promise<PlantHistoryItem[]> {
  return listPlantHistory();
}

export default function JournalScreen() {
  const [kind, setKind] = useState<JournalKind>('food');
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [plants, setPlants] = useState<PlantHistoryItem[]>([]);
  const [breeds, setBreeds] = useState<BreedHistoryItem[]>([]);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [foodFilter, setFoodFilter] = useState<FoodFilter>('all');

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [scanData, petData, plantData, breedData] = await Promise.all([
        listScans(),
        listPets(),
        listPlantChecks(),
        listBreedHistory(),
      ]);
      const [scansResolved, plantsResolved, breedsResolved] = await Promise.all([
        Promise.all(scanData.map(withResolvedScanImage)),
        Promise.all(plantData.map(withResolvedPhotoUri)),
        Promise.all(breedData.map(withResolvedBreedPhoto)),
      ]);
      setScans(scansResolved);
      setPets(petData);
      setPlants(plantsResolved);
      setBreeds(breedsResolved);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('history.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const filteredFood = useMemo(() => {
    if (foodFilter === 'all') return scans;
    return scans.filter((s) => (s.species ?? 'unknown') === foodFilter);
  }, [scans, foodFilter]);

  const onDeleteFood = async (scan: ScanRow) => {
    const ok = await confirmAction({
      title: t('history.deleteTitle'),
      message: t('history.deleteMessage', { name: scan.product_name }),
      confirmLabel: t('history.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteScan(scan.id);
      setScans((prev) => prev.filter((s) => s.id !== scan.id));
    } catch (err) {
      Alert.alert(
        t('history.deleteFailed'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onDeletePlant = async (item: PlantHistoryItem) => {
    const name = item.name_uk ?? item.query_text ?? t('plants.title');
    const ok = await confirmAction({
      title: t('history.deleteTitle'),
      message: t('history.deleteMessage', { name }),
      confirmLabel: t('history.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    await deletePlantHistoryItem(item.id);
    setPlants((prev) => prev.filter((p) => p.id !== item.id));
  };

  const onDeleteBreed = async (item: BreedHistoryItem) => {
    const name = item.breedNameUk ?? item.breedName;
    const ok = await confirmAction({
      title: t('history.deleteTitle'),
      message: t('history.deleteMessage', { name }),
      confirmLabel: t('history.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    await deleteBreedHistoryItem(item.id);
    setBreeds((prev) => prev.filter((b) => b.id !== item.id));
  };

  if (loading) {
    return <LoadingState message={t('history.loading')} />;
  }

  const kindOptions: { id: JournalKind; label: string }[] = [
    { id: 'food', label: t('journal.kindFood') },
    { id: 'plant', label: t('journal.kindPlant') },
    { id: 'breed', label: t('journal.kindBreed') },
  ];

  const foodFilters: { id: FoodFilter; label: string }[] = [
    { id: 'all', label: t('history.filterAll') },
    { id: 'dog', label: t('history.filterDog') },
    { id: 'cat', label: t('history.filterCat') },
    { id: 'unknown', label: t('history.filterOther') },
  ];

  return (
    <AppScreen>
      <View className="px-5 pb-2 pt-4">
        <ScreenHeader
          title={t('history.title')}
          subtitle={t('history.subtitle')}
        />

        <View style={{ marginTop: 16 }}>
          <SegmentedControl
            value={kind}
            onChange={setKind}
            options={kindOptions}
          />
        </View>

        {kind === 'food' ? (
          <View style={{ marginTop: 10 }}>
            <SegmentedControl
              value={foodFilter}
              onChange={setFoodFilter}
              options={foodFilters}
            />
          </View>
        ) : null}
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : kind === 'food' ? (
        <FlatList
          data={filteredFood}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#00A894"
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('history.emptyTitle')}>
              <Text className="font-body text-sm leading-5 text-forest-600">
                {t('history.emptyBody')}
              </Text>
              <View className="mt-3">
                <PrimaryButton
                  label={t('journal.goFood')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/scan-food')}
                />
              </View>
            </Section>
          }
          renderItem={({ item }) => {
            const tone = getScoreTone(item.score);
            const color = SCORE_COLORS[tone];
            const label = speciesLabel(item.species);
            const fans = petsForScan(item, pets);
            return (
              <View className="mb-3 rounded-2xl border border-forest-100 bg-white px-4 py-4">
                <Pressable
                  onPress={() => {
                    setPendingAnalysis({
                      result: {
                        productName: item.product_name,
                        score: item.score,
                        pros: item.pros,
                        cons: item.cons,
                        summary: item.summary,
                      },
                      imageUri: item.image_path,
                      scanId: item.id,
                      saved: true,
                      barcode: item.barcode,
                      productId: item.product_id,
                      species: item.species,
                    });
                    router.push('/(app)/result');
                  }}
                  className="flex-row items-center justify-between active:opacity-80"
                >
                  <JournalThumb uri={item.image_path} />
                  <View className="flex-1 pr-3">
                    <Text className="font-body-bold text-base text-forest-900">
                      {item.product_name}
                    </Text>
                    <Text className="mt-1 font-body text-xs text-forest-500">
                      {label ? `${label} · ` : ''}
                      {new Date(item.created_at).toLocaleString('uk-UA')}
                    </Text>
                    {fans.length > 0 ? (
                      <Text className="mt-2 font-body-medium text-xs text-forest-700">
                        {t('history.favoriteFor', {
                          names: fans.map((p) => p.name).join(', '),
                        })}
                      </Text>
                    ) : null}
                  </View>
                  <View
                    className="h-12 w-12 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${color}22` }}
                  >
                    <Text className="font-body-bold text-base" style={{ color }}>
                      {item.score}
                    </Text>
                  </View>
                </Pressable>
                <View className="mt-2 flex-row justify-end">
                  <IconButton
                    name="trash-outline"
                    color={brand.score.poor}
                    accessibilityLabel={t('history.delete')}
                    onPress={() => void onDeleteFood(item)}
                  />
                </View>
              </View>
            );
          }}
        />
      ) : kind === 'plant' ? (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#00A894"
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('journal.plantsEmptyTitle')}>
              <Text className="font-body text-sm leading-5 text-forest-600">
                {t('journal.plantsEmptyBody')}
              </Text>
              <View className="mt-3">
                <PrimaryButton
                  label={t('journal.goPlant')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/plant-safety')}
                />
              </View>
            </Section>
          }
          renderItem={({ item }) => {
            const tone = plantLevelTone(
              (['safe', 'mild', 'toxic', 'unknown'].includes(item.level)
                ? item.level
                : 'unknown') as PlantToxicityLevel,
            );
            return (
              <View className="mb-3 rounded-2xl border border-forest-100 bg-white px-4 py-4">
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/plant-result',
                      params: { id: item.id },
                    })
                  }
                  className="flex-row items-center active:opacity-80"
                >
                  <JournalThumb uri={item.photo_uri} />
                  <View className="flex-1 pr-2">
                    <Text className="font-body-bold text-base text-forest-900">
                      {item.name_uk ?? item.query_text ?? t('plants.title')}
                    </Text>
                    <Text className="mt-1 font-body text-xs text-forest-500">
                      {item.for_species === 'cat'
                        ? t('plants.speciesCat')
                        : t('plants.speciesDog')}
                      {' · '}
                      {new Date(item.created_at).toLocaleString('uk-UA')}
                    </Text>
                  </View>
                  <View
                    className={`max-w-[42%] rounded-full border px-2.5 py-1 ${tone.bg} ${tone.border}`}
                  >
                    <Text
                      className={`text-center font-body-bold text-[11px] ${tone.text}`}
                      numberOfLines={2}
                    >
                      {plantLevelLabel(item.level)}
                    </Text>
                  </View>
                </Pressable>
                <View className="mt-2 flex-row justify-end">
                  <IconButton
                    name="trash-outline"
                    color={brand.score.poor}
                    accessibilityLabel={t('history.delete')}
                    onPress={() => void onDeletePlant(item)}
                  />
                </View>
              </View>
            );
          }}
        />
      ) : (
        <FlatList
          data={breeds}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#00A894"
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('journal.breedsEmptyTitle')}>
              <Text className="font-body text-sm leading-5 text-forest-600">
                {t('journal.breedsEmptyBody')}
              </Text>
              <View className="mt-3">
                <PrimaryButton
                  label={t('journal.goBreed')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/breed-scan')}
                />
              </View>
            </Section>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl border border-forest-100 bg-white px-4 py-4">
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(app)/breed-result',
                    params: { id: item.id },
                  })
                }
                className="flex-row items-center active:opacity-80"
              >
                <JournalThumb uri={item.photoUri} />
                <View className="flex-1 pr-2">
                  <Text className="font-body-bold text-base text-forest-900">
                    {item.breedNameUk ?? item.breedName}
                  </Text>
                  <Text className="mt-1 font-body text-xs text-forest-500">
                    {item.species === 'cat'
                      ? t('breed.speciesCat')
                      : t('breed.speciesDog')}
                    {' · '}
                    {new Date(item.createdAt).toLocaleString('uk-UA')}
                  </Text>
                </View>
                <View className="rounded-full border border-forest-200 bg-forest-100 px-2.5 py-1">
                  <Text className="font-body-bold text-[11px] text-forest-800">
                    ~{Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              </Pressable>
              <View className="mt-2 flex-row justify-end">
                <IconButton
                  name="trash-outline"
                  color={brand.score.poor}
                  accessibilityLabel={t('history.delete')}
                  onPress={() => void onDeleteBreed(item)}
                />
              </View>
            </View>
          )}
        />
      )}
    </AppScreen>
  );
}
