import type { AnalysisResult } from '@/src/types/scan';

export const MOCK_ANALYSIS: AnalysisResult = {
  productName: 'Brit Care Adult Lamb & Rice',
  score: 86,
  pros: [
    'Ягня дегідратоване 26%',
    'Рис, батат',
    'М’ясо першим у списку, без штучних консервантів',
  ],
  cons: ['Кукурудзяний глютен'],
  summary:
    'Добрий склад: м’ясо першим у списку, без штучних консервантів. Зернові в рецепті — зверніть увагу при чутливому травленні.',
};

export function getScoreTone(score: number): 'poor' | 'fair' | 'good' {
  if (score < 40) return 'poor';
  if (score < 70) return 'fair';
  return 'good';
}

export function getScoreLabel(score: number): string {
  if (score < 40) return 'Poor';
  if (score < 70) return 'Fair';
  if (score < 85) return 'Good';
  return 'Excellent';
}

export const SCORE_COLORS = {
  poor: '#c45c3e',
  fair: '#c4922a',
  good: '#0a9b7a',
} as const;
