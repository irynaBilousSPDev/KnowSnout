import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import {
  formatRelativeAgo,
  scoreOutOfFive,
} from '@/src/lib/relativeTime';
import { listBreedHistory } from '@/src/services/breedId';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { listPets } from '@/src/services/pets';
import { listPlantHistory } from '@/src/services/plants';
import { listScans } from '@/src/services/scans';
import { brand, fonts } from '@/src/theme/brand';

type ActionKind = 'food' | 'plant' | 'breed' | 'compare';

type RecentSlot = {
  id: string;
  kind: 'food' | 'plant' | 'breed';
  title: string;
  meta: string;
  imageUri?: string | null;
  createdAt: string;
};

const ACTIONS: {
  kind: ActionKind;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  bodyKey: string;
  href: string;
}[] = [
  {
    kind: 'food',
    icon: 'restaurant-outline',
    titleKey: 'check.foodTitle',
    bodyKey: 'check.foodBody',
    href: '/(app)/scan-food',
  },
  {
    kind: 'plant',
    icon: 'leaf-outline',
    titleKey: 'check.plantTitle',
    bodyKey: 'check.plantBody',
    href: '/(app)/plant-safety',
  },
  {
    kind: 'breed',
    icon: 'home-outline',
    titleKey: 'check.breedTitle',
    bodyKey: 'check.breedBody',
    href: '/(app)/breed-scan',
  },
  {
    kind: 'compare',
    icon: 'git-compare-outline',
    titleKey: 'check.compareTitle',
    bodyKey: 'check.compareBody',
    href: '/(app)/compare-food',
  },
];

function RecentThumb({
  title,
  meta,
  imageUri,
  onPress,
}: {
  title: string;
  meta: string;
  imageUri?: string | null;
  onPress: () => void;
}) {
  const uri = imageUri && isNativeSafeImageUri(imageUri) ? imageUri : null;
  return (
    <Pressable onPress={onPress} style={styles.recentItem}>
      {uri ? (
        <Image source={{ uri }} style={styles.recentImage} resizeMode="cover" />
      ) : (
        <View style={styles.recentPlaceholder}>
          <Ionicons name="image-outline" size={22} color={brand.mutedSoft} />
          <Text style={styles.recentPlaceholderText} numberOfLines={1}>
            {t('check.photoPlaceholder')}
          </Text>
        </View>
      )}
      <Text style={styles.recentTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.recentMeta} numberOfLines={1}>
        {meta}
      </Text>
    </Pressable>
  );
}

