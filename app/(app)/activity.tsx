import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { t } from '@/src/i18n';
import { listActivityFeed, type ActivityItem } from '@/src/services/activity';
import { brand, fonts } from '@/src/theme/brand';

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
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('activity.title')}</Text>
          {items.map((item) => (
            <ListRow
              key={item.id}
              title={item.title}
              subtitle={item.body}
              meta={new Date(item.createdAt).toLocaleString('uk-UA')}
              leading={
                <View style={styles.iconWrap}>
                  <Ionicons
                    name={iconFor(item.kind)}
                    size={18}
                    color={brand.accentDark}
                  />
                </View>
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
  pad: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
