import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

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
import { brand } from '@/src/theme/brand';
import type { StoryComment, StoryPost } from '@/src/types/story';

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
    return <LoadingState message={t('stories.loading')} />;
  }

  if (error || !post) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          message={error ?? t('stories.postNotFound')}
          onRetry={() => void load()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={88}
      >
        <FlatList
          data={comments}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-4 pt-2"
          ListHeaderComponent={
            <View className="mb-4">
              <View className="flex-row items-center">
                <PetAvatar
                  avatarKey={post.avatarKey}
                  species={post.species}
                  size={40}
                  name={post.petName}
                />
                <View className="ml-3 flex-1">
                  <Text className="font-body-bold text-sm text-forest-900">
                    {post.author}
                  </Text>
                  <Text className="font-body text-xs text-forest-500">
                    {post.petName} · {formatStoryTimeAgo(post.createdAt)}
                  </Text>
                </View>
              </View>

              {post.imageUri ? (
                <View className="mt-3 overflow-hidden rounded-2xl bg-forest-100">
                  <Image
                    source={{ uri: post.imageUri }}
                    style={{ width: '100%', aspectRatio: 4 / 3 }}
                    resizeMode="cover"
                  />
                </View>
              ) : null}

              <Text className="mt-3 font-body text-base leading-6 text-forest-800">
                <Text className="font-body-bold">{post.author} </Text>
                {post.caption}
              </Text>

              <Text className="mt-4 font-body-bold text-base text-forest-900">
                {t('stories.commentsTitle')}
                {post.commentsCount > 0
                  ? ` · ${post.commentsCount}`
                  : ''}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Text className="py-8 text-center font-body text-sm text-forest-600">
              {t('stories.commentsEmpty')}
            </Text>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl border border-forest-100 bg-white px-4 py-3">
              <View className="flex-row items-start justify-between gap-2">
                <View className="flex-1">
                  <Text className="font-body-bold text-sm text-forest-900">
                    {item.author}
                  </Text>
                  <Text className="mt-1 font-body text-sm leading-5 text-forest-700">
                    {item.body}
                  </Text>
                  <Text className="mt-1 font-body text-[11px] text-forest-500">
                    {formatStoryTimeAgo(item.createdAt)}
                  </Text>
                </View>
                {item.mine ? (
                  <Pressable
                    onPress={() => onDelete(item)}
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

        <View className="border-t border-forest-100 bg-sand-50 px-5 pb-3 pt-3">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={t('stories.commentPlaceholder')}
            multiline
            className="min-h-[72px] rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
            placeholderTextColor="#7FD9C9"
          />
          <View className="mt-3">
            <PrimaryButton
              label={t('stories.commentSend')}
              loading={sending}
              onPress={() => void send()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
