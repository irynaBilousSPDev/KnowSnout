import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  listInboxNotifications,
  type InboxNotification,
} from '@/src/services/notificationsInbox';
import { brand } from '@/src/theme/brand';

function iconFor(
  kind: InboxNotification['kind'],
): keyof typeof Ionicons.glyphMap {
  if (kind === 'social') return 'chatbubble-outline';
  if (kind === 'promo') return 'sparkles-outline';
  return 'notifications-outline';
}

export default function NotificationsScreen() {
  const [items, setItems] = useState<InboxNotification[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listInboxNotifications().then(setItems);
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('notifications.title')}
            subtitle={t('notifications.subtitle')}
          />
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.body}
              meta={
                item.read
                  ? t('notifications.read')
                  : t('notifications.unread')
              }
              leading={
                <Ionicons
                  name={iconFor(item.kind)}
                  size={22}
                  color={brand.navy}
                />
              }
              showChevron={false}
            />
          ))}
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('notifications.empty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
