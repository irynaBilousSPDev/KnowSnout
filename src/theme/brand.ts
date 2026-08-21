/**
 * KnowSnout tokens — from HTML comps (`docs/design/html/*.dc.html`).
 * Active source: module phone mockups (Вхід і Перевір etc.), not PDF raster guesses.
 * Brandbook Variant 12 kept as `v12` for later remap if product chooses brandbook over kit screens.
 */

export const fonts = {
  display: 'Manrope_700Bold',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
  title: 'Manrope_700Bold',
  titleExtra: 'Manrope_800ExtraBold',
} as const;

/** Brandbook Variant 12 — deferred relative to HTML kit screens. */
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
 * Active HTML kit palette (phone mocks).
 * Primary = petrol teal; success = bright green; canvas = warm stone.
 */
export const brand = {
  /** Primary CTA / active accents */
  accent: '#0E6E5D',
  accentPressed: '#0A5346',
  accentDark: '#083F35',
  accentTint: '#EAF7F3',
  accentBorder: '#CBEBE1',
  accentSoft: '#9FD8CB',

  /** Safe / success */
  success: '#1EAE5C',
  successDark: '#0F6D38',
  successTint: '#EEFBF0',

  /** Warm stone canvas */
  canvas: '#F4F3F1',
  cream: '#F4F3F1',
  creamDeep: '#EAE7E2',

  ink: '#152233',
  muted: '#5B6B75',
  mutedSoft: '#8b96a0',
  label: '#455460',
  surface: '#F4F3F1',
  surfaceElevated: '#FFFFFF',
  mist: '#EAF7F3',
  mistBorder: '#D8D5D0',
  chipTrack: '#EAE7E2',

  terracotta: '#C45C3E',
  terracottaTint: '#F3E0D8',
  roseMist: '#F3E0D8',

  score: {
    poor: '#C45C3E',
    fair: '#C4922A',
    good: '#1EAE5C',
  },

  gradient: {
    start: '#0E6E5D',
    end: '#083F35',
    angleDeg: 135,
  },

  /**
   * Compatibility aliases used across older screens.
   * Map to HTML kit so the whole app shifts.
   */
  sage: '#0E6E5D',
  sageDeep: '#083F35',
  sageTint: '#EAF7F3',
  navy: '#0E6E5D',
  navyDeep: '#083F35',
  forest: '#1EAE5C',
  forestTint: '#EEFBF0',
  rose: '#C45C3E',
  roseTint: '#F3E0D8',
  lime: '#1EAE5C',
  teal: '#0E6E5D',
  tealDeep: '#083F35',
  tealPressed: '#0A5346',

  radius: {
    sm: 12,
    md: 14,
    lg: 18,
    xl: 20,
    pill: 999,
  },

  shadow: {
    color: '#152233',
    opacity: 0.08,
    radius: 3,
    offset: { width: 0, height: 1 },
  },
} as const;
