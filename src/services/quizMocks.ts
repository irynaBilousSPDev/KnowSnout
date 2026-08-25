export type ZoomQuestion = {
  id: string;
  hint: string;
  answer: string;
  choices: string[];
};

const QUESTIONS: ZoomQuestion[] = [
  {
    id: 'zq-1',
    hint: 'Фото тварини',
    answer: 'Оцелот',
    choices: ['Бенгальська кішка', 'Оцелот', 'Мейн-кун'],
  },
  {
    id: 'zq-2',
    hint: 'Крупний план шерсті',
    answer: 'Хаскі',
    choices: ['Хаскі', 'Маламут', 'Самоєд'],
  },
  {
    id: 'zq-3',
    hint: 'Вуса й трикутний ніс',
    answer: 'Бенгальська кішка',
    choices: ['Бенгальська кішка', 'Сфінкс', 'Перс'],
  },
  {
    id: 'zq-4',
    hint: 'Довгі вуха',
    answer: 'Мейн-кун',
    choices: ['Мейн-кун', 'Регдол', 'Оцелот'],
  },
  {
    id: 'zq-5',
    hint: 'Кудлата морда',
    answer: 'Самоєд',
    choices: ['Самоєд', 'Хаскі', 'Шпіц'],
  },
];

export function getZoomQuestions(): ZoomQuestion[] {
  return QUESTIONS;
}

export type HeavierQuestion = {
  id: string;
  prompt: string;
  choices: { id: string; label: string }[];
  correctId: string;
  explain: string;
};

const HEAVIER: HeavierQuestion[] = [
  {
    id: 'hq-1',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Сенбернар' },
      { id: 'b', label: 'Чихуахуа' },
    ],
    correctId: 'a',
    explain: 'Сенбернар значно важчий за чихуахуа.',
  },
  {
    id: 'hq-2',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Мастиф' },
      { id: 'b', label: 'Коргі' },
    ],
    correctId: 'a',
    explain: 'Мастиф — важка робоча порода.',
  },
  {
    id: 'hq-3',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Такса' },
      { id: 'b', label: 'Лабрадор' },
    ],
    correctId: 'b',
    explain: 'Лабрадор важчий за таксу.',
  },
  {
    id: 'hq-4',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Мейн-кун' },
      { id: 'b', label: 'Сіамська' },
    ],
    correctId: 'a',
    explain: 'Мейн-куни — одні з найбільших кішок.',
  },
  {
    id: 'hq-5',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Хаскі' },
      { id: 'b', label: 'Ньюфаундленд' },
    ],
    correctId: 'b',
    explain: 'Ньюфаундленд важчий за хаскі.',
  },
  {
    id: 'hq-6',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Пудель (той)' },
      { id: 'b', label: 'Ротвейлер' },
    ],
    correctId: 'b',
    explain: 'Ротвейлер значно важчий.',
  },
  {
    id: 'hq-7',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Британська короткошерста' },
      { id: 'b', label: 'Сфінкс' },
    ],
    correctId: 'a',
    explain: 'Британці зазвичай важчі за сфінксів.',
  },
  {
    id: 'hq-8',
    prompt: 'Хто в середньому важчий?',
    choices: [
      { id: 'a', label: 'Бігль' },
      { id: 'b', label: 'Німецька вівчарка' },
    ],
    correctId: 'b',
    explain: 'Вівчарка важча за бігля.',
  },
];

export function getHeavierQuestions(): HeavierQuestion[] {
  return HEAVIER;
}

export type MythCard = {
  id: string;
  claim: string;
  isMyth: boolean;
  explain: string;
};

const MYTHS: MythCard[] = [
  {
    id: 'mq-1',
    claim: 'Собаки бачать світ виключно чорно-білим',
    isMyth: true,
    explain: 'Собаки розрізняють кольори, але вужче за людей.',
  },
  {
    id: 'mq-2',
    claim: 'Котам обов’язково потрібне молоко щодня',
    isMyth: true,
    explain: 'Багато дорослих котів погано переносять лактозу.',
  },
  {
    id: 'mq-3',
    claim: 'Шоколад токсичний для собак',
    isMyth: false,
    explain: 'Це факт: теобромін небезпечний.',
  },
  {
    id: 'mq-4',
    claim: 'Собака з холодним носом завжди здорова',
    isMyth: true,
    explain: 'Температура носа змінюється протягом дня.',
  },
  {
    id: 'mq-5',
    claim: 'Лілії можуть бути смертельно небезпечні для котів',
    isMyth: false,
    explain: 'Це правда — тримайте лілії подалі.',
  },
  {
    id: 'mq-6',
    claim: 'Одна прогулянка на місяць достатня будь-якій собаці',
    isMyth: true,
    explain: 'Більшості собак потрібні регулярні прогулянки.',
  },
  {
    id: 'mq-7',
    claim: 'Кішки завжди приземляються на лапи',
    isMyth: true,
    explain: 'Не завжди — залежить від висоти й умов.',
  },
  {
    id: 'mq-8',
    claim: 'Собакам потрібен свіжий доступ до води щодня',
    isMyth: false,
    explain: 'Це правда — вода критична.',
  },
  {
    id: 'mq-9',
    claim: 'Мурчання завжди означає, що кіт щасливий',
    isMyth: true,
    explain: 'Мурчання буває і при стресі чи болю.',
  },
  {
    id: 'mq-10',
    claim: 'Щеплення допомагають захистити улюбленця від хвороб',
    isMyth: false,
    explain: 'Це факт — за графіком вета.',
  },
];

export function getMythCards(): MythCard[] {
  return MYTHS;
}
