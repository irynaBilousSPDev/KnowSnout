import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCloudUser } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { getUserProfile } from '@/src/services/userProfile';
import { supabase } from '@/src/services/supabase';

/** Forum: cloud-first when signed in + tables exist; else AsyncStorage. */

const THREADS_KEY = 'knowsnout.forum.threads.v1';
const POSTS_KEY = 'knowsnout.forum.posts.v1';
const NOTIFS_KEY = 'knowsnout.forum.notifications.v1';

export type ForumCategory = {
  id: string;
  title: string;
  body: string;
  threadCount: number;
};

export type ForumAuthor = {
  id: string;
  displayName: string;
  bio: string;
  joinedAt: string;
};

export type ForumThread = {
  id: string;
  categoryId: string;
  title: string;
  author: string;
  authorId: string;
  preview: string;
  replies: number;
  createdAt: string;
};

export type ForumPost = {
  id: string;
  threadId: string;
  author: string;
  authorId: string;
  body: string;
  createdAt: string;
  mine?: boolean;
};

export type ForumNotification = {
  id: string;
  title: string;
  body: string;
  threadId?: string;
  authorId?: string;
  createdAt: string;
  read: boolean;
};

export const FORUM_RULES_UA = `1. Повага до людей і тварин — без образ.
2. Не давай медичних призначень — лише досвід і посилання на ветів.
3. Без спаму, реклами й чужих персональних даних.
4. Фото — з дозволу; без шок-контенту.
5. Модерація демо-локальна: порушники потрапляють у «заблоковані» (пізніше).`;

const ME_AUTHOR_ID = 'fa-me';

const AUTHORS: Record<string, ForumAuthor> = {
  [ME_AUTHOR_ID]: {
    id: ME_AUTHOR_ID,
    displayName: 'Ти',
    bio: 'Твій локальний профіль на форумі KnowSnout.',
    joinedAt: '2026-08-01T10:00:00.000Z',
  },
  'fa-iryna': {
    id: 'fa-iryna',
    displayName: 'Ірина',
    bio: 'Дві кішки · догляд за шерстю й кігтями.',
    joinedAt: '2026-06-12T10:00:00.000Z',
  },
  'fa-maksym': {
    id: 'fa-maksym',
    displayName: 'Максим',
    bio: 'Рекс і калюжі — шукаю м’які шампуні.',
    joinedAt: '2026-05-03T10:00:00.000Z',
  },
  'fa-olya': {
    id: 'fa-olya',
    displayName: 'Оля',
    bio: 'Переходи кормів і спокійні рутини.',
    joinedAt: '2026-04-20T10:00:00.000Z',
  },
  'fa-dima': {
    id: 'fa-dima',
    displayName: 'Діма',
    bio: 'Луна на повідок — працюємо над спокоєм.',
    joinedAt: '2026-07-01T10:00:00.000Z',
  },
  'fa-katya': {
    id: 'fa-katya',
    displayName: 'Катя',
    bio: 'Поради без паніки · досвід з британцями.',
    joinedAt: '2026-03-15T10:00:00.000Z',
  },
};

const CATEGORIES: ForumCategory[] = [
  {
    id: 'fc-care',
    title: 'Догляд',
    body: 'Гігієна, шерсть, кігті, вуха',
    threadCount: 2,
  },
  {
    id: 'fc-food',
    title: 'Харчування',
    body: 'Корми, переходи, алергії (досвід)',
    threadCount: 1,
  },
  {
    id: 'fc-train',
    title: 'Виховання',
    body: 'Прогулянки, команди, поведінка',
    threadCount: 1,
  },
  {
    id: 'fc-offtopic',
    title: 'Офтоп',
    body: 'Мемчики й знайомства власників',
    threadCount: 0,
  },
];

