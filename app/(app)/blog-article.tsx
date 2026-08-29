import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  addBlogComment,
  getBlogArticle,
  getBlogCategory,
  isBookmarked,
  listBlogComments,
  toggleBookmark,
  type BlogComment,
} from '@/src/services/blog';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshots 05.21 + 05.22 — article + comments + composer */
export default function BlogArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const article = id ? getBlogArticle(id) : null;
  const category = article ? getBlogCategory(article.categoryId) : null;
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
        <ScrHeader title={t('blog.missing')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          <View style={styles.cover}>
            <Pressable
              onPress={() => router.back()}
              style={styles.coverBack}
              accessibilityRole="button"
              accessibilityLabel={t('common.back')}
            >
              <Ionicons name="chevron-back" size={18} color={brand.ink} />
            </Pressable>
            <Pressable
              onPress={() =>
                void toggleBookmark(article.id).then((on) => {
                  setBookmarked(on);
                  notify(
                    t('common.ok'),
                    on ? t('blog.bookmarkOn') : t('blog.bookmarkOff'),
                  );
                })
              }
              style={styles.coverBookmark}
              accessibilityRole="button"
              accessibilityLabel={
                bookmarked ? t('blog.unbookmark') : t('blog.bookmark')
              }
            >
              <Ionicons
                name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={brand.accent}
              />
            </Pressable>
            <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
            <Text style={styles.coverHint}>{t('blog.coverHint')}</Text>
            <Text style={styles.coverBrowse}>{t('blog.coverBrowse')}</Text>
          </View>

          {category ? (
            <View style={styles.catPill}>
              <Text style={styles.catText}>{category.title}</Text>
            </View>
          ) : null}

          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.meta}>
            {comments.length > 0
              ? t('blog.readCommentsMeta', {
                  n: article.readMinutes,
                  c: article.commentCount ?? comments.length,
                })
              : t('blog.readMeta', {
                  n: article.readMinutes,
                  author: article.authorLabel ?? t('blog.editorial'),
                })}
          </Text>

          <Text style={styles.body}>{article.body}</Text>

          {comments.length > 0 ? (
            <Text style={styles.bodyTail}>
              {t('blog.articleTail')}
            </Text>
          ) : null}

          <View style={styles.comments}>
            {comments.map((c) => (
              <View key={c.id} style={styles.comment}>
                <View style={styles.avatar} />
                <View style={styles.commentMid}>
                  <Text style={styles.author}>{c.author}</Text>
                  <Text style={styles.commentBody}>{c.body}</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder={t('blog.commentPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          <Pressable
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
            disabled={busy}
            style={[styles.send, busy && styles.sendDim]}
            accessibilityRole="button"
            accessibilityLabel={t('blog.sendComment')}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  cover: {
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  coverBack: {
    position: 'absolute',
    zIndex: 2,
    left: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverBookmark: {
    position: 'absolute',
    zIndex: 2,
    right: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  coverBrowse: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  catPill: {
    alignSelf: 'flex-start',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.mist,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 12,
  },
  catText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accent,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  meta: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  body: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: brand.ink,
  },
  bodyTail: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: brand.muted,
  },
  comments: {
    marginTop: 22,
    gap: 14,
  },
  comment: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
  },
  commentMid: { flex: 1, gap: 4 },
  author: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  commentBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.divider,
    backgroundColor: brand.canvas,
  },
  input: {
    flex: 1,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDim: { opacity: 0.55 },
});
