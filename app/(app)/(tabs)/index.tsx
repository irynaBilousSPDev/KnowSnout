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

          {ACTIONS.map((action) => {
            const iconBg =
              action.kind === 'food'
                ? brand.accentTint
                : action.kind === 'plant'
                  ? brand.successTint
                  : brand.chipTrack;
            const iconColor =
              action.kind === 'food'
                ? brand.accentDark
                : action.kind === 'plant'
                  ? brand.successDark
                  : brand.ink;
            return (
            <Pressable
              key={action.kind}
              onPress={() => router.push(action.href as never)}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.actionIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={action.icon} size={22} color={iconColor} />
              </View>
              <View style={styles.actionCopy}>
                <Text style={styles.actionTitle}>{t(action.titleKey)}</Text>
                <Text style={styles.actionBody}>{t(action.bodyKey)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={brand.mutedSoft}
              />
            </Pressable>
            );
          })}

          <Pressable
            onPress={() => router.push('/(app)/(tabs)/history')}
            style={styles.historyLink}
          >
            <Text style={styles.historyLinkText}>{t('check.tabHistory')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.accentDark} />
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
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  recentHeading: {
    marginBottom: 10,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.ink,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingBottom: 4,
  },
  recentCard: {
    width: 64,
  },
  recentPlaceholder: {
    height: 64,
    width: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mutedSoft,
    backgroundColor: brand.chipTrack,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  recentImage: {
    height: 64,
    width: 64,
    borderRadius: 14,
    backgroundColor: brand.chipTrack,
  },
  browse: {
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
    fontSize: 9,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  recentLabel: {
    marginTop: 6,
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: brand.muted,
    textAlign: 'center',
  },
  addCard: {
    height: 64,
    width: 64,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mutedSoft,
    backgroundColor: brand.chipTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    marginTop: 14,
    marginBottom: 6,
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
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
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: brand.accentDark,
  },
  statLabel: {
    marginTop: 2,
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: brand.muted,
    textAlign: 'center',
  },
  statSafe: {
    color: brand.successDark,
  },
  actionCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
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
    marginRight: 12,
    height: 52,
    width: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCopy: { flex: 1, paddingRight: 8 },
  actionTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  actionBody: {
    marginTop: 3,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 17,
    color: brand.muted,
  },
  pressed: { opacity: 0.88 },
  historyLink: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  historyLinkText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.accentDark,
  },
});
