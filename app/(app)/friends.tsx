import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { listFriends, removeFriend, type FriendUser } from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

type Tab = 'following' | 'suggestions';

function shortName(name: string) {
  if (name.includes(' та ')) return name;
  return name.split(' ')[0] ?? name;
}

/** Screenshot 04.08 / HTML 28 · Друзі */
export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [tab, setTab] = useState<Tab>('following');

  const load = useCallback(async () => {
    setFriends(await listFriends());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const friendCount = friends.length;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('friends.title')} titleSize={19} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.actions}>
            <Pressable
              onPress={() => router.push('/(app)/friend-requests' as never)}
              style={styles.actionBtn}
            >
              <Ionicons name="person-add-outline" size={16} color={brand.ink} />
              <Text style={styles.actionT}>{t('friends.requests')}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(app)/friend-search' as never)}
              style={styles.actionBtn}
            >
              <Ionicons name="search-outline" size={16} color={brand.ink} />
              <Text style={styles.actionT}>{t('friends.search')}</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push('/(app)/friend-invite' as never)}
              style={styles.actionBtn}
            >
              <Ionicons name="link-outline" size={16} color={brand.ink} />
              <Text style={styles.actionT}>{t('friends.invite')}</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => router.push('/(app)/friend-invite-accept' as never)}
            style={styles.acceptRow}
          >
            <Text style={styles.acceptT}>{t('friends.inviteAccept')}</Text>
            <Ionicons name="chevron-forward" size={14} color={brand.mutedSoft} />
          </Pressable>

          <SegmentedControl
            options={[
              {
                id: 'following',
                label: t('friends.followingCount', { count: friendCount }),
              },
              { id: 'suggestions', label: t('friends.suggestions') },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'following' ? (
            friends.length === 0 ? (
              <Text style={styles.empty}>{t('friends.empty')}</Text>
            ) : (
              friends.map((f) => (
                <Pressable
                  key={f.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/user-profile',
                      params: { userId: f.id },
                    } as never)
                  }
                  style={styles.card}
                >
                  <UserAvatar avatarKey={f.avatarKey} size={44} name={f.name} />
                  <View style={styles.copy}>
                    <Text style={styles.name}>{shortName(f.name)}</Text>
                    <Text style={styles.meta}>
                      {f.speciesHint || f.bio || f.handle}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => void removeFriend(f.id).then(load)}
                    style={styles.unfollow}
                  >
                    <Text style={styles.unfollowT}>{t('friends.unfollow')}</Text>
                  </Pressable>
                </Pressable>
              ))
            )
          ) : (
            <View style={styles.suggestBox}>
              <Text style={styles.empty}>{t('friends.suggestionsHint')}</Text>
              <Pressable
                onPress={() => router.push('/(app)/friend-search' as never)}
                style={styles.suggestBtn}
              >
                <Text style={styles.suggestBtnT}>{t('friends.search')}</Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.ink },
  acceptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  acceptT: { fontFamily: fonts.body, fontSize: 13, color: brand.accentDark },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  copy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  meta: { marginTop: 2, fontFamily: fonts.body, fontSize: 12, color: brand.muted },
  unfollow: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.ink },
  empty: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    textAlign: 'center',
  },
  suggestBox: { gap: 12, marginTop: 8 },
  suggestBtn: {
    alignSelf: 'center',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  suggestBtnT: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.accentDark },
});
