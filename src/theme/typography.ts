import { StyleSheet, TextStyle } from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

/** HTML kit type scale — Manrope titles + Inter body. */
export const type = StyleSheet.create({
  displayLg: {
    fontFamily: fonts.title,
    fontSize: 24,
    lineHeight: 30,
    color: brand.ink,
  },
  displayMd: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: brand.ink,
  },
  subtitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    lineHeight: 20,
    color: brand.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  bodyStrong: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    lineHeight: 16,
    color: brand.label,
  },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: brand.mutedSoft,
  },
  button: {
    fontFamily: fonts.title,
    fontSize: 14,
    letterSpacing: 0.1,
  },
});

export function displayStyle(extra?: TextStyle): TextStyle[] {
  return [type.displayMd, extra].filter(Boolean) as TextStyle[];
}
