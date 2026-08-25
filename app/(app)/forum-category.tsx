import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getForumCategory,
  listForumThreads,
  type ForumThread,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.12 — category thread cards */
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
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={category?.title ?? t('forum.categoryTitle')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {threads.map((th) => (
            <Pressable
              key={th.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-thread',
                  params: { id: th.id },
                } as never)
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Text style={styles.title}>{th.title}</Text>
              <Text style={styles.meta}>
                {t('forum.threadMeta', {
                  author: th.author,
                  replies: String(th.replies),
                  time: th.timeLabel ?? '',
                })}
              </Text>
            </Pressable>
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 6,
  },
  pressed: { opacity: 0.88 },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
