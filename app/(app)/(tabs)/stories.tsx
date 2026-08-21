import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { LoadingState } from '@/src/components/LoadingState';
import { ErrorState } from '@/src/components/ErrorState';
import { t } from '@/src/i18n';
import { buildStoryDeepLink, buildStoryShareMessage } from '@/src/lib/share';
import { brand, fonts } from '@/src/theme/brand';
import {
  createStoryPost,
  deleteStoryPost,
  formatLikedBy,
  formatStoryTags,
  formatStoryTimeAgo,
  listStoryFeed,
  toggleStoryLike,
} from '@/src/services/stories';
import {
  isFollowing,
  syncLocalFollowsToCloud,
  toggleFollow,
  unfollowUser,
} from '@/src/services/storyFollows';
import {
  blockUser,
  reportStoryTarget,
  type StoryReportReason,
} from '@/src/services/storyModeration';
import { getCareStreak, type CareStreakState } from '@/src/services/careStreak';
import { listPets } from '@/src/services/pets';
import { listFriends, type FriendUser } from '@/src/services/friends';
import { getCurrentUser } from '@/src/services/auth';
import { confirmAction } from '@/src/lib/confirm';
import {
  getSettingsPrefs,
  type ThemePref,
} from '@/src/services/settingsPrefs';
import type {
  StoryFeedFilter,
  StoryPost,
  StoryPrivacy,
  StorySpecies,
} from '@/src/types/story';
import type { PetRow } from '@/src/types/pet';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { notify } from '@/src/lib/notify';

const STORIES_DARK = {
  bg: brand.navyDeep,
  card: '#152A45',
  border: '#2A4060',
  text: brand.surface,
  muted: '#9AA8B8',
} as const;

type AuthorCard = {
  userId: string;
  author: string;
  petName: string;
  species: StorySpecies;
  avatarKey: string;
  postId?: string;
  mine?: boolean;
};

type ViewMode = 'list' | 'grid';

