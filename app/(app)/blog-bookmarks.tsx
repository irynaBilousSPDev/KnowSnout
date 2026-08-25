import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getBlogArticle,
  getBlogCategory,
  listBookmarks,
  type BlogArticle,
} from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.23 — saved articles with filled bookmark */
export default function BlogBookmarksScreen() {
  const [articles, setArticles] = useState<BlogArticle[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listBookmarks().then((ids) => {
        setArticles(
          ids
            .map((id) => getBlogArticle(id))
            .filter((a): a is BlogArticle => Boolean(a)),
        );
      });
    }, []),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('blog.bookmarksTitle')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {articles.map((a) => {
            const cat = getBlogCategory(a.categoryId);
            return (
              <Pressable
                key={a.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/blog-article',
                    params: { id: a.id },
                  } as never)
                }
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={styles.thumb}>
                  <Ionicons
                    name="image-outline"
                    size={18}
                    color={brand.mutedSoft}
                  />
                  <Text style={styles.thumbHint}>{t('blog.articleThumb')}</Text>
                </View>
                <View style={styles.mid}>
                  <Text style={styles.title} numberOfLines={2}>
                    {a.title}
                  </Text>
                  <Text style={styles.cat}>{cat?.title ?? ''}</Text>
                </View>
                <Ionicons name="bookmark" size={22} color={brand.accent} />
              </Pressable>
            );
          })}
          {articles.length === 0 ? (
            <Text style={styles.empty}>{t('blog.bookmarksEmpty')}</Text>
          ) : null}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.9 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  thumbHint: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: brand.mutedSoft,
  },
  mid: { flex: 1, gap: 4 },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  cat: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
