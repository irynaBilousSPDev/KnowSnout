/**
 * KnowSnout tokens — Organic PDF kit (active).
 * Source: docs/design/KnowSnout-UI-kit-v2-*.pdf + docs/design/refs/
 * Variant 12 (navy/forest/rose) deferred — see `v12` below for later remap.
 */

export const fonts = {
  display: 'Caprasimo_400Regular',
  body: 'Figtree_400Regular',
  bodyMedium: 'Figtree_500Medium',
  bodySemi: 'Figtree_600SemiBold',
  bodyBold: 'Figtree_700Bold',
  /** Fallbacks if Caprasimo/Figtree fail to load */
  displayFallback: 'Caprasimo_400Regular',
  bodyFallback: 'Figtree_400Regular',
} as const;

/** Deferred Brandbook Variant 12 — do not use as active chrome yet. */
export const v12 = {
  navy: '#122A4C',
  navyDeep: '#0C1C33',
  forest: '#2F5233',
  rose: '#E8879A',
  roseTint: '#F4DADF',
  forestTint: '#E3E9DF',
  surface: '#F7F1ED',
} as const;

/**
 * Active Organic palette sampled from PDF phone mocks.
 * Primary CTA = deep sage/teal; warm cream surface; terracotta accent.
 */
export const brand = {
  /** Primary CTA / active tab / links (PDF sage-teal) */
  sage: '#0A6B5C',
  sageDeep: '#084F44',
  sageTint: '#D8EBE6',
  /** Emotional / danger-adjacent accent */
  terracotta: '#C45C3E',
  terracottaTint: '#F3E0D8',
  /** Warm page background */
  cream: '#F3EDE4',
  creamDeep: '#E8DFD2',

  ink: '#1A2332',
  muted: '#6B7280',
  mutedSoft: '#9AA3AD',
  surface: '#F3EDE4',
  surfaceElevated: '#FFFFFF',
  mist: '#D8EBE6',
  mistBorder: '#D0D5CC',
  roseMist: '#F3E0D8',

  score: {
    poor: '#C45C3E',
    fair: '#C4922A',
    good: '#0A6B5C',
  },

  gradient: {
    start: '#0A6B5C',
    end: '#084F44',
    angleDeg: 135,
  },

  /**
   * Compatibility aliases — existing screens use navy/forest/rose.
   * Mapped onto Organic so the whole app shifts without per-file rewrites.
   */
  navy: '#0A6B5C',
  navyDeep: '#084F44',
  forest: '#0A6B5C',
  forestTint: '#D8EBE6',
  rose: '#C45C3E',
  roseTint: '#F3E0D8',
  lime: '#0A6B5C',
  teal: '#0A6B5C',
  tealDeep: '#084F44',
  tealPressed: '#084F44',

  /** Corner radii from PDF (soft, pill CTAs) */
  radius: {
    sm: 12,
    md: 16,
    lg: 22,
    xl: 28,
    pill: 999,
  },
} as const;
