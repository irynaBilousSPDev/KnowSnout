/**
 * Living registry of third-party data / APIs used by KnowSnout.
 * Update THIS file whenever you add, remove, or change an external source.
 * Human mirror + process: `/DATA_SOURCES.md`
 * In-app: «Мої дані» → «Джерела даних»
 */

export type DataSourceKind =
  | 'api'
  | 'database'
  | 'ai'
  | 'catalog'
  | 'infra';

export type DataSourceEntry = {
  id: string;
  name: string;
  kind: DataSourceKind;
  /** Where it appears in the product (UA short) */
  usedForUk: string;
  /** Code / docs pointers */
  codePaths: string[];
  homepage: string;
  licenseOrTerms: string;
  /** Attribution note for legal / credits UI */
  attributionUk: string;
};

export const DATA_SOURCES: DataSourceEntry[] = [
  {
    id: 'open-pet-food-facts',
    name: 'Open Pet Food Facts',
    kind: 'catalog',
    usedForUk: 'Сканер корму — штрихкод / склад для тварин',
    codePaths: ['src/services/barcodeLookup.ts'],
    homepage: 'https://world.openpetfoodfacts.org',
    licenseOrTerms: 'Open Food Facts ODbL / contributions — see project terms',
    attributionUk:
      'Дані про корм з Open Pet Food Facts (відкрита база). Не ветвисновок.',
  },
  {
    id: 'open-food-facts',
    name: 'Open Food Facts',
    kind: 'catalog',
    usedForUk: 'Fallback каталог продуктів за штрихкодом',
    codePaths: ['src/services/barcodeLookup.ts'],
    homepage: 'https://world.openfoodfacts.org',
    licenseOrTerms: 'ODbL / Open Food Facts terms',
    attributionUk: 'Додаткові дані з Open Food Facts за потреби.',
  },
  {
    id: 'openai',
    name: 'OpenAI (GPT Vision)',
    kind: 'ai',
    usedForUk:
      'Розбір фото етикетки / рослини / породи (Edge). Якщо це не те — «не розпізнано», без вигадки',
    codePaths: [
      'supabase/functions/analyze-label',
      'supabase/functions/identify-plant',
      'supabase/functions/identify-breed',
      'src/services/breedId.ts',
    ],
    homepage: 'https://platform.openai.com',
    licenseOrTerms: 'OpenAI API Terms — key only on server',
    attributionUk:
      'AI-оцінка складу / рослин / порід через захищений сервер. Результат інформаційний.',
  },
  {
    id: 'thedogapi',
    name: 'TheDogAPI',
    kind: 'api',
    usedForUk: 'Породи собак: пошук, квіз «вгадай породу», фото',
    codePaths: [
      'src/services/breedId.ts',
      'src/services/breedQuiz.ts',
    ],
    homepage: 'https://thedogapi.com/',
    licenseOrTerms: 'TheDogAPI terms of use',
    attributionUk:
      'Каталог і фото порід собак: TheDogAPI (/images/search). Без ключа /v1/breeds часто 403 — є offline fallback.',
  },
  {
    id: 'dogceo',
    name: 'Dog CEO',
    kind: 'api',
    usedForUk: 'Запасні фото собак для квізу, якщо CDN TheDogAPI не відкривається',
    codePaths: ['src/services/breedQuiz.ts'],
    homepage: 'https://dog.ceo/dog-api/',
    licenseOrTerms: 'Public domain / Dog CEO terms',
    attributionUk: 'Резервні фото собак: Dog CEO API.',
  },
  {
    id: 'thecatapi',
    name: 'TheCatAPI',
    kind: 'api',
    usedForUk: 'Породи котів: пошук, квіз, фото',
    codePaths: [
      'src/services/breedId.ts',
      'src/services/breedQuiz.ts',
    ],
    homepage: 'https://thecatapi.com/',
    licenseOrTerms: 'TheCatAPI terms of use',
    attributionUk: 'Каталог і фото порід котів: TheCatAPI.',
  },
  {
    id: 'wikidata',
    name: 'Wikidata',
    kind: 'database',
    usedForUk:
      'Квіз: країна походження порід, групи тварин; збагачення фактів',
    codePaths: ['src/services/wikidataQuiz.ts'],
    homepage: 'https://www.wikidata.org/',
    licenseOrTerms: 'CC0 (Wikidata data)',
    attributionUk:
      'Структуровані факти з Wikidata (CC0). Сестринський проєкт Вікіпедії.',
  },
  {
    id: 'open-trivia-db',
    name: 'Open Trivia DB',
    kind: 'api',
    usedForUk: 'Квіз «Факти про тварин» (категорія Animals)',
    codePaths: ['src/services/openTriviaQuiz.ts'],
    homepage: 'https://opentdb.com/',
    licenseOrTerms: 'CC BY-SA 4.0',
    attributionUk:
      'Питання вікторини: Open Trivia Database (CC BY-SA 4.0).',
  },
  {
    id: 'plants-seed',
    name: 'KnowSnout plants seed + cache',
    kind: 'catalog',
    usedForUk: 'Безпека рослин для собак/котів (локальний seed + Supabase)',
    codePaths: [
      'src/data/plantsSeed.ts',
      'src/services/plants.ts',
      'supabase/migrations/20260321220000_plant_safety.sql',
      'supabase/migrations/20260321233000_plant_catalog_expand.sql',
    ],
    homepage: 'https://knowsnout.com/',
    licenseOrTerms:
      'Internal curated list; informed by public ASPCA-class guidance — not a vet diagnosis',
    attributionUk:
      'Довідник рослин у KnowSnout. Інформаційно, не заміна ветеринару.',
  },
  {
    id: 'allegro',
    name: 'Allegro',
    kind: 'api',
    usedForUk:
      'Один з PL онлайн-каналів у «Де купити» (оцінка + посилання, без текстів відгуків). Не єдина платформа.',
    codePaths: [
      'src/services/storeScores.ts',
      'src/services/marketOffers.ts',
      'src/components/WhereToBuyBlock.tsx',
      'src/components/StoreScoreBadge.tsx',
      'supabase/functions/store-rating',
    ],
    homepage: 'https://developer.allegro.pl/',
    licenseOrTerms: 'Allegro REST API terms — client id/secret only on server',
    attributionUk:
      'Оцінки з Allegro (коли підключено API). Демо-режим показує зразок. Не оцінка складу KnowSnout.',
  },
  {
    id: 'market-offers',
    name: 'KnowSnout market offers (mock)',
    kind: 'catalog',
    usedForUk:
      'Блок «Де купити»: кілька онлайн + стаціонарних оферів за країною (UA/PL mock). Живі партнери / скрейп — пізніше.',
    codePaths: [
      'src/services/marketOffers.ts',
      'src/types/marketOffer.ts',
      'src/components/WhereToBuyBlock.tsx',
      'app/(app)/result.tsx',
      'app/(app)/settings.tsx',
    ],
    homepage: 'https://knowsnout.com/',
    licenseOrTerms:
      'Mock listings; live sources must respect marketplace ToS. Prices informational.',
    attributionUk:
      'Пропозиції «де купити» зараз демо. Джерела з’являться в «Мої дані → Джерела даних» коли підключимо партнерів.',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    kind: 'infra',
    usedForUk: 'Акаунти, скани, улюбленці, квіз-рейтинг, storage',
    codePaths: ['src/services/supabase.ts', 'supabase/migrations'],
    homepage: 'https://supabase.com',
    licenseOrTerms: 'Supabase / Postgres project terms',
    attributionUk: 'Бекенд і збереження даних акаунту: Supabase.',
  },
];

export function dataSourcesUpdatedNote(): string {
  return '2026-08-24';
}
