import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
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
import { StoryReportSheet } from '@/src/components/StoryReportSheet';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  formatStoryTimeAgo,
  listStoryFeed,
  toggleStoryLike,
} from '@/src/services/stories';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { StoryFeedFilter, StoryPost } from '@/src/types/story';
import type { UserProfile } from '@/src/types/userProfile';

type FeedTab = 'friends' | 'all' | 'myBreed' | 'nearby';

const TABS: { id: FeedTab; labelKey: string }[] = [
  { id: 'friends', labelKey: 'stories.filterFriends' },
  { id: 'all', labelKey: 'stories.filterAll' },
  { id: 'myBreed', labelKey: 'stories.filterMyBreed' },
  { id: 'nearby', labelKey: 'stories.filterNearby' },
];

function displayName(post: StoryPost): string {
  if (post.author.includes(' та ') || !post.petName) return post.author;
  if (post.author.includes(post.petName)) return post.author;
  return `${post.author}`;
}

function FeedCard({
  post,
  onLike,
  onReport,
}: {
  post: StoryPost;
  onLike: () => void;
  onReport: () => void;
}) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/(app)/story-post',
          params: { postId: post.id },
        } as never)
      }
      style={styles.card}
    >
      <View style={styles.cardHead}>
        <UserAvatar
          avatarKey={post.avatarKey}
          size={36}
          name={post.author}
        />
        <View style={styles.cardHeadText}>
          <Text style={styles.cardName} numberOfLines={1}>
            {displayName(post)}
          </Text>
          <Text style={styles.cardMeta} numberOfLines={1}>
            {[post.location, formatStoryTimeAgo(post.createdAt)]
              .filter(Boolean)
              .join(' · ')}
          </Text>
        </View>
        <Pressable
          hitSlop={8}
          style={styles.menuBtn}
          onPress={onReport}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={brand.muted} />
        </Pressable>
      </View>

      <View style={styles.photo}>
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.photoImg} />
        ) : (
          <>
            <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
            <Text style={styles.photoHint}>{t('stories.photoPlaceholder')}</Text>
          </>
        )}
      </View>

      <Text style={styles.caption}>{post.caption}</Text>

      <View style={styles.actions}>
        <Pressable onPress={onLike} style={styles.action} hitSlop={6}>
          <Ionicons
            name={post.liked ? 'paw' : 'paw-outline'}
            size={18}
            color={post.liked ? brand.accent : brand.muted}
          />
          <Text style={[styles.actionN, post.liked && styles.actionOn]}>
            {post.likes}
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
          hitSlop={6}
        >
          <Ionicons name="chatbubble-outline" size={17} color={brand.muted} />
          <Text style={styles.actionN}>{post.commentsCount}</Text>
        </Pressable>
        <Pressable
          onPress={() =>
            router.push({
              pathname: '/(app)/story-post',
              params: { postId: post.id },
            } as never)
          }
          style={styles.action}
          hitSlop={6}
        >
          <Ionicons name="share-social-outline" size={17} color={brand.muted} />
        </Pressable>
      </View>
    </Pressable>
  );
}

/** Screenshot 04.00 — Стрічка корінь */
export default function StoriesScreen() {
  const [tab, setTab] = useState<FeedTab>('friends');
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportPost, setReportPost] = useState<StoryPost | null>(null);

  const load = useCallback(async (soft?: boolean) => {
    if (!soft) setLoading(true);
    setError(null);
    try {
      const filter: StoryFeedFilter =
        tab === 'friends'
          ? 'friends'
          : tab === 'myBreed'
            ? 'myBreed'
            : tab === 'nearby'
              ? 'nearby'
              : 'all';
      const [feed, me] = await Promise.all([
        listStoryFeed(filter),
        getUserProfile(),
      ]);
      setPosts(feed);
      setProfile(me);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('stories.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [tab]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onLike = async (post: StoryPost) => {
    try {
      const next = await toggleStoryLike(post);
      setPosts((cur) => cur.map((p) => (p.id === next.id ? next : p)));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('tabs.stories')}</Text>
        <View style={styles.titleIcons}>
          <Pressable
            onPress={() => router.push('/(app)/search' as never)}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons name="search-outline" size={20} color={brand.ink} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/messages' as never)}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={brand.ink}
            />
          </Pressable>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {TABS.map((item) => {
          const on = tab === item.id;
          return (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[styles.tab, on && styles.tabOn]}
            >
              <Text style={[styles.tabT, on && styles.tabTOn]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(app)/story-compose' as never)}
        style={styles.composer}
      >
        <UserAvatar
          avatarKey={profile?.avatar_key}
          avatarUri={profile?.avatar_uri}
          gender={profile?.gender}
          size={36}
          name={profile?.display_name ?? t('me.title')}
        />
        <Text style={styles.composerHint} numberOfLines={1}>
          {t('stories.composerHint')}
        </Text>
        <View style={styles.composerPlus}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </View>
      </Pressable>

      {loading && posts.length === 0 ? (
        <LoadingState />
      ) : error && posts.length === 0 ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                void load(true);
              }}
              tintColor={brand.accent}
            />
          }
          renderItem={({ item }) => (
            <FeedCard
              post={item}
              onLike={() => void onLike(item)}
              onReport={() => setReportPost(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('stories.emptyFilter')}</Text>
          }
        />
      )}

      {reportPost ? (
        <StoryReportSheet
          visible
          targetUserId={reportPost.userId}
          postId={reportPost.id}
          onClose={() => setReportPost(null)}
          onBlocked={() => {
            setPosts((cur) =>
              cur.filter((p) => p.userId !== reportPost.userId),
            );
            setReportPost(null);
          }}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },
  title: {
    flex: 1,
    fontFamily: fonts.title,
    fontSize: 26,
    color: brand.ink,
  },
  titleIcons: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 10,
  },
  tab: {
    borderRadius: 999,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabOn: { backgroundColor: brand.accent },
  tabT: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.ink,
  },
  tabTOn: { color: '#FFFFFF' },
  composer: {
    marginHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 18,
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 8,
  },
  composerHint: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  composerPlus: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: 20, paddingBottom: 32, gap: 12 },
  card: {
    backgroundColor: brand.surfaceElevated,
    borderRadius: 18,
    padding: 12,
    gap: 10,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardHeadText: { flex: 1, minWidth: 0 },
  cardName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    marginTop: 1,
  },
  menuBtn: { padding: 4 },
  photo: {
    height: 200,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingTop: 2,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionN: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.muted,
  },
  actionOn: { color: brand.accent },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
