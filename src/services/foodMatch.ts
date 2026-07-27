import type { AnalysisResult } from '@/src/types/scan';
import type { LifeStage, PetRow } from '@/src/types/pet';

export type FoodMatchLevel = 'ok' | 'caution' | 'alert' | 'unknown';

export type FoodMatchHit = {
  level: FoodMatchLevel;
  kind: 'allergy' | 'life_stage' | 'diet' | 'species';
  detail: string;
};

export type FoodMatchResult = {
  level: FoodMatchLevel;
  hits: FoodMatchHit[];
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .trim();
}

function haystackFromFood(food: {
  productName: string;
  summary?: string;
  pros?: string[];
  cons?: string[];
}) {
  return normalize(
    [
      food.productName,
      food.summary ?? '',
      ...(food.pros ?? []),
      ...(food.cons ?? []),
    ].join(' '),
  );
}

function allergyTokens(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;/\n]+/)
    .map((t) => normalize(t))
    .filter((t) => t.length >= 3);
}

const LIFE_STAGE_FOOD: Record<
  Exclude<LifeStage, 'unknown'>,
  { positive: RegExp; negative: RegExp }
> = {
  puppy: {
    positive: /puppy|puppies|junior|щенят|щеня|puppy/i,
    negative: /senior|old\s*dog|для\s*старших|віков/i,
  },
  kitten: {
    positive: /kitten|kittens|кошенят|кошеня/i,
    negative: /senior|old\s*cat|для\s*старших/i,
  },
  adult: {
    positive: /adult|доросл/i,
    negative: /only\s*puppy|only\s*kitten|лише\s*для\s*щенят|лише\s*для\s*кошенят/i,
  },
  senior: {
    positive: /senior|mature|старш|віков/i,
    negative: /puppy|kitten|щенят|кошенят/i,
  },
};

/**
 * Informational match of a food label/analysis against a pet profile.
 * Not a veterinary recommendation.
 */
export function matchFoodToPet(
  pet: PetRow,
  food: Pick<AnalysisResult, 'productName' | 'summary' | 'pros' | 'cons'> & {
    species?: string | null;
  },
): FoodMatchResult {
  const hits: FoodMatchHit[] = [];
  const hay = haystackFromFood(food);

  for (const token of allergyTokens(pet.allergies)) {
    if (hay.includes(token)) {
      hits.push({
        level: 'alert',
        kind: 'allergy',
        detail: token,
      });
    }
  }

  const stage = pet.life_stage;
  if (stage && stage !== 'unknown') {
    const rules = LIFE_STAGE_FOOD[stage];
    if (rules) {
      const hasPositive = rules.positive.test(hay);
      const hasNegative = rules.negative.test(hay);
      if (hasNegative && !hasPositive) {
        hits.push({
          level: 'caution',
          kind: 'life_stage',
          detail: stage,
        });
      } else if (hasPositive) {
        hits.push({
          level: 'ok',
          kind: 'life_stage',
          detail: stage,
        });
      }
    }
  }

  if (pet.diet_type === 'dry' && /wet\s*only|лише\s*волог|пауч/i.test(hay) && !/dry|сух/i.test(hay)) {
    hits.push({ level: 'caution', kind: 'diet', detail: 'dry' });
  }
  if (pet.diet_type === 'wet' && /dry\s*only|лише\s*сух/i.test(hay) && !/wet|волог|пауч/i.test(hay)) {
    hits.push({ level: 'caution', kind: 'diet', detail: 'wet' });
  }

  if (
    food.species &&
    food.species !== 'unknown' &&
    pet.species !== 'other' &&
    food.species !== pet.species
  ) {
    hits.push({
      level: 'caution',
      kind: 'species',
      detail: `${pet.species}:${food.species}`,
    });
  }

  const level: FoodMatchLevel = hits.some((h) => h.level === 'alert')
    ? 'alert'
    : hits.some((h) => h.level === 'caution')
      ? 'caution'
      : hits.some((h) => h.level === 'ok')
        ? 'ok'
        : 'unknown';

  return { level, hits };
}

export function lifeStageLabelKey(
  stage: LifeStage | null | undefined,
): string | null {
  if (!stage || stage === 'unknown') return null;
  if (stage === 'puppy') return 'pets.lifePuppy';
  if (stage === 'kitten') return 'pets.lifeKitten';
  if (stage === 'adult') return 'pets.lifeAdult';
  if (stage === 'senior') return 'pets.lifeSenior';
  return null;
}

/** i18n key for a single match hit (pass through `t`). */
export function foodMatchHitKey(hit: FoodMatchHit): string {
  if (hit.kind === 'allergy') return 'foodMatch.allergy';
  if (hit.kind === 'life_stage') {
    return hit.level === 'ok' ? 'foodMatch.lifeOk' : 'foodMatch.lifeCaution';
  }
  if (hit.kind === 'diet') return 'foodMatch.diet';
  return 'foodMatch.species';
}
