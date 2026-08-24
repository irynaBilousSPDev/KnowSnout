import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Modal,
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
import { PetAvatar } from '@/src/components/PetAvatar';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { notify } from '@/src/lib/notify';
import { buildStoryDeepLink, buildStoryShareMessage } from '@/src/lib/share';
import { getCurrentUser } from '@/src/services/auth';
import {
  deleteStoryPost,
  getStoryPost,
  toggleStoryLike,
} from '@/src/services/stories';
import {
  blockUser,
  reportStoryTarget,
  type StoryReportReason,
} from '@/src/services/storyModeration';
import { unfollowUser } from '@/src/services/storyFollows';
import { brand, fonts } from '@/src/theme/brand';
import type { StoryPost } from '@/src/types/story';

/** HTML 04.01 · Пост із реакціями + 04.05/04.06 sheets */
export default function StoryPostScreen() {
  const { postId: rawPostId } = useLocalSearchParams<{ postId?: string }>();
  const postId =
    typeof rawPostId === 'string' && rawPostId.trim() ? rawPostId : 'seed-park';
  const [post, setPost] = useState<StoryPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);

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

  const onLike = async () => {
    if (!post) return;
    try {
      setPost(await toggleStoryLike(post));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onReport = async (reason: StoryReportReason) => {
    if (!post) return;
    setBusy(true);
    try {
      await reportStoryTarget({
        targetUserId: post.userId,
        postId: post.id,
        reason,
      });
      setMenuOpen(false);
      notify(t('stories.reportDone'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setBusy(false);
    }
  };

  const onBlock = async () => {
    if (!post || post.mine) return;
    const ok = await confirmAction({
      title: t('stories.blockTitle'),
      message: t('stories.blockMessage', { name: post.author }),
      confirmLabel: t('stories.block'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    setBusy(true);
    try {
      await blockUser(post.userId);
      await unfollowUser(post.userId);
      setMenuOpen(false);
      notify(t('stories.blockDone'));
      router.back();
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!post?.mine) return;
    const ok = await confirmAction({
      title: t('stories.deleteTitle'),
      message: t('stories.deleteMessage'),
      confirmLabel: t('stories.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteStoryPost(post);
      notify(t('stories.deleteDone'));
      router.back();
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('stories.deleteError'),
      );
    }
  };

  const openAuthor = async () => {
    if (!post) return;
    const me = await getCurrentUser();
    if (post.mine || (me && post.userId === me.id)) {
      router.push('/(app)/my-profile' as never);
      return;
    }
    router.push({
      pathname: '/(app)/user-profile',
      params: { userId: post.userId },
    } as never);
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

  const shareMessage = buildStoryShareMessage({
    petName: post.petName,
    caption: post.caption,
    postId: post.id,
  });
  const shareLink = buildStoryDeepLink(post.id);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.head}>
        <Text style={styles.title}>{t('stories.postTitle')}</Text>
        <Pressable onPress={() => setMenuOpen(true)} hitSlop={10}>
          <Ionicons name="ellipsis-horizontal" size={18} color={brand.muted} />
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.card}>
            <View style={styles.media}>
              {post.imageUri ? (
                <Image
                  source={{ uri: post.imageUri }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.mediaEmpty}>
                  <Text style={styles.mediaHint}>{t('stories.photoPlaceholder')}</Text>
                </View>
              )}
            </View>
            <View style={styles.body}>
              <Pressable onPress={() => void openAuthor()} style={styles.author}>
                <PetAvatar
                  avatarKey={post.avatarKey}
                  species={post.species}
                  size={26}
                  name={post.petName}
                />
                <Text style={styles.authorName} numberOfLines={1}>
                  {post.petName
                    ? `${post.author.includes(post.petName) ? post.author : `${post.author} та ${post.petName}`}`
                    : post.author}
                </Text>
              </Pressable>
              <Text style={styles.caption}>{post.caption}</Text>
              <View style={styles.actions}>
                <Pressable onPress={() => void onLike()} style={styles.action}>
                  <Ionicons
                    name={post.liked ? 'heart' : 'heart-outline'}
                    size={17}
                    color={post.liked ? brand.accent : brand.muted}
                  />
                  <Text
                    style={[
                      styles.actionN,
                      post.liked && styles.actionLiked,
                    ]}
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
                <Pressable
                  onPress={() => setShareOpen(true)}
                  style={styles.action}
                >
                  <Ionicons name="share-social-outline" size={17} color={brand.muted} />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <SharePhotoSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        imageUri={post.imageUri}
        message={shareMessage}
        title={t('share.dialogTitle')}
        linkUrl={shareLink}
      />

      <Modal
        visible={menuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <Pressable style={styles.scrim} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            {!post.mine ? (
              <Pressable
                disabled={busy}
                onPress={() => void onReport('inappropriate')}
                style={styles.sheetRow}
              >
                <Text style={styles.sheetText}>{t('stories.reportPost')}</Text>
              </Pressable>
            ) : null}
            {!post.mine ? (
              <Pressable
                disabled={busy}
                onPress={() => void onBlock()}
                style={styles.sheetRow}
              >
                <Text style={[styles.sheetText, styles.danger]}>
                  {t('stories.blockUser')}
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => void onDelete()} style={styles.sheetRow}>
                <Text style={[styles.sheetText, styles.danger]}>
                  {t('stories.delete')}
                </Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => setMenuOpen(false)}
              style={styles.sheetRow}
            >
              <Text style={[styles.sheetText, styles.muted]}>
                {t('common.cancel')}
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  title: { fontFamily: fonts.title, fontSize: 20, color: brand.ink },
  pad: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: brand.surfaceElevated,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 2,
  },
  media: {
    height: 220,
    backgroundColor: brand.creamDeep,
  },
  image: { width: '100%', height: '100%' },
  mediaEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaHint: { fontFamily: fonts.body, fontSize: 12, color: brand.mutedSoft },
  body: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 10 },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorName: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: brand.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: brand.divider,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionN: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.muted,
  },
  actionLiked: { color: brand.accent },
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(21,34,51,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: brand.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 28,
    paddingTop: 8,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.chipTrack,
    marginBottom: 8,
  },
  sheetRow: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.divider,
  },
  sheetText: {
    textAlign: 'center',
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    color: brand.ink,
  },
  danger: { color: brand.error },
  muted: { color: brand.mutedSoft, fontFamily: fonts.body },
});
