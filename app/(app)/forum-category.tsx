import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  getForumCategory,
  listForumThreads,
  type ForumThread,
} from '@/src/services/forum';
import { brand } from '@/src/theme/brand';

export default function ForumCategoryScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const category = id ? getForumCategory(id) : null;
  const [threads, setThreads] = useState<ForumThread[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!id) return;
      void listForumThreads(id).then(setThreads);
    }, [id]),
  );

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={category?.title ?? t('forum.categoryTitle')}
            subtitle={category?.body ?? t('forum.subtitle')}
          />
          <PrimaryButton
            label={t('forum.newThread')}
            onPress={() =>
              router.push({
                pathname: '/(app)/forum-new',
                params: { categoryId: id ?? '' },
              } as never)
            }
          />
          <View style={styles.gap} />
          {threads.map((th) => (
            <ListRow
              key={th.id}
              title={th.title}
              subtitle={th.preview}
              meta={`${th.author} · ${t('forum.replies', { count: th.replies })}`}
              leading={
                <Ionicons name="document-text-outline" size={22} color={brand.navy} />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-thread',
                  params: { id: th.id },
                } as never)
              }
            />
          ))}
          {threads.length === 0 ? (
            <Text style={styles.empty}>{t('forum.threadsEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  gap: { height: 12 },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
