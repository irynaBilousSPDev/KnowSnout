export type TravelPackId = 'schengen' | 'non_schengen';

export type TravelChecklistItem = {
  id: string;
  /** Ukrainian UI label */
  labelUk: string;
  /** Short tip */
  tipUk?: string;
};

export type TravelPack = {
  id: TravelPackId;
  titleUk: string;
  subtitleUk: string;
  items: TravelChecklistItem[];
};

/**
 * Curated informational checklists for UA/PL pet parents.
 * Always verify with vet / carrier / official border rules — not legal advice.
 */
export const TRAVEL_PACKS: TravelPack[] = [
  {
    id: 'schengen',
    titleUk: 'В межах ЄС',
    subtitleUk: 'Типовий набір для подорожі з собакою чи котом у зону Шенгену / ЄС',
    items: [
      {
        id: 'chip',
        labelUk: 'Мікрочипування',
        tipUk: 'Чіп зазвичай ставлять до вакцини від сказу.',
      },
      {
        id: 'rabies',
        labelUk: 'Щеплення проти сказу',
        tipUk: 'Перевір термін дії та правила «21 день після першої дози» для перших поїздок.',
      },
      {
        id: 'passport',
        labelUk: 'Ветеринарний паспорт ЄС',
        tipUk: 'Для тварин з UA часто потрібен офіційний сертифікат — уточни перед виїздом.',
      },
      {
        id: 'titers',
        labelUk: 'Аналіз титрів антитіл',
      },
      {
        id: 'tapeworm',
        labelUk: 'Обробка від стрічкових глистів (якщо країна вимагає)',
        tipUk: 'Актуально для частини напрямків (напр. FI / IE / NO / MT) — перевір місцеві правила.',
      },
      {
        id: 'health_check',
        labelUk: 'Огляд ветеринара перед поїздкою',
      },
      {
        id: 'carrier',
        labelUk: 'Перевірені правила авіа / потяга / авто',
        tipUk: 'Розмір переноски, бронювання місця для тварини, температура в багажі.',
      },
      {
        id: 'food_water',
        labelUk: 'Корм, вода, миски в дорогу',
      },
      {
        id: 'meds',
        labelUk: 'Ліки / рецепти (якщо потрібні)',
      },
      {
        id: 'photo_docs',
        labelUk: 'Фото документів + контакти вета в телефоні',
      },
    ],
  },
  {
    id: 'non_schengen',
    titleUk: 'Поза Шенгеном',
    subtitleUk: 'Додаткові пункти для країн поза Шенгеном / дальніх напрямків',
    items: [
      {
        id: 'dest_rules',
        labelUk: 'Перевірити правила країни призначення',
        tipUk: 'Сайт посольства / офіційні vet-імпортні вимоги.',
      },
      {
        id: 'import_permit',
        labelUk: 'Дозвіл на ввезення (якщо країна вимагає)',
      },
      {
        id: 'health_cert',
        labelUk: 'Офіційний ветсертифікат для кордону',
        tipUk: 'Часто з обмеженим терміном дії до вильоту.',
      },
      {
        id: 'rabies_titer',
        labelUk: 'Титрування на сказ (якщо вимагають)',
        tipUk: 'Для частини країн поза ЄС — план за місяці наперед.',
      },
      {
        id: 'quarantine',
        labelUk: 'Зʼясувати карантин / відсутність карантину',
      },
      {
        id: 'airline',
        labelUk: 'Політика авіакомпанії + маршрут із пересадками',
      },
      {
        id: 'return',
        labelUk: 'Правила повернення додому (UA / PL)',
      },
      {
        id: 'emergency',
        labelUk: 'План на випадок затримки рейсу / готелю з тваринами',
      },
    ],
  },
];

export function getTravelPack(id: TravelPackId): TravelPack {
  return TRAVEL_PACKS.find((p) => p.id === id) ?? TRAVEL_PACKS[0];
}
