import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  listBlogArticles,
  listBlogCategories,
  type BlogArticle,
} from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Блог hub with category chips. */
export default function BlogScreen() {
  const categories = listBlogCategories();
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [articles, setArticles] = useState<BlogArticle[]>([]);

  useFocusEffect(
    useCallback(() => {
      setArticles(listBlogArticles(categoryId ?? undefined));
    }, [categoryId]),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('blog.title')}</Text>

          <PrimaryButton
            label={t('blog.bookmarks')}
            variant="secondary"
            onPress={() => router.push('/(app)/blog-bookmarks' as never)}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Pressable
              onPress={() => setCategoryId(null)}
              style={[styles.chip, !categoryId && styles.chipActive]}
            >
              <Text
                style={[styles.chipText, !categoryId && styles.chipTextActive]}
              >
                {t('blog.all')}
              </Text>
            </Pressable>
            {categories.map((c) => {
              const active = c.id === categoryId;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {c.title}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {articles.map((a) => (
            <ListRow
              key={a.id}
              title={a.title}
              subtitle={a.excerpt}
              meta={t('blog.readMin', { n: a.readMinutes })}
              leading={
                <View style={styles.leadIcon}>
                  <Ionicons
                    name="newspaper-outline"
                    size={18}
                    color={brand.accentDark}
                  />
                </View>
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/blog-article',
                  params: { id: a.id },
                } as never)
              }
            />
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
    gap: 12,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  chips: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: brand.successTint },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  chipTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  leadIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
