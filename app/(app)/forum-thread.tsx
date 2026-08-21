import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  getForumThread,
  listForumPosts,
  replyForumThread,
  type ForumPost,
  type ForumThread,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

function openAuthor(authorId: string) {
  router.push({
    pathname: '/(app)/forum-author',
    params: { authorId },
  } as never);
}

export default function ForumThreadScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const [th, list] = await Promise.all([
      getForumThread(id),
      listForumPosts(id),
    ]);
    setThread(th);
    setPosts(list);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const send = async () => {
    if (!id || !reply.trim()) {
      notify(t('common.error'), t('forum.replyRequired'));
      return;
    }
    setBusy(true);
    try {
      await replyForumThread(id, reply);
      setReply('');
      await load();
    } catch {
      notify(t('common.error'), t('forum.replyError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={thread?.title ?? t('forum.threadTitle')}
            subtitle={
              thread
                ? t('forum.byAuthor', { name: thread.author })
                : undefined
            }
          />
          {thread ? (
            <Pressable
              onPress={() => openAuthor(thread.authorId)}
              accessibilityRole="button"
              accessibilityLabel={t('forum.openAuthor', { name: thread.author })}
              style={styles.authorLink}
            >
              <Text style={styles.authorLinkText}>
                {t('forum.openAuthor', { name: thread.author })}
              </Text>
            </Pressable>
          ) : null}
          {posts.map((p) => (
            <View key={p.id} style={styles.post}>
              <Pressable
                onPress={() => openAuthor(p.authorId)}
                accessibilityRole="button"
                accessibilityLabel={p.author}
              >
                <Text style={styles.author}>{p.author}</Text>
              </Pressable>
              <Text style={styles.body}>{p.body}</Text>
              <Text style={styles.meta}>
                {new Date(p.createdAt).toLocaleString('uk-UA')}
              </Text>
            </View>
          ))}

          <Text style={styles.label}>{t('forum.reply')}</Text>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder={t('forum.replyPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('forum.sendReply')}
            loading={busy}
            onPress={() => void send()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  authorLink: { marginBottom: 12 },
  authorLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.navy,
  },
  post: {
    marginBottom: 10,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  author: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.navy,
  },
  body: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  meta: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.muted,
  },
  input: {
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 88, textAlignVertical: 'top' },
  gap: { height: 12 },
});
