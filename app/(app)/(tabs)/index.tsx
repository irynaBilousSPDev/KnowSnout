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
  iconBg: string;
  iconColor: string;
}[] = [
  {
    kind: 'food',
    icon: 'restaurant-outline',
    titleKey: 'check.foodTitle',
    bodyKey: 'check.foodBody',
    href: '/(app)/scan-food',
    iconBg: brand.accentTint,
    iconColor: brand.accentDark,
  },
  {
    kind: 'plant',
    icon: 'leaf-outline',
    titleKey: 'check.plantTitle',
    bodyKey: 'check.plantBody',
    href: '/(app)/plant-safety',
    iconBg: brand.successTint,
    iconColor: brand.successDark,
  },
  {
    kind: 'breed',
    icon: 'paw-outline',
    titleKey: 'check.breedTitle',
    bodyKey: 'check.breedBody',
    href: '/(app)/breed-scan',
    iconBg: brand.creamDeep,
    iconColor: brand.ink,
  },
  {
    kind: 'compare',
    icon: 'git-compare-outline',
    titleKey: 'check.compareTitle',
    bodyKey: 'check.compareBody',
    href: '/(app)/compare-food',
    iconBg: brand.creamDeep,
    iconColor: brand.ink,
  },
];

function RecentThumb({
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
    <Pressable onPress={onPress} style={styles.recentItem}>
      {uri ? (
        <Image source={{ uri }} style={styles.recentImage} resizeMode="cover" />
      ) : (
        <View style={styles.recentPlaceholder}>
          <Text style={styles.recentPlaceholderText} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/** HTML phone “6 · Хаб Перевір”. */
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
                ? food.image_path
                  ? await resolveCheckImageUrl(food.image_path)
                  : food.image_path
                : null,
              href: '/(app)/scan-food',
            },
            {
              id: plant ? `p-${plant.id}` : 'empty-plant',
              kind: 'plant',
              label: t('check.kindPlant'),
              imageUri: plant
                ? plant.photo_uri
                  ? await resolveCheckImageUrl(plant.photo_uri)
                  : plant.photo_uri
                : null,
              href: '/(app)/plant-safety',
            },
            {
              id: breed ? `b-${breed.id}` : 'empty-breed',
              kind: 'breed',
              label: t('check.kindBreed'),
              imageUri: breed
                ? breed.photoUri
                  ? await resolveCheckImageUrl(breed.photoUri)
                  : breed.photoUri
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
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <AppChromeHeader />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <Text style={styles.title}>{t('tabs.scan')}</Text>

          <View>
            <Text style={styles.recentHeading}>{t('check.recent')}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.recentRow}
            >
              {recent.map((slot) => (
                <RecentThumb
                  key={slot.id}
                  label={slot.label}
                  imageUri={slot.imageUri}
                  onPress={() => router.push(slot.href as never)}
                />
              ))}
              <Pressable
                onPress={() => router.push('/(app)/scan-food')}
                style={styles.addCard}
                accessibilityRole="button"
                accessibilityLabel={t('check.foodTitle')}
              >
                <Text style={styles.addPlus}>+</Text>
              </Pressable>
            </ScrollView>
          </View>

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
              <View
                style={[styles.actionIcon, { backgroundColor: action.iconBg }]}
              >
                <Ionicons
                  name={action.icon}
                  size={24}
                  color={action.iconColor}
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

          <Pressable
            onPress={() => router.push('/(app)/(tabs)/history')}
            style={styles.historyLink}
          >
            <Text style={styles.historyLinkText}>{t('check.tabHistory')}</Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={brand.accentDark}
            />
          </Pressable>
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
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 2,
  },
  recentHeading: {
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recentItem: { width: 64 },
  recentPlaceholder: {
    height: 64,
    width: 64,
    borderRadius: brand.radius.md,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  recentPlaceholderText: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  recentImage: {
    height: 64,
    width: 64,
    borderRadius: brand.radius.md,
    backgroundColor: brand.creamDeep,
  },
  addCard: {
    height: 64,
    width: 64,
    borderRadius: brand.radius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: brand.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontFamily: fonts.body,
    fontSize: 22,
    color: brand.mutedSoft,
    lineHeight: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  statValue: {
    fontFamily: fonts.title,
    fontSize: 18,
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
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  actionIcon: {
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
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
  historyLink: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  historyLinkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accentDark,
  },
});
