import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { listFriends, removeFriend, type FriendUser } from '@/src/services/friends';
import { brand } from '@/src/theme/brand';

export default function FriendsScreen() {
  const [friends, setFriends] = useState<FriendUser[]>([]);

  const load = useCallback(async () => {
    setFriends(await listFriends());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('friends.title')} subtitle={t('friends.subtitle')} />
          <PrimaryButton
            label={t('friends.requests')}
            variant="secondary"
            onPress={() => router.push('/(app)/friend-requests' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('friends.search')}
            variant="secondary"
            onPress={() => router.push('/(app)/friend-search' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('friends.invite')}
            variant="secondary"
            onPress={() => router.push('/(app)/friend-invite' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('friends.inviteAccept')}
            variant="secondary"
            onPress={() => router.push('/(app)/friend-invite-accept' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('friends.planWalk')}
            onPress={() => router.push('/(app)/walk-plan' as never)}
          />

          <Text style={styles.section}>{t('friends.list')}</Text>
          {friends.length === 0 ? (
            <Text style={styles.empty}>{t('friends.empty')}</Text>
          ) : (
            friends.map((f) => (
              <ListRow
                key={f.id}
                title={f.name}
                subtitle={f.bio}
                meta={f.handle}
                leading={
                  <Ionicons name="person-outline" size={22} color={brand.tealPressed} />
                }
                onPress={() =>
                  router.push({
                    pathname: '/(app)/user-profile',
                    params: { userId: f.id },
                  } as never)
                }
                trailing={
                  <PrimaryButton
                    label={t('friends.remove')}
                    size="sm"
                    variant="ghost"
                    block={false}
                    onPress={() => void removeFriend(f.id).then(load)}
                  />
                }
                showChevron={false}
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
  section: {
    marginTop: 22,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A7A72',
  },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A7A72',
  },
  gap: { height: 10 },
});
