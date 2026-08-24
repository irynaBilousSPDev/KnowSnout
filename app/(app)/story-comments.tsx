import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  addStoryComment,
  deleteStoryComment,
  getStoryPost,
  listStoryComments,
} from '@/src/services/stories';
import { brand, fonts } from '@/src/theme/brand';
import type { StoryComment, StoryPost } from '@/src/types/story';

/** HTML phone “24 · Коментарі під постом”. */
export default function StoryCommentsScreen() {
  const params = useLocalSearchParams<{ postId?: string }>();
  const postId =
    typeof params.postId === 'string' && params.postId.trim()
      ? params.postId
      : 'seed-park';

  const [post, setPost] = useState<StoryPost | null>(null);
  const [comments, setComments] = useState<StoryComment[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
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
        prev ? { ...prev, commentsCount: prev.commentsCount + 1 } : prev,
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
        <AppChromeHeader />
        <LoadingState message={t('stories.loading')} />
      </AppScreen>
    );
  }

  if (error || !post) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <ErrorState
          message={error ?? t('stories.postNotFound')}
          onRetry={() => void load()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('stories.commentsTitle')} titleSize={18} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('stories.commentsEmpty')}</Text>
          }
          renderItem={({ item }) => (
            <Pressable
              onLongPress={item.mine ? () => void onDelete(item) : undefined}
              style={styles.comment}
            >
              <PetAvatar
                avatarKey="paw"
                species="dog"
                size={32}
                name={item.author}
              />
              <View style={styles.commentCopy}>
                <Text style={styles.commentAuthor}>{item.author}</Text>
                <Text style={styles.commentBody}>{item.body}</Text>
              </View>
            </Pressable>
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
          <Pressable
            onPress={() => void send()}
            disabled={sending || !draft.trim()}
            style={[
              styles.sendIcon,
              (!draft.trim() || sending) && styles.sendIconDisabled,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t('stories.commentSend')}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="send" size={18} color="#FFFFFF" />
            )}
          </Pressable>
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
    gap: 12,
    flexGrow: 1,
  },
  empty: {
    marginTop: 24,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textAlign: 'center',
  },
  comment: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  commentCopy: { flex: 1, minWidth: 0 },
  commentAuthor: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.ink,
  },
  commentBody: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.label,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: brand.canvas,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  sendIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIconDisabled: { opacity: 0.45 },
});
