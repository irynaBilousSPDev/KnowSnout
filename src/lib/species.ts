import type { PetSpecies } from '@/src/types/scan';

const CAT_PATTERNS = [
  /\bcat(s|food)?\b/i,
  /\bfeline\b/i,
  /\bkitten(s)?\b/i,
  /\bkitt(y|ies)\b/i,
  /\bкіт(и|ів|ам)?\b/iu,
  /\bкошенят/iu,
  /\bкотяч/iu,
  /\bдля\s+кот/iu,
  /\bkot(y|ów|om|a)?\b/i,
  /\bkoci[aeę]/i,
  /\bdla\s+kot/i,
];

const DOG_PATTERNS = [
  /\bdog(s|food)?\b/i,
  /\bcanine\b/i,
  /\bpupp(y|ies)\b/i,
  /\bсобак/iu,
  /\bцуцен/iu,
  /\bдля\s+собак/iu,
  /\bpies\b/i,
  /\bps[iyó]/i,
  /\bdla\s+ps/i,
];

function matchesAny(haystack: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(haystack));
}

/** Infer dog/cat from product name, summary, categories, etc. */
export function inferSpeciesFromText(
  ...parts: Array<string | null | undefined>
): PetSpecies {
  const haystack = parts.filter(Boolean).join(' ').trim();
  if (!haystack) return 'unknown';

  const isCat = matchesAny(haystack, CAT_PATTERNS);
  const isDog = matchesAny(haystack, DOG_PATTERNS);

  if (isCat && !isDog) return 'cat';
  if (isDog && !isCat) return 'dog';
  return 'unknown';
}

/** Prefer stored dog/cat; otherwise infer from text. */
export function resolveSpecies(
  stored: unknown,
  ...parts: Array<string | null | undefined>
): PetSpecies {
  if (stored === 'dog' || stored === 'cat') return stored;
  return inferSpeciesFromText(...parts);
}
