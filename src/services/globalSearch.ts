export type SearchSectionId = 'people' | 'pets' | 'articles' | 'food';

export type SearchHit = {
  id: string;
  section: SearchSectionId;
  title: string;
  subtitle: string;
};

const STATIC: SearchHit[] = [
  {
    id: 'p-1',
    section: 'people',
    title: 'Ірина К.',
    subtitle: '@iryna_pets · 2 кішки',
  },
  {
    id: 'p-2',
    section: 'people',
    title: 'Максим',
    subtitle: '@rex_walks · Рекс',
  },
  {
    id: 'pet-1',
    section: 'pets',
    title: 'Ада',
    subtitle: 'Кіт · британська',
  },
  {
    id: 'pet-2',
    section: 'pets',
    title: 'Рекс',
    subtitle: 'Собака · лабрадор',
  },
  {
    id: 'a-1',
    section: 'articles',
    title: 'Як читати склад корму',
    subtitle: 'Блог · 6 хв',
  },
  {
    id: 'a-2',
    section: 'articles',
    title: 'Рослини небезпечні для котів',
    subtitle: 'Блог · 4 хв',
  },
  {
    id: 'f-1',
    section: 'food',
    title: 'Royal Canin Indoor',
    subtitle: 'Корм · демо-оцінка 78',
  },
  {
    id: 'f-2',
    section: 'food',
    title: 'Acana Pacifica',
    subtitle: 'Корм · демо-оцінка 86',
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
  };
}
