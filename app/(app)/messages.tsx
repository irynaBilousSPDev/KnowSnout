import { useFocusEffect, router } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { listDmThreads, type DmThread } from '@/src/services/dm';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Чат — Manrope 22, white r14 soft cards. */
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
      <AppScreen>
        <LoadingState message={t('dm.loading')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <FlatList
        data={threads}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <HubHero title={t('dm.title')} lead={t('dm.emptyHint')} />
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
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            <PetAvatar
              avatarKey={item.peer.avatarKey || 'paw'}
              species="dog"
              size={44}
              name={item.peer.name}
            />
            <View style={styles.rowCopy}>
              <Text style={styles.rowTitle}>{item.peer.name}</Text>
              <Text numberOfLines={1} style={styles.rowMeta}>
                {item.lastBody || t('dm.noPreview')}
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={brand.mutedSoft}
            />
          </Pressable>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    flexGrow: 1,
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
  row: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
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
  rowCopy: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  rowMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
});
