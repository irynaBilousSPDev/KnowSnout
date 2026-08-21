import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  acceptFriendRequest,
  declineFriendRequest,
  listFriendRequests,
  type FriendRequest,
} from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

export default function FriendRequestsScreen() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);

  const load = useCallback(async () => {
    setRequests(await listFriendRequests());
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
          <ScreenHeader
            title={t('friends.requestsTitle')}
            subtitle={t('friends.requestsSubtitle')}
          />
          {requests.length === 0 ? (
            <Text style={styles.empty}>{t('friends.requestsEmpty')}</Text>
          ) : (
            requests.map((r) => (
              <View key={r.id} style={styles.block}>
                <ListRow
                  title={r.from.name}
                  subtitle={r.from.bio}
                  meta={r.from.handle}
                  leading={
                    <Ionicons
                      name="person-add-outline"
                      size={22}
                      color={brand.navy}
                    />
                  }
                  showChevron={false}
                />
                <View style={styles.row}>
                  <View style={styles.half}>
                    <PrimaryButton
                      label={t('friends.accept')}
                      size="sm"
                      onPress={() => void acceptFriendRequest(r.id).then(load)}
                    />
                  </View>
                  <View style={styles.half}>
                    <PrimaryButton
                      label={t('friends.decline')}
                      size="sm"
                      variant="secondary"
                      onPress={() => void declineFriendRequest(r.id).then(load)}
                    />
                  </View>
                </View>
              </View>
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
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  block: { marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginTop: -4, marginBottom: 12 },
  half: { flex: 1 },
});
