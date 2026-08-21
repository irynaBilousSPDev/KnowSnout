import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  getKnownUser,
  listFriends,
  sendFriendRequest,
  type FriendUser,
} from '@/src/services/friends';
import {
  formatStoryTimeAgo,
  listStoryPostsByUser,
} from '@/src/services/stories';
import {
  followUser,
  isFollowing,
  unfollowUser,
} from '@/src/services/storyFollows';
import type { StoryPost } from '@/src/types/story';
import { brand } from '@/src/theme/brand';

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const [user, setUser] = useState<FriendUser | null>(null);
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [following, setFollowing] = useState(false);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [known, feed, friends, alreadyFollowing] = await Promise.all([
        getKnownUser(userId),
        listStoryPostsByUser(userId),
        listFriends(),
        isFollowing(userId),
      ]);
      if (known) {
        setUser(known);
      } else if (feed[0]) {
        setUser({
          id: userId,
          name: feed[0].author,
          handle: `@${feed[0].author.toLowerCase().replace(/\s+/g, '_')}`,
          bio: t('profile.stubBio'),
          avatarKey: feed[0].avatarKey || 'woman-1',
          city: t('profile.stubCity'),
        });
      } else {
        setUser({
          id: userId,
          name: t('profile.unknown'),
          handle: '@user',
          bio: t('profile.stubBio'),
          avatarKey: 'woman-1',
          city: t('profile.stubCity'),
        });
      }
      setPosts(feed);
      setFollowing(alreadyFollowing);
      setIsFriend(friends.some((f) => f.id === userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onFollow = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      if (following) {
        await unfollowUser(userId);
        setFollowing(false);
      } else {
        await followUser(userId);
        setFollowing(true);
      }
    } finally {
      setBusy(false);
    }
  };

  const onAddFriend = async () => {
    if (!userId) return;
    setBusy(true);
    try {
      const ok = await sendFriendRequest(userId);
      notify(
        t('common.ok'),
        ok ? t('friends.addDone') : t('friends.addSkip'),
      );
      if (ok) setIsFriend(true);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <AppScreen>
        <LoadingState />
      </AppScreen>
    );
  }

  const petsCount = Math.max(1, posts.length > 0 ? 1 : 0) + (posts.length > 2 ? 1 : 0);

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={user?.name ?? t('profile.title')}
            subtitle={user?.handle ?? t('profile.subtitle')}
          />

          <View style={styles.hero}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={brand.navy} />
            </View>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.meta}>
              {user?.city ?? t('profile.stubCity')} ·{' '}
              {t('profile.petsCount', { count: String(petsCount) })}
            </Text>
            {user?.bio ? <Text style={styles.bio}>{user.bio}</Text> : null}
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label={following ? t('stories.unfollow') : t('stories.follow')}
              variant={following ? 'secondary' : 'primary'}
              loading={busy}
              onPress={() => void onFollow()}
            />
            <View style={styles.gap} />
            <PrimaryButton
              label={t('dm.message')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/dm/[userId]',
                  params: {
                    userId: userId ?? '',
                    name: user?.name ?? '',
                    avatarKey: user?.avatarKey ?? 'woman-1',
                  },
                } as never)
              }
            />
            <View style={styles.gap} />
            <PrimaryButton
              label={isFriend ? t('profile.alreadyFriend') : t('friends.add')}
              variant="ghost"
              disabled={isFriend}
              loading={busy}
              onPress={() => void onAddFriend()}
            />
          </View>

          <Text style={styles.section}>{t('profile.posts')}</Text>
          {posts.length === 0 ? (
            <Text style={styles.empty}>{t('profile.postsEmpty')}</Text>
          ) : (
            posts.map((p) => (
              <ListRow
                key={p.id}
                title={p.petName}
                subtitle={p.caption}
                meta={formatStoryTimeAgo(p.createdAt)}
                leading={
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={brand.navy}
                  />
                }
                onPress={() =>
                  router.push({
                    pathname: '/(app)/story-comments',
                    params: { postId: p.id },
                  } as never)
                }
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hero: {
    alignItems: 'center',
    marginBottom: 18,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.roseTint,
    marginBottom: 10,
  },
  name: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: brand.navy,
  },
  meta: {
    marginTop: 6,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.forest,
  },
  bio: {
    marginTop: 8,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
  actions: { marginBottom: 8 },
  gap: { height: 10 },
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.forest,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.forest,
  },
});
