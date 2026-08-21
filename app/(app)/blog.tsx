import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  listBlogArticles,
  listBlogCategories,
  type BlogArticle,
} from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

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
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero title={t('blog.title')} lead={t('blog.subtitle')} />
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
              <Text style={[styles.chipText, !categoryId && styles.chipTextActive]}>
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
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
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
                <Ionicons name="newspaper-outline" size={22} color={brand.navy} />
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
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  chips: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.surfaceElevated,
      },
  chipActive: {
    backgroundColor: brand.navy,
    borderColor: brand.navy,
  },
  chipText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.navy,
  },
  chipTextActive: { color: '#fff' },
});
