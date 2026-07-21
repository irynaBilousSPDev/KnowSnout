export type PetSpecies = 'dog' | 'cat' | 'unknown';

export type AnalysisResult = {
  productName: string;
  score: number;
  pros: string[];
  cons: string[];
  summary: string;
  species?: PetSpecies;
};

export type ProductSource =
  | 'ai'
  | 'open-pet-food-facts'
  | 'open-food-facts'
  | 'manual';

export type ProductRow = {
  id: string;
  barcode: string;
  product_name: string;
  brand: string | null;
  species: PetSpecies;
  score: number;
  pros: string[];
  cons: string[];
  summary: string;
  source: ProductSource;
  is_rich: boolean;
  extras: Record<string, unknown>;
  scan_count: number;
  created_at: string;
  updated_at: string;
};

export type ScanRow = {
  id: string;
  user_id: string;
  product_name: string;
  score: number;
  pros: string[];
  cons: string[];
  summary: string;
  image_path: string | null;
  barcode?: string | null;
  product_id?: string | null;
  species?: PetSpecies | null;
  created_at: string;
};

export type FeedingLogRow = {
  id: string;
  user_id: string;
  pet_id: string;
  scan_id: string | null;
  product_id: string | null;
  product_name: string;
  ate_fully: boolean | null;
  note: string | null;
  fed_at: string;
  created_at: string;
};

export type AnalyzeLabelPayload = {
  imageBase64: string;
  mimeType?: string;
};
