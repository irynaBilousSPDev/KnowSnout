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
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { StoryReportSheet } from '@/src/components/StoryReportSheet';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { buildStoryDeepLink, buildStoryShareMessage } from '@/src/lib/share';
import {
  formatStoryTimeAgo,
  listStoryFeed,
  toggleStoryLike,
} from '@/src/services/stories';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import { useThemedStyles } from '@/src/theme/AppThemeProvider';
import type { StoryFeedFilter, StoryPost } from '@/src/types/story';
import type { UserProfile } from '@/src/types/userProfile';

type FeedTab = 'friends' | 'all' | 'myBreed' | 'nearby';

const TABS: { id: FeedTab; labelKey: string }[] = [
  { id: 'friends', labelKey: 'stories.filterFriends' },
  { id: 'all', labelKey: 'stories.filterAll' },
  { id: 'myBreed', labelKey: 'stories.filterMyBreed' },
  { id: 'nearby', labelKey: 'stories.filterNearby' },
];

function FeedCard({
  post,
  onLike,
  onReport,
  onShare,
}: {
  post: StoryPost;
  onLike: () => void;
  onReport: () => void;
  onShare: () => void;
}) {
  const themed = useThemedStyles();
  const openPost = () =>
    router.push({
      pathname: '/(app)/story-post',
      params: { postId: post.id },
    } as never);

  const meta = [post.location, formatStoryTimeAgo(post.createdAt)]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={[styles.card, themed.card]}>
      <View style={styles.cardHead}>
        <Pressable onPress={openPost} style={styles.cardHeadMain}>
          <UserAvatar
            avatarKey={post.avatarKey}
            size={40}
            name={post.author}
          />
          <View style={styles.cardHeadText}>
            <Text style={[styles.cardName, themed.text]} numberOfLines={1}>
              {post.author}
            </Text>
            {meta ? (
              <Text style={[styles.cardMeta, themed.softText]} numberOfLines={1}>
                {meta}
              </Text>
            ) : null}
          </View>
        </Pressable>
        <Pressable hitSlop={12} onPress={onReport} style={styles.menuBtn}>
          <Ionicons
            name="ellipsis-horizontal"
            size={18}
            color={brand.mutedSoft}
          />
        </Pressable>
      </View>

      <Pressable onPress={openPost} style={[styles.photo, themed.photoPlaceholder]}>
        {post.imageUri ? (
          <Image source={{ uri: post.imageUri }} style={styles.photoImg} />
        ) : (
          <>
            <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
            <Text style={styles.photoHint}>{t('stories.photoPlaceholder')}</Text>
          </>
        )}
      </Pressable>

      <Pressable onPress={openPost}>
        <Text style={[styles.caption, themed.text]}>{post.caption}</Text>
      </Pressable>

      <View style={styles.actions}>
        <Pressable onPress={onLike} style={styles.action} hitSlop={10}>
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
          hitSlop={10}
        >
          <Ionicons name="chatbubble-outline" size={17} color={brand.muted} />
          <Text style={styles.actionN}>{post.commentsCount}</Text>
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable onPress={onShare} hitSlop={10} style={styles.shareBtn}>
          <Ionicons name="arrow-redo-outline" size={18} color={brand.muted} />
        </Pressable>
      </View>
    </View>
  );
}

/** Screenshot 04.00 — feed layout */
export default function StoriesScreen() {
  const themed = useThemedStyles();
  const [tab, setTab] = useState<FeedTab>('friends');
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportPost, setReportPost] = useState<StoryPost | null>(null);
  const [sharePost, setSharePost] = useState<StoryPost | null>(null);

  const load = useCallback(
    async (soft?: boolean) => {
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
    },
    [tab],
  );

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

  const listHeader = (
    <View style={styles.headerBlock}>
      <View style={styles.titleRow}>
        <Text style={[styles.title, themed.text]}>{t('tabs.stories')}</Text>
        <View style={styles.titleIcons}>
          <Pressable
            onPress={() => router.push('/(app)/spotlight-hub' as never)}
            style={[styles.iconBtn, themed.chip]}
            accessibilityLabel={t('spotlight.title')}
          >
            <Ionicons name="trophy-outline" size={18} color={themed.text.color} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/search' as never)}
            style={[styles.iconBtn, themed.chip]}
            accessibilityLabel={t('search.placeholder')}
          >
            <Ionicons name="search-outline" size={18} color={themed.text.color} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/messages' as never)}
            style={[styles.iconBtn, themed.chip]}
            accessibilityLabel={t('dm.title')}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={18}
              color={themed.text.color}
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
              style={[styles.tab, themed.chip, on && styles.tabOn]}
            >
              <Text style={[styles.tabT, themed.mutedText, on && styles.tabTOn]}>
                {t(item.labelKey)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => router.push('/(app)/story-compose' as never)}
        style={[styles.composer, themed.card]}
      >
        <UserAvatar
          avatarKey={profile?.avatar_key}
          avatarUri={profile?.avatar_uri}
          gender={profile?.gender}
          size={36}
          name={profile?.display_name ?? t('me.title')}
        />
        <Text style={[styles.composerHint, themed.softText]} numberOfLines={1}>
          {t('stories.composerHint')}
        </Text>
        <View style={styles.composerPlus}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </View>
      </Pressable>
    </View>
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      {loading && posts.length === 0 ? (
        <>
          {listHeader}
          <LoadingState />
        </>
      ) : error && posts.length === 0 ? (
        <>
          {listHeader}
          <ErrorState message={error} onRetry={() => void load()} />
        </>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={listHeader}
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
              onShare={() => setSharePost(item)}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('stories.emptyFilter')}</Text>
          }
          ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
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

      {sharePost ? (
        <SharePhotoSheet
          visible
          onClose={() => setSharePost(null)}
          imageUri={sharePost.imageUri}
          title={sharePost.author}
          message={buildStoryShareMessage({
            author: sharePost.author,
            caption: sharePost.caption,
            postId: sharePost.id,
          })}
          linkUrl={buildStoryDeepLink(sharePost.id)}
        />
      ) : null}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 6,
    paddingBottom: 14,
    gap: 12,
  },
  title: {
    flex: 1,
    fontFamily: fonts.titleExtra,
    fontSize: 26,
    lineHeight: 32,
    color: brand.ink,
    letterSpacing: -0.3,
  },
  titleIcons: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 14,
    paddingRight: 4,
  },
  tab: {
    borderRadius: 999,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabOn: {
    backgroundColor: brand.accentTint,
    borderColor: brand.accentBorder,
  },
  tabT: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  tabTOn: { color: brand.accent },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 999,
    paddingVertical: 6,
    paddingLeft: 6,
    paddingRight: 6,
    marginBottom: 16,
    shadowColor: brand.shadow.color,
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  composerHint: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
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
  list: {
    paddingBottom: 40,
  },
  card: {
    marginHorizontal: 20,
    borderRadius: 22,
    padding: 14,
    gap: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHead: { flexDirection: 'row', alignItems: 'center' },
  cardHeadMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 0,
  },
  cardHeadText: { flex: 1, minWidth: 0 },
  cardName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14.5,
    color: brand.ink,
  },
  cardMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    marginTop: 2,
  },
  menuBtn: { padding: 6, marginRight: -4 },
  photo: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
  },
  photoImg: { width: '100%', height: '100%' },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 14.5,
    lineHeight: 21,
    color: brand.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    paddingTop: 2,
  },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionN: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  actionOn: { color: brand.accent },
  shareBtn: { padding: 2 },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    marginHorizontal: 20,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
