export type HelpTopic = {
  id: string;
  titleKey: string;
  bodyKey: string;
};

export const HELP_TOPICS: HelpTopic[] = [
  { id: 'start', titleKey: 'help.topic.start', bodyKey: 'help.body.start' },
  { id: 'scan', titleKey: 'help.topic.scan', bodyKey: 'help.body.scan' },
  {
    id: 'stories',
    titleKey: 'help.topic.stories',
    bodyKey: 'help.body.stories',
  },
  {
    id: 'directories',
    titleKey: 'help.topic.directories',
    bodyKey: 'help.body.directories',
  },
  {
    id: 'account',
    titleKey: 'help.topic.account',
    bodyKey: 'help.body.account',
  },
];

export function getHelpTopic(id: string): HelpTopic | null {
  return HELP_TOPICS.find((t) => t.id === id) ?? null;
}
