import { StyleSheet, TextStyle } from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

/** PDF Organic type scale — Caprasimo display + Figtree body. */
export const type = StyleSheet.create({
  displayLg: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 38,
    color: brand.ink,
    letterSpacing: -0.3,
  },
  displayMd: {
    fontFamily: fonts.display,
    fontSize: 26,
    lineHeight: 32,
    color: brand.ink,
    letterSpacing: -0.2,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 20,
    lineHeight: 26,
    color: brand.ink,
  },
  subtitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 16,
    lineHeight: 22,
    color: brand.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  bodyStrong: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    lineHeight: 18,
    color: brand.ink,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: brand.mutedSoft,
  },
  button: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    letterSpacing: 0.2,
  },
});

export function displayStyle(extra?: TextStyle): TextStyle[] {
  return [type.displayMd, extra].filter(Boolean) as TextStyle[];
}
