export type ZoomQuestion = {
  id: string;
  hint: string;
  answer: string;
  choices: string[];
};

const QUESTIONS: ZoomQuestion[] = [
  {
    id: 'zq-1',
    hint: 'Крупний план: вуса й трикутний ніс. Хто це?',
    answer: 'Кіт',
    choices: ['Кіт', 'Кролик', 'Ховрах', 'Лисиця'],
  },
  {
    id: 'zq-2',
    hint: 'Мокрий ніс і довгі вуха в кадрі…',
    answer: 'Собака',
    choices: ['Собака', 'Кінь', 'Коза', 'Кабан'],
  },
  {
    id: 'zq-3',
    hint: 'Пір’я й дзьоб крупно. Не ссавець.',
    answer: 'Папуга',
    choices: ['Папуга', 'Качка', 'Голуб', 'Сова'],
  },
  {
    id: 'zq-4',
    hint: 'Панцир і повільні лапки в зумі.',
    answer: 'Черепаха',
    choices: ['Черепаха', 'Ящірка', 'Краб', 'Їжак'],
  },
  {
    id: 'zq-5',
    hint: 'Довгі вуха й стрибок — хто в зумі?',
    answer: 'Кролик',
    choices: ['Кролик', 'Заєць', 'Кіт', 'Собака'],
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
    prompt: 'Який вітамін у надлишку токсичний для собак (жиророзчинний)?',
    choices: [
      { id: 'a', label: 'Вітамін C' },
      { id: 'b', label: 'Вітамін A' },
      { id: 'c', label: 'Вітамін B12' },
      { id: 'd', label: 'Фолієва кислота' },
    ],
    correctId: 'b',
    explain: 'Жиророзчинні (A, D, E, K) накопичуються; A в надлишку небезпечний.',
  },
  {
    id: 'hq-2',
    prompt: 'Чому шоколад небезпечний для собак?',
    choices: [
      { id: 'a', label: 'Через кофеїн і теобромін' },
      { id: 'b', label: 'Через клітковину' },
      { id: 'c', label: 'Через сіль' },
      { id: 'd', label: 'Через лактозу лише' },
    ],
    correctId: 'a',
    explain: 'Теобромін і кофеїн токсичні; темний шоколад небезпечніший.',
  },
  {
    id: 'hq-3',
    prompt: 'Яка рослина особливо токсична для котів?',
    choices: [
      { id: 'a', label: 'Лілія' },
      { id: 'b', label: 'Кактус' },
      { id: 'c', label: 'Базилік' },
      { id: 'd', label: 'Петрушка' },
    ],
    correctId: 'a',
    explain: 'Лілії можуть викликати гостру ниркову недостатність у котів.',
  },
  {
    id: 'hq-4',
    prompt: 'Що означає «AAFCO statement» на кормі (орієнтир)?',
    choices: [
      { id: 'a', label: 'Корм сертифікований як ліки' },
      { id: 'b', label: 'Заява про відповідність поживним профілям' },
      { id: 'c', label: 'Гарантія смаку' },
      { id: 'd', label: 'Без ГМО назавжди' },
    ],
    correctId: 'b',
    explain: 'Це заява про поживний профіль / протокол годівлі, не «ліки».',
  },
  {
    id: 'hq-5',
    prompt: 'Найкраща перша дія при підозрі на отруєння?',
    choices: [
      { id: 'a', label: 'Дати молоко' },
      { id: 'b', label: 'Викликати блювоту завжди' },
      { id: 'c', label: 'Зв’язатися з ветом / токсикологією' },
      { id: 'd', label: 'Зачекати до ранку' },
    ],
    correctId: 'c',
    explain: 'Не експериментуйте вдома — швидкий контакт із фахівцем.',
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
    claim: 'Котам обов’язково потрібне молоко щодня',
    isMyth: true,
    explain: 'Багато дорослих котів погано переносять лактозу; вода важливіша.',
  },
  {
    id: 'mq-2',
    claim: 'Собака з холодним носом завжди здорова',
    isMyth: true,
    explain: 'Температура носа змінюється; орієнтуйтесь на поведінку й апетит.',
  },
  {
    id: 'mq-3',
    claim: 'Шоколад токсичний для собак',
    isMyth: false,
    explain: 'Це факт: теобромін небезпечний.',
  },
  {
    id: 'mq-4',
    claim: 'Одна прогулянка на місяць достатня будь-якій собаці',
    isMyth: true,
    explain: 'Більшості собак потрібні регулярні прогулянки й збагачення.',
  },
  {
    id: 'mq-5',
    claim: 'Лілії можуть бути смертельно небезпечні для котів',
    isMyth: false,
    explain: 'Це правда — тримайте лілії подалі.',
  },
];

export function getMythCards(): MythCard[] {
  return MYTHS;
}
