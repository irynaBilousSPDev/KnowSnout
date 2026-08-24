export function petAgeYears(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const t0 = new Date(birthDate).getTime();
  if (!Number.isFinite(t0)) return null;
  const years = Math.floor((Date.now() - t0) / (365.25 * 24 * 60 * 60 * 1000));
  return Math.max(0, years);
}

export function petAgeShortUk(birthDate: string | null | undefined): string {
  const y = petAgeYears(birthDate);
  if (y == null) return '';
  return `${y} р.`;
}
