/** KnowSnout tokens — UI Kit v2 Brandbook Variant 12 (нафтовий + ліс + троянда).
 * Source PDF: docs/design/KnowSnout-UI-kit-v2-brandbook.pdf
 * See BRANDBOOK.md
 */

export const brand = {
  /** Primary structure / nav / headers / primary actions */
  navy: '#122A4C',
  navyDeep: '#0C1C33',
  /** Safe / healthy / success */
  forest: '#2F5233',
  /** Emotional accent — active chips, heart accents, secondary CTAs */
  rose: '#E8879A',
  roseTint: '#F4DADF',
  forestTint: '#E3E9DF',

  ink: '#0C1C33',
  /** Secondary body / hints — navy-neutral (never mint) */
  muted: '#5A6B7D',
  mutedSoft: '#8A9AAB',
  surface: '#F7F1ED',
  surfaceElevated: '#FFFFFF',
  mist: '#E3E9DF',
  mistBorder: '#C8D2C4',
  roseMist: '#F4DADF',

  score: {
    poor: '#C45C3E',
    fair: '#C4922A',
    good: '#2F5233',
  },

  gradient: {
    start: '#122A4C',
    end: '#2F5233',
    angleDeg: 135,
  },

  /**
   * Legacy aliases (old teal/lime era) — mapped to Variant 12.
   * Prefer navy / forest / muted in new code.
   */
  lime: '#2F5233',
  teal: '#2F5233',
  tealDeep: '#244028',
  /** @deprecated use brand.navy */
  tealPressed: '#122A4C',
} as const;
