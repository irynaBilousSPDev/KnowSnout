import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { DIRECTORY_CATEGORIES } from '@/src/services/directories';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “F1 · Хаб довідників”. */
const ICONS: Record<
  string,
  {
    icon: keyof typeof Ionicons.glyphMap;
    tone: 'accent' | 'success' | 'neutral';
  }
> = {
  vets: { icon: 'medkit-outline', tone: 'accent' },
  breeders: { icon: 'ribbon-outline', tone: 'success' },
  transport: { icon: 'car-outline', tone: 'neutral' },
  sitters: { icon: 'checkmark-outline', tone: 'accent' },
  insurance: { icon: 'shield-checkmark-outline', tone: 'success' },
  lodging: { icon: 'bed-outline', tone: 'neutral' },
  shops: { icon: 'storefront-outline', tone: 'success' },
};

export default function DirectoriesHubScreen() {
  const [query, setQuery] = useState('');

  const cats = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DIRECTORY_CATEGORIES;
    return DIRECTORY_CATEGORIES.filter((cat) => {
      const title = t(`directories.cat.${cat.id}`).toLowerCase();
      const body = t(`directories.catBody.${cat.id}`).toLowerCase();
      return title.includes(q) || body.includes(q);
    });
  }, [query]);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('tabs.directories')}</Text>
          <Text style={styles.lead}>{t('directories.lead')}</Text>

          <View style={styles.search}>
            <Ionicons name="search-outline" size={16} color={brand.mutedSoft} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('directories.searchPlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          <View style={styles.grid}>
            {cats.map((cat) => {
              const meta = ICONS[cat.id] ?? {
                icon: 'location-outline' as const,
                tone: 'accent' as const,
              };
              const bg =
                meta.tone === 'accent'
                  ? brand.accentTint
                  : meta.tone === 'success'
                    ? brand.successTint
                    : brand.creamDeep;
              const fg =
                meta.tone === 'accent'
                  ? brand.accentDark
                  : meta.tone === 'success'
                    ? brand.successDark
                    : brand.ink;
              return (
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
                  style={({ pressed }) => [
                    styles.tile,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.tileIcon, { backgroundColor: bg }]}>
                    <Ionicons name={meta.icon} size={18} color={fg} />
                  </View>
                  <Text style={styles.tileTitle} numberOfLines={2}>
                    {t(`directories.cat.${cat.id}`)}
                  </Text>
                  <Text style={styles.tileBody} numberOfLines={2}>
                    {t(`directories.catBody.${cat.id}`)}
                  </Text>
                </Pressable>
              );
            })}
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    marginTop: -4,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.ink,
    padding: 0,
  },
  pressed: { opacity: 0.88 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  tile: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    gap: 8,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  tileIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  tileBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  reportLink: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  reportText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.terracotta,
  },
});
