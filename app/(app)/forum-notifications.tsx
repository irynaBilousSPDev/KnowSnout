import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  forumAuthorRoute,
  listForumNotifications,
  markForumNotificationRead,
  type ForumNotification,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

function BoldBody({
  body,
  boldSpans,
}: {
  body: string;
  boldSpans?: string[];
}) {
  if (!boldSpans?.length) {
    return <Text style={styles.body}>{body}</Text>;
  }
  const parts: { text: string; bold: boolean }[] = [];
  let rest = body;
  while (rest.length) {
    let earliest = -1;
    let match = '';
    for (const span of boldSpans) {
      const idx = rest.indexOf(span);
      if (idx >= 0 && (earliest < 0 || idx < earliest)) {
        earliest = idx;
        match = span;
      }
    }
    if (earliest < 0) {
      parts.push({ text: rest, bold: false });
      break;
    }
    if (earliest > 0) {
      parts.push({ text: rest.slice(0, earliest), bold: false });
    }
    parts.push({ text: match, bold: true });
    rest = rest.slice(earliest + match.length);
  }
  return (
    <Text style={styles.body}>
      {parts.map((p, i) => (
        <Text key={`${i}-${p.text}`} style={p.bold ? styles.bold : undefined}>
          {p.text}
        </Text>
      ))}
    </Text>
  );
}

/** Screenshot 05.17 — mint unread + time labels */
export default function ForumNotificationsScreen() {
  const [items, setItems] = useState<ForumNotification[]>([]);

  const load = useCallback(async () => {
    setItems(await listForumNotifications());
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const open = async (item: ForumNotification) => {
    if (!item.read) {
      await markForumNotificationRead(item.id);
      setItems((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      );
    }
    if (item.threadId) {
      router.push({
        pathname: '/(app)/forum-thread',
        params: { id: item.threadId },
      } as never);
      return;
    }
    if (item.authorId) {
      router.push(forumAuthorRoute(item.authorId) as never);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('forum.notificationsTitle')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('forum.notificationsEmpty')}</Text>
          ) : (
            items.map((n) => (
              <Pressable
                key={n.id}
                onPress={() => void open(n)}
                style={({ pressed }) => [
                  styles.card,
                  !n.read && styles.cardUnread,
                  pressed && styles.pressed,
                ]}
              >
                <View style={styles.avatar} />
                <View style={styles.mid}>
                  <BoldBody body={n.body} boldSpans={n.boldSpans} />
                </View>
                <Text style={[styles.time, !n.read && styles.timeNew]}>
                  {n.timeLabel ??
                    (n.read
                      ? ''
                      : t('forum.notificationUnread'))}
                </Text>
              </Pressable>
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
    paddingTop: 10,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  cardUnread: {
    backgroundColor: brand.mist,
  },
  pressed: { opacity: 0.88 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
  },
  mid: { flex: 1 },
  body: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 20,
    color: brand.ink,
  },
  bold: {
    fontFamily: fonts.bodyBold,
  },
  time: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    marginTop: 2,
  },
  timeNew: {
    fontFamily: fonts.bodySemi,
    color: brand.accent,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
});
