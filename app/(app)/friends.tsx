import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { t } from '@/src/i18n';
import { listFriends, removeFriend, type FriendUser } from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

type Tab = 'following' | 'suggestions';

/** HTML phone “28 · Друзі”. */
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
                label: t('friends.followingCount', { count: friends.length }),
              },
              { id: 'suggestions', label: t('friends.suggestions') },
            ]}
            value={tab}
            onChange={setTab}
          />

          <View style={styles.quickRow}>
            <PrimaryButton
              label={t('friends.search')}
              size="sm"
              onPress={() => router.push('/(app)/friend-search' as never)}
              style={styles.quickBtn}
            />
            <PrimaryButton
              label={t('friends.requests')}
              size="sm"
              variant="secondary"
              onPress={() => router.push('/(app)/friend-requests' as never)}
              style={styles.quickBtn}
            />
          </View>

          {tab === 'following' ? (
            friends.length === 0 ? (
              <Text style={styles.empty}>{t('friends.empty')}</Text>
            ) : (
              friends.map((f) => (
                <ListRow
                  key={f.id}
                  title={f.name}
                  subtitle={f.bio || f.handle}
                  leading={
                    <PetAvatar
                      avatarKey={f.avatarKey}
                      species="dog"
                      size={44}
                      name={f.name}
                    />
                  }
                  trailing={
                    <Pressable
                      onPress={() => void removeFriend(f.id).then(load)}
                      style={styles.unfollow}
                    >
                      <Text style={styles.unfollowText}>
                        {t('friends.unfollow')}
                      </Text>
                    </Pressable>
                  }
                  showChevron={false}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/user-profile',
                      params: { userId: f.id },
                    } as never)
                  }
                />
              ))
            )
          ) : (
            <View style={styles.suggestBox}>
              <Text style={styles.empty}>{t('friends.suggestionsHint')}</Text>
              <PrimaryButton
                label={t('friends.search')}
                variant="secondary"
                onPress={() => router.push('/(app)/friend-search' as never)}
              />
            </View>
          )}

          <PrimaryButton
            label={t('friends.invite')}
            variant="ghost"
            onPress={() => router.push('/(app)/friend-invite' as never)}
          />
          <PrimaryButton
            label={t('friends.planWalk')}
            variant="ghost"
            onPress={() => router.push('/(app)/walk-plan' as never)}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  quickRow: { flexDirection: 'row', gap: 8 },
  quickBtn: { flex: 1 },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    marginVertical: 8,
  },
  suggestBox: { gap: 12, marginTop: 4 },
  unfollow: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.divider,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unfollowText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.ink,
  },
});
