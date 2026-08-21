import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  listModerationQueue,
  type ModerationItem,
} from '@/src/services/adminModeration';

export default function AdminModerationScreen() {
  const [items, setItems] = useState<ModerationItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listModerationQueue().then(setItems);
    }, []),
  );

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('admin.moderation')}
            subtitle={t('admin.moderationBody')}
          />
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.summary}
              meta={`${item.type} · ${t(`admin.status.${item.status}`)}`}
              onPress={() =>
                router.push({
                  pathname: '/(admin)/moderation-item',
                  params: { id: item.id },
                } as never)
              }
            />
          ))}
          {items.length === 0 ? (
            <Text style={styles.empty}>{t('admin.queueEmpty')}</Text>
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
