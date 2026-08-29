import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { listFriends, type FriendUser } from '@/src/services/friends';
import {
  listBlockedUserIds,
  unblockUser,
} from '@/src/services/storyModeration';
import { brand, fonts } from '@/src/theme/brand';

const DEMO_ID = 'demo-blocked-2024';

/** 07.04 · Заблоковані */
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

  const rows = useMemo(() => {
    if (ids.length > 0) {
      return ids.map((id) => ({
        id,
        name:
          friends.find((x) => x.id === id)?.name ??
          t('blocked.demoName'),
      }));
    }
    return [{ id: DEMO_ID, name: t('blocked.demoName') }];
  }, [ids, friends]);

  const onUnblock = async (id: string) => {
    if (id === DEMO_ID && !ids.includes(DEMO_ID)) {
      notify(t('common.ok'), t('blocked.unblocked'));
      return;
    }
    await unblockUser(id);
    notify(t('common.ok'), t('blocked.unblocked'));
    await load();
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('blocked.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {rows.map((row) => (
            <View key={row.id} style={styles.card}>
              <View style={styles.thumb}>
                <Text style={styles.thumbText}>or browse</Text>
              </View>
              <Text style={styles.name}>{row.name}</Text>
              <PrimaryButton
                label={t('blocked.unblock')}
                variant="secondary"
                size="sm"
                block={false}
                onPress={() => void onUnblock(row.id)}
                style={styles.btn}
              />
            </View>
          ))}
          <Text style={styles.hint}>{t('blocked.hint')}</Text>
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
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  thumbText: {
    fontFamily: fonts.body,
    fontSize: 7.5,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  btn: { minWidth: 108 },
  hint: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.mutedSoft,
    textAlign: 'center',
    marginTop: 8,
  },
});
