import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  addStoryComment,
  deleteStoryComment,
  formatStoryTimeAgo,
  getStoryPost,
  listStoryComments,
} from '@/src/services/stories';
import { brand, fonts } from '@/src/theme/brand';
import type { StoryComment, StoryPost } from '@/src/types/story';

/** HTML kit · Коментарі — Manrope title, white r14 cards, accent CTA. */
export default function StoryCommentsScreen() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const postId = typeof params.postId === 'string' ? params.postId : undefined;

  const [post, setPost] = useState<StoryPost | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!postId) {
      setError(t('stories.postNotFound'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextPost, nextComments] = await Promise.all([
        getStoryPost(postId),
        listStoryComments(postId),
      ]);
      if (!nextPost) {
        setError(t('stories.postNotFound'));
        setPost(null);
        setComments([]);
        return;
      }
      setPost(nextPost);
      setComments(nextComments);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('stories.commentsLoadError'),
      );
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const send = async () => {
    if (!postId) return;
    setSending(true);
    try {
      const row = await addStoryComment(postId, draft);
      setComments((prev) => [...prev, row]);
      setDraft('');
      setPost((prev) =>
        prev
          ? { ...prev, commentsCount: prev.commentsCount + 1 }
          : prev,
      );
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'COMMENT_REQUIRED'
          ? t('stories.commentRequired')
          : err instanceof Error && err.message === 'COMMENT_TOO_LONG'
            ? t('stories.commentTooLong')
            : err instanceof Error
              ? err.message
              : t('stories.commentSendError');
      Alert.alert(t('common.error'), message);
    } finally {
      setSending(false);
    }
  };

  const onDelete = async (comment: StoryComment) => {
    Alert.alert(t('stories.commentDeleteTitle'), t('stories.commentDeleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('pets.delete'),
        style: 'destructive',
        onPress: () => {
          void (async () => {
            try {
              await deleteStoryComment(comment);
              setComments((prev) => prev.filter((c) => c.id !== comment.id));
              setPost((prev) =>
                prev
                  ? {
                      ...prev,
                      commentsCount: Math.max(0, prev.commentsCount - 1),
                    }
                  : prev,
              );
            } catch (err) {
              Alert.alert(
                t('common.error'),
                err instanceof Error ? err.message : t('common.error'),
              );
            }
          })();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <AppScreen>
        <LoadingState message={t('stories.loading')} />
      </AppScreen>
    );
  }

  if (error || !post) {
    return (
      <AppScreen>
        <ErrorState
          message={error ?? t('stories.postNotFound')}
          onRetry={() => void load()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <View style={styles.authorRow}>
                <PetAvatar
                  avatarKey={post.avatarKey}
                  species={post.species}
                  size={40}
                  name={post.petName}
                />
                <View style={styles.authorCopy}>
                  <Text style={styles.authorName}>{post.author}</Text>
                  <Text style={styles.authorMeta}>
                    {post.petName} · {formatStoryTimeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>

              {post.imageUri ? (
                <View style={styles.imageWrap}>
                  <Image
                    source={{ uri: post.imageUri }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              <Text style={styles.caption}>
                <Text style={styles.captionAuthor}>{post.author} </Text>
                {post.caption}
              </Text>

              <Text style={styles.sectionTitle}>
                {t('stories.commentsTitle')}
                {post.commentsCount > 0 ? ` · ${post.commentsCount}` : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>{t('stories.commentsEmpty')}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.commentCard}>
              <View style={styles.commentRow}>
                <View style={styles.commentCopy}>
                  <Text style={styles.commentAuthor}>{item.author}</Text>
                  <Text style={styles.commentBody}>{item.body}</Text>
                  <Text style={styles.commentTime}>
                    {formatStoryTimeAgo(item.createdAt)}
                  </Text>
                </View>
                {item.mine ? (
                  <Pressable
                    onPress={() => void onDelete(item)}
                    hitSlop={8}
                    accessibilityLabel={t('pets.delete')}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={brand.score.poor}
                    />
                  </Pressable>
                ) : null}
              </View>
            </View>
          )}
        />

        <View style={styles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('stories.commentPlaceholder')}
            multiline
            style={styles.input}
            placeholderTextColor={brand.mutedSoft}
          />
          <View style={styles.sendBtn}>
            <PrimaryButton
              label={t('stories.commentSend')}
              loading={sending}
              onPress={() => void send()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerBlock: { marginBottom: 16 },
  authorRow: { flexDirection: 'row', alignItems: 'center' },
  authorCopy: { flex: 1, marginLeft: 12 },
  authorName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  authorMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  imageWrap: {
    marginTop: 12,
    overflow: 'hidden',
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
  },
  image: { width: '100%', aspectRatio: 4 / 3 },
  caption: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  captionAuthor: { fontFamily: fonts.bodyBold },
  sectionTitle: {
    marginTop: 18,
    fontFamily: fonts.title,
    fontSize: 18,
    lineHeight: 24,
    color: brand.ink,
  },
  empty: {
    paddingVertical: 32,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  commentCard: {
    marginBottom: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  commentCopy: { flex: 1 },
  commentAuthor: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  commentBody: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.label,
  },
  commentTime: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    backgroundColor: brand.canvas,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  input: {
    minHeight: 72,
    borderRadius: brand.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  sendBtn: { marginTop: 12 },
});
