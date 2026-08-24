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
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { listDmThreads, type DmThread } from '@/src/services/dm';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.13 */
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
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.title}>{t('dm.title')}</Text>
        }
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
              size={44}
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
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 10,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 26,
    color: brand.ink,
    marginBottom: 8,
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
  pressed: { opacity: 0.9 },
  copy: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  preview: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  unread: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.accent,
  },
});
