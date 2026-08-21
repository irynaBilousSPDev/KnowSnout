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
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { listBreedHistory } from '@/src/services/breedId';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { listPets } from '@/src/services/pets';
import { listPlantHistory } from '@/src/services/plants';
import { listScans } from '@/src/services/scans';
import { brand } from '@/src/theme/brand';

type ActionKind = 'food' | 'plant' | 'breed' | 'compare';

type RecentSlot = {
  id: string;
  kind: 'food' | 'plant' | 'breed';
  label: string;
  imageUri?: string | null;
  href: string;
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
    icon: 'paw-outline',
    titleKey: 'check.breedTitle',
    bodyKey: 'check.breedBody',
    href: '/(app)/breed-scan',
  },
  {
    kind: 'compare',
    icon: 'list-outline',
    titleKey: 'check.compareTitle',
    bodyKey: 'check.compareBody',
    href: '/(app)/compare-food',
  },
];

function DashedThumb({
  label,
  imageUri,
  onPress,
}: {
  label: string;
  imageUri?: string | null;
  onPress: () => void;
}) {
  const uri = imageUri && isNativeSafeImageUri(imageUri) ? imageUri : null;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.recentCard, pressed && styles.pressed]}
    >
      {uri ? (
        <Image source={{ uri }} style={styles.recentImage} resizeMode="cover" />
      ) : (
        <View style={styles.recentPlaceholder}>
          <Ionicons name="image-outline" size={22} color={brand.mutedSoft} />
          <Text style={styles.browse}>{t('check.browseFiles')}</Text>
        </View>
      )}
      <Text style={styles.recentLabel} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

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

          const food = scans[0];
          const plant = plants[0];
          const breed = breeds[0];

          const slots: RecentSlot[] = [
            {
              id: food ? `f-${food.id}` : 'empty-food',
              kind: 'food',
              label: t('check.foodTitle'),
              imageUri: food
                ? (food.image_path
                    ? await resolveCheckImageUrl(food.image_path)
                    : food.image_path)
                : null,
              href: '/(app)/scan-food',
            },
            {
              id: plant ? `p-${plant.id}` : 'empty-plant',
              kind: 'plant',
              label: t('check.kindPlant'),
              imageUri: plant
                ? (plant.photo_uri
                    ? await resolveCheckImageUrl(plant.photo_uri)
                    : plant.photo_uri)
                : null,
              href: '/(app)/plant-safety',
            },
            {
              id: breed ? `b-${breed.id}` : 'empty-breed',
              kind: 'breed',
              label: t('check.kindBreed'),
              imageUri: breed
                ? (breed.photoUri
                    ? await resolveCheckImageUrl(breed.photoUri)
                    : breed.photoUri)
                : null,
              href: '/(app)/breed-scan',
            },
          ];
          setRecent(slots);
        } catch {
          if (!alive) return;
          setPetCount(0);
          setCheckCount(0);
          setSafePct(null);
          setRecent([
            {
              id: 'empty-food',
              kind: 'food',
              label: t('check.foodTitle'),
              href: '/(app)/scan-food',
            },
            {
              id: 'empty-plant',
              kind: 'plant',
              label: t('check.kindPlant'),
              href: '/(app)/plant-safety',
            },
            {
              id: 'empty-breed',
              kind: 'breed',
              label: t('check.kindBreed'),
              href: '/(app)/breed-scan',
            },
          ]);
        }
      })();
      return () => {
        alive = false;
      };
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.scroll}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('tabs.scan')}</Text>
            <ProfileEntry />
          </View>

          <Text style={styles.recentHeading}>{t('check.recent')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recentRow}
          >
            {recent.map((slot) => (
              <DashedThumb
                key={slot.id}
                label={slot.label}
                imageUri={slot.imageUri}
                onPress={() => router.push(slot.href as never)}
              />
            ))}
            <Pressable
              onPress={() => router.push('/(app)/scan-food')}
              style={({ pressed }) => [
                styles.addCard,
                pressed && styles.pressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t('check.foodTitle')}
            >
              <Ionicons name="add" size={28} color={brand.forest} />
            </Pressable>
          </ScrollView>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{checkCount}</Text>
              <Text style={styles.statLabel}>{t('check.statChecks')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, styles.statSafe]}>
                {safePct != null ? `${safePct}%` : '—'}
              </Text>
              <Text style={[styles.statLabel, styles.statSafe]}>
                {t('check.statSafe')}
              </Text>
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
                <Ionicons name={action.icon} size={24} color={brand.forest} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{t(action.titleKey)}</Text>
                <Text style={styles.actionBody}>{t(action.bodyKey)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={brand.mistBorder}
              />
            </Pressable>
          ))}

          <Pressable
            onPress={() => router.push('/(app)/(tabs)/history')}
            style={styles.historyLink}
          >
            <Text style={styles.historyLinkText}>{t('check.tabHistory')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.forest} />
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  title: {
    fontFamily: 'Caprasimo_400Regular',
    fontSize: 34,
    lineHeight: 40,
    color: brand.ink,
    letterSpacing: -0.4,
  },
  recentHeading: {
    marginBottom: 10,
    fontFamily: 'Figtree_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 4,
  },
  recentCard: {
    width: 88,
  },
  recentPlaceholder: {
    height: 88,
    width: 88,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  recentImage: {
    height: 88,
    width: 88,
    borderRadius: 16,
    backgroundColor: brand.mist,
  },
  browse: {
    marginTop: 4,
    fontFamily: 'Figtree_400Regular',
    fontSize: 10,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  recentLabel: {
    marginTop: 6,
    fontFamily: 'Figtree_500Medium',
    fontSize: 12,
    color: brand.muted,
    textAlign: 'center',
  },
  addCard: {
    height: 88,
    width: 88,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 18,
    color: brand.ink,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: 'Figtree_400Regular',
    fontSize: 11,
    color: brand.muted,
    textAlign: 'center',
  },
  statSafe: {
    color: brand.forest,
  },
  actionCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  actionIcon: {
    marginRight: 12,
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.forestTint,
  },
  actionCopy: { flex: 1, paddingRight: 8 },
  actionTitle: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  actionBody: {
    marginTop: 4,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  pressed: { opacity: 0.88 },
  historyLink: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  historyLinkText: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 14,
    color: brand.forest,
  },
});
