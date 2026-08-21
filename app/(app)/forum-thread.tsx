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
import { brand } from '@/src/theme/brand';

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
    <AppScreen>
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
            placeholderTextColor="#8AA8A0"
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
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: brand.tealPressed,
  },
  post: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  author: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: brand.tealPressed,
  },
  body: {
    marginTop: 6,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  meta: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#5A7A72',
  },
  label: {
    marginTop: 16,
    marginBottom: 6,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#5A7A72',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 88, textAlignVertical: 'top' },
  gap: { height: 12 },
});
