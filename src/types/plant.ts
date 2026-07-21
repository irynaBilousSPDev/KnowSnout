export type PlantToxicityLevel = 'safe' | 'mild' | 'toxic' | 'unknown';

export type PlantSpeciesTarget = 'dog' | 'cat';

export type PlantToxicity = {
  species: PlantSpeciesTarget;
  level: PlantToxicityLevel;
  notes: string | null;
};

export type PlantRecord = {
  id: string;
  latin: string;
  name_uk: string;
  name_en: string;
  name_pl: string | null;
  aliases: string[];
  toxicity: PlantToxicity[];
};

export type PlantCheckResult = {
  plant: PlantRecord;
  forSpecies: PlantSpeciesTarget;
  level: PlantToxicityLevel;
  notes: string | null;
  confidence: number;
  source: 'seed' | 'cache' | 'photo';
  matchedQuery?: string;
};
