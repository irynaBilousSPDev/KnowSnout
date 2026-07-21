import type { CompanionSpecies } from '@/src/types/pet';

export type VaccineCatalogItem = {
  key: string;
  /** Ukrainian label for UI */
  labelUk: string;
  species: CompanionSpecies[];
  /** Typical booster hint in months (informational) */
  typicalMonths?: number;
};

/**
 * Curated starter pack for UA/PL pet parents.
 * Not exhaustive medical advice — owners confirm with their vet.
 */
export const VACCINE_CATALOG: VaccineCatalogItem[] = [
  {
    key: 'rabies',
    labelUk: 'Сказ (Rabies)',
    species: ['dog', 'cat'],
    typicalMonths: 12,
  },
  {
    key: 'dog-combo',
    labelUk: 'Комплекс собаки (чума / парво / адено…)',
    species: ['dog'],
    typicalMonths: 12,
  },
  {
    key: 'lepto',
    labelUk: 'Лептоспіроз',
    species: ['dog'],
    typicalMonths: 12,
  },
  {
    key: 'bordetella',
    labelUk: 'Бордетельоз (вольєрний кашель)',
    species: ['dog'],
    typicalMonths: 12,
  },
  {
    key: 'cat-combo',
    labelUk: 'Комплекс кота (панлейкопенія / герпес / кальцівірус)',
    species: ['cat'],
    typicalMonths: 12,
  },
  {
    key: 'felv',
    labelUk: 'Вірус лейкозу котів (FeLV)',
    species: ['cat'],
    typicalMonths: 12,
  },
  {
    key: 'other',
    labelUk: 'Інше (своя назва)',
    species: ['dog', 'cat', 'other'],
  },
];

export function vaccinesForSpecies(
  species: CompanionSpecies,
): VaccineCatalogItem[] {
  return VACCINE_CATALOG.filter((v) => v.species.includes(species));
}

export function vaccineLabel(key: string | null | undefined): string | null {
  if (!key) return null;
  return VACCINE_CATALOG.find((v) => v.key === key)?.labelUk ?? null;
}

export function addMonthsIso(isoDate: string, months: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  if (Number.isNaN(d.getTime())) return isoDate;
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}
