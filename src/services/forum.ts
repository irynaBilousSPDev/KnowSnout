import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCloudUser } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { getUserProfile } from '@/src/services/userProfile';
import { supabase } from '@/src/services/supabase';

/** Forum: cloud-first when signed in + tables exist; else AsyncStorage. */

const THREADS_KEY = 'knowsnout.forum.threads.v2';
const POSTS_KEY = 'knowsnout.forum.posts.v2';
const NOTIFS_KEY = 'knowsnout.forum.notifications.v2';

export type ForumCategoryIcon = 'paw' | 'cat' | 'bowl' | 'heart';

export type ForumCategory = {
  id: string;
  title: string;
  body: string;
  threadCount: number;
  icon: ForumCategoryIcon;
};

export type ForumAuthor = {
  id: string;
  displayName: string;
  bio: string;
  joinedAt: string;
  topicCount?: number;
  replyCount?: number;
  rank?: string;
  /** Linked SnoutStories profile when the forum persona maps to a social user. */
  socialUserId?: string;
};

export type ForumAuthorRoute =
  | { pathname: '/(app)/user-profile'; params: { userId: string } }
  | { pathname: '/(app)/forum-author'; params: { authorId: string } };

export type ForumThread = {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  authorId: string;
  preview: string;
  replies: number;
  createdAt: string;
  /** Preformatted relative time for list cards (mock). */
  timeLabel?: string;
  tags?: string[];
};

export type ForumPost = {
  id: string;
  threadId: string;
  author: string;
  authorId: string;
  body: string;
  createdAt: string;
  mine?: boolean;
  votes?: number;
  isSolution?: boolean;
};

export type ForumNotification = {
  id: string;
  title: string;
  /** Plain text; use boldSpans for emphasis in UI. */
  body: string;
  /** Substrings of body that should render bold. */
  boldSpans?: string[];
  threadId?: string;
  authorId?: string;
  createdAt: string;
  read: boolean;
  /** Right-side label e.g. Нове / Вчора / 2 дні */
  timeLabel?: string;
};

export const FORUM_RULES: string[] = [
  'Поважайте інших власників і тварин',
  'Без реклами й спаму в темах',
  'Медичні поради — не заміна візиту до лікаря',
  'Порушення — попередження, потім блокування',
];

/** @deprecated use FORUM_RULES */
export const FORUM_RULES_UA = FORUM_RULES.map(
  (r, i) => `${i + 1}. ${r}`,
).join('\n');

export const FORUM_SEARCH_TAGS = [
  'алергія',
  'цуценя',
  'переноска',
  'щеплення',
] as const;

const ME_AUTHOR_ID = 'fa-me';

const AUTHORS: Record<string, ForumAuthor> = {
  [ME_AUTHOR_ID]: {
    id: ME_AUTHOR_ID,
    displayName: 'Ти',
    bio: 'Твій локальний профіль на форумі KnowSnout.',
    joinedAt: '2026-08-01T10:00:00.000Z',
    topicCount: 2,
    replyCount: 5,
    rank: 'Новачок',
  },
  'fa-oksana': {
    id: 'fa-oksana',
    displayName: 'Оксана',
    bio: 'Кішки й спокійні рутини.',
    joinedAt: '2026-03-01T10:00:00.000Z',
    topicCount: 42,
    replyCount: 210,
    rank: 'Досвідчений власник кота',
    socialUserId: 'fu-1',
  },
  'fa-marta': {
    id: 'fa-marta',
    displayName: 'Марта',
    bio: 'Собаки · нашийники й майданчики.',
    joinedAt: '2026-05-12T10:00:00.000Z',
    topicCount: 18,
    replyCount: 96,
    rank: 'Досвідчений власник собаки',
    socialUserId: 'seed-marta',
  },
  'fa-igor': {
    id: 'fa-igor',
    displayName: 'Ігор',
    bio: 'Київ · прогулянки й тренування.',
    joinedAt: '2026-04-20T10:00:00.000Z',
    topicCount: 11,
    replyCount: 64,
    rank: 'Активний учасник',
    socialUserId: 'fu-3',
  },
};

