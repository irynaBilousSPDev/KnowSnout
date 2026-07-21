import type { AnalysisResult } from '@/src/types/scan';

export const MOCK_ANALYSIS: AnalysisResult = {
  productName: 'Acme Adult Dog — Chicken & Rice',
  score: 72,
  pros: [
    'Chicken listed as the first ingredient',
    'Includes omega fatty acids for coat health',
    'No artificial colors detected on the label',
  ],
  cons: [
    'Contains multiple plant fillers lower on the list',
    'Protein percentage is only average for an adult formula',
    'Ambiguous “meat by-products” wording',
  ],
  summary:
    'A solid mid-tier adult dog food: decent animal protein up front, but fillers and vague by-product language keep it from a top score. Fine for healthy adults; not ideal for pets with allergies or high activity needs.',
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
