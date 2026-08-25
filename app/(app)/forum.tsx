import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  listForumCategories,
  type ForumCategoryIcon,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

function CategoryIcon({ name }: { name: ForumCategoryIcon }) {
  if (name === 'cat') {
    return (
      <MaterialCommunityIcons name="cat" size={18} color={brand.ink} />
    );
  }
  const map: Record<Exclude<ForumCategoryIcon, 'cat'>, keyof typeof Ionicons.glyphMap> = {
    paw: 'paw-outline',
    bowl: 'restaurant-outline',
    heart: 'heart-outline',
  };
  return <Ionicons name={map[name]} size={18} color={brand.ink} />;
}

/** Screenshot 05.11 — category rows + teal CTA */
export default function ForumScreen() {
  const categories = listForumCategories();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('forum.title')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-category',
                  params: { id: c.id },
                } as never)
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.rowLeft}>
                <CategoryIcon name={c.icon} />
                <Text style={styles.rowTitle}>{c.title}</Text>
              </View>
              <View style={styles.chip}>
                <Text style={styles.chipText}>
                  {t('forum.threadCount', { count: c.threadCount })}
                </Text>
              </View>
            </Pressable>
          ))}

          <PrimaryButton
            label={`+ ${t('forum.newThread')}`}
            onPress={() => router.push('/(app)/forum-new' as never)}
            style={styles.addBtn}
          />

          <View style={styles.links}>
            {(
              [
                ['forum.search', '/(app)/forum-search'],
                ['forum.rules', '/(app)/forum-rules'],
                ['forum.notifications', '/(app)/forum-notifications'],
              ] as const
            ).map(([key, href]) => (
              <Pressable
                key={href}
                onPress={() => router.push(href as never)}
                hitSlop={6}
              >
                <Text style={styles.linkText}>{t(key)}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  pressed: { opacity: 0.88 },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.muted,
  },
  addBtn: { marginTop: 8 },
  links: {
    marginTop: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textDecorationLine: 'underline',
  },
});
