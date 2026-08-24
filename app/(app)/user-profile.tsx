import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  getKnownUser,
  listFriends,
  sendFriendRequest,
  type FriendUser,
} from '@/src/services/friends';
import { listStoryPostsByUser } from '@/src/services/stories';
import type { StoryPost } from '@/src/types/story';
import { brand, fonts } from '@/src/theme/brand';

type Tab = 'posts' | 'tagged' | 'contests';

const DEMO_PETS = [
  { name: 'Лапка', meta: 'Кокер · 4 р.' },
  { name: 'Мурчик', meta: 'Кіт · 7 р.' },
];

/** Screenshot 04.12 */
export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId?: string }>();
  const [user, setUser] = useState<FriendUser | null>(null);
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>('posts');

  const load = useCallback(async () => {
    if (!userId) {
      setUser(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [known, feed, allFriends] = await Promise.all([
        getKnownUser(userId),
        listStoryPostsByUser(userId),
        listFriends(),
      ]);
      setUser(
        known ?? {
          id: userId,
          name: feed[0]?.author ?? t('profile.unknown'),
          handle: '@user',
          bio: t('profile.stubBio'),
          avatarKey: feed[0]?.avatarKey || 'woman-1',
          city: t('profile.stubCity'),
          mutualCount: 12,
        },
      );
      setPosts(feed);
      setIsFriend(allFriends.some((f) => f.id === userId));
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('profile.title')}
        titleSize={18}
        right={
          <Pressable style={styles.more}>
            <Text style={styles.moreT}>⋯</Text>
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.hero}>
            <UserAvatar
              avatarKey={user?.avatarKey}
              size={76}
              name={user?.name}
            />
            <View style={styles.counts}>
              <View style={styles.count}>
                <Text style={styles.countN}>{posts.length || 34}</Text>
                <Text style={styles.countL}>{t('profile.statPosts')}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countN}>128</Text>
                <Text style={styles.countL}>{t('friends.title')}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countN}>2</Text>
                <Text style={styles.countL}>{t('tabs.pets')}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.bio}>{user?.bio}</Text>
          <View style={styles.pills}>
            <View style={styles.pill}>
              <Text style={styles.pillT}>📍 {user?.city ?? 'Варшава'}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillT}>🇺🇦 укр · 🇵🇱 пол</Text>
            </View>
            <View style={[styles.pill, styles.pillMint]}>
              <Text style={styles.pillMintT}>{t('profile.withUs')}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={
                  isFriend ? t('profile.alreadyFriend') : t('friends.addPlus')
                }
                disabled={isFriend}
                loading={busy}
                onPress={() => {
                  if (!userId) return;
                  setBusy(true);
                  void sendFriendRequest(userId)
                    .then(() => {
                      notify(t('common.ok'), t('friends.requestSent'));
                      setIsFriend(true);
                    })
                    .finally(() => setBusy(false));
                }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <PrimaryButton
                label={t('profile.write')}
                variant="secondary"
                onPress={() =>
                  router.push({
                    pathname: '/(app)/dm/[userId]',
                    params: {
                      userId: userId ?? '',
                      name: user?.name ?? '',
                      avatarKey: user?.avatarKey ?? '',
                    },
                  } as never)
                }
              />
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('tabs.pets')}</Text>
            <Text style={styles.link}>{t('profile.allPets', { n: '2' })}</Text>
          </View>
          <View style={styles.petRow}>
            {DEMO_PETS.map((p) => (
              <View key={p.name} style={styles.petCard}>
                <UserAvatar size={38} name={p.name} />
                <View>
                  <Text style={styles.petName}>{p.name}</Text>
                  <Text style={styles.petMeta}>{p.meta}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('profile.mutualFriends')}</Text>
            <Text style={styles.link}>12</Text>
          </View>
          <View style={styles.mutual}>
            <View style={styles.stack}>
              {[0, 1, 2, 3].map((i) => (
                <View
                  key={i}
                  style={[styles.stackAv, { marginLeft: i === 0 ? 0 : -10 }]}
                >
                  <UserAvatar size={34} name={`F${i}`} />
                </View>
              ))}
            </View>
            <Text style={styles.mutualT}>{t('profile.mutualList')}</Text>
          </View>

          <View style={styles.tabs}>
            {(
              [
                { id: 'posts' as const, label: t('profile.statPosts') },
                { id: 'tagged' as const, label: t('profile.tabTagged') },
                { id: 'contests' as const, label: t('profile.tabContests') },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setTab(item.id)}
                style={[styles.tab, tab === item.id && styles.tabOn]}
              >
                <Text style={[styles.tabT, tab === item.id && styles.tabTOn]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {tab === 'posts' && posts.length === 0 ? (
            <Text style={styles.empty}>{t('profile.postsEmpty')}</Text>
          ) : null}
          {tab === 'posts'
            ? posts.slice(0, 6).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/story-post',
                      params: { postId: p.id },
                    } as never)
                  }
                  style={styles.postCard}
                >
                  <Text style={styles.postCap} numberOfLines={2}>
                    {p.caption}
                  </Text>
                </Pressable>
              ))
            : (
              <Text style={styles.empty}>{t('profile.tabEmpty')}</Text>
            )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  more: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreT: { fontSize: 16, color: brand.ink },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 8 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  counts: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  count: { alignItems: 'center' },
  countN: { fontFamily: fonts.title, fontSize: 17, color: brand.ink },
  countL: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  name: { fontFamily: fonts.title, fontSize: 16, color: brand.ink, marginTop: 4 },
  bio: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: brand.muted,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  pill: {
    borderRadius: 999,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillT: { fontFamily: fonts.body, fontSize: 11, color: brand.ink },
  pillMint: { backgroundColor: brand.accentTint },
  pillMintT: { fontFamily: fonts.bodySemi, fontSize: 11, color: brand.accent },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  sectionRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { fontFamily: fonts.title, fontSize: 13, color: brand.ink },
  link: { fontFamily: fonts.bodyBold, fontSize: 11.5, color: brand.accent },
  petRow: { flexDirection: 'row', gap: 8 },
  petCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    padding: 10,
  },
  petName: { fontFamily: fonts.bodyBold, fontSize: 12, color: brand.ink },
  petMeta: { fontFamily: fonts.body, fontSize: 10.5, color: brand.muted },
  mutual: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stack: { flexDirection: 'row' },
  stackAv: {
    borderRadius: 17,
    borderWidth: 2,
    borderColor: brand.canvas,
    overflow: 'hidden',
  },
  mutualT: { flex: 1, fontFamily: fonts.body, fontSize: 12, color: brand.muted },
  tabs: { flexDirection: 'row', gap: 6, marginTop: 8 },
  tab: {
    borderRadius: 999,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 13,
    paddingVertical: 5,
  },
  tabOn: { backgroundColor: brand.accentTint },
  tabT: { fontFamily: fonts.body, fontSize: 11.5, color: brand.muted },
  tabTOn: { fontFamily: fonts.bodySemi, color: brand.accent },
  empty: { fontFamily: fonts.body, fontSize: 13, color: brand.muted, marginTop: 8 },
  postCard: {
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
  },
  postCap: { fontFamily: fonts.body, fontSize: 13, color: brand.ink },
});
