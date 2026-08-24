import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('friends.title')}</Text>
          <SegmentedControl
            options={[
              {
                id: 'following',
                label: t('friends.followingCount', { count: 12 }),
              },
              { id: 'suggestions', label: t('friends.suggestions') },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'following' ? (
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
          ) : (
            <Text style={styles.empty}>{t('friends.suggestionsHint')}</Text>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40, gap: 10 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginBottom: 2,
  },
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
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.ink },
  empty: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    textAlign: 'center',
  },
});
