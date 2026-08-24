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
    name_uk: 'Монстера деліціоза',
    name_en: 'Monstera / Swiss cheese plant',
    name_pl: 'Monstera dziurawa',
    aliases: ['swiss cheese', 'монстера', 'monstera deliciosa'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'нудота, блювання',
      },
      {
        species: 'dog',
        level: 'safe',
        notes: null,
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
  {
    id: 'seed-ficus-elastica',
    latin: 'Ficus elastica',
    name_uk: 'Фікус каучуконосний',
    name_en: 'Rubber plant',
    name_pl: 'Fikus sprężysty',
    aliases: ['rubber plant', 'фікус', 'каучукове дерево'],
    toxicity: [
      {
        species: 'cat',
        level: 'mild',
        notes: 'Сік може дратувати шкіру/ШКТ при поїданні.',
      },
      {
        species: 'dog',
        level: 'mild',
        notes: 'Сік може дратувати шкіру/ШКТ при поїданні.',
      },
    ],
  },
  {
    id: 'seed-ficus-benjamina',
    latin: 'Ficus benjamina',
    name_uk: 'Фікус Бенджаміна',
    name_en: 'Weeping fig',
    name_pl: 'Fikus benjamina',
    aliases: ['weeping fig', 'benjamin fig', 'бенджамін'],
    toxicity: [
      { species: 'cat', level: 'mild', notes: 'Може викликати подразнення ШКТ.' },
      { species: 'dog', level: 'mild', notes: 'Може викликати подразнення ШКТ.' },
    ],
  },
  {
    id: 'seed-ivy',
    latin: 'Hedera helix',
    name_uk: 'Плющ звичайний',
    name_en: 'English ivy',
    name_pl: 'Bluszcz pospolity',
    aliases: ['english ivy', 'ivy', 'плющ'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Сапоніни — блювота, діарея, можлива млявість.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Сапоніни — блювота, діарея, можлива млявість.',
      },
    ],
  },
  {
    id: 'seed-schefflera',
    latin: 'Schefflera spp.',
    name_uk: 'Шефлера',
    name_en: 'Umbrella plant / schefflera',
    name_pl: 'Szeflera',
    aliases: ['umbrella plant', 'шефлера', 'шеффлера'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалати — подразнення рота, слина, блювання.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалати — подразнення рота, слина, блювання.',
      },
    ],
  },
  {
    id: 'seed-jade',
    latin: 'Crassula ovata',
    name_uk: 'Товстянка / нефритове дерево',
    name_en: 'Jade plant',
    name_pl: 'Grubosz jajowaty',
    aliases: ['jade', 'money plant', 'товстянка', 'красула'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Може викликати блювання й млявість.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Може викликати блювання й млявість.',
      },
    ],
  },
  {
    id: 'seed-kalanchoe',
    latin: 'Kalanchoe spp.',
    name_uk: 'Каланхое',
    name_en: 'Kalanchoe',
    name_pl: 'Kalanchoe',
    aliases: ['kalanchoe', 'каланхое'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Кардіоглікозиди — ШКТ і ризик для серця.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Кардіоглікозиди — ШКТ і ризик для серця.',
      },
    ],
  },
  {
    id: 'seed-poinsettia',
    latin: 'Euphorbia pulcherrima',
    name_uk: 'Пуансетія',
    name_en: 'Poinsettia',
    name_pl: 'Wilczomlecz piękny',
    aliases: ['poinsettia', 'різдвяна зірка', 'пуансетія'],
    toxicity: [
      {
        species: 'cat',
        level: 'mild',
        notes: 'Зазвичай легке подразнення рота/ШКТ, не «смертельна» міф-токсичність.',
      },
      {
        species: 'dog',
        level: 'mild',
        notes: 'Зазвичай легке подразнення рота/ШКТ.',
      },
    ],
  },
  {
    id: 'seed-lily-valley',
    latin: 'Convallaria majalis',
    name_uk: 'Конвалія',
    name_en: 'Lily of the valley',
    name_pl: 'Konwalia majowa',
    aliases: ['lily of the valley', 'конвалія'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Кардіотоксична — усі частини; терміново до вета.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Кардіотоксична — усі частини; терміново до вета.',
      },
    ],
  },
  {
    id: 'seed-yew',
    latin: 'Taxus baccata',
    name_uk: 'Тис',
    name_en: 'Yew',
    name_pl: 'Cis pospolity',
    aliases: ['yew', 'тис ягідний'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Дуже небезпечна — серце; терміново до вета.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Дуже небезпечна — серце; терміново до вета.',
      },
    ],
  },
  {
    id: 'seed-begonia',
    latin: 'Begonia spp.',
    name_uk: 'Бегонія',
    name_en: 'Begonia',
    name_pl: 'Begonia',
    aliases: ['begonia', 'бегонія'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалати (особливо бульби/корені) — подразнення.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалати (особливо бульби/корені) — подразнення.',
      },
    ],
  },
  {
    id: 'seed-chrysanthemum',
    latin: 'Chrysanthemum spp.',
    name_uk: 'Хризантема',
    name_en: 'Chrysanthemum',
    name_pl: 'Chryzantema',
    aliases: ['mum', 'хризантема', 'chrysanthemum'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Може викликати блювання, діарею, дерматит.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Може викликати блювання, діарею, дерматит.',
      },
    ],
  },
  {
    id: 'seed-hydrangea',
    latin: 'Hydrangea spp.',
    name_uk: 'Гортензія',
    name_en: 'Hydrangea',
    name_pl: 'Hortensja',
    aliases: ['hydrangea', 'гортензія'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Ціаногенні глікозиди — блювота, діарея.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Ціаногенні глікозиди — блювота, діарея.',
      },
    ],
  },
  {
    id: 'seed-syngonium',
    latin: 'Syngonium podophyllum',
    name_uk: 'Сингоніум',
    name_en: 'Arrowhead plant',
    name_pl: 'Syngonium',
    aliases: ['arrowhead', 'сингоніум', 'nephthytis'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалати — подразнення рота й блювання.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалати — подразнення рота й блювання.',
      },
    ],
  },
  {
    id: 'seed-anthurium',
    latin: 'Anthurium spp.',
    name_uk: 'Антуріум',
    name_en: 'Anthurium / flamingo flower',
    name_pl: 'Anturium',
    aliases: ['anthurium', 'антуріум', 'flamingo flower'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалати — біль у роті, слина, блювання.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалати — біль у роті, слина, блювання.',
      },
    ],
  },
  {
    id: 'seed-alocasia',
    latin: 'Alocasia spp.',
    name_uk: 'Алоказія',
    name_en: 'Alocasia / elephant ear',
    name_pl: 'Alokazja',
    aliases: ['alocasia', 'elephant ear', 'алоказія'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Оксалати — сильне подразнення слизових.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Оксалати — сильне подразнення слизових.',
      },
    ],
  },
  {
    id: 'seed-tomato-plant',
    latin: 'Solanum lycopersicum',
    name_uk: 'Томат (рослина)',
    name_en: 'Tomato plant',
    name_pl: 'Pomidor',
    aliases: ['tomato', 'томат', 'помідор', 'tomato vine'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Зелені частини / незрілі плоди — соланін; стиглі плоди зазвичай менш ризикові.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Зелені частини / незрілі плоди — соланін.',
      },
    ],
  },
  {
    id: 'seed-grape',
    latin: 'Vitis vinifera',
    name_uk: 'Виноград',
    name_en: 'Grape / vine',
    name_pl: 'Winorośl',
    aliases: ['grape', 'raisin', 'виноград', 'родзинки'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Ризик для нирок; уникати навіть малих кількостей.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Добре відома токсичність для собак — нирки; терміново до вета.',
      },
    ],
  },
  {
    id: 'seed-onion',
    latin: 'Allium cepa',
    name_uk: 'Цибуля',
    name_en: 'Onion',
    name_pl: 'Cebula',
    aliases: ['onion', 'цибуля', 'allium'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Ушкоджує еритроцити — навіть у їжі/юшці.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Ушкоджує еритроцити — навіть у їжі/юшці.',
      },
    ],
  },
  {
    id: 'seed-garlic',
    latin: 'Allium sativum',
    name_uk: 'Часник',
    name_en: 'Garlic',
    name_pl: 'Czosnek',
    aliases: ['garlic', 'часник'],
    toxicity: [
      {
        species: 'cat',
        level: 'toxic',
        notes: 'Як і цибуля — ризик гемолізу.',
      },
      {
        species: 'dog',
        level: 'toxic',
        notes: 'Як і цибуля — ризик гемолізу.',
      },
    ],
  },
  {
    id: 'seed-hoya',
    latin: 'Hoya spp.',
    name_uk: 'Хойя',
    name_en: 'Hoya / wax plant',
    name_pl: 'Hoya',
    aliases: ['hoya', 'wax plant', 'хойя', 'восковик'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай вважається безпечною.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай вважається безпечною.' },
    ],
  },
  {
    id: 'seed-pilea',
    latin: 'Pilea peperomioides',
    name_uk: 'Пілея',
    name_en: 'Chinese money plant',
    name_pl: 'Pilea',
    aliases: ['pilea', 'chinese money plant', 'пілея'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-parlor-palm',
    latin: 'Chamaedorea elegans',
    name_uk: 'Хамедорея (парлова пальма)',
    name_en: 'Parlor palm',
    name_pl: 'Chamedora wytworna',
    aliases: ['parlor palm', 'neanthe bella', 'хамедорея'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-aspidistra',
    latin: 'Aspidistra elatior',
    name_uk: 'Аспідістра',
    name_en: 'Cast iron plant',
    name_pl: 'Aspidistra',
    aliases: ['cast iron plant', 'аспідістра'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-haworthia',
    latin: 'Haworthia spp.',
    name_uk: 'Гавортія',
    name_en: 'Haworthia',
    name_pl: 'Haworthia',
    aliases: ['haworthia', 'гавортія', 'zebra plant'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-echeveria',
    latin: 'Echeveria spp.',
    name_uk: 'Ечеверія',
    name_en: 'Echeveria',
    name_pl: 'Echeveria',
    aliases: ['echeveria', 'ечеверія', 'сукулент'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
  {
    id: 'seed-basil',
    latin: 'Ocimum basilicum',
    name_uk: 'Базилік',
    name_en: 'Basil',
    name_pl: 'Bazylia',
    aliases: ['basil', 'базилік'],
    toxicity: [
      {
        species: 'cat',
        level: 'safe',
        notes: 'Кулинарні кількості зазвичай ок; великі дози можуть дратувати ШКТ.',
      },
      {
        species: 'dog',
        level: 'safe',
        notes: 'Кулинарні кількості зазвичай ок.',
      },
    ],
  },
  {
    id: 'seed-ponytail',
    latin: 'Beaucarnea recurvata',
    name_uk: 'Бокарнея (кінський хвіст)',
    name_en: 'Ponytail palm',
    name_pl: 'Nolina',
    aliases: ['ponytail palm', 'elephant foot', 'бокарнея', 'ноліна'],
    toxicity: [
      { species: 'cat', level: 'safe', notes: 'Зазвичай безпечна.' },
      { species: 'dog', level: 'safe', notes: 'Зазвичай безпечна.' },
    ],
  },
];

/** Informational count for UI / docs. */
export const PLANTS_SEED_COUNT = PLANTS_SEED.length;

export const MOCK_PHOTO_PLANT_ID = 'seed-epipremnum';