const CATEGORIES: ForumCategory[] = [
  {
    id: 'fc-dogs',
    title: 'Собаки',
    body: 'Нашийники, майданчики, виховання',
    threadCount: 248,
    icon: 'paw',
  },
  {
    id: 'fc-cats',
    title: 'Коти',
    body: 'Переноски, поведінка, догляд',
    threadCount: 312,
    icon: 'cat',
  },
  {
    id: 'fc-feeding',
    title: 'Годування',
    body: 'Корми, алергії, раціон',
    threadCount: 96,
    icon: 'bowl',
  },
  {
    id: 'fc-health',
    title: "Здоров'я",
    body: 'Щеплення, симптоми, ветдосвід',
    threadCount: 154,
    icon: 'heart',
  },
];

const SEED_THREADS: ForumThread[] = [
  {
    id: 'ft-collar',
    categoryId: 'fc-dogs',
    title: 'Як привчити до нашийника?',
    author: 'Марта',
    authorId: 'fa-marta',
    preview: 'Цуценя 3 місяці, боїться нашийника…',
    replies: 6,
    createdAt: '2026-08-25T14:40:00.000Z',
    timeLabel: '20 хв тому',
    tags: ['цуценя'],
  },
  {
    id: 'ft-parks',
    categoryId: 'fc-dogs',
    title: 'Найкращі майданчики у Києві',
    author: 'Ігор',
    authorId: 'fa-igor',
    preview: 'Де зручно для середніх порід?',
    replies: 41,
    createdAt: '2026-08-24T12:00:00.000Z',
    timeLabel: 'вчора',
  },
  {
    id: 'ft-carrier',
    categoryId: 'fc-cats',
    title: 'Як привчити кота до переноски?',
    author: 'Оксана',
    authorId: 'fa-oksana',
    preview: 'Кіт панікує щоразу, коли бачить переноску.',
    replies: 14,
    createdAt: '2026-08-23T10:00:00.000Z',
    timeLabel: '2 дні тому',
    tags: ['переноска'],
  },
  {
    id: 'ft-fish',
    categoryId: 'fc-cats',
    title: 'Чи можна годувати кота рибою щодня?',
    author: 'Оксана',
    authorId: 'fa-oksana',
    preview: 'Чула, що часто — небажано. Як у вас?',
    replies: 8,
    createdAt: '2026-08-22T09:00:00.000Z',
    timeLabel: '3 дні тому',
  },
  {
    id: 'ft-allergy',
    categoryId: 'fc-feeding',
    title: 'Алергія на курку — чим годувати?',
    author: 'Марта',
    authorId: 'fa-marta',
    preview: 'Свербіж після курячого корму.',
    replies: 22,
    createdAt: '2026-08-21T11:00:00.000Z',
    timeLabel: '4 дні тому',
    tags: ['алергія'],
  },
  {
    id: 'ft-chew',
    categoryId: 'fc-dogs',
    title: 'Цуценя гризе меблі, що робити?',
    author: 'Ігор',
    authorId: 'fa-igor',
    preview: 'Диван уже «під обстрілом».',
    replies: 31,
    createdAt: '2026-08-20T16:00:00.000Z',
    timeLabel: '5 днів тому',
    tags: ['цуценя'],
  },
  {
    id: 'ft-vax',
    categoryId: 'fc-health',
    title: 'Графік щеплень для цуценяти',
    author: 'Марта',
    authorId: 'fa-marta',
    preview: 'Що обов’язково до року?',
    replies: 12,
    createdAt: '2026-08-19T10:00:00.000Z',
    timeLabel: '6 днів тому',
    tags: ['щеплення'],
  },
];

