export type CompanionBreedSpecies = 'dog' | 'cat';

export type BreedGuess = {
  id: string;
  name: string;
  nameUk?: string | null;
  species: CompanionBreedSpecies;
  confidence: number;
  temperament?: string | null;
  bredFor?: string | null;
  origin?: string | null;
  referenceImageUrl?: string | null;
  source: 'mock' | 'thedogapi' | 'thecatapi';
};

export type BreedCheckResult = {
  species: CompanionBreedSpecies;
  primary: BreedGuess;
  alternatives: BreedGuess[];
  disclaimer: true;
};
