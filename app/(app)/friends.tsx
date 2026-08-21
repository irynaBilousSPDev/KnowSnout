import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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
          <HubHero title={t('friends.title')} lead={t('friends.subtitle')} />
          <PrimaryButton
            label={t('friends.search')}
            onPress={() => router.push('/(app)/friend-search' as never)}
          />

          <View style={styles.quickRow}>
            <Pressable
              style={styles.quick}
              onPress={() => router.push('/(app)/friend-requests' as never)}
            >
              <Ionicons name="mail-outline" size={18} color={brand.navy} />
              <Text style={styles.quickText}>{t('friends.requests')}</Text>
            </Pressable>
            <Pressable
              style={styles.quick}
              onPress={() => router.push('/(app)/friend-invite' as never)}
            >
              <Ionicons name="qr-code-outline" size={18} color={brand.navy} />
              <Text style={styles.quickText}>{t('friends.invite')}</Text>
            </Pressable>
            <Pressable
              style={styles.quick}
              onPress={() => router.push('/(app)/walk-plan' as never)}
            >
              <Ionicons name="walk-outline" size={18} color={brand.navy} />
              <Text style={styles.quickText}>{t('friends.planWalk')}</Text>
            </Pressable>
          </View>

          <Pressable
            style={styles.linkRow}
            onPress={() =>
              router.push('/(app)/friend-invite-accept' as never)
            }
          >
            <Text style={styles.linkText}>{t('friends.inviteAccept')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>

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
                  <Ionicons name="person-outline" size={22} color={brand.navy} />
                }
                onPress={() =>
                  router.push({
                    pathname: '/(app)/user-profile',
                    params: { userId: f.id },
                  } as never)
                }
                trailing={
                  <Pressable
                    onPress={() =>
                      void removeFriend(f.id).then(() => load())
                    }
                    hitSlop={8}
                  >
                    <Ionicons
                      name="close-outline"
                      size={20}
                      color={brand.score.poor}
                    />
                  </Pressable>
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
  quickRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
  },
  quick: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 12,
    paddingHorizontal: 6,
  },
  quickText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textAlign: 'center',
    color: brand.navy,
  },
  linkRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  linkText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: brand.navy,
  },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.muted,
  },
});
