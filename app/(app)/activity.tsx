import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { listActivityFeed, type ActivityItem } from '@/src/services/activity';
import { brand } from '@/src/theme/brand';

function iconFor(kind: ActivityItem['kind']): keyof typeof Ionicons.glyphMap {
  switch (kind) {
    case 'like':
      return 'heart-outline';
    case 'comment':
      return 'chatbubble-outline';
    case 'follow':
      return 'person-add-outline';
    case 'contest':
      return 'trophy-outline';
    case 'walk':
      return 'walk-outline';
    case 'friend':
      return 'people-outline';
    default:
      return 'notifications-outline';
  }
}

export default function ActivityScreen() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      void listActivityFeed().then(setItems);
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('activity.title')}
            subtitle={t('activity.subtitle')}
          />
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.body}
              meta={new Date(item.createdAt).toLocaleString('uk-UA')}
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
            <Text style={styles.empty}>{t('activity.empty')}</Text>
          ) : null}
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
    color: '#5A6B7D',
  },
});
