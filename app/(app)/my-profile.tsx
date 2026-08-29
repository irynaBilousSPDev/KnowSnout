import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { petAgeShortUk } from '@/src/lib/petAge';
import { speciesLabel } from '@/src/lib/petMeta';
import { getActivityUnreadCount } from '@/src/services/activity';
import { getCurrentUser } from '@/src/services/auth';
import {
  listFriendRequests,
  listFriends,
  type FriendUser,
} from '@/src/services/friends';
import { listPets } from '@/src/services/pets';
import { listStoryPostsByUser } from '@/src/services/stories';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { StoryPost } from '@/src/types/story';
import type { UserProfile } from '@/src/types/userProfile';

type Tab = 'posts' | 'tagged' | 'contests';

const PROFILE_BADGES = [
  { id: 'checks', labelKey: 'profile.badgeChecks' },
  { id: 'breeds', labelKey: 'profile.badgeBreeds' },
  { id: 'spotlight', labelKey: 'profile.badgeSpotlight' },
] as const;

function petCardMeta(pet: PetRow): string {
  const breed = pet.breed?.trim() || speciesLabel(pet.species);
  const age = petAgeShortUk(pet.birth_date);
  return age ? `${breed} · ${age}` : breed;
}

function friendShortName(name: string): string {
  if (name.includes(' та ')) return name;
  return name.split(' ')[0] ?? name;
}

