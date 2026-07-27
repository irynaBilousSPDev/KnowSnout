import type { ContestPeriod } from '@/src/types/contest';

export type SpotlightContest = {
  id: string;
  period: ContestPeriod;
  /** Ukrainian theme title */
  titleUk: string;
  /** Short brief */
  briefUk: string;
  status: 'active' | 'soon';
};

/**
 * Editorial SnoutSpotlight themes (scaffold).
 * One active theme per period — swap copy without schema.
 */
export const SPOTLIGHT_CONTESTS: SpotlightContest[] = [
  {
    id: 'day-sunny-snout',
    period: 'day',
    titleUk: 'Сонячна мордочка дня',
    briefUk: 'Світло, вікно, прогулянка — лови момент, коли улюбленець сяє.',
    status: 'active',
  },
  {
    id: 'week-play-time',
    period: 'week',
    titleUk: 'Гра тижня',
    briefUk: 'Іграшка, стрибок, «полювання» — покажи, як ви граєте разом.',
    status: 'active',
  },
  {
    id: 'month-cozy',
    period: 'month',
    titleUk: 'Затишок місяця',
    briefUk: 'Диван, плед, обійми — наймиліший домашній кадр.',
    status: 'active',
  },
  {
    id: 'year-star',
    period: 'year',
    titleUk: 'Зірка року',
    briefUk: 'Найкращий портрет сезону. Демо-рейтинг сердечками.',
    status: 'active',
  },
];

export function getActiveSpotlight(
  period: ContestPeriod,
): SpotlightContest | null {
  return (
    SPOTLIGHT_CONTESTS.find((c) => c.period === period && c.status === 'active') ??
    SPOTLIGHT_CONTESTS.find((c) => c.period === period) ??
    null
  );
}
