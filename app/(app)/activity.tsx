import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { listActivityFeed, type ActivityItem } from '@/src/services/activity';
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

/** Screenshot 04.26 */
export default function ActivityScreen() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listActivityFeed().then(setItems);
    }, []),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.titlePad}>
        <Text style={styles.title}>{t('activity.title')}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {items.map((item) => {
            const isNew = item.kind === 'follow';
            return (
              <View
                key={item.id}
                style={[styles.card, isNew && styles.cardNew]}
              >
                <UserAvatar
                  avatarKey={AVATARS[item.title] ?? 'paw'}
                  size={36}
                  name={item.title}
                />
                <Text style={styles.body}>
                  <Text style={styles.strong}>{item.title}</Text>
                  {item.body ? ` ${item.body}` : ''}
                </Text>
                <Text style={[styles.time, isNew && styles.timeNew]}>
                  {isNew ? t('activity.badgeNew') : relativeTime(item.createdAt)}
                </Text>
              </View>
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
  titlePad: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  title: { fontFamily: fonts.title, fontSize: 20, color: brand.ink },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardNew: { backgroundColor: brand.accentTint },
  body: { flex: 1, fontFamily: fonts.body, fontSize: 13, color: brand.ink },
  strong: { fontFamily: fonts.bodyBold },
  time: { fontFamily: fonts.body, fontSize: 11, color: brand.mutedSoft },
  timeNew: { color: brand.accent, fontFamily: fonts.bodySemi },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
