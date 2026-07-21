import { MOCK_ANALYSIS } from '@/src/constants/analysis';
import { env } from '@/src/lib/env';
import { resolveSpecies } from '@/src/lib/species';
import { supabase } from '@/src/services/supabase';
import type { AnalysisResult, AnalyzeLabelPayload, PetSpecies } from '@/src/types/scan';

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseSpecies(value: unknown): PetSpecies | undefined {
  if (value === 'dog' || value === 'cat' || value === 'unknown') return value;
  return undefined;
}

function isValidResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.productName === 'string' &&
    typeof v.score === 'number' &&
    Array.isArray(v.pros) &&
    Array.isArray(v.cons) &&
    typeof v.summary === 'string'
  );
}

export async function analyzeLabel(
  payload: AnalyzeLabelPayload,
): Promise<AnalysisResult> {
  if (env.useMockAi || env.isDemoMode || !supabase) {
    await delay(900);
    return {
      ...MOCK_ANALYSIS,
      species: resolveSpecies(
        undefined,
        MOCK_ANALYSIS.productName,
        MOCK_ANALYSIS.summary,
      ),
    };
  }

  const { data, error } = await supabase.functions.invoke('analyze-label', {
    body: {
      imageBase64: payload.imageBase64,
      mimeType: payload.mimeType ?? 'image/jpeg',
    },
  });

  if (error) {
    throw new Error(error.message || 'Analysis request failed');
  }

  const result = (data?.result ?? data) as unknown;
  if (!isValidResult(result)) {
    throw new Error('Unexpected response from analysis service');
  }

  const productName = result.productName;
  const summary = result.summary;
  const fromModel = parseSpecies(
    (result as AnalysisResult & { species?: unknown }).species,
  );

  return {
    productName,
    score: Math.max(0, Math.min(100, Math.round(result.score))),
    pros: result.pros.map(String),
    cons: result.cons.map(String),
    summary,
    species: resolveSpecies(fromModel, productName, summary),
  };
}
