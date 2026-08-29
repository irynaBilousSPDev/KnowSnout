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
import { DIRECTORY_HUB_CATEGORIES } from '@/src/services/directories';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** Extra hub entries beyond 06.01 six-tile mock. */
const EXTRA_HUB_TILES = [
  { id: 'behavior' as const },
  { id: 'shops' as const },
];

/** 06.01 · Хаб довідників — 6-tile grid + extra links */
const ICONS: Record<
  string,
  { icon: keyof typeof Ionicons.glyphMap; bg: string; fg: string }
> = {
  vets: { icon: 'medkit-outline', bg: brand.accentTint, fg: brand.accentDark },
  behavior: { icon: 'school-outline', bg: brand.accentTint, fg: brand.accentDark },
  breeders: { icon: 'star-outline', bg: brand.accentTint, fg: brand.accentDark },
  transport: { icon: 'car-outline', bg: brand.accentTint, fg: brand.accentDark },
  sitters: { icon: 'checkmark-outline', bg: brand.accentTint, fg: brand.accentDark },
  shops: { icon: 'bag-outline', bg: brand.accentTint, fg: brand.accentDark },
  insurance: { icon: 'shield-checkmark-outline', bg: brand.accentTint, fg: brand.accentDark },
  lodging: { icon: 'home-outline', bg: brand.accentTint, fg: brand.accentDark },
};

function openCategory(id: string) {
  if (id === 'transport') {
    router.push('/(app)/directory-carriers' as never);
    return;
  }
  if (id === 'vets') {
    router.push('/(app)/vet-hub' as never);
    return;
  }
  if (id === 'behavior') {
    router.push('/(app)/specialist-behavior' as never);
    return;
  }
  if (id === 'shops') {
    router.push({
      pathname: '/(app)/directory-list',
      params: { category: 'shops' },
    } as never);
    return;
  }
  router.push({
    pathname: '/(app)/directory-list',
    params: { category: id },
  } as never);
}

export default function DirectoriesHubScreen() {
  const [query, setQuery] = useState('');

  const { gridCats, extraCats } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filterCat = (id: string) => {
      if (!q) return true;
      const title = t(`directories.cat.${id}`).toLowerCase();
      const body = t(`directories.catBody.${id}`).toLowerCase();
      return title.includes(q) || body.includes(q);
    };
    return {
      gridCats: DIRECTORY_HUB_CATEGORIES.filter((cat) => filterCat(cat.id)),
      extraCats: EXTRA_HUB_TILES.filter((cat) => filterCat(cat.id)),
    };
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
            {gridCats.map((cat) => {
              const meta = ICONS[cat.id] ?? ICONS.vets;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => openCategory(cat.id)}
                  style={({ pressed }) => [
                    styles.tile,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.tileIcon, { backgroundColor: meta.bg }]}>
                    <Ionicons name={meta.icon} size={18} color={meta.fg} />
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

          {extraCats.length > 0 ? (
            <>
              <Text style={styles.extraLbl}>{t('directories.alsoSection')}</Text>
              {extraCats.map((cat) => {
                const meta = ICONS[cat.id] ?? ICONS.vets;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => openCategory(cat.id)}
                    style={({ pressed }) => [
                      styles.extraRow,
                      pressed && styles.pressed,
                    ]}
                  >
                    <View style={[styles.extraIcon, { backgroundColor: meta.bg }]}>
                      <Ionicons name={meta.icon} size={16} color={meta.fg} />
                    </View>
                    <View style={styles.extraCopy}>
                      <Text style={styles.extraTitle}>
                        {t(`directories.cat.${cat.id}`)}
                      </Text>
                      <Text style={styles.extraBody} numberOfLines={1}>
                        {t(`directories.catBody.${cat.id}`)}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={16}
                      color={brand.mutedSoft}
                    />
                  </Pressable>
                );
              })}
            </>
          ) : null}
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
  },
  title: {
    fontFamily: fonts.titleExtra,
    fontSize: 26,
    lineHeight: 32,
    color: brand.ink,
    letterSpacing: -0.3,
  },
  lead: {
    marginTop: 4,
    marginBottom: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
    padding: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    minHeight: 118,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    gap: 6,
  },
  pressed: { opacity: 0.9 },
  tileIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  tileBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.muted,
  },
  extraLbl: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  extraRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    marginBottom: 8,
  },
  extraIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraCopy: { flex: 1, minWidth: 0 },
  extraTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  extraBody: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
});
