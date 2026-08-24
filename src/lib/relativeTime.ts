import { t } from '@/src/i18n';

/** Relative time labels matching Check hub / history screenshots. */
export function formatRelativeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(ms) || ms < 0) return t('check.agoToday');
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 18) return t('check.agoToday');
  if (hours < 42) return t('check.agoYesterday');
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  if (days < 7) return t('check.agoDays', { count: days });
  if (days < 14) return t('check.agoWeek');
  return t('check.agoWeeks', { count: Math.round(days / 7) });
}

export function scoreOutOfFive(score: number): string {
  return (Math.max(0, Math.min(100, score)) / 20).toFixed(1);
}
