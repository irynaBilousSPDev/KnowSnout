import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { LoadingState } from '@/src/components/LoadingState';
import { ErrorState } from '@/src/components/ErrorState';
import { t } from '@/src/i18n';
import { buildStoryDeepLink, buildStoryShareMessage } from '@/src/lib/share';
import { brand } from '@/src/theme/brand';
import {
  createStoryPost,
  formatLikedBy,
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
import { getCurrentUser } from '@/src/services/auth';
import { confirmAction } from '@/src/lib/confirm';
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

function StoryPostCard({
  post,
  compact,
  onToggleLike,
  onShare,
  onOpenComments,
  onOpenAuthor,
}: {
  post: StoryPost;
  compact?: boolean;
  onToggleLike: (post: StoryPost) => void;
  onShare: (post: StoryPost) => void;
  onOpenComments: (post: StoryPost) => void;
  onOpenAuthor: (post: StoryPost) => void;
}) {
  const timeAgo = formatStoryTimeAgo(post.createdAt);
  const likedBy = formatLikedBy(post.likes, post.liked);

  if (compact) {
    return (
      <View className="mb-3 overflow-hidden rounded-2xl border border-forest-100 bg-white">
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
        <View className="px-2.5 py-2">
          <Pressable onPress={() => onOpenAuthor(post)}>
            <Text numberOfLines={1} className="font-body-bold text-[11px] text-forest-900">
              {post.author}
            </Text>
          </Pressable>
          <Text numberOfLines={2} className="mt-0.5 font-body text-xs text-forest-800">
            {post.caption}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-3">
            <Pressable
              onPress={() => onToggleLike(post)}
              className="flex-row items-center gap-1"
            >
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={16}
                color={post.liked ? brand.score.poor : brand.tealPressed}
              />
              <Text className="font-body text-[11px] text-forest-500">
                {post.likes}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => onOpenComments(post)}
              className="flex-row items-center gap-1"
            >
              <Ionicons
                name="chatbubble-outline"
                size={15}
                color={brand.tealPressed}
              />
              <Text className="font-body text-[11px] text-forest-500">
                {post.commentsCount}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="mb-5 overflow-hidden rounded-3xl border border-forest-100 bg-white">
      <Pressable
        onPress={() => onOpenAuthor(post)}
        className="flex-row items-center px-4 py-3 active:opacity-80"
      >
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
            {post.petName}
            {post.privacy === 'private'
              ? ` · ${t('stories.privacyPrivate')}`
              : ''}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#7A9A92" />
      </Pressable>

      <View style={styles.listMedia}>
        {post.imageUri ? (
          <Image
            source={{ uri: post.imageUri }}
            style={styles.fillImage}
            resizeMode="cover"
          />
        ) : (
          <View className="items-center px-6">
            <PetAvatar
              avatarKey={post.avatarKey}
              species={post.species}
              size={96}
              name={post.petName}
            />
            <Text className="mt-3 text-center font-body text-sm text-forest-600">
              {post.caption}
            </Text>
          </View>
        )}
      </View>

      <View className="px-4 py-3">
        <Text className="font-body text-xs uppercase tracking-wide text-forest-500">
          {timeAgo}
        </Text>
        <View className="mt-3 flex-row items-center gap-5">
          <Pressable
            onPress={() => onToggleLike(post)}
            className="active:opacity-70"
          >
            <Ionicons
              name={post.liked ? 'heart' : 'heart-outline'}
              size={26}
              color={post.liked ? brand.score.poor : brand.tealPressed}
            />
          </Pressable>
          <Pressable
            onPress={() => onOpenComments(post)}
            className="active:opacity-70"
          >
            <Ionicons
              name="chatbubble-outline"
              size={24}
              color={brand.tealPressed}
            />
          </Pressable>
          <Pressable
            onPress={() => onShare(post)}
            className="active:opacity-70"
          >
            <Ionicons
              name="share-outline"
              size={24}
              color={brand.tealPressed}
            />
          </Pressable>
        </View>
        <View className="mt-3 flex-row items-center">
          <Ionicons name="heart" size={14} color={brand.ink} />
          <Text className="ml-2 flex-1 font-body text-sm text-forest-800">
            {likedBy}
          </Text>
        </View>
        <Text className="mt-2 font-body text-sm text-forest-700">
          <Text className="font-body-bold">{post.author}</Text> {post.caption}
        </Text>
        <Pressable onPress={() => onOpenComments(post)}>
          <Text className="mt-1 font-body text-xs text-forest-500">
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
  const [sharePost, setSharePost] = useState<StoryPost | null>(null);
  const [authorCard, setAuthorCard] = useState<AuthorCard | null>(null);
  const [authorFollowing, setAuthorFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);
  const [modBusy, setModBusy] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [composeError, setComposeError] = useState<string | null>(null);
  const [careStreak, setCareStreak] = useState<CareStreakState | null>(null);

  const closeCompose = () => {
    setComposeOpen(false);
    setComposeError(null);
  };

  const load = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        void syncLocalFollowsToCloud();
        const [feed, nextPets] = await Promise.all([
          listStoryFeed(filter),
          listPets().catch(() => [] as PetRow[]),
        ]);
        setPosts(feed);
        setPets(nextPets);
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
    setComposeError(null);
    setComposeOpen(true);
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
      await createStoryPost({
        caption: text,
        imageUri,
        species: pet?.species === 'dog' || pet?.species === 'cat' ? pet.species : species,
        privacy,
        petId: pet?.id ?? null,
        petName: pet?.name ?? null,
        avatarKey: pet?.avatar_key ?? null,
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
    <View style={styles.feedHeader}>
      <ScreenHeader logo="icon" showProfile />
      <View style={styles.actionsRow}>
        <View style={styles.actionsPrimary}>
          <PrimaryButton
            label={t('stories.addPost')}
            size="sm"
            onPress={openCompose}
          />
        </View>
        <Pressable
          onPress={() => router.push('/(app)/contests')}
          style={styles.contestsBtn}
          accessibilityRole="button"
          accessibilityLabel={t('contests.open')}
        >
          <Ionicons name="trophy-outline" size={18} color={brand.tealPressed} />
        </Pressable>
        <Pressable
          onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
          style={styles.contestsBtn}
          accessibilityRole="button"
          accessibilityLabel={
            viewMode === 'list' ? t('stories.viewGrid') : t('stories.viewList')
          }
        >
          <Ionicons
            name={viewMode === 'list' ? 'grid-outline' : 'list'}
            size={18}
            color={brand.tealPressed}
          />
        </Pressable>
      </View>

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
              style={[styles.filterChip, active && styles.filterChipActive]}
            >
              <Text
                style={[
                  styles.filterChipText,
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
    <AppScreen>
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
              tintColor={brand.tealDeep}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
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
                onToggleLike={(p) => void onToggleLike(p)}
                onShare={setSharePost}
                onOpenComments={openComments}
                onOpenAuthor={(p) => void openAuthor(p)}
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
        <View className="flex-1 justify-end">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.close')}
            onPress={closeCompose}
            className="absolute inset-0 bg-black/40"
          />
          <View className="max-h-[90%] rounded-t-3xl bg-sand-50 px-5 pb-10 pt-5">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-display text-2xl text-forest-900">
                {t('stories.composeTitle')}
              </Text>
              <Pressable
                onPress={closeCompose}
                accessibilityRole="button"
                accessibilityLabel={t('common.close')}
                className="h-10 w-10 items-center justify-center rounded-full bg-forest-100"
              >
                <Ionicons name="close" size={22} color={brand.ink} />
              </Pressable>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <View className="mt-2">
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
                  <Text className="mt-4 font-body-medium text-sm text-forest-700">
                    {t('stories.pickPet')}
                  </Text>
                  <View className="mt-2 flex-row flex-wrap gap-2">
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
                            className={`rounded-2xl px-4 py-2.5 ${
                              active ? 'bg-forest-700' : 'bg-forest-100'
                            }`}
                          >
                            <Text
                              className={`font-body-bold text-sm ${
                                active ? 'text-sand-50' : 'text-forest-800'
                              }`}
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
                  <Text className="mt-4 font-body-medium text-sm text-forest-700">
                    {t('stories.species')}
                  </Text>
                  <View className="mt-2 flex-row gap-2">
                    {(['cat', 'dog'] as StorySpecies[]).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setSpecies(s)}
                        className={`flex-1 items-center rounded-2xl py-3 ${
                          species === s ? 'bg-forest-700' : 'bg-forest-100'
                        }`}
                      >
                        <Text
                          className={`font-body-bold text-sm ${
                            species === s ? 'text-sand-50' : 'text-forest-800'
                          }`}
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

              <Text className="mt-4 font-body-medium text-sm text-forest-700">
                {t('stories.privacy')}
              </Text>
              <View className="mt-2 flex-row gap-2">
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
                    className={`flex-1 items-center rounded-2xl py-3 ${
                      privacy === item.id ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-body-bold text-xs ${
                        privacy === item.id ? 'text-sand-50' : 'text-forest-800'
                      }`}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <Text className="mt-4 font-body-medium text-sm text-forest-700">
                {t('stories.caption')}
              </Text>
              <TextInput
                value={caption}
                onChangeText={(text) => {
                  setCaption(text);
                  if (text.trim()) setComposeError(null);
                }}
                placeholder={t('stories.captionPlaceholder')}
                multiline
                className="mt-2 min-h-[96px] rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
                placeholderTextColor="#7FD9C9"
              />

              {composeError ? (
                <Text className="mt-3 font-body text-sm leading-5 text-score-poor">
                  {composeError}
                </Text>
              ) : null}

              <View className="mt-5 gap-3">
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
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-sand-50 px-5 pb-10 pt-5">
            {authorCard ? (
              <>
                <View className="flex-row items-center">
                  <PetAvatar
                    avatarKey={authorCard.avatarKey}
                    species={authorCard.species}
                    size={56}
                    name={authorCard.petName}
                  />
                  <View className="ml-3 flex-1">
                    <Text className="font-display text-2xl text-forest-900">
                      {authorCard.author}
                    </Text>
                    <Text className="mt-1 font-body text-sm text-forest-600">
                      {t('stories.authorPet', { name: authorCard.petName })}
                    </Text>
                  </View>
                </View>
                <Text className="mt-4 font-body text-xs leading-5 text-forest-500">
                  {t('stories.authorHint')}
                </Text>
                {authorCard.mine && careStreak ? (
                  <View className="mt-3 rounded-2xl bg-mist px-4 py-3">
                    <Text className="font-body-bold text-sm text-forest-900">
                      {t('stories.careStreakTitle', {
                        count: careStreak.currentStreak,
                      })}
                    </Text>
                    <Text className="mt-1 font-body text-xs text-forest-600">
                      {t('stories.careStreakBest', {
                        count: careStreak.bestStreak,
                      })}
                    </Text>
                  </View>
                ) : null}
                <View className="mt-5 gap-3">
                  {authorCard.mine ? (
                    <Text className="text-center font-body text-sm text-forest-600">
                      {t('stories.authorSelf')}
                    </Text>
                  ) : (
                    <>
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
                        <View className="gap-2">
                          <Text className="font-body-medium text-sm text-forest-700">
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
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  feedHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  actionsPrimary: { flex: 1 },
  contestsBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    paddingBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  filterChipActive: {
    backgroundColor: brand.tealPressed,
    borderColor: brand.tealPressed,
  },
  filterChipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: brand.tealPressed,
  },
  filterChipTextActive: {
    fontFamily: 'DMSans_700Bold',
    color: brand.surface,
  },
  listContent: {
    paddingBottom: 24,
  },
  listItem: {
    paddingHorizontal: 20,
  },
  gridContent: {
    paddingBottom: 24,
  },
  gridRow: {
    gap: 10,
    paddingHorizontal: 20,
  },
  gridItem: {
    flex: 1,
  },
  emptyWrap: {
    marginTop: 32,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A7A72',
  },
  emptyBtn: {
    marginTop: 16,
    width: '100%',
    paddingHorizontal: 20,
  },
  compactMedia: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listMedia: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillImage: {
    width: '100%',
    height: '100%',
  },
});
