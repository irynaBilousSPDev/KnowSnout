import type { PlantRecord } from '@/src/types/plant';

/**
 * Curated starter list (informational). Prefer Latin as stable key.
 * Levels follow common ASPCA-class public guidance — not a veterinary diagnosis.
 */
export const PLANTS_SEED: PlantRecord[] = [
  {
    id: 'seed-lilium',
    latin: 'Lilium spp.',
    name_uk: 'Лілія',
    name_en: 'True lily',
    name_pl: 'Lilia',
    aliases: ['lily', 'лілії', 'easter lily', 'asiatic lily'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Навіть пилок/вода з вази — небезпечні для нирок кота.',
      },
      {
        species: 'dog',
        level: 'mild',
        notes: 'Зазвичай шлунково-кишкові симптоми; для котів значно гірше.',
      },
    ],
  },
  {
    id: 'seed-hemerocallis',
    latin: 'Hemerocallis spp.',
    name_uk: 'Лілійник',
    name_en: 'Daylily',
    name_pl: 'Liliowiec',
    aliases: ['day lily', 'деньлілія'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Токсична для котів (нирки), як і справжні лілії.',
      },
      { species: 'dog', level: 'mild', notes: 'Може викликати розлад ШКТ.' },
    ],
  },
  {
    id: 'seed-epipremnum',
    latin: 'Epipremnum aureum',
    name_uk: 'Сциндапсус / потос',
    name_en: 'Pothos / devil’s ivy',
    name_pl: 'Epipremnum złociste',
    aliases: ['pothos', 'devil ivy', 'золотий потос', 'scindapsus'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалатні кристали — подразнення рота й блювання.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалатні кристали — подразнення рота й блювання.',
      },
    ],
  },
  {
    id: 'seed-monstera',
    latin: 'Monstera deliciosa',
    name_uk: 'Монстера',
    name_en: 'Monstera / Swiss cheese plant',
    name_pl: 'Monstera dziurawa',
    aliases: ['swiss cheese', 'монстера деліціоза'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалати кальцію — подразнення слизових.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалати кальцію — подразнення слизових.',
      },
    ],
  },
  {
    id: 'seed-philodendron',
    latin: 'Philodendron spp.',
    name_uk: 'Філодендрон',
    name_en: 'Philodendron',
    name_pl: 'Filodendron',
    aliases: ['філодендрон'],
    toxicity: [
      { species: 'cat', level: 'toxic', notes: 'Оксалати — біль у роті, слина.' },
      { species: 'dog', level: 'toxic', notes: 'Оксалати — біль у роті, слина.' },
    ],
  },
  {
    id: 'seed-dieffenbachia',
    latin: 'Dieffenbachia spp.',
    name_uk: 'Дифенбахія',
    name_en: 'Dieffenbachia / dumb cane',
    name_pl: 'Difenbachia',
    aliases: ['dumb cane', 'диффенбахія'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Сильне подразнення рота; можливий набряк.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Сильне подразнення рота; можливий набряк.',
      },
    ],
  },
  {
    id: 'seed-spathiphyllum',
    latin: 'Spathiphyllum spp.',
    name_uk: 'Спатифілум (мирний лілійник)',
    name_en: 'Peace lily',
    name_pl: 'Skrzydłokwiat',
    aliases: ['peace lily', 'спатіфілум', 'білий прапор'],
    toxicity: [
      {
        species: 'cat',
        level: 'mild',
        notes: 'Не справжня лілія; оксалати — зазвичай легший ШКТ/рота.',
      },
      {
        species: 'dog',
        level: 'mild',
        notes: 'Не справжня лілія; оксалати — зазвичай легший ШКТ/рота.',
      },
    ],
  },
  {
    id: 'seed-aloe',
    latin: 'Aloe vera',
    name_uk: 'Алое',
    name_en: 'Aloe vera',
    name_pl: 'Aloes',
    aliases: ['алоє', 'aloe'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Сапоніни — блювота, діарея при поїданні.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Сапоніни — блювота, діарея при поїданні.',
      },
    ],
  },
  {
    id: 'seed-dracaena',
    latin: 'Dracaena spp.',
    name_uk: 'Драцена',
    name_en: 'Dracaena',
    name_pl: 'Dracena',
    aliases: ['corn plant', 'драцена'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Може викликати блювання, слабкість.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Може викликати блювання, слабкість.',
      },
    ],
  },
  {
    id: 'seed-sansevieria',
    latin: 'Dracaena trifasciata',
    name_uk: 'Сансев’єрія (тещин язик)',
    name_en: 'Snake plant',
    name_pl: 'Sansewieria',
    aliases: ['sansevieria', 'snake plant', 'тещин язик'],
    toxicity: [
      {
        species: 'cat',
        level: 'mild',
        notes: 'Сапоніни — нудота / розлад ШКТ при поїданні.',
      },
      {
        species: 'dog',
        level: 'mild',
        notes: 'Сапоніни — нудота / розлад ШКТ при поїданні.',
      },
    ],
  },
  {
    id: 'seed-sago',
    latin: 'Cycas revoluta',
    name_uk: 'Сагова пальма',
    name_en: 'Sago palm',
    name_pl: 'Sagowiec',
    aliases: ['cycad', 'саговник'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Дуже небезпечна — печінка; терміново до вета.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Дуже небезпечна — печінка; терміново до вета.',
      },
    ],
  },
  {
    id: 'seed-oleander',
    latin: 'Nerium oleander',
    name_uk: 'Олеандр',
    name_en: 'Oleander',
    name_pl: 'Oleander',
    aliases: ['олеандер'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Кардіотоксична — усі частини рослини.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Кардіотоксична — усі частини рослини.',
      },
    ],
  },
  {
    id: 'seed-azalea',
    latin: 'Rhododendron spp.',
    name_uk: 'Азалія / рододендрон',
    name_en: 'Azalea / rhododendron',
    name_pl: 'Azalia / różanecznik',
    aliases: ['azalea', 'азалія', 'рододендрон'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Граїнотоксини — ШКТ і серцево-судинні ризики.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Граїнотоксини — ШКТ і серцево-судинні ризики.',
      },
    ],
  },
  {
    id: 'seed-tulip',
    latin: 'Tulipa spp.',
    name_uk: 'Тюльпан',
    name_en: 'Tulip',
    name_pl: 'Tulipan',
    aliases: ['тюльпани', 'tulip bulb'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Найбільш токсичні цибулини.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Найбільш токсичні цибулини.',
      },
    ],
  },
  {
    id: 'seed-daffodil',
    latin: 'Narcissus spp.',
    name_uk: 'Нарцис',
    name_en: 'Daffodil / narcissus',
    name_pl: 'Narcyz',
    aliases: ['jonquil', 'нарциси'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Цибулини найнебезпечніші — блювота, можливі судоми.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Цибулини найнебезпечніші — блювота, можливі судоми.',
      },
    ],
  },
  {
    id: 'seed-spider',
    latin: 'Chlorophytum comosum',
    name_uk: 'Хлорофітум (павукова рослина)',
    name_en: 'Spider plant',
    name_pl: 'Zielistka',
    aliases: ['spider plant', 'хлорофітум'],
    toxicity: [
      {
        species: 'cat',
        level: 'safe',
        notes: 'Зазвичай вважається безпечною; поїдання може дратувати ШКТ.',
      },
      {
        species: 'dog',
        level: 'safe',
        notes: 'Зазвичай вважається безпечною; поїдання може дратувати ШКТ.',
      },
    ],
  },
  {
    id: 'seed-calathea',
    latin: 'Goeppertia / Calathea spp.',
    name_uk: 'Калатея',
    name_en: 'Calathea / prayer plant family',
    name_pl: 'Kalatea',
    aliases: ['calathea', 'калатея'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна для котів.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна для собак.' },
    ],
  },
  {
    id: 'seed-maranta',
    latin: 'Maranta leuconeura',
    name_uk: 'Маранта',
    name_en: 'Prayer plant',
    name_pl: 'Maranta',
    aliases: ['prayer plant', 'маранта'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-boston-fern',
    latin: 'Nephrolepis exaltata',
    name_uk: 'Бостонський папороть',
    name_en: 'Boston fern',
    name_pl: 'Nephrolepis',
    aliases: ['boston fern', 'папороть'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-phalaenopsis',
    latin: 'Phalaenopsis spp.',
    name_uk: 'Орхідея фаленопсис',
    name_en: 'Moth orchid',
    name_pl: 'Storczyk Phalaenopsis',
    aliases: ['orchid', 'орхідея', 'фаленопсис'],
    toxicity: [
      {
        species: 'cat',
        level: 'safe',
        notes: 'Фаленопсис зазвичай безпечний; не плутати з іншими видами.',
      },
      {
        species: 'dog',
        level: 'safe',
        notes: 'Фаленопсис зазвичай безпечний.',
      },
    ],
  },
  {
    id: 'seed-peperomia',
    latin: 'Peperomia spp.',
    name_uk: 'Пеперомія',
    name_en: 'Peperomia',
    name_pl: 'Peperomia',
    aliases: ['peperomia', 'пеперомія'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-african-violet',
    latin: 'Saintpaulia ionantha',
    name_uk: 'Фіалка узамбарська',
    name_en: 'African violet',
    name_pl: 'Fiołek afrykański',
    aliases: ['african violet', 'сенполія', 'фіалка'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-pachira',
    latin: 'Pachira aquatica',
    name_uk: 'Пахіра (грошове дерево)',
    name_en: 'Money tree',
    name_pl: 'Pachira',
    aliases: ['money tree', 'пахіра'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-zz',
    latin: 'Zamioculcas zamiifolia',
    name_uk: 'Заміокулькас (ZZ)',
    name_en: 'ZZ plant',
    name_pl: 'Zamiokulkas',
    aliases: ['zz plant', 'заміокулькас', 'доларове дерево'],
    toxicity: [
      {
        species: 'cat',
        level: 'mild',
        notes: 'Оксалати — подразнення при поїданні.',
      },
      {
        species: 'dog',
        level: 'mild',
        notes: 'Оксалати — подразнення при поїданні.',
      },
    ],
  },
];

export const MOCK_PHOTO_PLANT_ID = 'seed-epipremnum';
