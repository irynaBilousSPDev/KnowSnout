import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { DIRECTORY_CATEGORIES } from '@/src/services/directories';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

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
          <HubHero
            brandMark
            title={t('tabs.directories')}
            lead={t('directories.lead')}
            right={<ProfileEntry />}
          />

          <Pressable
            onPress={() => router.push('/(app)/directory-carriers' as never)}
            style={({ pressed }) => [
              styles.feature,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.featureIcon}>
              <Ionicons name="bus-outline" size={24} color="#FFFFFF" />
            </View>
            <View style={styles.featureCopy}>
              <Text style={styles.featureTitle}>
                {t('directories.carriersTitle')}
              </Text>
              <Text style={styles.featureBody}>
                {t('directories.carriersHubBody')}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={brand.mistBorder}
            />
          </Pressable>

          <Text style={styles.section}>{t('directories.hint')}</Text>
          <View style={styles.grid}>
            {DIRECTORY_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/directory-list',
                    params: { category: cat.id },
                  } as never)
                }
                style={({ pressed }) => [
                  styles.tile,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.tileIcon}>
                  <Ionicons
                    name={ICONS[cat.id] ?? 'location-outline'}
                    size={22}
                    color={brand.navy}
                  />
                </View>
                <Text style={styles.tileTitle} numberOfLines={2}>
                  {t(`directories.cat.${cat.id}`)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  pressed: { opacity: 0.88 },
  feature: {
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: brand.navy,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  featureIcon: {
    marginRight: 12,
    height: 44,
    width: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  featureCopy: { flex: 1, paddingRight: 8 },
  featureTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  featureBody: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.78)',
  },
  section: {
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '47.5%',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    minHeight: 104,
  },
  tileIcon: {
    marginBottom: 10,
    height: 36,
    width: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.forestTint,
  },
  tileTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    lineHeight: 18,
    color: brand.ink,
  },
});
