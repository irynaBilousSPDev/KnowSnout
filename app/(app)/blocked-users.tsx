import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { listFriends, type FriendUser } from '@/src/services/friends';
import {
  listBlockedUserIds,
  unblockUser,
} from '@/src/services/storyModeration';
import { brand } from '@/src/theme/brand';

export default function BlockedUsersScreen() {
  const [ids, setIds] = useState<string[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);

  const load = useCallback(async () => {
    const [blocked, fl] = await Promise.all([
      listBlockedUserIds(),
      listFriends().catch(() => [] as FriendUser[]),
    ]);
    setIds(blocked);
    setFriends(fl);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const labelFor = (id: string) => {
    const f = friends.find((x) => x.id === id);
    return f?.name ?? id;
  };

  const onUnblock = async (id: string) => {
    await unblockUser(id);
    notify(t('common.ok'), t('blocked.unblocked'));
    await load();
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('blocked.title')}
            subtitle={t('blocked.subtitle')}
          />
          {ids.length === 0 ? (
            <Text style={styles.empty}>{t('blocked.empty')}</Text>
          ) : (
            ids.map((id) => (
              <ListRow
                key={id}
                title={labelFor(id)}
                subtitle={id}
                leading={
                  <Ionicons
                    name="ban-outline"
                    size={22}
                    color={brand.score.poor}
                  />
                }
                trailing={
                  <PrimaryButton
                    label={t('blocked.unblock')}
                    variant="ghost"
                    size="sm"
                    block={false}
                    onPress={() => void onUnblock(id)}
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
  empty: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
