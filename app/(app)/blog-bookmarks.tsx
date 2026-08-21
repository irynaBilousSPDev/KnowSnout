import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  getBlogArticle,
  listBookmarks,
  type BlogArticle,
} from '@/src/services/blog';
import { brand } from '@/src/theme/brand';

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
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('blog.bookmarksTitle')}
            subtitle={t('blog.bookmarksSubtitle')}
          />
          {articles.map((a) => (
            <ListRow
              key={a.id}
              title={a.title}
              subtitle={a.excerpt}
              leading={
                <Ionicons name="bookmark" size={22} color={brand.navy} />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/blog-article',
                  params: { id: a.id },
                } as never)
              }
            />
          ))}
          {articles.length === 0 ? (
            <Text style={styles.empty}>{t('blog.bookmarksEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  empty: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
