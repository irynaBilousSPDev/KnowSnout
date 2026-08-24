import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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

function iconFor(kind: ActivityItem['kind']): keyof typeof Ionicons.glyphMap {
  switch (kind) {
    case 'like':
      return 'heart';
    case 'comment':
      return 'chatbubble';
    case 'follow':
      return 'person-add';
    case 'contest':
      return 'trophy';
    case 'walk':
      return 'walk';
    case 'friend':
      return 'people';
    default:
      return 'notifications';
  }
}

/** HTML · Активність. */
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
          {items.map((item, index) => {
            const isNew = index === 0;
            return (
              <View
                key={item.id}
                style={[styles.card, isNew && styles.cardNew]}
              >
                <View style={[styles.avatar, isNew && styles.avatarNew]}>
                  <Ionicons
                    name={iconFor(item.kind)}
                    size={16}
                    color={isNew ? brand.accentDark : brand.muted}
                  />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.body}>
                    <Text style={styles.strong}>{item.title}</Text>
                    {item.body ? ` ${item.body}` : ''}
                  </Text>
                </View>
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
  titlePad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 26,
    color: brand.ink,
  },
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
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
  cardNew: {
    backgroundColor: brand.accentTint,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarNew: {
    backgroundColor: brand.accentBorder,
  },
  copy: { flex: 1, minWidth: 0 },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brand.ink,
  },
  strong: {
    fontFamily: fonts.bodyBold,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  timeNew: {
    color: brand.accentDark,
    fontFamily: fonts.bodyBold,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    marginTop: 12,
  },
});
