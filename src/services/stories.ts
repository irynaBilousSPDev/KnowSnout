import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { isNativeSafeImageUri, persistLocalImage } from '@/src/lib/image';
import {
  friendlyDbError,
  isMissingSchemaError,
} from '@/src/lib/schemaErrors';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import { getUserProfile } from '@/src/services/userProfile';
import type {
  StoryComment,
  StoryFeedFilter,
  StoryPost,
  StoryPrivacy,
  StorySpecies,
} from '@/src/types/story';

const LOCAL_KEY = 'knowsnout.story_posts.v1';
const LOCAL_COMMENTS_KEY = 'knowsnout.story_comments.v1';

const SEED_POSTS: StoryPost[] = [
  {
    id: 'seed-1',
    userId: 'seed',
    author: 'Iryna',
    petName: 'Ада',
    species: 'cat',
    avatarKey: 'cat-1',
    caption: 'Сонячний ранок на підвіконні',
    imageUri: null,
    imagePath: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 12,
    liked: false,
    commentsCount: 1,
    mine: false,
    privacy: 'public',
    petId: null,
  },
  {
    id: 'seed-2',
    userId: 'seed',
    author: 'Andrii',
    petName: 'Белла',
    species: 'cat',
    avatarKey: 'cat-2',
    caption: 'Нова іграшка — і нуль спокою вдома',
    imageUri: null,
    imagePath: null,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 8,
    liked: true,
    commentsCount: 0,
    mine: false,
    privacy: 'public',
    petId: null,
  },
  {
    id: 'seed-3',
    userId: 'seed',
    author: 'Marta',
    petName: 'Рекс',
    species: 'dog',
    avatarKey: 'dog-1',
    caption: 'Перша прогулянка після дощу',
    imageUri: null,
    imagePath: null,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    likes: 21,
    liked: false,
    commentsCount: 2,
    mine: false,
    privacy: 'public',
    petId: null,
  },
];

const SEED_COMMENTS: StoryComment[] = [
  {
    id: 'seed-c1',
    postId: 'seed-1',
    userId: 'seed',
    author: 'Оля',
    body: 'Яка красуня 💛',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-c2',
    postId: 'seed-3',
    userId: 'seed',
    author: 'Ігор',
    body: 'Гарна прогулянка!',
    createdAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'seed-c3',
    postId: 'seed-3',
    userId: 'seed',
    author: 'Аня',
    body: 'Рекс зірка 🐶',
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
];

async function readLocal(): Promise<StoryPost[]> {
  const raw = await AsyncStorage.getItem(LOCAL_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoryPost[];
    return parsed.map((p) => ({
      ...p,
      commentsCount: p.commentsCount ?? 0,
    }));
  } catch {
    return [];
  }
}

async function writeLocal(posts: StoryPost[]) {
  await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(posts));
}

async function readLocalComments(): Promise<StoryComment[]> {
  const raw = await AsyncStorage.getItem(LOCAL_COMMENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoryComment[];
  } catch {
    return [];
  }
}

async function writeLocalComments(rows: StoryComment[]) {
  await AsyncStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(rows));
}