const SEED_POSTS: ForumPost[] = [
  {
    id: 'fp-carrier-q',
    threadId: 'ft-carrier',
    author: 'Оксана',
    authorId: 'fa-oksana',
    body: 'Кіт панікує щоразу, коли бачить переноску. Як ви привчали?',
    createdAt: '2026-08-23T10:00:00.000Z',
    votes: 4,
  },
  {
    id: 'fp-carrier-sol',
    threadId: 'ft-carrier',
    author: 'Марта',
    authorId: 'fa-marta',
    body: 'Залишайте переноску відкритою вдома постійно, хай звикає поступово.',
    createdAt: '2026-08-23T11:30:00.000Z',
    votes: 24,
    isSolution: true,
  },
  {
    id: 'fp-carrier-r2',
    threadId: 'ft-carrier',
    author: 'Ігор',
    authorId: 'fa-igor',
    body: 'Ще спробуйте класти улюблену ковдру всередину.',
    createdAt: '2026-08-23T14:00:00.000Z',
    votes: 6,
  },
  {
    id: 'fp-collar-q',
    threadId: 'ft-collar',
    author: 'Марта',
    authorId: 'fa-marta',
    body: 'Цуценя 3 місяці, боїться нашийника…',
    createdAt: '2026-08-25T14:40:00.000Z',
    votes: 2,
  },
  {
    id: 'fp-parks-q',
    threadId: 'ft-parks',
    author: 'Ігор',
    authorId: 'fa-igor',
    body: 'Де зручно для середніх порід у Києві?',
    createdAt: '2026-08-24T12:00:00.000Z',
    votes: 5,
  },
];

const SEED_NOTIFICATIONS: ForumNotification[] = [
  {
    id: 'fn-1',
    title: 'Нова відповідь',
    body: 'Ігор відповів у твоєму треді «Як привчити до нашийника?»',
    boldSpans: ['Ігор'],
    threadId: 'ft-collar',
    authorId: 'fa-igor',
    createdAt: '2026-08-25T15:00:00.000Z',
    read: false,
    timeLabel: 'Нове',
  },
  {
    id: 'fn-2',
    title: 'Розвʼязання',
    body: "Твою відповідь позначили як розв'язання",
    boldSpans: ["розв'язання"],
    threadId: 'ft-carrier',
    createdAt: '2026-08-24T10:00:00.000Z',
    read: true,
    timeLabel: 'Вчора',
  },
  {
    id: 'fn-3',
    title: 'Голос',
    body: 'Оксана проголосувала за твою відповідь',
    boldSpans: ['Оксана'],
    threadId: 'ft-collar',
    authorId: 'fa-oksana',
    createdAt: '2026-08-23T10:00:00.000Z',
    read: true,
    timeLabel: '2 дні',
  },
];

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      await AsyncStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function resolveAuthorId(
  authorId: string | undefined,
  authorName: string,
): string {
  if (authorId && AUTHORS[authorId]) return authorId;
  const byName = Object.values(AUTHORS).find(
    (a) => a.displayName === authorName,
  );
  return byName?.id ?? ME_AUTHOR_ID;
}

function normalizeThread(raw: ForumThread): ForumThread {
  const authorId = resolveAuthorId(raw.authorId, raw.author);
  return {
    ...raw,
    authorId,
    author: AUTHORS[authorId]?.displayName ?? raw.author,
  };
}

function normalizePost(raw: ForumPost): ForumPost {
  const authorId = resolveAuthorId(raw.authorId, raw.author);
  return {
    ...raw,
    authorId,
    author: AUTHORS[authorId]?.displayName ?? raw.author,
  };
}

async function myDisplayName(): Promise<string> {
  try {
    const profile = await getUserProfile();
    if (profile?.display_name?.trim()) return profile.display_name.trim();
  } catch {
    /* local */
  }
  return AUTHORS[ME_AUTHOR_ID]?.displayName ?? 'Ти';
}

export function listForumCategories(): ForumCategory[] {
  return CATEGORIES;
}

export function getForumCategory(id: string): ForumCategory | null {
  return CATEGORIES.find((c) => c.id === id) ?? null;
}

export function getForumAuthor(id: string): ForumAuthor | null {
  if (AUTHORS[id]) return AUTHORS[id];
  if (id.length > 20) {
    return {
      id,
      displayName: 'Користувач',
      bio: 'Профіль з хмари.',
      joinedAt: new Date().toISOString(),
    };
  }
  return null;
}

export function forumAuthorRoute(authorId: string): ForumAuthorRoute {
  const author = getForumAuthor(authorId);
  if (author?.socialUserId) {
    return {
      pathname: '/(app)/user-profile',
      params: { userId: author.socialUserId },
    };
  }
  return {
    pathname: '/(app)/forum-author',
    params: { authorId },
  };
}

