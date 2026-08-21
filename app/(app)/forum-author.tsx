import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  getForumAuthor,
  listThreadsByAuthor,
  type ForumAuthor,
  type ForumThread,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

export default function ForumAuthorScreen() {
  const { authorId } = useLocalSearchParams<{ authorId?: string }>();
  const [author, setAuthor] = useState<ForumAuthor | null>(null);
  const [threads, setThreads] = useState<ForumThread[]>([]);

  const load = useCallback(async () => {
    if (!authorId) {
      setAuthor(null);
      setThreads([]);
      return;
    }
    setAuthor(getForumAuthor(authorId));
    setThreads(await listThreadsByAuthor(authorId));
  }, [authorId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={author?.displayName ?? t('forum.authorTitle')}
            subtitle={author?.bio ?? t('forum.authorMissing')}
          />
          {author ? (
            <Text style={styles.meta}>
              {t('forum.authorJoined', {
                date: new Date(author.joinedAt).toLocaleDateString('uk-UA'),
              })}
            </Text>
          ) : null}

          <Text style={styles.section}>{t('forum.authorThreads')}</Text>
          {threads.length === 0 ? (
            <Text style={styles.empty}>{t('forum.authorThreadsEmpty')}</Text>
          ) : (
            threads.map((th) => (
              <ListRow
                key={th.id}
                title={th.title}
                subtitle={th.preview}
                meta={t('forum.replies', { count: th.replies })}
                leading={
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={22}
                    color={brand.navy}
                  />
                }
                onPress={() =>
                  router.push({
                    pathname: '/(app)/forum-thread',
                    params: { id: th.id },
                  } as never)
                }
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
  meta: {
    marginBottom: 16,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  section: {
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
});
