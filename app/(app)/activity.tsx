import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import {
  listActivityFeed,
  markActivitySeen,
  type ActivityItem,
} from '@/src/services/activity';
import { brand, fonts } from '@/src/theme/brand';

function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '';
  const h = Math.floor(ms / (1000 * 60 * 60));
  if (h < 1) return t('activity.justNow');
  if (h < 24) return t('activity.hoursAgo', { count: String(h) });
  const d = Math.floor(h / 24);
  return t('activity.daysAgo', { count: String(d) });
}

const AVATARS: Record<string, string> = {
  Ігор: 'man-1',
  Оксана: 'woman-1',
  Марта: 'woman-2',
};

/** Screenshot 04.26 — Активність */
export default function ActivityScreen() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        await markActivitySeen();
        setItems(await listActivityFeed());
      })();
    }, []),
  );

  const openItem = (item: ActivityItem) => {
    if (
      (item.kind === 'follow' || item.kind === 'friend') &&
      item.userId
    ) {
      router.push({
        pathname: '/(app)/user-profile',
        params: { userId: item.userId },
      } as never);
      return;
    }
    if (item.href) {
      router.push(item.href as never);
      return;
    }
    if (item.userId) {
      router.push({
        pathname: '/(app)/user-profile',
        params: { userId: item.userId },
      } as never);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('activity.title')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {items.map((item) => {
            const isNew = item.kind === 'follow';
            return (
              <Pressable
                key={item.id}
                onPress={() => openItem(item)}
                style={[styles.card, isNew && styles.cardNew]}
              >
                <UserAvatar
                  avatarKey={AVATARS[item.title] ?? 'paw'}
                  size={40}
                  name={item.title}
                />
                <Text style={styles.body}>
                  <Text style={styles.strong}>{item.title}</Text>
                  {item.body ? ` ${item.body}` : ''}
                </Text>
                <Text style={[styles.time, isNew && styles.timeNew]}>
                  {isNew ? t('activity.badgeNew') : relativeTime(item.createdAt)}
                </Text>
              </Pressable>
            );
          })}
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('activity.empty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardNew: { backgroundColor: brand.accentTint },
  body: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 19,
    color: brand.ink,
  },
  strong: { fontFamily: fonts.bodyBold },
  time: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  timeNew: { color: brand.accent, fontFamily: fonts.bodySemi },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
