import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getForumAuthor,
  listThreadsByAuthor,
  type ForumAuthor,
  type ForumThread,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.16 — dashed avatar + rank + topic cards */
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
      <ScrHeader title={t('forum.authorTitle')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.avatar}>
            <Text style={styles.avatarHint}>{t('forum.avatarHint')}</Text>
            <Text style={styles.avatarBrowse}>{t('forum.avatarBrowse')}</Text>
          </View>

          <Text style={styles.name}>
            {author?.displayName ?? t('forum.authorMissing')}
          </Text>
          {author ? (
            <Text style={styles.stats}>
              {t('forum.authorStats', {
                topics: String(author.topicCount ?? threads.length),
                replies: String(author.replyCount ?? 0),
              })}
            </Text>
          ) : null}
          {author?.rank ? (
            <View style={styles.rankPill}>
              <Text style={styles.rankText}>{author.rank}</Text>
            </View>
          ) : null}

          <View style={styles.list}>
            {threads.length === 0 ? (
              <Text style={styles.empty}>{t('forum.authorThreadsEmpty')}</Text>
            ) : (
              threads.map((th) => (
                <Pressable
                  key={th.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/forum-thread',
                      params: { id: th.id },
                    } as never)
                  }
                  style={({ pressed }) => [
                    styles.card,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {th.title}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {t('forum.repliesShort', { count: th.replies })}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 40,
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarHint: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  avatarBrowse: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  name: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.ink,
  },
  stats: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  rankPill: {
    marginTop: 12,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.mist,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  rankText: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accent,
  },
  list: {
    alignSelf: 'stretch',
    marginTop: 22,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  pressed: { opacity: 0.88 },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  badge: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    textAlign: 'center',
  },
});
