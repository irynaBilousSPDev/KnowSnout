import { lookupBarcode as lookupPublicBarcode } from '@/src/services/barcodeLookup';
import {
  getProductByBarcode,
  isPublicMatchRich,
  productToAnalysis,
  upsertProduct,
} from '@/src/services/products';
import { t } from '@/src/i18n';
import { resolveSpecies } from '@/src/lib/species';
import type { AnalysisResult, PetSpecies } from '@/src/types/scan';

export type ResolveBarcodeResult =
  | {
      status: 'ready';
      barcode: string;
      analysis: AnalysisResult;
      from: 'own-db' | 'open-pet-food-facts' | 'open-food-facts';
      species: PetSpecies;
    }
  | {
      status: 'need-photo';
      barcode: string;
      preferredName?: string;
      species?: PetSpecies;
      reason: string;
    };

export async function resolveBarcode(barcode: string): Promise<ResolveBarcodeResult> {
  const cleaned = barcode.replace(/\s/g, '').trim();

  const own = await getProductByBarcode(cleaned);
  if (own?.is_rich) {
    return {
      status: 'ready',
      barcode: cleaned,
      analysis: productToAnalysis(own),
      from: 'own-db',
      species: own.species,
    };
  }

  if (own && !own.is_rich) {
    return {
      status: 'need-photo',
      barcode: cleaned,
      preferredName: own.product_name,
      species: own.species,
      reason: t('barcode.needPhotoKnown', { name: own.product_name }),
    };
  }

  const pub = await lookupPublicBarcode(cleaned);
  if (pub.found) {
    const rich = pub.hasIngredients && isPublicMatchRich(pub.analysis);
    await upsertProduct({
      barcode: cleaned,
      analysis: pub.analysis,
      source: pub.source,
      isRich: rich,
      brand: pub.brand,
      species: pub.species,
    });

    if (rich) {
      return {
        status: 'ready',
        barcode: cleaned,
        analysis: pub.analysis,
        from: pub.source,
        species: pub.species,
      };
    }

    return {
      status: 'need-photo',
      barcode: cleaned,
      preferredName: pub.analysis.productName,
      species: pub.species,
      reason: t('barcode.needPhotoPartial', {
        name: pub.analysis.productName,
      }),
    };
  }

  return {
    status: 'need-photo',
    barcode: cleaned,
    reason: t('barcode.needPhotoNew'),
  };
}

export async function persistAiProduct(options: {
  barcode?: string | null;
  preferredName?: string | null;
  analysis: AnalysisResult;
  species?: PetSpecies | null;
}) {
  if (!options.barcode) return null;

  const analysis: AnalysisResult = {
    ...options.analysis,
    productName: options.preferredName?.trim() || options.analysis.productName,
  };

  return upsertProduct({
    barcode: options.barcode,
    analysis,
    source: 'ai',
    isRich: true,
    species: resolveSpecies(
      options.species,
      analysis.productName,
      analysis.summary,
    ),
  });
}
