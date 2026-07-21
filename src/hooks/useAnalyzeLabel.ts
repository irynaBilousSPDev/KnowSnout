import { useCallback, useState } from 'react';

import { uriToBase64, guessMimeType } from '@/src/lib/image';
import { analyzeLabel } from '@/src/services/analysis';
import type { AnalysisResult } from '@/src/types/scan';

export function useAnalyzeLabel() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const analyze = useCallback(async (imageUri: string) => {
    setLoading(true);
    setError(null);
    try {
      const imageBase64 = await uriToBase64(imageUri);
      const analysis = await analyzeLabel({
        imageBase64,
        mimeType: guessMimeType(imageUri),
      });
      setResult(analysis);
      return analysis;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to analyze label';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const analyzeMock = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeLabel({
        imageBase64: '',
        mimeType: 'image/jpeg',
      });
      setResult(analysis);
      return analysis;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to run demo analysis';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, result, analyze, analyzeMock, setResult, setError };
}
