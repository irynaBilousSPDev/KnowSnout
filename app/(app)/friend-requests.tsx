import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  acceptFriendRequest,
  declineFriendRequest,
  listFriendRequests,
  type FriendRequest,
} from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Вхідні запити в друзі. */
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

  const title =
    requests.length > 0
      ? `${t('friends.requestsTitle')} (${requests.length})`
      : t('friends.requestsTitle');

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={title} titleSize={19} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {requests.length === 0 ? (
            <Text style={styles.empty}>{t('friends.requestsEmpty')}</Text>
          ) : (
            requests.map((r) => (
              <View key={r.id} style={styles.block}>
                <View style={styles.card}>
                  <PetAvatar
                    avatarKey={r.from.avatarKey}
                    species="dog"
                    size={44}
                    name={r.from.name}
                  />
                  <View style={styles.copy}>
                    <Text style={styles.name}>{r.from.name}</Text>
                    <Text style={styles.meta}>
                      {t('friends.requestHint')}
                    </Text>
                  </View>
                </View>
                <View style={styles.actions}>
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    marginTop: 8,
  },
  block: { gap: 6 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  copy: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  meta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 56,
  },
  half: { flex: 1 },
});
