import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { DIRECTORY_CATEGORIES } from '@/src/services/directories';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** PDF F1 — equal category tiles on cream. */
const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  vets: 'medkit-outline',
  breeders: 'ribbon-outline',
  transport: 'car-outline',
  sitters: 'home-outline',
  insurance: 'shield-checkmark-outline',
  lodging: 'bed-outline',
};

export default function DirectoriesHubScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('tabs.directories')}</Text>
            <ProfileEntry />
          </View>
          <Text style={styles.lead}>{t('directories.lead')}</Text>

          <View style={styles.grid}>
            {DIRECTORY_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => {
                  if (cat.id === 'transport') {
                    router.push('/(app)/directory-carriers' as never);
                    return;
                  }
                  router.push({
                    pathname: '/(app)/directory-list',
                    params: { category: cat.id },
                  } as never);
                }}
                style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
              >
                <View style={styles.tileIcon}>
                  <Ionicons
                    name={ICONS[cat.id] ?? 'location-outline'}
                    size={22}
                    color={brand.sage}
                  />
                </View>
                <Text style={styles.tileTitle} numberOfLines={2}>
                  {t(`directories.cat.${cat.id}`)}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/(app)/directory-report' as never)}
            style={styles.reportLink}
          >
            <Ionicons
              name="warning-outline"
              size={18}
              color={brand.terracotta}
            />
            <Text style={styles.reportText}>{t('directories.reportFraud')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 34,
    color: brand.ink,
  },
  lead: {
    marginBottom: 18,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  pressed: { opacity: 0.88 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    minHeight: 112,
    borderRadius: brand.radius.lg,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  tileIcon: {
    marginBottom: 10,
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.sageTint,
  },
  tileTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  reportLink: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  reportText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.terracotta,
  },
});
