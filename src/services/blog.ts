import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'knowsnout.blog.bookmarks.v1';
const COMMENTS_KEY = 'knowsnout.blog.comments.v1';

export type BlogCategory = {
  id: string;
  title: string;
};

export type BlogArticle = {
  id: string;
  categoryId: string;
  title: string;
  excerpt: string;
  body: string;
  readMinutes: number;
  publishedAt: string;
};

export type BlogComment = {
  id: string;
  articleId: string;
  author: string;
  body: string;
  createdAt: string;
  mine?: boolean;
};

export const BLOG_CATEGORIES: BlogCategory[] = [
  { id: 'bc-food', title: 'Харчування' },
  { id: 'bc-safety', title: 'Безпека' },
  { id: 'bc-life', title: 'Побут' },
];

const ARTICLES: BlogArticle[] = [
  {
    id: 'ba-1',
    categoryId: 'bc-food',
    title: 'Як читати склад корму',
    excerpt: 'Білок першим, вологість і «маркетингові» слова на етикетці.',
    body: `На упаковці спочатку дивіться на порядок інгредієнтів: чим вище позиція, тим більша частка.

Волога в консервах і сухий корм — різні світи калорійності. Порівнюйте на суху речовину, якщо хочете чесне порівняння.

Фрази на кшталт «преміум» не регулюються законом. Краще звіряти аналіз із потребами вашого улюбленця і порадою вета.

KnowSnout допомагає оцінити етикетку — це орієнтир, не діагноз.`,
    readMinutes: 6,
    publishedAt: '2026-08-10T10:00:00.000Z',
  },
  {
    id: 'ba-2',
    categoryId: 'bc-safety',
    title: 'Рослини небезпечні для котів',
    excerpt: 'Лілії, дифенбахія, плющ — коротко що тримати подалі.',
    body: `Кішки часто гризуть листя з цікавості. Деякі кімнатні рослини токсичні навіть у малій кількості.

Лілії — особливо небезпечні для котів. Якщо є підозра на поїдання — негайно до вета.

У застосунку є сканер рослин (демо/реальний API за ключами) — зручно перевірити фото перед тим, як ставити горщик на підвіконня.`,
    readMinutes: 4,
    publishedAt: '2026-08-12T10:00:00.000Z',
  },
  {
    id: 'ba-3',
    categoryId: 'bc-life',
    title: '5 хвилин гри щодня',
    excerpt: 'Короткі сесії краще за рідкі марафони — для котів і собак.',
    body: `Короткі ігри знижують стрес і допомагають «спалити» енергію перед сном.

Для котів: вудка, лазер (завжди з фінальним «спіймав»), картонні коробки.

Для собак: нюхові ігри, короткі апорти, навчання трюку за смаколик.

Дивіться розділ «Ігри та іграшки» у профілі улюбленця — там є редакційні ідеї.`,
    readMinutes: 5,
    publishedAt: '2026-08-15T10:00:00.000Z',
  },
];

const SEED_COMMENTS: BlogComment[] = [
  {
    id: 'bcmt-1',
    articleId: 'ba-1',
    author: 'Максим',
    body: 'Дякую, нарешті зрозумів про суху речовину.',
    createdAt: '2026-08-11T12:00:00.000Z',
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

export function listBlogCategories(): BlogCategory[] {
  return BLOG_CATEGORIES;
}

export function listBlogArticles(categoryId?: string): BlogArticle[] {
  if (!categoryId) return ARTICLES;
  return ARTICLES.filter((a) => a.categoryId === categoryId);
}

export function getBlogArticle(id: string): BlogArticle | null {
  return ARTICLES.find((a) => a.id === id) ?? null;
}

export async function listBookmarks(): Promise<string[]> {
  return readJson(BOOKMARKS_KEY, [] as string[]);
}

export async function toggleBookmark(articleId: string): Promise<boolean> {
  const ids = await listBookmarks();
  const has = ids.includes(articleId);
  const next = has ? ids.filter((id) => id !== articleId) : [...ids, articleId];
  await writeJson(BOOKMARKS_KEY, next);
  return !has;
}

export async function isBookmarked(articleId: string): Promise<boolean> {
  const ids = await listBookmarks();
  return ids.includes(articleId);
}

export async function listBlogComments(
  articleId: string,
): Promise<BlogComment[]> {
  const all = await readJson(COMMENTS_KEY, SEED_COMMENTS);
  return all
    .filter((c) => c.articleId === articleId)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function addBlogComment(
  articleId: string,
  body: string,
): Promise<BlogComment> {
  const all = await readJson(COMMENTS_KEY, SEED_COMMENTS);
  const comment: BlogComment = {
    id: `bcmt-${Date.now()}`,
    articleId,
    author: 'Ти',
    body: body.trim(),
    createdAt: new Date().toISOString(),
    mine: true,
  };
  all.push(comment);
  await writeJson(COMMENTS_KEY, all);
  return comment;
}