function StoryTagsRow({ post }: { post: StoryPost }) {
  const tags = formatStoryTags(post);
  if (tags.length === 0) return null;
  return (
    <View style={tagStyles.row}>
      {tags.map((label) => (
        <View key={label} style={tagStyles.chip}>
          <Text style={tagStyles.chipText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const tagStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    borderRadius: brand.radius.sm,
    backgroundColor: brand.terracottaTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.accentDark,
  },
});

function StoryPostCard({
  post,
  compact,
  dark,
  onToggleLike,
  onShare,
  onOpenComments,
  onOpenAuthor,
  onDelete,
}: {
  post: StoryPost;
  compact?: boolean;
  dark?: boolean;
  onToggleLike: (post: StoryPost) => void;
  onShare: (post: StoryPost) => void;
  onOpenComments: (post: StoryPost) => void;
  onOpenAuthor: (post: StoryPost) => void;
  onDelete?: (post: StoryPost) => void;
}) {
  const timeAgo = formatStoryTimeAgo(post.createdAt);
  const likedBy = formatLikedBy(post.likes, post.liked);
  const darkCard = dark
    ? { backgroundColor: STORIES_DARK.card }
    : undefined;
  const darkTitle = dark ? { color: STORIES_DARK.text } : undefined;
  const darkMuted = dark ? { color: STORIES_DARK.muted } : undefined;

  if (compact) {
    return (
      <View style={[styles.cardCompact, darkCard]}>
        <Pressable onPress={() => onOpenComments(post)}>
          <View style={styles.compactMedia}>
            {post.imageUri ? (
              <Image
                source={{ uri: post.imageUri }}
                style={styles.fillImage}
                resizeMode="cover"
              />
            ) : (
              <PetAvatar
                avatarKey={post.avatarKey}
                species={post.species}
                size={56}
                name={post.petName}
              />
            )}
          </View>
        </Pressable>
        <View style={styles.compactBody}>
          <Pressable onPress={() => onOpenAuthor(post)}>
            <Text numberOfLines={1} style={[styles.compactAuthor, darkTitle]}>
              {post.author}
            </Text>
          </Pressable>
          <Text numberOfLines={2} style={[styles.compactCaption, darkMuted]}>
            {post.caption}
          </Text>
          <View style={styles.compactActions}>
            <Pressable
              onPress={() => onToggleLike(post)}
              style={styles.compactAction}
            >
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={16}
                color={post.liked ? brand.terracotta : brand.muted}
              />
              <Text style={[styles.compactActionText, darkMuted]}>
                {post.likes}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenComments(post)}
              style={styles.compactAction}
            >
              <Ionicons
                name="chatbubble-outline"
                size={15}
                color={brand.accent}
              />
              <Text style={[styles.compactActionText, darkMuted]}>
                {post.commentsCount}
              </Text>
            </Pressable>
            {post.mine && onDelete ? (
              <Pressable
                onPress={() => onDelete(post)}
                accessibilityRole="button"
                accessibilityLabel={t('stories.delete')}
              >
                <Ionicons
                  name="trash-outline"
                  size={15}
                  color={brand.score.poor}
                />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, darkCard]}>
      <Pressable
        onPress={() => onOpenAuthor(post)}
        style={({ pressed }) => [
          styles.cardAuthorRow,
          pressed && styles.pressed,
        ]}
      >
        <PetAvatar
          avatarKey={post.avatarKey}
          species={post.species}
          size={40}
          name={post.petName}
        />
        <View style={styles.cardAuthorCopy}>
          <Text style={[styles.cardAuthorName, darkTitle]}>{post.author}</Text>
          <Text style={[styles.cardAuthorMeta, darkMuted]}>
            {post.petName}
            {post.privacy === 'private'
              ? ` · ${t('stories.privacyPrivate')}`
              : ''}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={16}
          color={dark ? STORIES_DARK.muted : brand.mutedSoft}
        />
      </Pressable>

      <View style={styles.listMedia}>
        {post.imageUri ? (
          <Image
            source={{ uri: post.imageUri }}
            style={styles.fillImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.noImage}>
            <PetAvatar
              avatarKey={post.avatarKey}
              species={post.species}
              size={96}
              name={post.petName}
            />
            <Text style={[styles.noImageCaption, darkMuted]}>
              {post.caption}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.tagsUnderImage}>
        <StoryTagsRow post={post} />
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.timeAgo, darkMuted]}>{timeAgo}</Text>
        <View style={styles.actionsIcons}>
          <Pressable
            onPress={() => onToggleLike(post)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={26}
              color={post.liked ? brand.terracotta : brand.muted}
            />
          </Pressable>
          <Pressable
            onPress={() => onOpenComments(post)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={brand.accent}
            />
          </Pressable>
          <Pressable
            onPress={() => onShare(post)}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <Ionicons name="share-outline" size={24} color={brand.accent} />
          </Pressable>
          {post.mine && onDelete ? (
            <Pressable
              onPress={() => onDelete(post)}
              style={({ pressed }) => pressed && styles.pressed}
              accessibilityRole="button"
              accessibilityLabel={t('stories.delete')}
            >
              <Ionicons
                name="trash-outline"
                size={24}
                color={brand.score.poor}
              />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.likedRow}>
          <Ionicons
            name="heart"
            size={14}
            color={dark ? STORIES_DARK.text : brand.ink}
          />
          <Text style={[styles.likedBy, darkTitle]}>{likedBy}</Text>
        </View>
        <Text style={[styles.captionLine, darkMuted]}>
          <Text style={[styles.captionAuthor, darkTitle]}>{post.author}</Text>{' '}
          {post.caption}
        </Text>
        <Pressable onPress={() => onOpenComments(post)}>
          <Text style={[styles.commentsLink, darkMuted]}>
            {post.likes} {t('stories.likes')}
            {post.commentsCount > 0
              ? ` · ${t('stories.commentsCount', { count: String(post.commentsCount) })}`
              : ` · ${t('stories.commentsOpen')}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function StoriesScreen() {
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [filter, setFilter] = useState<StoryFeedFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [privacy, setPrivacy] = useState<StoryPrivacy>('public');
  const [species, setSpecies] = useState<StorySpecies>('cat');
  const [petId, setPetId] = useState<string | null>(null);
  const [taggedPetIds, setTaggedPetIds] = useState<string[]>([]);
  const [taggedFriendIds, setTaggedFriendIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [sharePost, setSharePost] = useState<StoryPost | null>(null);
  const [authorCard, setAuthorCard] = useState<AuthorCard | null>(null);
  const [authorFollowing, setAuthorFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [modBusy, setModBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [careStreak, setCareStreak] = useState<CareStreakState | null>(null);
  const [theme, setTheme] = useState<ThemePref>('light');
  const dark = theme === 'dark';

  const closeCompose = () => {
    setComposeOpen(false);
    setComposeError(null);
    setTaggedPetIds([]);
    setTaggedFriendIds([]);
  };

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        void syncLocalFollowsToCloud();
        const [feed, nextPets, nextFriends] = await Promise.all([
          listStoryFeed(filter),
          listPets().catch(() => [] as PetRow[]),
          listFriends().catch(() => [] as FriendUser[]),
        ]);
        setPosts(feed);
        setPets(nextPets);
        setFriends(nextFriends);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('stories.loadError'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter],
  );

  useFocusEffect(
    useCallback(() => {
      void load();
      void getSettingsPrefs().then((prefs) => setTheme(prefs.theme));
    }, [load]),
  );

  const onToggleLike = async (post: StoryPost) => {
    try {
      const next = await toggleStoryLike(post);
      setPosts((prev) => prev.map((p) => (p.id === post.id ? next : p)));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const openComments = (post: StoryPost) => {
    router.push({
      pathname: '/(app)/story-comments',
      params: { postId: post.id },
    });
  };

  const openCompose = () => {
    const first = pets[0];
    if (first && (first.species === 'dog' || first.species === 'cat')) {
      setPetId(first.id);
      setSpecies(first.species);
    } else {
      setPetId(null);
      setSpecies('cat');
    }
    setTaggedPetIds([]);
    setTaggedFriendIds([]);
    setComposeError(null);
    setComposeOpen(true);
  };

  const toggleTaggedPet = (id: string) => {
    setTaggedPetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleTaggedFriend = (id: string) => {
    setTaggedFriendIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const publish = async () => {
    const text = caption.trim();
    if (!imageUri) {
      setComposeError(t('stories.photoRequired'));
      return;
    }
    if (!text) {
      setComposeError(t('stories.captionRequired'));
      return;
    }
    setComposeError(null);
    setPublishing(true);
    try {
      const pet = pets.find((p) => p.id === petId) ?? null;
      const taggedPetNames = taggedPetIds
        .map((id) => pets.find((p) => p.id === id)?.name)
        .filter((n): n is string => Boolean(n));
      const taggedFriendNames = taggedFriendIds
        .map((id) => friends.find((f) => f.id === id)?.name)
        .filter((n): n is string => Boolean(n));
      await createStoryPost({
        caption: text,
        imageUri,
        species: pet?.species === 'dog' || pet?.species === 'cat' ? pet.species : species,
        privacy,
        petId: pet?.id ?? null,
        petName: pet?.name ?? null,
        avatarKey: pet?.avatar_key ?? null,
        taggedPetIds,
        taggedFriendIds,
        taggedPetNames,
        taggedFriendNames,
      });
      setCaption('');
      setImageUri(null);
      closeCompose();
      setFilter('mine');
      await load(true);
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'PHOTO_REQUIRED'
          ? t('stories.photoRequired')
          : err instanceof Error && err.message === 'CAPTION_REQUIRED'
            ? t('stories.captionRequired')
            : err instanceof Error
              ? err.message
              : t('stories.publishError');
      setComposeError(message);
      notify(t('common.error'), message);
    } finally {
      setPublishing(false);
    }
  };

  const onDeletePost = async (post: StoryPost) => {
    if (!post.mine) return;
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
      setPosts((prev) => prev.filter((p) => p.id !== post.id));
      if (authorCard?.postId === post.id) setAuthorCard(null);
      notify(t('stories.deleteDone'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('stories.deleteError'),
      );
    }
  };

  const openAuthor = async (post: StoryPost) => {
    setAuthorCard({
      userId: post.userId,
      author: post.author,
      petName: post.petName,
      species: post.species,
      avatarKey: post.avatarKey,
      postId: post.id,
      mine: post.mine,
    });
    setReportOpen(false);
    setCareStreak(null);
    try {
      const user = await getCurrentUser();
      const mine = Boolean(post.mine || (user && post.userId === user.id));
      if (mine) {
        setAuthorFollowing(false);
        setCareStreak(await getCareStreak());
        return;
      }
      setAuthorFollowing(await isFollowing(post.userId));
    } catch {
      setAuthorFollowing(false);
    }
  };

  const onToggleAuthorFollow = async () => {
    if (!authorCard || authorCard.mine) return;
    setFollowBusy(true);
    try {
      const result = await toggleFollow(authorCard.userId);
      setAuthorFollowing(result.following);
      if (filter === 'following') void load(true);
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setFollowBusy(false);
    }
  };

  const onBlockAuthor = async () => {
    if (!authorCard || authorCard.mine) return;
    const ok = await confirmAction({
      title: t('stories.blockTitle'),
      message: t('stories.blockMessage', { name: authorCard.author }),
      confirmLabel: t('stories.block'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    setModBusy(true);
    try {
      await blockUser(authorCard.userId);
      await unfollowUser(authorCard.userId);
      setAuthorFollowing(false);
      setAuthorCard(null);
      notify(t('stories.blockDone'));
      await load(true);
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setModBusy(false);
    }
  };

  const onReportAuthor = async (reason: StoryReportReason) => {
    if (!authorCard || authorCard.mine) return;
    setModBusy(true);
    try {
      await reportStoryTarget({
        targetUserId: authorCard.userId,
        postId: authorCard.postId,
        reason,
      });
      setReportOpen(false);
      notify(t('stories.reportDone'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setModBusy(false);
    }
  };

  const filters: { id: StoryFeedFilter; label: string }[] = [
    { id: 'all', label: t('stories.filterAll') },
    { id: 'following', label: t('stories.filterFollowing') },
    { id: 'cat', label: t('stories.filterCats') },
    { id: 'dog', label: t('stories.filterDogs') },
    { id: 'mine', label: t('stories.filterMine') },
  ];

  const feedHeader = (
    <View style={[styles.feedHeader, dark && styles.feedHeaderDark]}>
      <Text style={[styles.pageTitle, dark && styles.pageTitleDark]}>
        {t('tabs.stories')}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.moduleNav}
      >
        {(
          [
            {
              label: t('spotlight.title'),
              icon: 'sparkles-outline' as const,
              href: '/(app)/spotlight-hub',
            },
            {
              label: t('friends.title'),
              icon: 'people-outline' as const,
              href: '/(app)/friends',
            },
            {
              label: t('activity.title'),
              icon: 'notifications-outline' as const,
              href: '/(app)/activity',
            },
            {
              label: t('dm.title'),
              icon: 'chatbubble-ellipses-outline' as const,
              href: '/(app)/messages',
            },
            {
              label: t('search.title'),
              icon: 'search-outline' as const,
              href: '/(app)/search',
            },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            style={[styles.moduleChip, dark && styles.moduleChipDark]}
          >
            <Ionicons name={item.icon} size={16} color={brand.accent} />
            <Text style={styles.moduleChipText} numberOfLines={1}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.actionsRow}>
        <View style={styles.actionsPrimary}>
          <PrimaryButton
            label={t('stories.addPost')}
            size="sm"
            onPress={openCompose}
          />
        </View>
        <Pressable
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={[styles.contestsBtn, dark && styles.contestsBtnDark]}
          accessibilityRole="button"
          accessibilityLabel={
            viewMode === 'list' ? t('stories.viewGrid') : t('stories.viewList')
          }
        >
          <Ionicons
            name={viewMode === 'list' ? 'grid-outline' : 'list'}
            size={18}
            color={brand.accent}
          />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRow}
      >
        {(
          [
            {
              href: '/(app)/friends',
              icon: 'people-outline' as const,
              label: t('stories.openFriends'),
            },
            {
              href: '/(app)/messages',
              icon: 'chatbubble-ellipses-outline' as const,
              label: t('stories.openMessages'),
            },
            {
              href: '/(app)/spotlight-hub',
              icon: 'sparkles-outline' as const,
              label: t('stories.openSpotlight'),
            },
            {
              href: '/(app)/search',
              icon: 'search-outline' as const,
              label: t('stories.openSearch'),
            },
            {
              href: '/(app)/activity',
              icon: 'notifications-outline' as const,
              label: t('stories.openActivity'),
            },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href as never)}
            style={[styles.quickChip, dark && styles.quickChipDark]}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Ionicons name={item.icon} size={16} color={brand.accent} />
            <Text
              style={[styles.quickChipText, dark && styles.quickChipTextDark]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {filters.map((f) => {
          const active = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setFilter(f.id)}
              style={[
                styles.filterChip,
                dark && styles.filterChipDark,
                active && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  dark && styles.filterChipTextDark,
                  active && styles.filterChipTextActive,
                ]}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={[styles.flex, dark && styles.darkScreen]}>
      {loading ? (
        <View style={styles.flex}>
          {feedHeader}
          <LoadingState message={t('stories.loading')} />
        </View>
      ) : error ? (
        <View style={styles.flex}>
          {feedHeader}
          <ErrorState message={error} onRetry={() => void load()} />
        </View>
      ) : (
        <FlatList
          key={viewMode}
          style={styles.flex}
          data={posts}
          keyExtractor={(item) => item.id}
          numColumns={viewMode === 'grid' ? 2 : 1}
          columnWrapperStyle={
            viewMode === 'grid' ? styles.gridRow : undefined
          }
          contentContainerStyle={
            viewMode === 'grid' ? styles.gridContent : styles.listContent
          }
          ListHeaderComponent={feedHeader}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={brand.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, dark && styles.emptyTextDark]}>
                {filter === 'mine'
                  ? t('stories.emptyMine')
                  : filter === 'following'
                    ? t('stories.emptyFollowing')
                    : t('stories.emptyFilter')}
              </Text>
              <View style={styles.emptyBtn}>
                <PrimaryButton
                  label={t('stories.addPost')}
                  onPress={openCompose}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => (
            <View
              style={
                viewMode === 'grid' ? styles.gridItem : styles.listItem
              }
            >
              <StoryPostCard
                post={item}
                compact={viewMode === 'grid'}
                dark={dark}
                onToggleLike={(p) => void onToggleLike(p)}
                onShare={setSharePost}
                onOpenComments={openComments}
                onOpenAuthor={(p) => void openAuthor(p)}
                onDelete={(p) => void onDeletePost(p)}
              />
            </View>
          )}
        />
      )}

      <Modal
        visible={composeOpen}
        animationType="slide"
        transparent
        onRequestClose={closeCompose}
      >
        <View style={styles.modalRoot}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={closeCompose}
            style={styles.modalScrim}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('stories.composeTitle')}</Text>
              <Pressable
                onPress={closeCompose}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={brand.ink} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.composePhoto}>
                <PhotoAttachField
                  label={t('stories.photo')}
                  uri={imageUri}
                  onChange={(uri) => {
                    setImageUri(uri);
                    if (uri) setComposeError(null);
                  }}
                  emptyHint={t('stories.photoHint')}
                  filePrefix="story"
                  aspect={[4, 3]}
                  height={200}
                />
              </View>

              {pets.length > 0 ? (
                <>
                  <Text style={styles.fieldLabel}>{t('stories.pickPet')}</Text>
                  <View style={styles.chipWrap}>
                    {pets
                      .filter(
                        (p) => p.species === 'dog' || p.species === 'cat',
                      )
                      .map((p) => {
                        const active = petId === p.id;
                        return (
                          <Pressable
                            key={p.id}
                            onPress={() => {
                              setPetId(p.id);
                              if (p.species === 'dog' || p.species === 'cat') {
                                setSpecies(p.species);
                              }
                            }}
                            style={[styles.pickChip, active && styles.pickChipActive]}
                          >
                            <Text
                              style={[
                                styles.pickChipText,
                                active && styles.pickChipTextActive,
                              ]}
                            >
                              {p.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.fieldLabel}>{t('stories.species')}</Text>
                  <View style={styles.rowGap}>
                    {(['cat', 'dog'] as StorySpecies[]).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setSpecies(s)}
                        style={[
                          styles.pickChipFlex,
                          species === s && styles.pickChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickChipText,
                            species === s && styles.pickChipTextActive,
                          ]}
                        >
                          {s === 'cat'
                            ? t('stories.filterCats')
                            : t('stories.filterDogs')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.fieldLabel}>{t('stories.privacy')}</Text>
              <View style={styles.rowGap}>
                {(
                  [
                    { id: 'public' as const, label: t('stories.privacyPublic') },
                    {
                      id: 'private' as const,
                      label: t('stories.privacyPrivate'),
                    },
                  ] as const
                ).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => setPrivacy(item.id)}
                    style={[
                      styles.pickChipFlex,
                      privacy === item.id && styles.pickChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pickChipTextSm,
                        privacy === item.id && styles.pickChipTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text style={styles.fieldLabel}>{t('stories.tagPets')}</Text>
              {pets.length === 0 ? (
                <Text style={styles.fieldHint}>{t('stories.tagPetsEmpty')}</Text>
              ) : (
                <View style={styles.chipWrap}>
                  {pets.map((p) => {
                    const active = taggedPetIds.includes(p.id);
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => toggleTaggedPet(p.id)}
                        style={[
                          styles.pickChip,
                          active && styles.tagPetActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickChipText,
                            active && styles.pickChipTextActive,
                          ]}
                        >
                          {p.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={styles.fieldLabel}>{t('stories.tagFriends')}</Text>
              {friends.length === 0 ? (
                <Text style={styles.fieldHint}>
                  {t('stories.tagFriendsEmpty')}
                </Text>
              ) : (
                <View style={styles.chipWrap}>
                  {friends.map((f) => {
                    const active = taggedFriendIds.includes(f.id);
                    return (
                      <Pressable
                        key={f.id}
                        onPress={() => toggleTaggedFriend(f.id)}
                        style={[
                          styles.pickChip,
                          active && styles.pickChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.pickChipText,
                            active && styles.pickChipTextActive,
                          ]}
                        >
                          {f.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}

              <Text style={styles.fieldLabel}>{t('stories.caption')}</Text>
              <TextInput
                value={caption}
                onChangeText={(text) => {
                  setCaption(text);
                  if (text.trim()) setComposeError(null);
                }}
                placeholder={t('stories.captionPlaceholder')}
                multiline
                style={styles.captionInput}
                placeholderTextColor={brand.mutedSoft}
              />

              {composeError ? (
                <Text style={styles.composeError}>{composeError}</Text>
              ) : null}

              <View style={styles.modalActions}>
                <PrimaryButton
                  label={t('stories.publish')}
                  loading={publishing}
                  onPress={() => void publish()}
                />
                <PrimaryButton
                  label={t('common.cancel')}
                  variant="ghost"
                  onPress={() => {
                    closeCompose();
                    setImageUri(null);
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(authorCard)}
        animationType="slide"
        transparent
        onRequestClose={() => {
          setReportOpen(false);
          setAuthorCard(null);
        }}
      >
        <View style={styles.authorModalRoot}>
          <View style={styles.modalSheet}>
            {authorCard ? (
              <>
                <View style={styles.authorHeader}>
                  <PetAvatar
                    avatarKey={authorCard.avatarKey}
                    species={authorCard.species}
                    size={56}
                    name={authorCard.petName}
                  />
                  <View style={styles.authorHeaderCopy}>
                    <Text style={styles.modalTitle}>{authorCard.author}</Text>
                    <Text style={styles.authorPet}>
                      {t('stories.authorPet', { name: authorCard.petName })}
                    </Text>
                  </View>
                </View>
                <Text style={styles.authorHint}>{t('stories.authorHint')}</Text>
                {authorCard.mine && careStreak ? (
                  <View style={styles.streakCard}>
                    <Text style={styles.streakTitle}>
                      {t('stories.careStreakTitle', {
                        count: careStreak.currentStreak,
                      })}
                    </Text>
                    <Text style={styles.streakBest}>
                      {t('stories.careStreakBest', {
                        count: careStreak.bestStreak,
                      })}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.modalActions}>
                  {authorCard.mine ? (
                    <>
                      <Text style={styles.selfHint}>{t('stories.authorSelf')}</Text>
                      {authorCard.postId ? (
                        <PrimaryButton
                          label={t('stories.delete')}
                          variant="danger"
                          onPress={() => {
                            const post = posts.find(
                              (p) => p.id === authorCard.postId,
                            );
                            if (post) void onDeletePost(post);
                          }}
                        />
                      ) : null}
                    </>
                  ) : (
                    <>
                      <PrimaryButton
                        label={t('profile.open')}
                        variant="secondary"
                        onPress={() => {
                          const card = authorCard;
                          setAuthorCard(null);
                          router.push({
                            pathname: '/(app)/user-profile',
                            params: { userId: card.userId },
                          } as never);
                        }}
                      />
                      <PrimaryButton
                        label={
                          authorFollowing
                            ? t('stories.unfollow')
                            : t('stories.follow')
                        }
                        variant={authorFollowing ? 'secondary' : 'primary'}
                        loading={followBusy}
                        onPress={() => void onToggleAuthorFollow()}
                      />
                      <PrimaryButton
                        label={t('dm.message')}
                        variant="secondary"
                        onPress={() => {
                          const card = authorCard;
                          setAuthorCard(null);
                          router.push({
                            pathname: '/(app)/dm/[userId]',
                            params: {
                              userId: card.userId,
                              name: card.author,
                              avatarKey: card.avatarKey,
                            },
                          });
                        }}
                      />
                      {reportOpen ? (
                        <View style={styles.reportBlock}>
                          <Text style={styles.fieldLabel}>
                            {t('stories.reportPick')}
                          </Text>
                          {(
                            [
                              ['spam', 'stories.reportSpam'],
                              ['abuse', 'stories.reportAbuse'],
                              ['inappropriate', 'stories.reportInappropriate'],
                              ['other', 'stories.reportOther'],
                            ] as const
                          ).map(([reason, key]) => (
                            <PrimaryButton
                              key={reason}
                              label={t(key)}
                              variant="secondary"
                              loading={modBusy}
                              onPress={() => void onReportAuthor(reason)}
                            />
                          ))}
                          <PrimaryButton
                            label={t('common.cancel')}
                            variant="ghost"
                            onPress={() => setReportOpen(false)}
                          />
                        </View>
                      ) : (
                        <>
                          <PrimaryButton
                            label={t('stories.report')}
                            variant="secondary"
                            onPress={() => setReportOpen(true)}
                          />
                          <PrimaryButton
                            label={t('stories.block')}
                            variant="ghost"
                            loading={modBusy}
                            onPress={() => void onBlockAuthor()}
                          />
                        </>
                      )}
                    </>
                  )}
                  <PrimaryButton
                    label={t('common.close')}
                    variant="ghost"
                    onPress={() => {
                      setReportOpen(false);
                      setAuthorCard(null);
                    }}
                  />
                </View>
              </>
            ) : null}
          </View>
        </View>
      </Modal>

      <SharePhotoSheet
        visible={Boolean(sharePost)}
        onClose={() => setSharePost(null)}
        imageUri={sharePost?.imageUri}
        title={t('share.dialogTitle')}
        linkUrl={sharePost ? buildStoryDeepLink(sharePost.id) : null}
        message={
          sharePost
            ? buildStoryShareMessage({
                petName: sharePost.petName,
                caption: sharePost.caption,
                postId: sharePost.id,
              })
            : ''
        }
      />
      </View>
    </AppScreen>
  );
}

const softCard = {
  backgroundColor: brand.surfaceElevated,
  shadowColor: brand.shadow.color,
  shadowOpacity: brand.shadow.opacity,
  shadowRadius: brand.shadow.radius,
  shadowOffset: brand.shadow.offset,
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pressed: { opacity: 0.9 },
  darkScreen: { backgroundColor: STORIES_DARK.bg },
  feedHeader: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  feedHeaderDark: { backgroundColor: STORIES_DARK.bg },
  pageTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 12,
  },
  pageTitleDark: { color: STORIES_DARK.text },
  moduleNav: { flexDirection: 'row', gap: 8, paddingBottom: 12 },
  moduleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  moduleChipDark: { backgroundColor: STORIES_DARK.card },
  moduleChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingBottom: 8,
  },
  actionsPrimary: { flex: 1 },
  contestsBtn: {
    width: 42,
    height: 42,
    borderRadius: brand.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...softCard,
  },
  contestsBtnDark: { backgroundColor: STORIES_DARK.card },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
  },
  quickChipDark: { backgroundColor: STORIES_DARK.card },
  quickChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  quickChipTextDark: { color: brand.terracotta },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
  },
  filterChipDark: { backgroundColor: STORIES_DARK.card },
  filterChipActive: { backgroundColor: brand.accentTint },
  filterChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  filterChipTextDark: { color: STORIES_DARK.muted },
  filterChipTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.accentDark,
  },
  listContent: { paddingBottom: 24 },
  listItem: { paddingHorizontal: 20 },
  gridContent: { paddingBottom: 24 },
  gridRow: { gap: 10, paddingHorizontal: 20 },
  gridItem: { flex: 1 },
  emptyWrap: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  emptyTextDark: { color: STORIES_DARK.muted },
  emptyBtn: { marginTop: 16, width: '100%', paddingHorizontal: 20 },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
    borderRadius: brand.radius.md,
    ...softCard,
  },
  cardCompact: {
    marginBottom: 10,
    overflow: 'hidden',
    borderRadius: brand.radius.md,
    ...softCard,
  },
  compactMedia: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactBody: { paddingHorizontal: 10, paddingVertical: 8 },
  compactAuthor: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.ink,
  },
  compactCaption: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.ink,
  },
  compactActions: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  compactActionText: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  cardAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardAuthorCopy: { flex: 1, marginLeft: 12 },
  cardAuthorName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  cardAuthorMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  listMedia: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImage: { alignItems: 'center', paddingHorizontal: 24 },
  noImageCaption: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  tagsUnderImage: { paddingHorizontal: 14, paddingBottom: 4 },
  fillImage: { width: '100%', height: '100%' },
  cardFooter: { paddingHorizontal: 14, paddingVertical: 12 },
  timeAgo: {
    fontFamily: fonts.body,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.muted,
  },
  actionsIcons: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  likedRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  likedBy: {
    marginLeft: 8,
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  captionLine: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.label,
  },
  captionAuthor: { fontFamily: fonts.bodyBold, color: brand.ink },
  commentsLink: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(21, 34, 51, 0.4)',
  },
  modalSheet: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: brand.canvas,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  modalHeader: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  modalClose: {
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.chipTrack,
  },
  composePhoto: { marginTop: 8 },
  fieldLabel: {
    marginTop: 16,
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.accentDark,
  },
  fieldHint: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  chipWrap: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rowGap: { marginTop: 8, flexDirection: 'row', gap: 8 },
  pickChip: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pickChipFlex: {
    flex: 1,
    alignItems: 'center',
    borderRadius: brand.radius.md,
    backgroundColor: brand.chipTrack,
    paddingVertical: 12,
  },
  pickChipActive: { backgroundColor: brand.accent },
  tagPetActive: { backgroundColor: brand.terracotta },
  pickChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  pickChipTextSm: {
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.ink,
  },
  pickChipTextActive: { color: '#FFFFFF' },
  captionInput: {
    marginTop: 8,
    minHeight: 96,
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
  composeError: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.score.poor,
  },
  modalActions: { marginTop: 20, gap: 12 },
  authorModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(21, 34, 51, 0.4)',
  },
  authorHeader: { flexDirection: 'row', alignItems: 'center' },
  authorHeaderCopy: { flex: 1, marginLeft: 12 },
  authorPet: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  authorHint: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.muted,
  },
  streakCard: {
    marginTop: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.mist,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  streakTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  streakBest: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  selfHint: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  reportBlock: { gap: 8 },
});
