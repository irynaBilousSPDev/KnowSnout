import { inferSpeciesFromText } from '@/src/lib/species';
import type { AnalysisResult, PetSpecies } from '@/src/types/scan';

export type BarcodeLookupResult =
  | {
      found: true;
      barcode: string;
      source: 'open-pet-food-facts' | 'open-food-facts';
      analysis: AnalysisResult;
      species: PetSpecies;
      hasIngredients: boolean;
      brand?: string | null;
    }
  | {
      found: false;
      barcode: string;
    };

type OffProduct = {
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  categories_tags?: string[];
  nutriments?: Record<string, number | undefined>;
  labels_tags?: string[];
};

function buildName(product: OffProduct): string {
  const name = product.product_name || product.product_name_en || 'Unknown product';
  const brand = product.brands?.split(',')[0]?.trim();
  return brand ? `${brand} — ${name}` : name;
}

function detectSpecies(product: OffProduct, textExtra = ''): PetSpecies {
  return inferSpeciesFromText(
    ...(product.categories_tags ?? []),
    product.product_name,
    product.product_name_en,
    textExtra,
  );
}

function scoreFromProduct(product: OffProduct): {
  score: number;
  pros: string[];
  cons: string[];
  summary: string;
  hasIngredients: boolean;
  species: PetSpecies;
} {
  const ingredientsRaw =
    product.ingredients_text || product.ingredients_text_en || '';
  const ingredients = ingredientsRaw.toLowerCase();
  const labels = (product.labels_tags ?? []).join(' ').toLowerCase();
  const categories = (product.categories_tags ?? []).join(' ').toLowerCase();
  const protein = product.nutriments?.proteins_100g;
  const species = detectSpecies(product, ingredients);
  const productName = buildName(product);
  const pros: string[] = [];
  const cons: string[] = [];
  let score = 58;

  if (species === 'cat' || species === 'dog') {
    score += 4;
  }

  if (
    /chicken|turkey|salmon|beef|duck|lamb|tuna|fish|meat|wołowina|kurczak/.test(
      ingredients,
    ) &&
    !ingredients.startsWith('cereal')
  ) {
    score += 12;
    pros.push('Named animal protein is listed among the ingredients');
  }

  if (typeof protein === 'number' && protein >= 28) {
    score += 8;
    pros.push(`Solid protein density (~${Math.round(protein)}g / 100g)`);
  } else if (typeof protein === 'number' && protein > 0) {
    pros.push(`Protein on label ~${Math.round(protein)}g / 100g`);
  }

  if (labels.includes('organic') || /no-artificial|without-artificial/.test(labels)) {
    score += 5;
    pros.push('Cleaner labeling signals (e.g. organic / fewer artificial additives)');
  }

  if (/by-product|by product|derivatives|meat and animal/.test(ingredients)) {
    score -= 12;
    cons.push('Vague by-product / meat-derivative wording lowers transparency');
  }

  if (/sugar|glucose|caramel|color|colour|e1[0-9]{2}/.test(ingredients)) {
    score -= 8;
    cons.push('Added sugars and/or colorants are present');
  }

  if (/corn|wheat|soy|soya|cereal|grain/.test(ingredients)) {
    score -= 4;
    cons.push('Includes grains or plant fillers');
  }

  const hasIngredients = ingredients.trim().length > 12;

  if (!hasIngredients) {
    return {
      score: 40,
      pros: ['Product identified from barcode'],
      cons: ['Ingredient list not available yet'],
      summary: `${productName} was recognized, but the composition is incomplete in public data. A quick photo of the ingredients panel will unlock a full KnowSnout score.`,
      hasIngredients: false,
      species,
    };
  }

  if (pros.length === 0) {
    pros.push('Composition data is available for a first-pass score');
  }
  if (cons.length === 0) {
    cons.push('Public data may miss brand-specific caveats — verify on pack');
  }

  score = Math.max(20, Math.min(90, Math.round(score)));

  const speciesLabel =
    species === 'cat' ? 'cat' : species === 'dog' ? 'dog' : 'pet';

  const summary = `${productName} looks like a mid-pack ${speciesLabel} food based on public composition data. Highlight: ${pros[0].toLowerCase()}. Watch-out: ${cons[0].toLowerCase()}. KnowSnout will get sharper after community-verified label scans.`;

  return { score, pros, cons, summary, hasIngredients: true, species };
}

async function fetchProduct(
  baseUrl: string,
  barcode: string,
): Promise<OffProduct | null> {
  const response = await fetch(`${baseUrl}/api/v2/product/${barcode}.json`, {
    headers: { 'User-Agent': 'KnowSnout/1.0 (pet food scanner)' },
  });
  if (!response.ok) return null;
  const json = (await response.json()) as {
    status?: number;
    product?: OffProduct;
  };
  if (json.status !== 1 || !json.product) return null;
  return json.product;
}

export async function lookupBarcode(barcode: string): Promise<BarcodeLookupResult> {
  const cleaned = barcode.replace(/\s/g, '').trim();
  if (cleaned.length < 6) {
    return { found: false, barcode: cleaned };
  }

  const petProduct = await fetchProduct(
    'https://world.openpetfoodfacts.org',
    cleaned,
  );
  if (petProduct) {
    const scored = scoreFromProduct(petProduct);
    return {
      found: true,
      barcode: cleaned,
      source: 'open-pet-food-facts',
      hasIngredients: scored.hasIngredients,
      species: scored.species,
      brand: petProduct.brands?.split(',')[0]?.trim() ?? null,
      analysis: {
        productName: buildName(petProduct),
        score: scored.score,
        pros: scored.pros,
        cons: scored.cons,
        summary: scored.summary,
      },
    };
  }

  const foodProduct = await fetchProduct(
    'https://world.openfoodfacts.org',
    cleaned,
  );
  if (foodProduct) {
    const scored = scoreFromProduct(foodProduct);
    return {
      found: true,
      barcode: cleaned,
      source: 'open-food-facts',
      hasIngredients: scored.hasIngredients,
      species: scored.species,
      brand: foodProduct.brands?.split(',')[0]?.trim() ?? null,
      analysis: {
        productName: buildName(foodProduct),
        score: scored.score,
        pros: scored.pros,
        cons: scored.cons,
        summary: scored.summary,
      },
    };
  }

  return { found: false, barcode: cleaned };
}