export function formatStoryTimeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const mins = Math.max(0, Math.floor(ms / 60000));
  if (mins < 1) return 'Щойно';
  if (mins < 60) return `${mins} хв тому`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} год тому`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Вчора';
  if (days < 7) return `${days} дні тому`;
  return new Date(iso).toLocaleDateString('uk-UA');
}

export function formatLikedBy(likes: number, liked: boolean): string {
  if (likes <= 0) return 'Поки без сердечок';
  if (liked && likes === 1) return 'Ти';
  if (liked) return `Ти та ще ${likes - 1}`;
  return `${likes}`;
}

function publicImageUrl(path: string | null | undefined): string | null {
  if (!path || !supabase) return null;
  if (isNativeSafeImageUri(path)) return path;
  const { data } = supabase.storage.from('story-images').getPublicUrl(path);
  return data.publicUrl || null;
}

function mapCloudRow(
  row: Record<string, unknown>,
  likeCount: number,
  liked: boolean,
  commentsCount: number,
  myUserId: string | null,
): StoryPost {
  const imagePath = row.image_path ? String(row.image_path) : null;
  const speciesRaw = row.species ? String(row.species) : 'cat';
  const species: StorySpecies = speciesRaw === 'dog' ? 'dog' : 'cat';
  const privacy: StoryPrivacy =
    row.privacy === 'private' ? 'private' : 'public';
  const userId = String(row.user_id);
  return {
    id: String(row.id),
    userId,
    author: row.author_name ? String(row.author_name) : 'Учасник',
    petName: row.pet_name
      ? String(row.pet_name)
      : species === 'dog'
        ? 'Пес'
        : 'Кіт',
    species,
    avatarKey: row.avatar_key
      ? String(row.avatar_key)
      : species === 'dog'
        ? 'dog-1'
        : 'cat-1',
    caption: row.caption ? String(row.caption) : '',
    imagePath,
    imageUri: publicImageUrl(imagePath),
    createdAt: String(row.created_at),
    likes: likeCount,
    liked,
    commentsCount,
    mine: Boolean(myUserId && userId === myUserId),
    privacy,
    petId: row.pet_id ? String(row.pet_id) : null,
  };
}

async function uploadStoryImage(
  userId: string,
  uri: string,
): Promise<string | null> {
  if (!supabase) return null;
  const stable = await persistLocalImage(uri, 'stories');
  const ext = stable.toLowerCase().includes('png') ? 'png' : 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const response = await fetch(stable);
  const blob = await response.blob();
  const { error } = await supabase.storage.from('story-images').upload(path, blob, {
    contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
    upsert: false,
  });
  if (error) throw new Error(error.message);
  return path;
}

function withLocalCommentCounts(
  posts: StoryPost[],
  comments: StoryComment[],
): StoryPost[] {
  const counts = new Map<string, number>();
  for (const c of comments) {
    counts.set(c.postId, (counts.get(c.postId) ?? 0) + 1);
  }
  return posts.map((p) => ({
    ...p,
    commentsCount:
      p.id.startsWith('seed-') && !counts.has(p.id)
        ? p.commentsCount
        : (counts.get(p.id) ?? p.commentsCount ?? 0),
  }));
}

export async function listStoryFeed(
  filter: StoryFeedFilter = 'all',
): Promise<StoryPost[]> {
  const user = await getCurrentUser();

  if (env.isDemoMode || !supabase) {
    return listStoryFeedDemo(filter);
  }

  try {
    let query = supabase
      .from('story_posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(80);

    if (filter === 'mine') {
      if (!user) return [];
      query = query.eq('user_id', user.id);
    } else if (filter === 'cat') {
      query = query.eq('species', 'cat').eq('privacy', 'public');
    } else if (filter === 'dog') {
      query = query.eq('species', 'dog').eq('privacy', 'public');
    } else {
      query = query.eq('privacy', 'public');
    }

    const { data, error } = await query;
    if (error) {
      if (isMissingSchemaError(error.message)) {
        return listStoryFeedDemo(filter);
      }
      throw new Error(friendlyDbError(error.message));
    }

    const rows = data ?? [];
    const ids = rows.map((r) => String((r as { id: string }).id));
    const likeCounts = new Map<string, number>();
    const likedSet = new Set<string>();
    const commentCounts = new Map<string, number>();

    if (ids.length > 0) {
      const [{ data: likes }, { data: comments }] = await Promise.all([
        supabase.from('story_likes').select('post_id, user_id').in('post_id', ids),
        supabase.from('story_comments').select('post_id').in('post_id', ids),
      ]);
      for (const like of likes ?? []) {
        const pid = String((like as { post_id: string }).post_id);
        likeCounts.set(pid, (likeCounts.get(pid) ?? 0) + 1);
        if (
          user &&
          String((like as { user_id: string }).user_id) === user.id
        ) {
          likedSet.add(pid);
        }
      }
      for (const c of comments ?? []) {
        const pid = String((c as { post_id: string }).post_id);
        commentCounts.set(pid, (commentCounts.get(pid) ?? 0) + 1);
      }
    }

    return rows.map((row) => {
      const id = String((row as { id: string }).id);
      return mapCloudRow(
        row as Record<string, unknown>,
        likeCounts.get(id) ?? 0,
        likedSet.has(id),
        commentCounts.get(id) ?? 0,
        user?.id ?? null,
      );
    });
  } catch (err) {
    if (err instanceof Error && isMissingSchemaError(err.message)) {
      return listStoryFeedDemo(filter);
    }
    throw err;
  }
}

async function listStoryFeedDemo(filter: StoryFeedFilter) {
  const local = await readLocal();
  const localComments = await readLocalComments();
  const mine = local.map((p) => ({ ...p, mine: true }));
  const all = withLocalCommentCounts([...mine, ...SEED_POSTS], [
    ...SEED_COMMENTS,
    ...localComments,
  ]);
  return all.filter((p) => {
    if (filter === 'mine') return p.mine;
    if (p.mine && p.privacy === 'private') return false;
    if (filter === 'cat') return p.species === 'cat';
    if (filter === 'dog') return p.species === 'dog';
    return true;
  });
}

function localPost(input: {
  id: string;
  userId: string;
  author: string;
  petName: string;
  species: StorySpecies;
  avatarKey: string;
  caption: string;
  imageUri: string | null;
  imagePath: string | null;
  privacy: StoryPrivacy;
  petId: string | null;
  now: string;
}): StoryPost {
  return {
    ...input,
    createdAt: input.now,
    likes: 0,
    liked: false,
    commentsCount: 0,
    mine: true,
  };
}

export async function createStoryPost(input: {
  caption: string;
  imageUri: string;
  species: StorySpecies;
  privacy: StoryPrivacy;
  petId?: string | null;
  petName?: string | null;
  avatarKey?: string | null;
}): Promise<StoryPost> {
  const caption = input.caption.trim();
  if (!caption) throw new Error('CAPTION_REQUIRED');
  if (!input.imageUri) throw new Error('PHOTO_REQUIRED');

  const user = await getCurrentUser();
  const profile = await getUserProfile();
  const author =
    profile?.display_name?.trim() ||
    (user?.email ? user.email.split('@')[0] : null) ||
    'Ти';
  const petName =
    input.petName?.trim() ||
    (input.species === 'dog' ? 'Мій пес' : 'Мій кіт');
  const avatarKey =
    input.avatarKey ||
    (input.species === 'dog' ? 'dog-1' : 'cat-1');
  const now = new Date().toISOString();

  if (env.isDemoMode || !supabase || !user) {
    const post = localPost({
      id: `local-${Date.now()}`,
      userId: user?.id ?? 'local',
      author,
      petName,
      species: input.species,
      avatarKey,
      caption,
      imageUri: await persistLocalImage(input.imageUri, 'stories'),
      imagePath: null,
      privacy: input.privacy,
      petId: input.petId ?? null,
      now,
    });
    const prev = await readLocal();
    await writeLocal([post, ...prev].slice(0, 50));
    return post;
  }

  let imagePath: string | null = null;
  try {
    imagePath = await uploadStoryImage(user.id, input.imageUri);
  } catch {
    const post = localPost({
      id: `local-${Date.now()}`,
      userId: user.id,
      author,
      petName,
      species: input.species,
      avatarKey,
      caption,
      imageUri: await persistLocalImage(input.imageUri, 'stories'),
      imagePath: null,
      privacy: input.privacy,
      petId: input.petId ?? null,
      now,
    });
    const prev = await readLocal();
    await writeLocal([post, ...prev].slice(0, 50));
    return post;
  }

  const payload = {
    user_id: user.id,
    pet_id: input.petId ?? null,
    caption,
    image_path: imagePath,
    privacy: input.privacy,
    species: input.species,
    author_name: author,
    pet_name: petName,
    avatar_key: avatarKey,
  };

  const { data, error } = await supabase
    .from('story_posts')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    if (error && isMissingSchemaError(error.message)) {
      const post = localPost({
        id: `local-${Date.now()}`,
        userId: user.id,
        author,
        petName,
        species: input.species,
        avatarKey,
        caption,
        imageUri: publicImageUrl(imagePath) ?? input.imageUri,
        imagePath,
        privacy: input.privacy,
        petId: input.petId ?? null,
        now,
      });
      const prev = await readLocal();
      await writeLocal([post, ...prev].slice(0, 50));
      return post;
    }
    throw new Error(friendlyDbError(error?.message) || 'Failed to publish');
  }

  return mapCloudRow(data as Record<string, unknown>, 0, false, 0, user.id);
}

export async function getStoryPost(postId: string): Promise<StoryPost | null> {
  if (!postId) return null;

  if (
    env.isDemoMode ||
    !supabase ||
    postId.startsWith('seed-') ||
    postId.startsWith('local-')
  ) {
    const all = await listStoryFeedDemo('all');
    const mine = await listStoryFeedDemo('mine');
    return (
      all.find((p) => p.id === postId) ??
      mine.find((p) => p.id === postId) ??
      null
    );
  }

  try {
    const user = await getCurrentUser();
    const { data, error } = await supabase
      .from('story_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();
    if (error) {
      if (isMissingSchemaError(error.message)) {
        const all = await listStoryFeedDemo('all');
        return all.find((p) => p.id === postId) ?? null;
      }
      throw new Error(friendlyDbError(error.message));
    }
    if (!data) return null;

    const [{ count: likeCount }, { count: commentsCount }, { data: myLike }] =
      await Promise.all([
        supabase
          .from('story_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('story_comments')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId),
        user
          ? supabase
              .from('story_likes')
              .select('post_id')
              .eq('post_id', postId)
              .eq('user_id', user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

    return mapCloudRow(
      data as Record<string, unknown>,
      likeCount ?? 0,
      Boolean(myLike),
      commentsCount ?? 0,
      user?.id ?? null,
    );
  } catch (err) {
    if (err instanceof Error && isMissingSchemaError(err.message)) {
      const all = await listStoryFeedDemo('all');
      return all.find((p) => p.id === postId) ?? null;
    }
    throw err;
  }
}

export async function toggleStoryLike(post: StoryPost): Promise<StoryPost> {
  const user = await getCurrentUser();
  const nextLiked = !post.liked;
  const nextLikes = Math.max(0, post.likes + (nextLiked ? 1 : -1));

  if (
    env.isDemoMode ||
    !supabase ||
    !user ||
    post.id.startsWith('seed-') ||
    post.id.startsWith('local-')
  ) {
    const updated = { ...post, liked: nextLiked, likes: nextLikes };
    if (post.id.startsWith('local-') || post.mine) {
      const prev = await readLocal();
      await writeLocal(prev.map((p) => (p.id === post.id ? updated : p)));
    }
    return updated;
  }

  if (nextLiked) {
    const { error } = await supabase.from('story_likes').insert({
      post_id: post.id,
      user_id: user.id,
    });
    if (error && !error.message.toLowerCase().includes('duplicate')) {
      throw new Error(friendlyDbError(error.message));
    }
  } else {
    const { error } = await supabase
      .from('story_likes')
      .delete()
      .eq('post_id', post.id)
      .eq('user_id', user.id);
    if (error) throw new Error(friendlyDbError(error.message));
  }

  return { ...post, liked: nextLiked, likes: nextLikes };
}

function mapComment(
  row: Record<string, unknown>,
  myUserId: string | null,
): StoryComment {
  const userId = String(row.user_id);
  return {
    id: String(row.id),
    postId: String(row.post_id),
    userId,
    author: row.author_name ? String(row.author_name) : 'Учасник',
    body: String(row.body ?? ''),
    createdAt: String(row.created_at),
    mine: Boolean(myUserId && userId === myUserId),
  };
}

export async function listStoryComments(
  postId: string,
): Promise<StoryComment[]> {
  const user = await getCurrentUser();

  if (
    env.isDemoMode ||
    !supabase ||
    postId.startsWith('seed-') ||
    postId.startsWith('local-')
  ) {
    const local = await readLocalComments();
    return [...SEED_COMMENTS, ...local]
      .filter((c) => c.postId === postId)
      .map((c) => ({
        ...c,
        mine: Boolean(user && c.userId === user.id),
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  try {
    const { data, error } = await supabase
      .from('story_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })
      .limit(100);
    if (error) {
      if (isMissingSchemaError(error.message)) {
        const local = await readLocalComments();
        return local
          .filter((c) => c.postId === postId)
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
      }
      throw new Error(friendlyDbError(error.message));
    }
    return (data ?? []).map((row) =>
      mapComment(row as Record<string, unknown>, user?.id ?? null),
    );
  } catch (err) {
    if (err instanceof Error && isMissingSchemaError(err.message)) {
      const local = await readLocalComments();
      return local
        .filter((c) => c.postId === postId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    throw err;
  }
}

export async function addStoryComment(
  postId: string,
  bodyRaw: string,
): Promise<StoryComment> {
  const body = bodyRaw.trim();
  if (!body) throw new Error('COMMENT_REQUIRED');
  if (body.length > 500) throw new Error('COMMENT_TOO_LONG');

  const user = await getCurrentUser();
  if (!user) throw new Error('You must be signed in');
  const profile = await getUserProfile();
  const author =
    profile?.display_name?.trim() ||
    (user.email ? user.email.split('@')[0] : null) ||
    'Ти';
  const now = new Date().toISOString();

  if (
    env.isDemoMode ||
    !supabase ||
    postId.startsWith('seed-') ||
    postId.startsWith('local-')
  ) {
    const row: StoryComment = {
      id: `local-c-${Date.now()}`,
      postId,
      userId: user.id,
      author,
      body,
      createdAt: now,
      mine: true,
    };
    const prev = await readLocalComments();
    await writeLocalComments([...prev, row].slice(-200));
    return row;
  }

  const payload = {
    post_id: postId,
    user_id: user.id,
    body,
    author_name: author,
  };

  const { data, error } = await supabase
    .from('story_comments')
    .insert(payload)
    .select('*')
    .single();

  if (error || !data) {
    if (error && isMissingSchemaError(error.message)) {
      // Retry without author_name if column missing
      const { data: retry, error: retryErr } = await supabase
        .from('story_comments')
        .insert({ post_id: postId, user_id: user.id, body })
        .select('*')
        .single();
      if (retryErr || !retry) {
        throw new Error(friendlyDbError(retryErr?.message || error.message));
      }
      return mapComment(retry as Record<string, unknown>, user.id);
    }
    throw new Error(friendlyDbError(error?.message) || 'Failed to comment');
  }

  return mapComment(data as Record<string, unknown>, user.id);
}

export async function deleteStoryComment(comment: StoryComment): Promise<void> {
  const user = await getCurrentUser();
  if (!user || !comment.mine) throw new Error('NOT_OWNED');

  if (
    env.isDemoMode ||
    !supabase ||
    comment.id.startsWith('local-c-') ||
    comment.id.startsWith('seed-')
  ) {
    const prev = await readLocalComments();
    await writeLocalComments(prev.filter((c) => c.id !== comment.id));
    return;
  }

  const { error } = await supabase
    .from('story_comments')
    .delete()
    .eq('id', comment.id)
    .eq('user_id', user.id);
  if (error) throw new Error(friendlyDbError(error.message));
}
