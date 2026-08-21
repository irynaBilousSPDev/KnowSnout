/**
 * KnowSnout tokens — option 1 locked:
 * phone HTML inline :root + Брендбук (ЗАТВЕРДЖЕНО).
 * Source: docs/design/KnowSnout_project/*.dc.html
 * Organic _ds provides class patterns only; cream/Caprasimo defaults are NOT used.
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

export const brand = {
  /** Primary CTA / accents */
  accent: '#0E6E5D',
  accentPressed: '#0A5346',
  accentDark: '#083F35',
  accentTint: '#EAF7F3',
  accentBorder: '#CBEBE1',
  accentSoft: '#9FD8CB',

  /** Logo wordmark “Snout” + secondary success */
  logoGreen: '#22C57A',
  success: '#1EAE5C',
  successDark: '#0F6D38',
  successTint: '#EEFBF0',
  successSoft: '#DFF6E3',

  /** Surfaces */
  canvas: '#F4F3F1',
  cream: '#F4F3F1',
  creamDeep: '#EAE7E2',
  surface: '#F4F3F1',
  surfaceElevated: '#FFFFFF',
  mist: '#EAF7F3',
  mistBorder: '#D8D5D0',
  chipTrack: '#EAE7E2',
  divider: 'rgba(21,34,51,0.12)',

  /** Text */
  ink: '#152233',
  muted: '#5B6B75',
  mutedSoft: '#8b96a0',
  label: '#455460',

  /** Semantic (brandbook) */
  error: '#D9534F',
  warning: '#F0A93A',
  terracotta: '#D9534F',
  terracottaTint: '#F3E0D8',
  roseMist: '#F3E0D8',

  score: {
    poor: '#D9534F',
    fair: '#F0A93A',
    good: '#1EAE5C',
  },

  gradient: {
    start: '#0E6E5D',
    end: '#083F35',
    angleDeg: 135,
  },

  /** Compatibility aliases (older screens) */
  sage: '#0E6E5D',
  sageDeep: '#083F35',
  sageTint: '#EAF7F3',
  navy: '#0E6E5D',
  navyDeep: '#083F35',
  forest: '#1EAE5C',
  forestTint: '#EEFBF0',
  rose: '#D9534F',
  roseTint: '#F3E0D8',
  lime: '#1EAE5C',
  teal: '#0E6E5D',
  tealDeep: '#083F35',
  tealPressed: '#0A5346',

  /** HTML module radii */
  radius: {
    sm: 8,
    md: 14,
    lg: 20,
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