/** 02.01 Hub «Перевір» — recent, stats, menu; logic from local scans/plants/breeds. */
export default function CheckHubScreen() {
  const [petCount, setPetCount] = useState(0);
  const [checkCount, setCheckCount] = useState(0);
  const [safePct, setSafePct] = useState<number | null>(null);
  const [recent, setRecent] = useState<RecentSlot[]>([]);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        try {
          const [pets, scans, plants, breeds] = await Promise.all([
            listPets(),
            listScans(),
            listPlantHistory(),
            listBreedHistory(),
          ]);
          if (!alive) return;

          const total = scans.length + plants.length + breeds.length;
          const safeFood = scans.filter((s) => s.score >= 70).length;
          const safePlant = plants.filter((p) => p.level === 'safe').length;
          const safeN = safeFood + safePlant;
          const denom = scans.length + plants.length;

          setPetCount(pets.length);
          setCheckCount(total);
          setSafePct(denom > 0 ? Math.round((safeN / denom) * 100) : null);

          const merged: RecentSlot[] = [];

          await Promise.all(
            scans.map(async (food) => {
              const when = formatRelativeAgo(food.created_at);
              merged.push({
                id: `f-${food.id}`,
                kind: 'food',
                title: food.product_name.split(' ').slice(0, 2).join(' '),
                meta: t('check.recentScore', {
                  score: scoreOutOfFive(food.score),
                  when,
                }),
                imageUri: food.image_path
                  ? await resolveCheckImageUrl(food.image_path)
                  : food.image_path,
                createdAt: food.created_at,
              });
            }),
          );
          await Promise.all(
            plants.map(async (plant) => {
              const when = formatRelativeAgo(plant.created_at);
              merged.push({
                id: `p-${plant.id}`,
                kind: 'plant',
                title: plant.name_uk ?? plant.query_text ?? t('check.kindPlant'),
                meta:
                  plant.level === 'safe'
                    ? t('check.recentSafe', { when })
                    : `${t('plants.verdictToxicShort')} · ${when}`,
                imageUri: plant.photo_uri
                  ? await resolveCheckImageUrl(plant.photo_uri)
                  : plant.photo_uri,
                createdAt: plant.created_at,
              });
            }),
          );
          await Promise.all(
            breeds.map(async (breed) => {
              const when = formatRelativeAgo(breed.createdAt);
              merged.push({
                id: `b-${breed.id}`,
                kind: 'breed',
                title: breed.breedNameUk ?? breed.breedName,
                meta: t('check.recentBreed', {
                  pct: Math.round(breed.confidence * 100),
                  when,
                }),
                imageUri: breed.photoUri
                  ? await resolveCheckImageUrl(breed.photoUri)
                  : breed.photoUri,
                createdAt: breed.createdAt,
              });
            }),
          );

          merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
          setRecent(merged.slice(0, 4));
        } catch {
          if (!alive) return;
          setPetCount(0);
          setCheckCount(0);
          setSafePct(null);
          setRecent([]);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  const openRecent = (slot: RecentSlot) => {
    if (slot.kind === 'food') {
      void (async () => {
        const scans = await listScans();
        const id = slot.id.replace(/^f-/, '');
        const food = scans.find((s) => s.id === id);
        if (food) {
          const { setPendingAnalysis } = await import('@/src/lib/resultStore');
          setPendingAnalysis({
            result: {
              productName: food.product_name,
              score: food.score,
              pros: food.pros,
              cons: food.cons,
              summary: food.summary,
            },
            imageUri: food.image_path,
            scanId: food.id,
            saved: true,
            barcode: food.barcode,
            productId: food.product_id,
            species: food.species,
          });
        }
        router.push('/(app)/result');
      })();
      return;
    }
    if (slot.kind === 'plant') {
      router.push({
        pathname: '/(app)/plant-result',
        params: { id: slot.id.replace(/^p-/, '') },
      });
      return;
    }
    router.push({
      pathname: '/(app)/breed-result',
      params: { id: slot.id.replace(/^b-/, '') },
    });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <AppChromeHeader
          trailing="bell"
          bellCount={3}
          onBellPress={() => router.push('/(app)/notifications' as never)}
        />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.title}>{t('tabs.scan')}</Text>

          <View style={styles.recentHead}>
            <Text style={styles.recentHeading}>{t('check.recent')}</Text>
            <Pressable
              onPress={() => router.push('/(app)/(tabs)/history')}
              hitSlop={8}
            >
              <Text style={styles.allHistory}>{t('check.allHistory')}</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRow}
          >
            {recent.length === 0 ? (
              <Pressable
                onPress={() => router.push('/(app)/scan-food')}
                style={styles.recentItem}
              >
                <View style={styles.recentPlaceholder}>
                  <Ionicons
                    name="add"
                    size={24}
                    color={brand.mutedSoft}
                  />
                </View>
                <Text style={styles.recentTitle}>{t('check.foodTitle')}</Text>
                <Text style={styles.recentMeta}>{t('check.tabNew')}</Text>
              </Pressable>
            ) : (
              recent.map((slot) => (
                <RecentThumb
                  key={slot.id}
                  title={slot.title}
                  meta={slot.meta}
                  imageUri={slot.imageUri}
                  onPress={() => openRecent(slot)}
                />
              ))
            )}
          </ScrollView>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statAccent]}>
                {checkCount}
              </Text>
              <Text style={styles.statLabel}>{t('check.statChecks')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statSafe]}>
                {safePct != null ? `${safePct}%` : '—'}
              </Text>
              <Text style={styles.statLabel}>{t('check.statSafe')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{petCount}</Text>
              <Text style={styles.statLabel}>{t('check.statPets')}</Text>
            </View>
          </View>

          {ACTIONS.map((action) => (
            <Pressable
              key={action.kind}
              onPress={() => router.push(action.href as never)}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIcon}>
                <Ionicons
                  name={action.icon}
                  size={22}
                  color={brand.accentDark}
                />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{t(action.titleKey)}</Text>
                <Text style={styles.actionBody}>{t(action.bodyKey)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 28,
    lineHeight: 34,
    color: brand.ink,
    marginBottom: 4,
  },
  recentHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: -4,
  },
  recentHeading: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  allHistory: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accent,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingBottom: 2,
  },
  recentItem: { width: 76 },
  recentPlaceholder: {
    height: 76,
    width: 76,
    borderRadius: 14,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    gap: 2,
  },
  recentPlaceholderText: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  recentImage: {
    height: 76,
    width: 76,
    borderRadius: 14,
    backgroundColor: brand.creamDeep,
  },
  recentTitle: {
    marginTop: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.ink,
  },
  recentMeta: {
    marginTop: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.ink,
  },
  statAccent: { color: brand.accentDark },
  statSafe: { color: brand.successDark },
  statLabel: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
    textAlign: 'center',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
  },
  actionIcon: {
    height: 48,
    width: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.accentTint,
  },
  actionCopy: { flex: 1 },
  actionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  actionBody: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 17,
    color: brand.muted,
  },
  pressed: { opacity: 0.88 },
});