const SEED_THREADS: ForumThread[] = [
  {
    id: 'ft-1',
    categoryId: 'fc-care',
    title: 'Як часто стригти кігті коту?',
    author: 'Ірина',
    authorId: 'fa-iryna',
    preview: 'У нас британка — щось кусає, коли підходжу…',
    replies: 3,
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'ft-2',
    categoryId: 'fc-care',
    title: 'Шампунь для собак після дощу',
    author: 'Максим',
    authorId: 'fa-maksym',
    preview: 'Рекс валяється в калюжах — що м’яко пахне?',
    replies: 2,
    createdAt: '2026-08-19T11:00:00.000Z',
  },
  {
    id: 'ft-3',
    categoryId: 'fc-food',
    title: 'Перехід на новий сухий корм',
    author: 'Оля',
    authorId: 'fa-olya',
    preview: 'Скільки днів мішати зі старим?',
    replies: 4,
    createdAt: '2026-08-17T09:00:00.000Z',
  },
  {
    id: 'ft-4',
    categoryId: 'fc-train',
    title: 'Тягне повідок на білок',
    author: 'Діма',
    authorId: 'fa-dima',
    preview: 'Луна зривається — лайфхаки без крику?',
    replies: 2,
    createdAt: '2026-08-16T15:00:00.000Z',
  },
];

const SEED_POSTS: ForumPost[] = [
  {
    id: 'fp-1',
    threadId: 'ft-1',
    author: 'Ірина',
    authorId: 'fa-iryna',
    body: 'У нас британка — щось кусає, коли підходжу з кусачками. Як ви привчали?',
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'fp-2',
    threadId: 'ft-1',
    author: 'Катя',
    authorId: 'fa-katya',
    body: 'Починала з 10 секунд + смаколик. І кусачки біля лежака, щоб звикла до звуку.',
    createdAt: '2026-08-18T12:00:00.000Z',
  },
  {
    id: 'fp-3',
    threadId: 'ft-1',
    author: 'Оля',
    authorId: 'fa-olya',
    body: 'Нам вет показав правильний кут — менше стресу.',
    createdAt: '2026-08-18T14:00:00.000Z',
  },
  {
    id: 'fp-4',
    threadId: 'ft-3',
    author: 'Оля',
    authorId: 'fa-olya',
    body: 'Скільки днів мішати зі старим при переході на новий сухий?',
    createdAt: '2026-08-17T09:00:00.000Z',
  },
  {
    id: 'fp-5',
    threadId: 'ft-3',
    author: 'Максим',
    authorId: 'fa-maksym',
    body: 'Ми робили 7–10 днів. Якщо стілець «плаває» — повільніше.',
    createdAt: '2026-08-17T11:00:00.000Z',
  },
];

const SEED_NOTIFICATIONS: ForumNotification[] = [
  {
    id: 'fn-1',
    title: 'Нова відповідь',
    body: 'Катя відповіла в «Як часто стригти кігті коту?»',
    threadId: 'ft-1',
    authorId: 'fa-katya',
    createdAt: '2026-08-18T12:05:00.000Z',
    read: false,
  },
  {
    id: 'fn-2',
    title: 'Згадка в темі',
    body: 'Максим згадав про перехід на сухий корм',
    threadId: 'ft-3',
    authorId: 'fa-maksym',
    createdAt: '2026-08-17T11:10:00.000Z',
    read: false,
  },
  {
    id: 'fn-3',
    title: 'Правила форуму',
    body: 'Нагадування: без медпризначень — лише досвід.',
    createdAt: '2026-08-15T09:00:00.000Z',
    read: true,
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
              : 'Користувач',
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
  };
  const post: ForumPost = {
    id: `fp-${Date.now()}`,
    threadId: id,
    author: me.displayName,
    authorId: me.id,
    body: input.body.trim(),
    createdAt: thread.createdAt,
    mine: true,
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

export async function searchForum(query: string): Promise<ForumThread[]> {
  const q = query.trim().toLowerCase();
  const threads = await listForumThreads();
  if (!q) return threads;
  return threads.filter(
    (t) =>
      t.title.toLowerCase().includes(q) ||
      t.preview.toLowerCase().includes(q) ||
      t.author.toLowerCase().includes(q),
  );
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
