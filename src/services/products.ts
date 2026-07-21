import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';
import type {
  AnalysisResult,
  PetSpecies,
  ProductRow,
  ProductSource,
} from '@/src/types/scan';

const LOCAL_PRODUCTS_KEY = 'snoutscore.demo.products';

export type UpsertProductInput = {
  barcode: string;
  analysis: AnalysisResult;
  source: ProductSource;
  isRich: boolean;
  brand?: string | null;
  species?: PetSpecies | null;
  extras?: Record<string, unknown>;
};

async function readLocalProducts(): Promise<ProductRow[]> {
  const raw = await AsyncStorage.getItem(LOCAL_PRODUCTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as ProductRow[];
  } catch {
    return [];
  }
}

async function writeLocalProducts(products: ProductRow[]) {
  await AsyncStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(products));
}

function mapProduct(row: Record<string, unknown>): ProductRow {
  const species = row.species;
  return {
    id: String(row.id),
    barcode: String(row.barcode),
    product_name: String(row.product_name),
    brand: row.brand ? String(row.brand) : null,
    species:
      species === 'dog' || species === 'cat' || species === 'unknown'
        ? species
        : 'unknown',
    score: Number(row.score),
    pros: Array.isArray(row.pros) ? row.pros.map(String) : [],
    cons: Array.isArray(row.cons) ? row.cons.map(String) : [],
    summary: String(row.summary ?? ''),
    source: row.source as ProductSource,
    is_rich: Boolean(row.is_rich),
    extras:
      row.extras && typeof row.extras === 'object'
        ? (row.extras as Record<string, unknown>)
        : {},
    scan_count: Number(row.scan_count ?? 1),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function productToAnalysis(product: ProductRow): AnalysisResult {
  return {
    productName: product.product_name,
    score: product.score,
    pros: product.pros,
    cons: product.cons,
    summary: product.summary,
  };
}

export function isPublicMatchRich(analysis: AnalysisResult): boolean {
  const summary = analysis.summary.toLowerCase();
  if (summary.includes('composition is incomplete')) return false;
  if (summary.includes('little ingredient detail')) return false;
  if (summary.includes('ingredient list missing')) return false;
  if (analysis.cons.some((c) => /ingredient list not available/i.test(c))) {
    return false;
  }
  return analysis.pros.length + analysis.cons.length >= 3;
}

export async function getProductByBarcode(
  barcode: string,
): Promise<ProductRow | null> {
  const cleaned = barcode.replace(/\s/g, '').trim();
  if (!cleaned) return null;

  if (env.isDemoMode || !supabase) {
    const products = await readLocalProducts();
    return products.find((p) => p.barcode === cleaned) ?? null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', cleaned)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapProduct(data as Record<string, unknown>) : null;
}

export async function upsertProduct(
  input: UpsertProductInput,
): Promise<ProductRow> {
  const cleaned = input.barcode.replace(/\s/g, '').trim();
  const user = await getCurrentUser();
  const now = new Date().toISOString();
  const species = input.species ?? 'unknown';

  if (env.isDemoMode || !supabase) {
    const products = await readLocalProducts();
    const existing = products.find((p) => p.barcode === cleaned);
    if (existing) {
      const replaceDetails = input.isRich || !existing.is_rich;
      const updated: ProductRow = {
        ...existing,
        product_name: replaceDetails
          ? input.analysis.productName
          : existing.product_name,
        brand: input.brand ?? existing.brand,
        species:
          species !== 'unknown'
            ? species
            : existing.species !== 'unknown'
              ? existing.species
              : species,
        score: replaceDetails ? input.analysis.score : existing.score,
        pros: replaceDetails ? input.analysis.pros : existing.pros,
        cons: replaceDetails ? input.analysis.cons : existing.cons,
        summary: replaceDetails ? input.analysis.summary : existing.summary,
        source: input.isRich ? input.source : existing.source,
        is_rich: existing.is_rich || input.isRich,
        extras: { ...existing.extras, ...(input.extras ?? {}) },
        scan_count: existing.scan_count + 1,
        updated_at: now,
      };
      const next = products.map((p) => (p.id === existing.id ? updated : p));
      await writeLocalProducts(next);
      return updated;
    }

    const created: ProductRow = {
      id: `local-product-${Date.now()}`,
      barcode: cleaned,
      product_name: input.analysis.productName,
      brand: input.brand ?? null,
      species,
      score: input.analysis.score,
      pros: input.analysis.pros,
      cons: input.analysis.cons,
      summary: input.analysis.summary,
      source: input.source,
      is_rich: input.isRich,
      extras: input.extras ?? {},
      scan_count: 1,
      created_at: now,
      updated_at: now,
    };
    products.unshift(created);
    await writeLocalProducts(products);
    return created;
  }

  const existing = await getProductByBarcode(cleaned);

  if (existing) {
    const replaceDetails = input.isRich || !existing.is_rich;
    const nextSpecies =
      species !== 'unknown'
        ? species
        : existing.species !== 'unknown'
          ? existing.species
          : species;
    const { data, error } = await supabase
      .from('products')
      .update({
        product_name: replaceDetails
          ? input.analysis.productName
          : existing.product_name,
        brand: input.brand ?? existing.brand,
        species: nextSpecies,
        score: replaceDetails ? input.analysis.score : existing.score,
        pros: replaceDetails ? input.analysis.pros : existing.pros,
        cons: replaceDetails ? input.analysis.cons : existing.cons,
        summary: replaceDetails ? input.analysis.summary : existing.summary,
        source: input.isRich ? input.source : existing.source,
        is_rich: existing.is_rich || input.isRich,
        extras: { ...existing.extras, ...(input.extras ?? {}) },
        scan_count: existing.scan_count + 1,
        updated_at: now,
      })
      .eq('id', existing.id)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update product');
    }
    return mapProduct(data as Record<string, unknown>);
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      barcode: cleaned,
      product_name: input.analysis.productName,
      brand: input.brand ?? null,
      species,
      score: input.analysis.score,
      pros: input.analysis.pros,
      cons: input.analysis.cons,
      summary: input.analysis.summary,
      source: input.source,
      is_rich: input.isRich,
      extras: input.extras ?? {},
      created_by: user?.id ?? null,
    })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to create product');
  }
  return mapProduct(data as Record<string, unknown>);
}
