import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { Section } from '@/src/components/Section';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { getScoreTone, SCORE_COLORS } from '@/src/constants/analysis';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { setPendingAnalysis } from '@/src/lib/resultStore';
import {
  deleteBreedHistoryItem,
  listBreedHistory,
  type BreedHistoryItem,
} from '@/src/services/breedId';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { listPets } from '@/src/services/pets';
import {
  deletePlantHistoryItem,
  listPlantHistory,
  type PlantHistoryItem,
} from '@/src/services/plants';
import { deleteScan, listScans } from '@/src/services/scans';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { PetSpecies, ScanRow } from '@/src/types/scan';
import type { PlantToxicityLevel } from '@/src/types/plant';

type Mode = 'new' | 'history';
type KindFilter = 'all' | 'food' | 'plant' | 'breed';
type SpeciesFilter = 'all' | 'dog' | 'cat' | 'bird';

type HistoryRow =
  | { type: 'food'; item: ScanRow }
  | { type: 'plant'; item: PlantHistoryItem }
  | { type: 'breed'; item: BreedHistoryItem };

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)));
  if (days <= 1) return t('check.agoDays', { count: Math.max(1, days || 1) });
  if (days < 7) return t('check.agoDays', { count: days });
  if (days < 14) return t('check.agoWeek');
  return t('check.agoWeeks', { count: Math.round(days / 7) });
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

