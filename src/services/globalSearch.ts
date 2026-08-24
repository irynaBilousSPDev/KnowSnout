export type SearchSectionId = 'people' | 'pets' | 'articles' | 'food' | 'quizzes';

export type SearchHit = {
  id: string;
  section: SearchSectionId;
  title: string;
  subtitle: string;
};

const STATIC: SearchHit[] = [
  {
    id: 'seed-marta',
    section: 'people',
    title: 'Марта та Тукан',
    subtitle: 'Власниця корги',
  },
  {
    id: 'a-corgi',
    section: 'articles',
    title: 'Все, що варто знати про корги',
    subtitle: 'Блог',
  },
  {
    id: 'q-corgi',
    section: 'quizzes',
    title: 'Звідки ця порода?',
    subtitle: 'Містить «корги»',
  },
  {
    id: 'p-1',
    section: 'people',
    title: 'Оксана Мельник',
    subtitle: '@oksana · коти',
  },
  {
    id: 'a-1',
    section: 'articles',
    title: 'Як читати склад корму',
    subtitle: 'Блог · 6 хв',
  },
];

export function searchGlobal(query: string): Record<SearchSectionId, SearchHit[]> {
  const q = query.trim().toLowerCase();
  const hits = q
    ? STATIC.filter(
        (h) =>
          h.title.toLowerCase().includes(q) ||
          h.subtitle.toLowerCase().includes(q),
      )
    : STATIC;

  return {
    people: hits.filter((h) => h.section === 'people'),
    pets: hits.filter((h) => h.section === 'pets'),
    articles: hits.filter((h) => h.section === 'articles'),
    food: hits.filter((h) => h.section === 'food'),
    quizzes: hits.filter((h) => h.section === 'quizzes'),
  };
}
