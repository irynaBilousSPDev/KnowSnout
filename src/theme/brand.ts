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
   * Legacy aliases (old teal/lime era) — mapped to Variant 12 so existing
   * `brand.teal*` call sites keep working during the visual migrate.
   */
  lime: '#2F5233',
  teal: '#2F5233',
  tealDeep: '#244028',
  /** Primary pressed / interactive — navy per brandbook */
  tealPressed: '#122A4C',
} as const;