function Thumb({ uri }: { uri?: string | null }) {
  if (uri && isNativeSafeImageUri(uri)) {
    return (
      <Image source={{ uri }} style={styles.thumbImage} resizeMode="cover" />
    );
  }
  return (
    <View style={styles.thumbDash}>
      <Text style={styles.thumbDashIcon}>▢</Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function JournalScreen() {
  const [mode, setMode] = useState<Mode>('history');
  const [kind, setKind] = useState<KindFilter>('all');
  const [species, setSpecies] = useState<SpeciesFilter>('dog');
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [plants, setPlants] = useState<PlantHistoryItem[]>([]);
  const [breeds, setBreeds] = useState<BreedHistoryItem[]>([]);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [scanData, petData, plantData, breedData] = await Promise.all([
        listScans(),
        listPets(),
        listPlantHistory(),
        listBreedHistory(),
      ]);
      const [scansResolved, plantsResolved, breedsResolved] = await Promise.all([
        Promise.all(
          scanData.map(async (s) => {
            if (!s.image_path) return s;
            const url = await resolveCheckImageUrl(s.image_path);
            return { ...s, image_path: url ?? s.image_path };
          }),
        ),
        Promise.all(
          plantData.map(async (p) => {
            if (!p.photo_uri) return p;
            const url = await resolveCheckImageUrl(p.photo_uri);
            return { ...p, photo_uri: url ?? p.photo_uri };
          }),
        ),
        Promise.all(
          breedData.map(async (b) => {
            if (!b.photoUri) return b;
            const url = await resolveCheckImageUrl(b.photoUri);
            return { ...b, photoUri: url ?? b.photoUri };
          }),
        ),
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

  const rows = useMemo(() => {
    const out: HistoryRow[] = [];
    if (kind === 'all' || kind === 'food') {
      for (const item of scans) {
        if (species === 'all') out.push({ type: 'food', item });
        else if (species === 'bird') continue;
        else if ((item.species ?? 'unknown') === species || !item.species) {
          out.push({ type: 'food', item });
        }
      }
    }
    if (kind === 'all' || kind === 'plant') {
      for (const item of plants) {
        if (species === 'all' || species === 'bird') {
          out.push({ type: 'plant', item });
        } else if (item.for_species === species) {
          out.push({ type: 'plant', item });
        }
      }
    }
    if (kind === 'all' || kind === 'breed') {
      for (const item of breeds) {
        if (species === 'all') out.push({ type: 'breed', item });
        else if (species === 'bird') continue;
        else if (item.species === species) out.push({ type: 'breed', item });
      }
    }
    return out.sort((a, b) => {
      const da =
        a.type === 'food'
          ? a.item.created_at
          : a.type === 'plant'
            ? a.item.created_at
            : a.item.createdAt;
      const db =
        b.type === 'food'
          ? b.item.created_at
          : b.type === 'plant'
            ? b.item.created_at
            : b.item.createdAt;
      return db.localeCompare(da);
    });
  }, [scans, plants, breeds, kind, species]);

  const onDelete = async (row: HistoryRow) => {
    const name =
      row.type === 'food'
        ? row.item.product_name
        : row.type === 'plant'
          ? (row.item.name_uk ?? row.item.query_text ?? t('plants.title'))
          : (row.item.breedNameUk ?? row.item.breedName);
    const ok = await confirmAction({
      title: t('history.deleteTitle'),
      message: t('history.deleteMessage', { name }),
      confirmLabel: t('history.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      if (row.type === 'food') {
        await deleteScan(row.item.id);
        setScans((prev) => prev.filter((s) => s.id !== row.item.id));
      } else if (row.type === 'plant') {
        await deletePlantHistoryItem(row.item.id);
        setPlants((prev) => prev.filter((p) => p.id !== row.item.id));
      } else {
        await deleteBreedHistoryItem(row.item.id);
        setBreeds((prev) => prev.filter((b) => b.id !== row.item.id));
      }
    } catch (err) {
      Alert.alert(
        t('history.deleteFailed'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  if (loading) return <LoadingState message={t('history.loading')} />;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.scan')}</Text>

        <SegmentedControl
          options={[
            { id: 'new', label: t('check.tabNew') },
            { id: 'history', label: t('check.tabHistory') },
          ]}
          value={mode}
          onChange={(id) => {
            if (id === 'new') {
              setMode('new');
              router.replace('/(app)/(tabs)');
              return;
            }
            setMode('history');
          }}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(
            [
              ['dog', t('history.filterDog')],
              ['cat', t('history.filterCat')],
              ['bird', t('check.filterBird')],
              ['all', t('check.filterAllSpecies')],
            ] as const
          ).map(([id, label]) => (
            <Chip
              key={id}
              label={label}
              active={species === id}
              onPress={() => setSpecies(id)}
            />
          ))}
        </ScrollView>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {(
            [
              ['food', t('journal.kindFood')],
              ['plant', t('journal.kindPlant')],
              ['breed', t('journal.kindBreed')],
              ['all', t('history.filterAll')],
            ] as const
          ).map(([id, label]) => (
            <Chip
              key={id}
              label={label}
              active={kind === id}
              onPress={() => setKind(id)}
            />
          ))}
        </ScrollView>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => `${row.type}-${row.item.id}`}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={brand.accent}
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('history.emptyTitle')}>
              <Text style={styles.emptyBody}>{t('history.emptyBody')}</Text>
              <View style={{ marginTop: 12 }}>
                <PrimaryButton
                  label={t('journal.goFood')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/scan-food')}
                />
              </View>
            </Section>
          }
          ListFooterComponent={
            rows.length > 0 ? (
              <Text style={styles.swipeHint}>{t('check.swipeDelete')}</Text>
            ) : null
          }
          renderItem={({ item: row }) => {
            if (row.type === 'food') {
              const item = row.item;
              const tone = getScoreTone(item.score);
              const color = SCORE_COLORS[tone];
              const petName =
                pets.find((p) => p.favorite_product_id === item.product_id)
                  ?.name ?? pets[0]?.name;
              return (
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
                  onLongPress={() => void onDelete(row)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed,
                  ]}
                >
                  <Thumb uri={item.image_path} />
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.product_name}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {petName
                        ? t('check.foodForPet', { name: petName })
                        : t('journal.kindFood')}
                      {' · '}
                      {timeAgo(item.created_at)}
                    </Text>
                  </View>
                  <View
                    style={[styles.badge, { backgroundColor: `${color}22` }]}
                  >
                    <Text style={[styles.badgeText, { color }]}>
                      {(item.score / 20).toFixed(1)}
                    </Text>
                  </View>
                </Pressable>
              );
            }
            if (row.type === 'plant') {
              const item = row.item;
              return (
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/plant-result',
                      params: { id: item.id },
                    })
                  }
                  onLongPress={() => void onDelete(row)}
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed,
                  ]}
                >
                  <Thumb uri={item.photo_uri} />
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.name_uk ?? item.query_text ?? t('plants.title')}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {t('check.kindPlant')} · {timeAgo(item.created_at)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.badgeWide,
                      {
                        backgroundColor:
                          item.level === 'safe'
                            ? brand.forestTint
                            : brand.roseTint,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        {
                          color:
                            item.level === 'safe'
                              ? brand.forest
                              : brand.score.poor,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {plantLevelLabel(item.level)}
                    </Text>
                  </View>
                </Pressable>
              );
            }
            const item = row.item;
            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(app)/breed-result',
                    params: { id: item.id },
                  })
                }
                onLongPress={() => void onDelete(row)}
                style={({ pressed }) => [
                  styles.card,
                  pressed && styles.pressed,
                ]}
              >
                <Thumb uri={item.photoUri} />
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.breedNameUk ?? item.breedName}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {t('check.kindBreed')} · {timeAgo(item.createdAt)}
                  </Text>
                </View>
                <View style={styles.badgeMuted}>
                  <Text style={styles.badgeMutedText}>
                    {Math.round(item.confidence * 100)}%
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8, gap: 12 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 0,
  },
  chipRow: { flexDirection: 'row', gap: 8, paddingBottom: 0 },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: {
    backgroundColor: brand.successTint,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  chipTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1, gap: 0 },
  card: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.9 },
  thumbDash: {
    height: 52,
    width: 52,
    borderRadius: 12,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  thumbDashIcon: { color: brand.mutedSoft, fontSize: 18 },
  thumbImage: {
    height: 52,
    width: 52,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: brand.creamDeep,
  },
  cardCopy: { flex: 1, paddingRight: 8 },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  cardMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  badge: {
    minWidth: 40,
    borderRadius: brand.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: brand.accentTint,
  },
  badgeWide: {
    maxWidth: 110,
    borderRadius: brand.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeMuted: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  badgeMutedText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  swipeHint: {
    marginTop: 6,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
});
