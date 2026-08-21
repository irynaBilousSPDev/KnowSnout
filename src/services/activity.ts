export type ActivityItem = {
  id: string;
  kind: 'like' | 'comment' | 'follow' | 'contest' | 'walk' | 'friend';
  title: string;
  body: string;
  createdAt: string;
};

const SEED: ActivityItem[] = [
  {
    id: 'act-1',
    kind: 'like',
    title: 'Ірина вподобала твій пост',
    body: '«Ранкове сонце на підвіконні»',
    createdAt: '2026-08-21T14:00:00.000Z',
  },
  {
    id: 'act-2',
    kind: 'comment',
    title: 'Максим прокоментував',
    body: 'Який красень Рекс! 🐕',
    createdAt: '2026-08-21T12:30:00.000Z',
  },
  {
    id: 'act-3',
    kind: 'friend',
    title: 'Новий запит у друзі',
    body: 'Оля хоче додати тебе',
    createdAt: '2026-08-21T08:00:00.000Z',
  },
  {
    id: 'act-4',
    kind: 'contest',
    title: 'Голос у Spotlight',
    body: 'Хтось підтримав «Аду» в Сонячній мордочці',
    createdAt: '2026-08-20T20:00:00.000Z',
  },
  {
    id: 'act-5',
    kind: 'walk',
    title: 'Нагадування про прогулянку',
    body: 'Завтра з Максимом о 09:00',
    createdAt: '2026-08-20T18:00:00.000Z',
  },
  {
    id: 'act-6',
    kind: 'follow',
    title: 'Нова підписка',
    body: 'Катя підписалась на твої Stories',
    createdAt: '2026-08-19T16:00:00.000Z',
  },
];

export async function listActivityFeed(): Promise<ActivityItem[]> {
  return [...SEED];
}
