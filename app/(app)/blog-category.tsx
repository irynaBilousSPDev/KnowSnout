import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getBlogCategory,
  listBlogArticles,
} from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.20 — horizontal article rows in category */
export default function BlogCategoryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const category = id ? getBlogCategory(id) : null;
  const articles = listBlogArticles(id);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={category?.title ?? t('blog.title')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {articles.map((a) => (
            <Pressable
              key={a.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/blog-article',
                  params: { id: a.id },
                } as never)
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <View style={styles.thumb}>
                <Ionicons name="image-outline" size={18} color={brand.mutedSoft} />
                <Text style={styles.thumbHint}>{t('blog.articleThumb')}</Text>
              </View>
              <View style={styles.mid}>
                <Text style={styles.title} numberOfLines={2}>
                  {a.title}
                </Text>
                <Text style={styles.meta}>
                  {t('blog.readMin', { n: a.readMinutes })}
                </Text>
              </View>
            </Pressable>
          ))}
          {articles.length === 0 ? (
            <Text style={styles.empty}>{t('blog.missing')}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  pressed: { opacity: 0.9 },
  thumb: {
    width: 64,
    height: 64,
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
  meta: {
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
