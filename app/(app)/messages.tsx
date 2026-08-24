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
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { listDmThreads, type DmThread } from '@/src/services/dm';
import { brand, fonts } from '@/src/theme/brand';

function formatThreadTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

/** HTML · Чат — список розмов. */
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
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('dm.empty')}</Text>
            <Text style={styles.emptyHint}>{t('dm.emptyHint')}</Text>
            <View style={styles.emptyBtn}>
              <PrimaryButton
                label={t('dm.openFeed')}
                onPress={() => router.push('/(app)/(tabs)/stories')}
              />
            </View>
          </View>
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
            <PetAvatar
              avatarKey={item.peer.avatarKey || 'paw'}
              species="dog"
              size={44}
              name={item.peer.name}
            />
            <View style={styles.copy}>
              <Text style={styles.name}>{item.peer.name}</Text>
              <Text numberOfLines={1} style={styles.preview}>
                {item.lastBody || t('dm.noPreview')}
              </Text>
            </View>
            <Text style={styles.time}>{formatThreadTime(item.updatedAt)}</Text>
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
  empty: {
    marginTop: 48,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  emptyTitle: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  emptyHint: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.mutedSoft,
  },
  emptyBtn: { marginTop: 24, width: '100%' },
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
});