/** Screenshot 04.25 + app map — соціальний «Мій профіль» (акаунт → my-data). */
export default function MyProfileScreen() {
  const scrollRef = useRef<ScrollView>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [posts, setPosts] = useState<StoryPost[]>([]);
  const [requestCount, setRequestCount] = useState(0);
  const [activityUnread, setActivityUnread] = useState(0);
  const [tab, setTab] = useState<Tab>('posts');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await getCurrentUser();
      const [nextProfile, nextPets, nextFriends, requests, unread] =
        await Promise.all([
          getUserProfile(),
          listPets().catch(() => [] as PetRow[]),
          listFriends().catch(() => [] as FriendUser[]),
          listFriendRequests().catch(() => []),
          getActivityUnreadCount().catch(() => 0),
        ]);
      setProfile(nextProfile);
      setPets(nextPets);
      setFriends(nextFriends);
      setRequestCount(requests.length);
      setActivityUnread(unread);
      if (me) {
        const userPosts = await listStoryPostsByUser(me.id);
        setPosts(userPosts);
      } else {
        setPosts([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <LoadingState message={t('common.loading')} />
      </AppScreen>
    );
  }

  const name = profile?.display_name?.trim() || t('account.demoName');
  const handle = profile?.handle
    ? `@${profile.handle.replace(/^@/, '')}`
    : '@marta.k';
  const city = profile?.city?.trim() || t('account.demoCity');
  const bio =
    profile?.bio?.trim() || t('profile.defaultBio');
  const languages = profile?.languages?.trim() || t('profile.langs');
  const friendCount = friends.length;
  const postCount = posts.length;
  const postSlots = Array.from({ length: 6 }, (_, i) => posts[i] ?? null);

  const openPostsTab = () => {
    setTab('posts');
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('profile.mine')}
        titleSize={18}
        right={
          <View style={styles.headIcons}>
            <Pressable
              onPress={() => router.push('/(app)/story-compose' as never)}
              style={styles.iconBtn}
              accessibilityLabel={t('stories.composeTitle')}
            >
              <Ionicons name="camera-outline" size={16} color={brand.ink} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(app)/activity' as never)}
              style={styles.iconBtn}
              accessibilityLabel={
                activityUnread > 0
                  ? `${t('activity.title')}, ${activityUnread}`
                  : t('activity.title')
              }
            >
              <Ionicons name="paw-outline" size={16} color={brand.ink} />
              {activityUnread > 0 ? (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeT}>
                    {activityUnread > 99 ? '99' : String(activityUnread)}
                  </Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        }
      />

      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <View style={styles.pad}>
          <View style={styles.hero}>
            <Pressable
              onPress={() => router.push('/(app)/edit-account' as never)}
              accessibilityLabel={t('profile.edit')}
            >
              <UserAvatar
                avatarKey={profile?.avatar_key}
                avatarUri={profile?.avatar_uri}
                size={78}
                name={name}
              />
            </Pressable>
            <View style={styles.counts}>
              <Pressable style={styles.count} onPress={openPostsTab}>
                <Text style={styles.countN}>{postCount}</Text>
                <Text style={styles.countL}>{t('profile.statPosts')}</Text>
              </Pressable>
              <Pressable
                style={styles.count}
                onPress={() => router.push('/(app)/friends' as never)}
              >
                <Text style={styles.countN}>{friendCount}</Text>
                <Text style={styles.countL}>{t('profile.statFriends')}</Text>
              </Pressable>
              <Pressable
                style={styles.count}
                onPress={() => router.push('/(app)/(tabs)/pets' as never)}
              >
                <Text style={styles.countN}>{pets.length}</Text>
                <Text style={styles.countL}>{t('profile.statPets')}</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>
            {handle} · {city}
          </Text>
          <Text style={styles.bio}>{bio}</Text>

          <View style={styles.pills}>
            <View style={[styles.pill, styles.pillRose]}>
              <Ionicons name="location" size={11} color={brand.rose} />
              <Text style={styles.pillRoseT}>{city}</Text>
            </View>
            <View style={styles.pill}>
              <Text style={styles.pillT}>{languages}</Text>
            </View>
            <View style={[styles.pill, styles.pillGreen]}>
              <Text style={styles.pillGreenT}>{t('profile.withUs')}</Text>
            </View>
            {profile?.privacy_friends_only ? (
              <View style={styles.pill}>
                <Ionicons
                  name="lock-closed-outline"
                  size={11}
                  color={brand.muted}
                />
                <Text style={styles.pillT}>{t('profile.privacyFriends')}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.editWrap}>
            <PrimaryButton
              label={t('profile.edit')}
              variant="secondary"
              onPress={() => router.push('/(app)/edit-account' as never)}
            />
          </View>

          <Pressable
            onPress={() => router.push('/(app)/my-data' as never)}
            style={styles.accountRow}
            accessibilityRole="button"
            accessibilityLabel={t('me.title')}
          >
            <View style={styles.accountCopy}>
              <Text style={styles.accountLabel}>{t('me.title')}</Text>
              <Text style={styles.accountHint}>{t('profile.accountHint')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={14} color={brand.mutedSoft} />
          </Pressable>

          {requestCount > 0 ? (
            <Pressable
              onPress={() => router.push('/(app)/friend-requests' as never)}
              style={styles.requestBanner}
            >
              <View style={styles.requestCopy}>
                <Text style={styles.requestTitle}>
                  {t('profile.newRequests', { n: String(requestCount) })}
                </Text>
                <Text style={styles.requestBody}>{t('profile.view')}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.accentDark}
              />
            </Pressable>
          ) : null}

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('profile.achievements')}</Text>
            <Pressable onPress={() => router.push('/(app)/achievements' as never)}>
              <Text style={styles.link}>{t('profile.allCount', { n: '3' })}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.badgeRow}>
              {PROFILE_BADGES.map((badge) => (
                <Pressable
                  key={badge.id}
                  onPress={() => router.push('/(app)/achievements' as never)}
                  style={styles.badgeChip}
                >
                  <Ionicons name="ribbon-outline" size={14} color={brand.accent} />
                  <Text style={styles.badgeChipT}>{t(badge.labelKey)}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('profile.myPets')}</Text>
            <Pressable onPress={() => router.push('/(app)/pet-species' as never)}>
              <Text style={styles.link}>{t('profile.addPet')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.petRow}>
              {pets.length === 0 ? (
                <Pressable
                  onPress={() => router.push('/(app)/pet-species' as never)}
                  style={styles.petEmpty}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={22}
                    color={brand.mutedSoft}
                  />
                  <Text style={styles.petEmptyT}>{t('pets.emptyTitle')}</Text>
                  <Text style={styles.petEmptyLink}>{t('pets.add')}</Text>
                </Pressable>
              ) : (
                pets.map((pet) => (
                  <Pressable
                    key={pet.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/pet-hub',
                        params: { petId: pet.id },
                      } as never)
                    }
                    style={styles.petCard}
                  >
                    <PetAvatar
                      avatarKey={pet.avatar_key}
                      avatarUri={pet.avatar_uri}
                      species={pet.species}
                      size={40}
                      name={pet.name}
                    />
                    <View style={styles.petCopy}>
                      <Text style={styles.petName}>{pet.name}</Text>
                      <Text style={styles.petMeta}>{petCardMeta(pet)}</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          </ScrollView>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('friends.title')}</Text>
            <Pressable onPress={() => router.push('/(app)/friends' as never)}>
              <Text style={styles.link}>
                {friendCount > 0
                  ? t('profile.allFriends', { n: String(friendCount) })
                  : t('friends.search')}
              </Text>
            </Pressable>
          </View>

          {friends.length === 0 ? (
            <Pressable
              onPress={() => router.push('/(app)/friend-search' as never)}
              style={styles.friendEmpty}
            >
              <Ionicons name="people-outline" size={20} color={brand.mutedSoft} />
              <Text style={styles.friendEmptyT}>{t('friends.empty')}</Text>
              <Text style={styles.friendEmptyLink}>{t('friends.search')}</Text>
            </Pressable>
          ) : (
            <>
              {friends.length > 1 ? (
                <View style={styles.friendStackRow}>
                  <View style={styles.stack}>
                    {friends.slice(0, 4).map((f, i) => (
                      <View
                        key={f.id}
                        style={[
                          styles.stackAv,
                          { marginLeft: i === 0 ? 0 : -10 },
                        ]}
                      >
                        <UserAvatar
                          avatarKey={f.avatarKey}
                          size={32}
                          name={f.name}
                        />
                      </View>
                    ))}
                  </View>
                  <Text style={styles.stackHint}>
                    {t('profile.friendsCount', { count: String(friendCount) })}
                  </Text>
                </View>
              ) : null}
              <View style={styles.friendList}>
                {friends.slice(0, 3).map((f) => (
                  <Pressable
                    key={f.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/user-profile',
                        params: { userId: f.id },
                      } as never)
                    }
                    style={styles.friendCard}
                  >
                    <UserAvatar avatarKey={f.avatarKey} size={40} name={f.name} />
                    <Text style={styles.friendName}>{friendShortName(f.name)}</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={brand.mutedSoft}
                    />
                  </Pressable>
                ))}
              </View>
            </>
          )}

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
            posts.length === 0 ? (
              <View style={styles.postsEmpty}>
                <Ionicons
                  name="camera-outline"
                  size={28}
                  color={brand.mutedSoft}
                />
                <Text style={styles.postsEmptyT}>{t('profile.postsEmpty')}</Text>
                <Pressable
                  onPress={() => router.push('/(app)/story-compose' as never)}
                  style={styles.postsEmptyBtn}
                >
                  <Text style={styles.postsEmptyBtnT}>
                    {t('stories.composeTitle')}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.grid}>
                {postSlots.map((p, i) => (
                  <Pressable
                    key={p?.id ?? `slot-${i}`}
                    onPress={() => {
                      if (!p) {
                        router.push('/(app)/story-compose' as never);
                        return;
                      }
                      router.push({
                        pathname: '/(app)/story-post',
                        params: { postId: p.id },
                      } as never);
                    }}
                    style={styles.gridCell}
                  >
                    {p?.imageUri ? (
                      <Image source={{ uri: p.imageUri }} style={styles.gridImg} />
                    ) : (
                      <>
                        <Ionicons
                          name="image-outline"
                          size={22}
                          color={brand.mutedSoft}
                        />
                        <Text style={styles.gridLabel}>{t('profile.postCell')}</Text>
                      </>
                    )}
                  </Pressable>
                ))}
              </View>
            )
          ) : tab === 'contests' ? (
            <View style={styles.tabEmptyBlock}>
              <Text style={styles.tabEmpty}>{t('profile.tabEmpty')}</Text>
              <Pressable
                onPress={() => router.push('/(app)/spotlight-hub' as never)}
                style={styles.tabEmptyLink}
              >
                <Text style={styles.link}>{t('spotlight.title')}</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.tabEmpty}>{t('profile.tabEmpty')}</Text>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40 },
  headIcons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    minWidth: 76,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    backgroundColor: brand.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: brand.canvas,
  },
  bellBadgeT: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    lineHeight: 11,
    color: '#FFFFFF',
  },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    gap: 10,
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  counts: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  count: { alignItems: 'center', gap: 2 },
  countN: { fontFamily: fonts.title, fontSize: 18, color: brand.ink },
  countL: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  name: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
    marginTop: 2,
  },
  handle: { fontFamily: fonts.body, fontSize: 12.5, color: brand.muted },
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
  editWrap: { marginTop: 4 },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  accountCopy: { flex: 1, gap: 2, paddingRight: 8 },
  accountLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.ink,
  },
  accountHint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  requestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  requestCopy: { flex: 1, gap: 2 },
  requestTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  requestBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.accentDark,
  },
  section: { fontFamily: fonts.title, fontSize: 14, color: brand.ink },
  sectionRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: { fontFamily: fonts.bodyBold, fontSize: 12, color: brand.accent },
  badgeRow: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeChipT: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: brand.ink,
  },
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
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  petCopy: { gap: 1 },
  petName: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  petMeta: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  petEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    paddingVertical: 20,
    paddingHorizontal: 24,
    minWidth: 200,
  },
  petEmptyT: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textAlign: 'center',
  },
  petEmptyLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.accent,
  },
  friendStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  stack: { flexDirection: 'row' },
  stackAv: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: brand.canvas,
    overflow: 'hidden',
  },
  stackHint: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  friendList: { gap: 8 },
  friendEmpty: {
    alignItems: 'center',
    gap: 6,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  friendEmptyT: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textAlign: 'center',
  },
  friendEmptyLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.accent,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  friendName: { flex: 1, fontFamily: fonts.bodyBold, fontSize: 14, color: brand.ink },
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
    overflow: 'hidden',
  },
  gridImg: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  gridLabel: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brand.mutedSoft,
  },
  postsEmpty: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
    borderRadius: 16,
    backgroundColor: brand.creamDeep,
    marginTop: 4,
  },
  postsEmptyT: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  postsEmptyBtn: {
    marginTop: 4,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  postsEmptyBtnT: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  tabEmpty: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    marginTop: 12,
  },
  tabEmptyBlock: { alignItems: 'flex-start', gap: 8, marginTop: 4 },
  tabEmptyLink: { paddingVertical: 4 },
});
