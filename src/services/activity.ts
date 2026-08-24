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
    title: 'Ігор',
    body: 'вподобав твій пост',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-2',
    kind: 'comment',
    title: 'Оксана',
    body: 'прокоментувала твій пост',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'act-3',
    kind: 'follow',
    title: 'Марта',
    body: 'тепер підписана на тебе',
    createdAt: new Date().toISOString(),
  },
];

export async function listActivityFeed(): Promise<ActivityItem[]> {
  return [...SEED];
}