export async function listForumThreads(
  categoryId?: string,
): Promise<ForumThread[]> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      let q = supabase
        .from('forum_threads')
        .select('id, category_id, author_id, title, preview, reply_count, created_at')
        .order('created_at', { ascending: false });
      if (categoryId) q = q.eq('category_id', categoryId);
      const { data, error } = await q;
      if (error) {
        if (!isMissingSchemaError(error.message)) {
          /* fall through to local */
        }
      } else if (data && data.length > 0) {
        return data.map((row) => ({
          id: String(row.id),
          categoryId: String(row.category_id),
          title: String(row.title),
          author:
            String(row.author_id) === user.id
              ? 'Ти'
              : AUTHORS[String(row.author_id)]?.displayName ?? 'Користувач',
          authorId: String(row.author_id),
          preview: String(row.preview ?? ''),
          replies: Number(row.reply_count ?? 0),
          createdAt: String(row.created_at),
        }));
      }
    } catch {
      /* local */
    }
  }

  const list = await readJson(THREADS_KEY, SEED_THREADS);
  const normalized = list.map(normalizeThread);
  const filtered = categoryId
    ? normalized.filter((t) => t.categoryId === categoryId)
    : normalized;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listThreadsByAuthor(
  authorId: string,
): Promise<ForumThread[]> {
  const list = await listForumThreads();
  return list.filter((t) => t.authorId === authorId);
}

export async function getForumThread(id: string): Promise<ForumThread | null> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('forum_threads')
        .select('id, category_id, author_id, title, preview, reply_count, created_at')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) {
        return {
          id: String(data.id),
          categoryId: String(data.category_id),
          title: String(data.title),
          author:
            String(data.author_id) === user.id
              ? 'Ти'
              : AUTHORS[String(data.author_id)]?.displayName ?? 'Користувач',
          authorId: String(data.author_id),
          preview: String(data.preview ?? ''),
          replies: Number(data.reply_count ?? 0),
          createdAt: String(data.created_at),
        };
      }
    } catch {
      /* local */
    }
  }
  const list = await listForumThreads();
  return list.find((t) => t.id === id) ?? null;
}

export async function listForumPosts(threadId: string): Promise<ForumPost[]> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('forum_posts')
        .select('id, thread_id, author_id, body, created_at')
        .eq('thread_id', threadId)
        .order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: String(row.id),
          threadId: String(row.thread_id),
          author:
            String(row.author_id) === user.id ? 'Ти' : 'Користувач',
          authorId: String(row.author_id),
          body: String(row.body),
          createdAt: String(row.created_at),
          mine: String(row.author_id) === user.id,
        }));
      }
    } catch {
      /* local */
    }
  }

  const list = await readJson(POSTS_KEY, SEED_POSTS);
  return list
    .map(normalizePost)
    .filter((p) => p.threadId === threadId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createForumThread(input: {
  categoryId: string;
  title: string;
  body: string;
}): Promise<ForumThread> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const title = input.title.trim();
      const body = input.body.trim();
      const preview = body.slice(0, 80);
      const { data: thread, error } = await supabase
        .from('forum_threads')
        .insert({
          category_id: input.categoryId,
          author_id: user.id,
          title,
          preview,
          reply_count: 0,
        })
        .select('id, category_id, author_id, title, preview, reply_count, created_at')
        .single();
      if (!error && thread) {
        await supabase.from('forum_posts').insert({
          thread_id: thread.id,
          author_id: user.id,
          body,
        });
        const name = await myDisplayName();
        return {
          id: String(thread.id),
          categoryId: String(thread.category_id),
          title: String(thread.title),
          author: name,
          authorId: user.id,
          preview,
          replies: 0,
          createdAt: String(thread.created_at),
        };
      }
      if (error && !isMissingSchemaError(error.message)) {
        /* fall local */
      }
    } catch {
      /* local */
    }
  }

  const threads = await readJson(THREADS_KEY, SEED_THREADS);
  const posts = await readJson(POSTS_KEY, SEED_POSTS);
  const me = AUTHORS[ME_AUTHOR_ID]!;
  const id = `ft-${Date.now()}`;
  const thread: ForumThread = {
    id,
    categoryId: input.categoryId,
    title: input.title.trim(),
    author: me.displayName,
    authorId: me.id,
    preview: input.body.trim().slice(0, 80),
    replies: 0,
    createdAt: new Date().toISOString(),
    timeLabel: 'щойно',
  };
  const post: ForumPost = {
    id: `fp-${Date.now()}`,
    threadId: id,
    author: me.displayName,
    authorId: me.id,
    body: input.body.trim(),
    createdAt: thread.createdAt,
    mine: true,
    votes: 0,
  };
  threads.unshift(thread);
  posts.push(post);
  await writeJson(THREADS_KEY, threads);
  await writeJson(POSTS_KEY, posts);
  return thread;
}

