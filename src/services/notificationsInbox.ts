export type InboxNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  kind: 'system' | 'social' | 'promo';
};

const SEED: InboxNotification[] = [
  {
    id: 'n1',
    title: 'Ласкаво просимо',
    body: 'Це демо-сповіщення KnowSnout на пристрої.',
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    read: false,
    kind: 'system',
  },
  {
    id: 'n2',
    title: 'Новий коментар',
    body: 'Хтось відповів на твій пост у стрічці (мок).',
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    read: false,
    kind: 'social',
  },
  {
    id: 'n3',
    title: 'Spotlight',
    body: 'Конкурс мордочок триває — заглянь у рейтинг.',
    createdAt: new Date(Date.now() - 172_800_000).toISOString(),
    read: true,
    kind: 'promo',
  },
];

export async function listInboxNotifications(): Promise<InboxNotification[]> {
  return [...SEED].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}
