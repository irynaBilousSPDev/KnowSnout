import { t } from '@/src/i18n';
import type { AnalysisResult } from '@/src/types/scan';

export type Tone = 'good' | 'ok' | 'caution';

export type IndicatorRow = {
  label: string;
  tone: Tone;
  toneLabel: string;
};

export type IngredientRow = {
  label: string;
  tone: Tone;
  toneLabel: string;
};

function toneLabel(tone: Tone): string {
  if (tone === 'good') return t('result.toneGood');
  if (tone === 'ok') return t('result.toneOk');
  return t('result.toneCaution');
}

export function scoreHeadline(score: number): { title: string; body: string } {
  if (score >= 80) {
    return {
      title: t('result.verdictGood'),
      body: t('result.verdictGoodBody'),
    };
  }
  if (score >= 60) {
    return {
      title: t('result.verdictFair'),
      body: t('result.verdictFairBody'),
    };
  }
  return {
    title: t('result.verdictPoor'),
    body: t('result.verdictPoorBody'),
  };
}

/** Derive «Показники» + «Склад» rows from analysis text (mock-friendly). */
export function buildFoodResultView(result: AnalysisResult): {
  indicators: IndicatorRow[];
  ingredients: IngredientRow[];
} {
  const blob = `${result.summary} ${result.pros.join(' ')} ${result.cons.join(' ')}`.toLowerCase();
  const proteinTone: Tone =
    blob.includes('protein') || blob.includes('білок') || result.score >= 70
      ? 'good'
      : 'ok';
  const fatTone: Tone = result.score >= 50 ? 'ok' : 'caution';
  const grainTone: Tone =
    blob.includes('grain') ||
    blob.includes('зерн') ||
    blob.includes('corn') ||
    blob.includes('кукуруд') ||
    result.cons.some((c) => /filler|зерн|corn|gluten/i.test(c))
      ? 'caution'
      : 'ok';

  const indicators: IndicatorRow[] = [
    {
      label: t('result.indicatorProtein', { pct: 26 }),
      tone: proteinTone,
      toneLabel: toneLabel(proteinTone),
    },
    {
      label: t('result.indicatorFat', { pct: 14 }),
      tone: fatTone,
      toneLabel: toneLabel(fatTone),
    },
    {
      label: t('result.indicatorGrains'),
      tone: grainTone,
      toneLabel: toneLabel(grainTone),
    },
  ];

  const ingredients: IngredientRow[] = result.pros.slice(0, 2).map((p) => ({
    label: p,
    tone: 'good' as Tone,
    toneLabel: toneLabel('good'),
  }));
  if (result.pros[2]) {
    ingredients.push({
      label: result.pros[2],
      tone: 'ok',
      toneLabel: toneLabel('ok'),
    });
  }
  for (const c of result.cons.slice(0, 1)) {
    ingredients.push({
      label: c,
      tone: 'caution',
      toneLabel: toneLabel('caution'),
    });
  }
  if (ingredients.length === 0) {
    ingredients.push({
      label: result.summary.slice(0, 80),
      tone: result.score >= 70 ? 'good' : 'ok',
      toneLabel: toneLabel(result.score >= 70 ? 'good' : 'ok'),
    });
  }

  return { indicators, ingredients };
}
