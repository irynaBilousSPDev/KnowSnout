import { router, useFocusEffect } from 'expo-router';
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
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { petAgeShortUk } from '@/src/lib/petAge';
import { listFriends, type FriendUser } from '@/src/services/friends';
import { listPets } from '@/src/services/pets';
import { listStoryPostsByUser } from '@/src/services/stories';
import { getUserProfile } from '@/src/services/userProfile';
import { getCurrentUser } from '@/src/services/auth';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { UserProfile } from '@/src/types/userProfile';

function speciesLabel(species: PetRow['species']): string {
  if (species === 'cat') return t('pets.speciesCat');
  if (species === 'bird') return t('pets.speciesBird');
  if (species === 'dog') return 'Корґі';
  return t('pets.pickOther');
}

/** Screenshot 04.25 — HTML Мій профіль */
export default function MyProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [postCount, setPostCount] = useState(18);

  const load = useCallback(async () => {
    const me = await getCurrentUser();
    const [nextProfile, nextPets, nextFriends] = await Promise.all([
      getUserProfile(),
      listPets().catch(() => [] as PetRow[]),
      listFriends().catch(() => [] as FriendUser[]),
    ]);
    setProfile(nextProfile);
    setPets(nextPets);
    setFriends(nextFriends);
    if (me) {
      const posts = await listStoryPostsByUser(me.id);
      setPostCount(Math.max(posts.length, 18));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const name = profile?.display_name?.trim() || 'Марта Ковальчук';
  const handle = profile?.handle
    ? `@${profile.handle.replace(/^@/, '')}`
    : '@marta.k';
  const city = profile?.city?.trim() || 'Варшава';

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.head}>
        <View style={styles.headSpacer} />
        <Text style={styles.headTitle}>{t('profile.mine')}</Text>
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
            accessibilityLabel={t('activity.title')}
          >
            <Ionicons name="notifications-outline" size={16} color={brand.ink} />
          </Pressable>
        </View>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.hero}>
            <UserAvatar
              avatarKey={profile?.avatar_key}
              avatarUri={profile?.avatar_uri}
              size={76}
              name={name}
            />
            <View style={styles.counts}>
              <View style={styles.count}>
                <Text style={styles.countN}>{postCount}</Text>
                <Text style={styles.countL}>{t('profile.statPosts')}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countN}>64</Text>
                <Text style={styles.countL}>{t('profile.statFriends')}</Text>
              </View>
              <View style={styles.count}>
                <Text style={styles.countN}>{Math.max(pets.length, 3)}</Text>
                <Text style={styles.countL}>{t('profile.statPets')}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.handle}>
            {handle} · {city}
          </Text>
          <View style={{ marginTop: 10 }}>
            <PrimaryButton
              label={t('profile.edit')}
              variant="secondary"
              onPress={() => router.push('/(app)/edit-account' as never)}
            />
          </View>

          <Text style={styles.section}>{t('profile.personal')}</Text>
          <View style={styles.card}>
            <Row label={t('profile.email')} value="marta.k@mail.com" />
            <Row label={t('profile.phone')} value="+48 •••• 421" border />
            <Row label={t('profile.language')} value="Українська" border />
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowL}>{t('profile.subscription')}</Text>
              <View style={styles.plusChip}>
                <Text style={styles.plusT}>Plus</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('profile.myPets')}</Text>
            <Pressable onPress={() => router.push('/(app)/pet-species' as never)}>
              <Text style={styles.link}>{t('profile.addPet')}</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.petRow}>
              {(pets.length
                ? pets
                : [
                    {
                      id: 'demo-tukan',
                      name: 'Тукан',
                      species: 'dog' as const,
                      birth_date: '2023-05-01',
                    },
                    {
                      id: 'demo-pukh',
                      name: 'Пух',
                      species: 'cat' as const,
                      birth_date: '2024-03-01',
                    },
                  ]
              ).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    if (String(p.id).startsWith('demo-')) {
                      router.push('/(app)/(tabs)/pets' as never);
                      return;
                    }
                    router.push({
                      pathname: '/(app)/pet-hub',
                      params: { petId: p.id },
                    } as never);
                  }}
                  style={styles.petCard}
                >
                  <UserAvatar size={38} name={p.name} />
                  <View>
                    <Text style={styles.petName}>{p.name}</Text>
                    <Text style={styles.petMeta}>
                      {speciesLabel(p.species)} ·{' '}
                      {petAgeShortUk(p.birth_date) || '—'}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.sectionRow}>
            <Text style={styles.section}>{t('friends.title')}</Text>
            <Pressable onPress={() => router.push('/(app)/friends' as never)}>
              <Text style={styles.link}>{t('profile.allFriends', { n: '64' })}</Text>
            </Pressable>
          </View>
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
              <Text style={styles.friendName}>
                {f.name.includes(' та ') ? f.name : f.name.split(' ')[0]}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function Row({
  label,
  value,
  border,
}: {
  label: string;
  value: string;
  border?: boolean;
}) {
  return (
    <View style={[styles.row, border && styles.rowBorder]}>
      <Text style={styles.rowL}>{label}</Text>
      <Text style={styles.rowV}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 6,
  },
  headSpacer: { width: 72 },
  headTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  headIcons: {
    width: 72,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 8 },
  hero: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 },
  counts: { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  count: { alignItems: 'center', gap: 2 },
  countN: { fontFamily: fonts.title, fontSize: 18, color: brand.ink },
  countL: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  name: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
    marginTop: 10,
  },
  handle: { fontFamily: fonts.body, fontSize: 13, color: brand.muted },
  section: {
    marginTop: 16,
    fontFamily: fonts.title,
    fontSize: 14,
    color: brand.ink,
  },
  sectionRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: { fontFamily: fonts.bodyBold, fontSize: 12, color: brand.accent },
  card: {
    borderRadius: 18,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: brand.divider },
  rowL: { fontFamily: fonts.body, fontSize: 13, color: brand.muted },
  rowV: { fontFamily: fonts.bodySemi, fontSize: 13, color: brand.ink },
  plusChip: {
    borderRadius: 999,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  plusT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.accent },
  petRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 12,
    paddingHorizontal: 12,
    minWidth: 148,
  },
  petName: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  petMeta: { fontFamily: fonts.body, fontSize: 11, color: brand.muted },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  friendName: { fontFamily: fonts.bodyBold, fontSize: 14, color: brand.ink },
});
