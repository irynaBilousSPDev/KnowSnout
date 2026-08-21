import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  addBlogComment,
  getBlogArticle,
  isBookmarked,
  listBlogComments,
  toggleBookmark,
  type BlogComment,
} from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

export default function BlogArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const article = id ? getBlogArticle(id) : null;
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [bm, list] = await Promise.all([
      isBookmarked(id),
      listBlogComments(id),
    ]);
    setBookmarked(bm);
    setComments(list);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (!article) {
    return (
      <AppScreen edges={['bottom']}>
      <AppChromeHeader />
        <View style={styles.pad}>
          <ScreenHeader title={t('blog.missing')} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={article.title}
            subtitle={t('blog.readMin', { n: article.readMinutes })}
          />
          <PrimaryButton
            label={
              bookmarked ? t('blog.unbookmark') : t('blog.bookmark')
            }
            variant="secondary"
            onPress={() =>
              void toggleBookmark(article.id).then((on) => {
                setBookmarked(on);
                notify(
                  t('common.ok'),
                  on ? t('blog.bookmarkOn') : t('blog.bookmarkOff'),
                );
              })
            }
          />
          <Text style={styles.body}>{article.body}</Text>

          <Text style={styles.section}>{t('blog.comments')}</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.comment}>
              <Text style={styles.author}>{c.author}</Text>
              <Text style={styles.commentBody}>{c.body}</Text>
            </View>
          ))}

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('blog.commentPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('blog.sendComment')}
            loading={busy}
            onPress={() => {
              if (!text.trim()) {
                notify(t('common.error'), t('blog.commentRequired'));
                return;
              }
              setBusy(true);
              void addBlogComment(article.id, text)
                .then(() => {
                  setText('');
                  return load();
                })
                .finally(() => setBusy(false));
            }}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  body: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: brand.ink,
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.muted,
  },
  comment: {
    marginBottom: 10,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    padding: 12,
  },
  author: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.navy,
  },
  commentBody: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  input: {
    marginTop: 8,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 80, textAlignVertical: 'top' },
  gap: { height: 12 },
});
