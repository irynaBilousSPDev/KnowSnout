import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { t } from '@/src/i18n';
import {
  listModerationQueue,
  type ModerationItem,
} from '@/src/services/adminModeration';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Адмінка · Черга модерації. */
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
          <HubHero
            title={t('admin.moderation')}
            lead={t('admin.moderationBody')}
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
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
