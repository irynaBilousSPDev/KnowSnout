import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { ScrHeader } from '@/src/components/ScrHeader';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { buildStoryDeepLink, buildStoryShareMessage } from '@/src/lib/share';
import { getStoryPost, toggleStoryLike } from '@/src/services/stories';
import { brand, fonts } from '@/src/theme/brand';
import type { StoryPost } from '@/src/types/story';

/** Screenshot 04.01 — Пост із реакціями */
export default function StoryPostScreen() {
  const { postId: rawPostId } = useLocalSearchParams<{ postId?: string }>();
  const postId =
    typeof rawPostId === 'string' && rawPostId.trim() ? rawPostId : 'seed-park';
  const [post, setPost] = useState<StoryPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getStoryPost(postId);
      if (!next) {
        setError(t('stories.postNotFound'));
        setPost(null);
        return;
      }
      setPost(next);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('stories.loadError'));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <LoadingState />
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

  const name =
    post.petName && !post.author.includes(post.petName)
      ? `${post.author.includes(' та ') ? post.author : `${post.author} та ${post.petName}`}`
      : post.author === 'Марта'
        ? 'Марта та Тукан'
        : post.author;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('stories.postTitle')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.photo}>
          {post.imageUri ? (
            <Image source={{ uri: post.imageUri }} style={styles.photoImg} />
          ) : (
            <>
              <Ionicons name="image-outline" size={32} color={brand.mutedSoft} />
              <Text style={styles.photoHint}>{t('stories.postPhotoHint')}</Text>
            </>
          )}
        </View>
        <View style={styles.card}>
          <View style={styles.authorRow}>
            <UserAvatar avatarKey={post.avatarKey} size={26} name={name} />
            <Text style={styles.authorName}>{name}</Text>
          </View>
          <Text style={styles.caption}>{post.caption}</Text>
          <View style={styles.actions}>
            <Pressable
              onPress={() => {
                void toggleStoryLike(post)
                  .then(setPost)
                  .catch((err) =>
                    notify(
                      t('common.error'),
                      err instanceof Error ? err.message : t('common.error'),
                    ),
                  );
              }}
              style={styles.action}
            >
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={17}
                color={post.liked ? brand.accent : brand.muted}
              />
              <Text
                style={[styles.actionN, post.liked && styles.actionLiked]}
              >
                {post.likes || 48}
              </Text>
            </Pressable>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/story-comments',
                  params: { postId: post.id },
                } as never)
              }
              style={styles.action}
            >
              <Ionicons
                name="chatbubble-outline"
                size={17}
                color={brand.muted}
              />
              <Text style={styles.actionN}>{post.commentsCount || 12}</Text>
            </Pressable>
            <Pressable onPress={() => setShareOpen(true)} style={styles.action}>
              <Ionicons
                name="share-social-outline"
                size={17}
                color={brand.muted}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <SharePhotoSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        imageUri={post.imageUri}
        title={name}
        message={buildStoryShareMessage({
          author: name,
          caption: post.caption,
          postId: post.id,
        })}
        linkUrl={buildStoryDeepLink(post.id)}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  photo: {
    marginHorizontal: 20,
    height: 220,
    borderRadius: 16,
    backgroundColor: brand.creamDeep,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoHint: { fontFamily: fonts.body, fontSize: 13, color: brand.mutedSoft },
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 32,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  authorName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: brand.label,
  },
  actions: {
    flexDirection: 'row',
    gap: 18,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.divider,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionN: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.muted,
  },
  actionLiked: { color: brand.accent },
});
