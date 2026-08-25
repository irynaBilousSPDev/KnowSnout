import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  getForumCategory,
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

/** Screenshot 05.13 — question + votes + solution + reply pill */
export default function ForumThreadScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const category = useMemo(
    () => (thread ? getForumCategory(thread.categoryId) : null),
    [thread],
  );

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

  const question = posts[0];
  const replies = posts.slice(1);

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
      <ScrHeader
        title={t('forum.threadTitle')}
        right={
          <Pressable
            onPress={() =>
              notify(t('forum.moreMenu'), thread?.title ?? '')
            }
            style={styles.moreBtn}
            accessibilityRole="button"
            accessibilityLabel={t('forum.moreMenu')}
          >
            <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.pad}
        >
          {thread ? (
            <Pressable
              onPress={() => openAuthor(thread.authorId)}
              style={styles.question}
            >
              <Text style={styles.qTitle}>{thread.title}</Text>
              <Text style={styles.qMeta}>
                {t('forum.threadHeaderMeta', {
                  author: thread.author,
                  category: category?.title ?? '',
                  count: String(thread.replies),
                })}
              </Text>
            </Pressable>
          ) : null}

          {replies.map((p) => (
            <ReplyCard key={p.id} post={p} />
          ))}

          {replies.length === 0 && question ? (
            <Text style={styles.empty}>{t('forum.threadsEmpty')}</Text>
          ) : null}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            value={reply}
            onChangeText={setReply}
            placeholder={t('forum.replyPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          <Pressable
            onPress={() => void send()}
            disabled={busy}
            style={[styles.send, busy && styles.sendDim]}
            accessibilityRole="button"
            accessibilityLabel={t('forum.sendReply')}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

function ReplyCard({ post }: { post: ForumPost }) {
  const solution = Boolean(post.isSolution);
  return (
    <View style={[styles.reply, solution && styles.replySolution]}>
      <View style={styles.votes}>
        <Ionicons name="chevron-up" size={16} color={brand.muted} />
        <Text style={styles.voteNum}>{post.votes ?? 0}</Text>
      </View>
      <View style={styles.replyBody}>
        <View style={styles.replyHead}>
          <Pressable onPress={() => openAuthor(post.authorId)}>
            <Text style={styles.author}>{post.author}</Text>
          </Pressable>
          {solution ? (
            <View style={styles.solPill}>
              <Text style={styles.solText}>{t('forum.solution')}</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.body}>{post.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    gap: 10,
  },
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  question: {
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  qTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    lineHeight: 24,
    color: brand.ink,
  },
  qMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  reply: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  replySolution: {
    borderColor: brand.accentSoft,
  },
  votes: {
    width: 28,
    alignItems: 'center',
    paddingTop: 2,
    gap: 2,
  },
  voteNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  replyBody: { flex: 1, gap: 6 },
  replyHead: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  author: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  solPill: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.mist,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  solText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accent,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: brand.ink,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.divider,
    backgroundColor: brand.canvas,
  },
  input: {
    flex: 1,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDim: { opacity: 0.55 },
});
