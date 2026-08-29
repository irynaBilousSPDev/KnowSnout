import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { listBlogCategories } from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.19 — category cards with dashed image area */
export default function BlogScreen() {
  const categories = listBlogCategories();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('blog.title')}
        right={
          <Pressable
            onPress={() => router.push('/(app)/blog-bookmarks' as never)}
            style={styles.bookmarkBtn}
            accessibilityRole="button"
            accessibilityLabel={t('blog.bookmarks')}
          >
            <Ionicons name="bookmark-outline" size={18} color={brand.accent} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/blog-category',
                  params: { id: c.id },
                } as never)
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.cover}>
                <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
                <Text style={styles.coverHint}>{t('blog.coverHint')}</Text>
                <Text style={styles.coverBrowse}>{t('blog.coverBrowse')}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.cardTitle}>{c.title}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bookmarkBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.9 },
  cover: {
    minHeight: 140,
    margin: 12,
    marginBottom: 0,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  coverHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  coverBrowse: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
});
