import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  listForumNotifications,
  markForumNotificationRead,
  type ForumNotification,
} from '@/src/services/forum';
import { brand } from '@/src/theme/brand';

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
      router.push({
        pathname: '/(app)/forum-author',
        params: { authorId: item.authorId },
      } as never);
    }
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('forum.notificationsTitle')}
            subtitle={t('forum.notificationsSubtitle')}
          />
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('forum.notificationsEmpty')}</Text>
          ) : (
            items.map((n) => (
              <ListRow
                key={n.id}
                title={n.title}
                subtitle={n.body}
                meta={
                  n.read
                    ? new Date(n.createdAt).toLocaleString('uk-UA')
                    : t('forum.notificationUnread')
                }
                leading={
                  <Ionicons
                    name={n.read ? 'mail-open-outline' : 'mail-unread-outline'}
                    size={22}
                    color={n.read ? '#5A6B7D' : brand.rose}
                  />
                }
                onPress={() => void open(n)}
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
  empty: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
});
