import type { AnalysisResult, PetSpecies } from '@/src/types/scan';

type PendingAnalysis = {
  result: AnalysisResult;
  imageUri?: string | null;
  scanId?: string;
  saved?: boolean;
  barcode?: string | null;
  productId?: string | null;
  preferredName?: string | null;
  species?: PetSpecies | null;
};

let pending: PendingAnalysis | null = null;
let pendingBarcodeContext: {
  barcode: string;
  preferredName?: string;
  species?: PetSpecies;
} | null = null;

export function setPendingAnalysis(value: PendingAnalysis) {
  pending = value;
}

export function getPendingAnalysis(): PendingAnalysis | null {
  return pending;
}

export function clearPendingAnalysis() {
  pending = null;
}

export function setPendingBarcodeContext(
  value: {
    barcode: string;
    preferredName?: string;
    species?: PetSpecies;
  } | null,
) {
  pendingBarcodeContext = value;
}

export function getPendingBarcodeContext() {
  return pendingBarcodeContext;
}

export function clearPendingBarcodeContext() {
  pendingBarcodeContext = null;
}
