import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { listForumCategories } from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “35 · Форум: категорії”. */
export default function ForumScreen() {
  const categories = listForumCategories();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('forum.title')}</Text>

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
                <Ionicons
                  name="chatbubbles-outline"
                  size={17}
                  color={brand.ink}
                />
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

          <Text style={styles.section}>{t('check.moreSection')}</Text>
          {(
            [
              ['forum.search', '/(app)/forum-search'],
              ['forum.rules', '/(app)/forum-rules'],
              ['forum.notifications', '/(app)/forum-notifications'],
            ] as const
          ).map(([key, href]) => (
            <Pressable
              key={href}
              style={styles.linkRow}
              onPress={() => router.push(href as never)}
            >
              <Text style={styles.linkText}>{t(key)}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
          ))}
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
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  pressed: { opacity: 0.88 },
  rowLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
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
    color: brand.ink,
  },
  addBtn: { marginTop: 6 },
  section: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accentDark,
  },
});