export async function replyForumThread(
  threadId: string,
  body: string,
): Promise<ForumPost> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const text = body.trim();
      const { data, error } = await supabase
        .from('forum_posts')
        .insert({
          thread_id: threadId,
          author_id: user.id,
          body: text,
        })
        .select('id, thread_id, author_id, body, created_at')
        .single();
      if (!error && data) {
        const { data: thread } = await supabase
          .from('forum_threads')
          .select('reply_count')
          .eq('id', threadId)
          .maybeSingle();
        const nextCount = Number(thread?.reply_count ?? 0) + 1;
        await supabase
          .from('forum_threads')
          .update({
            reply_count: nextCount,
            preview: text.slice(0, 80),
            updated_at: new Date().toISOString(),
          })
          .eq('id', threadId);
        const name = await myDisplayName();
        return {
          id: String(data.id),
          threadId: String(data.thread_id),
          author: name,
          authorId: user.id,
          body: text,
          createdAt: String(data.created_at),
          mine: true,
          votes: 0,
        };
      }
    } catch {
      /* local */
    }
  }

  const posts = await readJson(POSTS_KEY, SEED_POSTS);
  const threads = await readJson(THREADS_KEY, SEED_THREADS);
  const me = AUTHORS[ME_AUTHOR_ID]!;
  const post: ForumPost = {
    id: `fp-${Date.now()}`,
    threadId,
    author: me.displayName,
    authorId: me.id,
    body: body.trim(),
    createdAt: new Date().toISOString(),
    mine: true,
    votes: 0,
  };
  posts.push(post);
  const idx = threads.findIndex((t) => t.id === threadId);
  if (idx >= 0) {
    threads[idx] = {
      ...threads[idx],
      replies: threads[idx].replies + 1,
      preview: body.trim().slice(0, 80),
    };
  }
  await writeJson(POSTS_KEY, posts);
  await writeJson(THREADS_KEY, threads);
  return post;
}

export async function searchForum(
  query: string,
  tag?: string,
): Promise<ForumThread[]> {
  const q = query.trim().toLowerCase();
  const tagQ = tag?.trim().toLowerCase();
  const threads = await listForumThreads();
  return threads.filter((t) => {
    const tagOk =
      !tagQ ||
      (t.tags ?? []).some((x) => x.toLowerCase() === tagQ) ||
      t.title.toLowerCase().includes(tagQ);
    if (!tagOk) return false;
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.preview.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q) ||
      (t.tags ?? []).some((x) => x.toLowerCase().includes(q))
    );
  });
}

export async function listForumNotifications(): Promise<ForumNotification[]> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('forum_notifications')
        .select('id, title, body, thread_id, read_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: String(row.id),
          title: String(row.title),
          body: String(row.body ?? ''),
          threadId: row.thread_id ? String(row.thread_id) : undefined,
          createdAt: String(row.created_at),
          read: Boolean(row.read_at),
        }));
      }
    } catch {
      /* local */
    }
  }
  const list = await readJson(NOTIFS_KEY, SEED_NOTIFICATIONS);
  return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function markForumNotificationRead(
  id: string,
): Promise<ForumNotification | null> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('forum_notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select('id, title, body, thread_id, read_at, created_at')
        .maybeSingle();
      if (!error && data) {
        return {
          id: String(data.id),
          title: String(data.title),
          body: String(data.body ?? ''),
          threadId: data.thread_id ? String(data.thread_id) : undefined,
          createdAt: String(data.created_at),
          read: true,
        };
      }
    } catch {
      /* local */
    }
  }
  const list = await readJson(NOTIFS_KEY, SEED_NOTIFICATIONS);
  const idx = list.findIndex((n) => n.id === id);
  if (idx < 0) return null;
  list[idx] = { ...list[idx], read: true };
  await writeJson(NOTIFS_KEY, list);
  return list[idx];
}
