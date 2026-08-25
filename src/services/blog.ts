import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'knowsnout.blog.bookmarks.v2';
const COMMENTS_KEY = 'knowsnout.blog.comments.v2';

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
  authorLabel?: string;
  commentCount?: number;
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
  { id: 'bc-health', title: "Здоров'я" },
];

const ARTICLES: BlogArticle[] = [
  {
    id: 'ba-myths',
    categoryId: 'bc-food',
    title: '5 міфів про сухий корм',
    excerpt: 'Склад важливіший за ціну — розбираємо поширені помилки.',
    body: `Багато власників вважають, що дорожчий корм — завжди кращий. Насправді склад важливіший за ціну.

Маркетингові слова на кшталт «преміум» не гарантують якості. Дивіться на порядок інгредієнтів і аналіз.

Міф про «сухий корм сушить нирки» теж спрощує реальність: головне — доступ до свіжої води й підбір під вік і стан здоров’я.

Тож перед покупкою дивіться на перші 3 інгредієнти складу, а не на ціну чи рекламу.`,
    readMinutes: 7,
    publishedAt: '2026-08-10T10:00:00.000Z',
    authorLabel: 'Ветеринарна редакція',
    commentCount: 34,
  },
  {
    id: 'ba-puppy-meals',
    categoryId: 'bc-food',
    title: 'Скільки разів годувати цуценя',
    excerpt: 'Частота прийомів їжі за віком — короткий гід.',
    body: `Цуценята потребують частіших і менших порцій, ніж дорослі собаки.

До 3–4 місяців зазвичай 3–4 рази на день. Пізніше можна переходити на 2–3.

Орієнтуйтесь на рекомендації виробника корму й пораду вета — особливо для великих порід.`,
    readMinutes: 5,
    publishedAt: '2026-08-12T10:00:00.000Z',
    authorLabel: 'Ветеринарна редакція',
    commentCount: 12,
  },
  {
    id: 'ba-natural',
    categoryId: 'bc-food',
    title: 'Натуральний раціон: за і проти',
    excerpt: 'Коли «натуралка» працює, а коли краще готовий корм.',
    body: `Натуральний раціон вимагає балансу білків, жирів, кальцію й мікроелементів.

Без розрахунку легко отримати дефіцити. Готовий повнораціонний корм простіший у щоденному використанні.

Якщо обираєте натуралку — робіть це з нутриціологом або ветом.`,
    readMinutes: 9,
    publishedAt: '2026-08-14T10:00:00.000Z',
    authorLabel: 'Ветеринарна редакція',
    commentCount: 8,
  },
  {
    id: 'ba-teeth',
    categoryId: 'bc-health',
    title: 'Догляд за зубами вдома',
    excerpt: 'Щітка, гелі й коли їхати до вета.',
    body: `Регулярне чищення зубів знижує ризик пародонтозу.

Починайте поступово зі смаколиків і м’якої щітки. Якщо з’явився запах або кровоточивість ясен — до вета.`,
    readMinutes: 6,
    publishedAt: '2026-08-16T10:00:00.000Z',
    authorLabel: 'Ветеринарна редакція',
    commentCount: 5,
  },
];

const SEED_COMMENTS: BlogComment[] = [
  {
    id: 'bcmt-1',
    articleId: 'ba-myths',
    author: 'Дмитро',
    body: 'Дуже корисно, не знав про перші 3 інгредієнти!',
    createdAt: '2026-08-11T12:00:00.000Z',
  },
  {
    id: 'bcmt-2',
    articleId: 'ba-myths',
    author: 'Соломія',
    body: 'А чи є список кормів, які проходять цей тест?',
    createdAt: '2026-08-11T14:00:00.000Z',
  },
];

const SEED_BOOKMARKS = ['ba-myths'];

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

export function getBlogCategory(id: string): BlogCategory | null {
  return BLOG_CATEGORIES.find((c) => c.id === id) ?? null;
}

export function listBlogArticles(categoryId?: string): BlogArticle[] {
  if (!categoryId) return ARTICLES;
  return ARTICLES.filter((a) => a.categoryId === categoryId);
}

export function getBlogArticle(id: string): BlogArticle | null {
  return ARTICLES.find((a) => a.id === id) ?? null;
}

export async function listBookmarks(): Promise<string[]> {
  return readJson(BOOKMARKS_KEY, SEED_BOOKMARKS);
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
