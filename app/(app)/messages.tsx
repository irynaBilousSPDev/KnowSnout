import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { ScrHeader } from '@/src/components/ScrHeader';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { listDmThreads, type DmThread } from '@/src/services/dm';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.13 — Чат список */
export default function MessagesScreen() {
  const [threads, setThreads] = useState<DmThread[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setThreads(await listDmThreads());
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
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <LoadingState message={t('dm.loading')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('dm.title')} titleSize={18} />
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/dm/[userId]',
                params: {
                  userId: item.peer.userId,
                  name: item.peer.name,
                  avatarKey: item.peer.avatarKey ?? '',
                },
              })
            }
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
          >
            <UserAvatar
              avatarKey={item.peer.avatarKey || 'paw'}
              size={46}
              name={item.peer.name}
            />
            <View style={styles.copy}>
              <Text style={styles.name}>{item.peer.name}</Text>
              <Text numberOfLines={1} style={styles.preview}>
                {item.lastBody || t('dm.noPreview')}
              </Text>
            </View>
            {item.unread ? (
              <View style={styles.unread} />
            ) : (
              <Text style={styles.time}>
                {item.peer.userId === 'fu-1' ? '14:20' : ''}
              </Text>
            )}
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>{t('dm.empty')}</Text>
        }
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.92 },
  copy: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  preview: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  unread: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: brand.accent,
  },
  empty: {
    marginTop: 24,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
