import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

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

/** Screenshot 04.12 — pixel: pills, underline tabs, 3-col dashed grid */
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

  const postSlots = Array.from({ length: 6 }, (_, i) => posts[i] ?? null);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('profile.title')}
        titleSize={18}
        right={
          <Pressable style={styles.more} accessibilityRole="button">
            <Ionicons name="ellipsis-horizontal" size={16} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.hero}>
            <UserAvatar
              avatarKey={user?.avatarKey}
              size={78}
              name={user?.name}
            />
            <View style={styles.counts}>
              <View style={styles.count}>
                <Text style={styles.countN}>{posts.length || 34}</Text>
                <Text style={styles.countL}>{t('profile.statPosts')}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countN}>128</Text>
                <Text style={styles.countL}>{t('profile.statFriends')}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countN}>2</Text>
                <Text style={styles.countL}>{t('profile.statPets')}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{user?.name ?? 'Оксана Мельник'}</Text>
          <Text style={styles.bio}>
            {user?.bio ||
              'Волонтерка притулку «На Палюху». Кокер-спанієль і два коти вдома.'}
          </Text>

          <View style={styles.pills}>
            <View style={[styles.pill, styles.pillRose]}>
              <Ionicons name="location" size={11} color={brand.rose} />
              <Text style={styles.pillRoseT}>
                {user?.city ?? 'Варшава'}
              </Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillT}>{t('profile.langs')}</Text>
            </View>
            <View style={[styles.pill, styles.pillGreen]}>
              <Text style={styles.pillGreenT}>{t('profile.withUs')}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <View style={{ flex: 1.15 }}>
              <PrimaryButton
                label={
                  isFriend
                    ? t('profile.alreadyFriend')
                    : t('friends.addToFriends')
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
            <Text style={styles.section}>{t('profile.petsSection')}</Text>
            <Text style={styles.link}>{t('profile.allPets', { n: '2' })}</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petRow}
          >
            {DEMO_PETS.map((p) => (
              <View key={p.name} style={styles.petCard}>
                <UserAvatar size={40} name={p.name} />
                <View style={styles.petCopy}>
                  <Text style={styles.petName}>{p.name}</Text>
                  <Text style={styles.petMeta}>{p.meta}</Text>
                </View>
              </View>
            ))}
          </ScrollView>

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
                  <UserAvatar size={32} name={`F${i}`} />
                </View>
              ))}
            </View>
            <Text style={styles.mutualT}>{t('profile.mutualList')}</Text>
          </View>

          <View style={styles.tabs}>
            {(
              [
                { id: 'posts' as const, label: t('profile.tabPosts') },
                { id: 'tagged' as const, label: t('profile.tabTagged') },
                { id: 'contests' as const, label: t('profile.tabContests') },
              ] as const
            ).map((item) => {
              const on = tab === item.id;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setTab(item.id)}
                  style={[styles.tab, on && styles.tabOn]}
                >
                  <Text style={[styles.tabT, on && styles.tabTOn]}>
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {tab === 'posts' ? (
            <View style={styles.grid}>
              {postSlots.map((p, i) => (
                <Pressable
                  key={p?.id ?? `slot-${i}`}
                  onPress={() => {
                    if (!p) return;
                    router.push({
                      pathname: '/(app)/story-post',
                      params: { postId: p.id },
                    } as never);
                  }}
                  style={styles.gridCell}
                >
                  <Ionicons
                    name="image-outline"
                    size={22}
                    color={brand.mutedSoft}
                  />
                  <Text style={styles.gridLabel}>{t('profile.postCell')}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counts: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  count: { alignItems: 'center', gap: 2 },
  countN: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  countL: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  name: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
    marginTop: 2,
  },
  bio: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
    marginTop: -2,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillT: { fontFamily: fonts.body, fontSize: 11, color: brand.ink },
  pillRose: { backgroundColor: brand.roseTint },
  pillRoseT: { fontFamily: fonts.bodySemi, fontSize: 11, color: brand.ink },
  pillGreen: { backgroundColor: brand.accent },
  pillGreenT: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: '#FFFFFF',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
  sectionRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  section: { fontFamily: fonts.title, fontSize: 14, color: brand.ink },
  link: { fontFamily: fonts.bodyBold, fontSize: 12, color: brand.accent },
  petRow: { flexDirection: 'row', gap: 10, paddingRight: 8 },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minWidth: 148,
  },
  petCopy: { gap: 1 },
  petName: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  petMeta: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  mutual: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stack: { flexDirection: 'row' },
  stackAv: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: brand.canvas,
    overflow: 'hidden',
  },
  mutualT: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  tabs: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.divider,
  },
  tab: {
    paddingHorizontal: 4,
    paddingBottom: 10,
    marginRight: 18,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabOn: { borderBottomColor: brand.accent },
  tabT: { fontFamily: fonts.body, fontSize: 13, color: brand.muted },
  tabTOn: { fontFamily: fonts.bodySemi, color: brand.accent },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  gridCell: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  gridLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brand.mutedSoft,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    marginTop: 12,
  },
});
