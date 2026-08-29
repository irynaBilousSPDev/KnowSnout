export type HelpTopic = {
  id: string;
  titleKey: string;
  bodyKey: string;
  articleTitleKey?: string;
};

/** 07.09 / 07.10 — mock FAQ topics only. */
export const HELP_TOPICS: HelpTopic[] = [
  {
    id: 'food-rating',
    titleKey: 'help.topic.foodRating',
    articleTitleKey: 'help.article.foodRatingTitle',
    bodyKey: 'help.body.foodRating',
  },
  {
    id: 'microchip',
    titleKey: 'help.topic.microchip',
    articleTitleKey: 'help.article.microchipTitle',
    bodyKey: 'help.body.microchip',
  },
];

export function getHelpTopic(id: string): HelpTopic | null {
  return HELP_TOPICS.find((t) => t.id === id) ?? null;
}
