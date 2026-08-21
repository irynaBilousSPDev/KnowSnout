import { t } from '@/src/i18n';
import type { CompanionSpecies, PetRow } from '@/src/types/pet';

export function speciesLabel(species: CompanionSpecies) {
  if (species === 'dog') return t('pets.speciesDog');
  if (species === 'cat') return t('pets.speciesCat');
  if (species === 'bird') return t('pets.speciesBird');
  return t('pets.speciesOther');
}

/** Age string for kit meta lines, e.g. "3 роки" / "1.5 роки". */
export function petAgeLabel(birthDate: string | null | undefined): string | null {
  if (!birthDate) return null;
  const d = new Date(`${birthDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const years = (Date.now() - d.getTime()) / (365.25 * 24 * 3600 * 1000);
  if (years < 1) {
    const months = Math.max(1, Math.round(years * 12));
    return t('pets.ageMonths', { n: months });
  }
  const rounded = Math.round(years * 10) / 10;
  return t('pets.ageYearsLong', { n: rounded });
}

/** Hub / list meta: breed · species · age */
export function petHubMeta(pet: PetRow): string {
  const parts: string[] = [];
  if (pet.breed?.trim()) parts.push(pet.breed.trim());
  parts.push(speciesLabel(pet.species));
  const age = petAgeLabel(pet.birth_date);
  if (age) parts.push(age);
  return parts.join(' · ');
}

/** Profile meta: breed · species · age · weight */
export function petProfileMeta(pet: PetRow): string {
  const parts: string[] = [];
  if (pet.breed?.trim()) parts.push(pet.breed.trim());
  parts.push(speciesLabel(pet.species));
  const age = petAgeLabel(pet.birth_date);
  if (age) parts.push(age);
  if (pet.weight_kg != null) {
    if (pet.species === 'bird' && pet.weight_kg < 2) {
      parts.push(`${Math.round(pet.weight_kg * 1000)} г`);
    } else {
      parts.push(`${pet.weight_kg} ${t('pets.kg')}`);
    }
  }
  return parts.join(' · ');
}
