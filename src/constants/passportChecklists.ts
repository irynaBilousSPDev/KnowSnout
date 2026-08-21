export type PassportPackId = 'home' | 'eu' | 'non_schengen';

export type PassportChecklistItem = {
  id: string;
  labelUk: string;
  tipUk?: string;
};

export type PassportPack = {
  id: PassportPackId;
  titleUk: string;
  subtitleUk: string;
  items: PassportChecklistItem[];
};

/**
 * Informational document checklists for UA/PL pet parents.
 * Not legal or veterinary advice — verify with vet / official rules.
 */
export const PASSPORT_PACKS: PassportPack[] = [
  {
    id: 'home',
    titleUk: 'Вдома',
    subtitleUk: 'Базовий набір документів і даних у профілі улюбленця',
    items: [
      {
        id: 'chip',
        labelUk: 'Номер мікрочипа збережено',
        tipUk: 'У профілі улюбленця або у паспорті / сертифікаті.',
      },
      {
        id: 'passport_doc',
        labelUk: 'Паспорт / сертифікат тварини під рукою',
        tipUk: 'Європейський ветпаспорт або національний документ — залежно від країни.',
      },
      {
        id: 'rabies',
        labelUk: 'Щеплення від сказу з датою в календарі',
        tipUk: 'Додай запис у «Щеплення» KnowSnout і звіряй із паспортом.',
      },
      {
        id: 'other_vax',
        labelUk: 'Інші обов’язкові / рекомендовані щеплення',
        tipUk: 'За схемою ветеринара (не універсальний список).',
      },
      {
        id: 'vet_contact',
        labelUk: 'Контакти ветклініки в профілі',
      },
      {
        id: 'photos',
        labelUk: 'Фото документів у телефоні',
        tipUk: 'Паспорт, чіп, останні щеплення — на випадок втрати паперу.',
      },
      {
        id: 'ownership',
        labelUk: 'Документи про походження / притулок (якщо є)',
        tipUk: 'Договір, акт передачі, метрика — за потреби.',
      },
    ],
  },
  {
    id: 'eu',
    titleUk: 'В межах ЄС',
    subtitleUk: 'Документний мінімум перед поїздкою в зону ЄС / Шенген (інформаційно)',
    items: [
      {
        id: 'chip_iso',
        labelUk: 'Мікрочипування',
      },
      {
        id: 'rabies_valid',
        labelUk: 'Щеплення проти сказу',
        tipUk: 'Для перших виїздів часто є правило «21 день» — уточни у вета.',
      },
      {
        id: 'eu_passport',
        labelUk: 'Ветеринарний паспорт ЄС',
        tipUk: 'Для тварин з UA вимоги можуть відрізнятись — перевір офіційні правила.',
      },
      {
        id: 'titers',
        labelUk: 'Аналіз титрів антитіл',
      },
      {
        id: 'tapeworm',
        labelUk: 'Обробка від стрічкових глистів (якщо країна вимагає)',
      },
      {
        id: 'carrier_rules',
        labelUk: 'Правила перевізника (авіа / потяг / авто) звірено',
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
      },
      {
        id: 'chip_iso',
        labelUk: 'Мікрочипування',
      },
      {
        id: 'rabies_valid',
        labelUk: 'Щеплення проти сказу',
      },
      {
        id: 'titers',
        labelUk: 'Аналіз титрів антитіл',
      },
      {
        id: 'health_cert',
        labelUk: 'Офіційний ветсертифікат / дозвіл',
      },
      {
        id: 'quarantine',
        labelUk: 'Карантин / додаткові аналізи (якщо потрібно)',
      },
    ],
  },
];

export function getPassportPack(id: PassportPackId): PassportPack {
  return PASSPORT_PACKS.find((p) => p.id === id) ?? PASSPORT_PACKS[0]!;
}
