export type CompanionSpecies = 'dog' | 'cat' | 'bird' | 'other';

export type PetSex = 'female' | 'male' | 'unknown';

export type PetOrigin = 'home' | 'shelter' | 'breeder';

export type CoatType = 'short' | 'long' | 'wire' | 'curly' | 'hairless' | 'unknown';

export type SizeCategory = 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'unknown';

export type ActivityLevel = 'low' | 'medium' | 'high' | 'unknown';

export type DietType = 'dry' | 'wet' | 'mixed' | 'raw' | 'homemade' | 'unknown';

export type LifeStage = 'puppy' | 'kitten' | 'adult' | 'senior' | 'unknown';

export type IndoorOutdoor = 'indoor' | 'outdoor' | 'both' | 'unknown';

export type PetRow = {
  id: string;
  user_id: string;
  name: string;
  species: CompanionSpecies;
  breed: string | null;
  sex: PetSex | null;
  birth_date: string | null;
  weight_kg: number | null;
  chip_code: string | null;
  notes: string | null;
  avatar_key: string | null;
  avatar_path: string | null;
  avatar_uri?: string | null;
  favorite_food: string | null;
  favorite_product_id: string | null;
  origin: PetOrigin;
  color_coat: string | null;
  coat_type: CoatType | null;
  size_category: SizeCategory | null;
  sterilized: boolean | null;
  allergies: string | null;
  conditions: string | null;
  medications: string | null;
  activity_level: ActivityLevel | null;
  diet_type: DietType | null;
  life_stage: LifeStage | null;
  indoor_outdoor: IndoorOutdoor | null;
  personality: string | null;
  distinctive_marks: string | null;
  acquired_date: string | null;
  passport_number: string | null;
  vet_name: string | null;
  vet_phone: string | null;
  ideal_weight_kg: number | null;
  extras: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type PetInput = {
  name: string;
  species: CompanionSpecies;
  breed?: string | null;
  sex?: PetSex | null;
  birth_date?: string | null;
  weight_kg?: number | null;
  chip_code?: string | null;
  notes?: string | null;
  avatar_key?: string | null;
  avatar_path?: string | null;
  avatar_uri?: string | null;
  favorite_food?: string | null;
  favorite_product_id?: string | null;
  origin?: PetOrigin;
  color_coat?: string | null;
  coat_type?: CoatType | null;
  size_category?: SizeCategory | null;
  sterilized?: boolean | null;
  allergies?: string | null;
  conditions?: string | null;
  medications?: string | null;
  activity_level?: ActivityLevel | null;
  diet_type?: DietType | null;
  life_stage?: LifeStage | null;
  indoor_outdoor?: IndoorOutdoor | null;
  personality?: string | null;
  distinctive_marks?: string | null;
  acquired_date?: string | null;
  passport_number?: string | null;
  vet_name?: string | null;
  vet_phone?: string | null;
  ideal_weight_kg?: number | null;
  /** Merged into extras (bird wingspan, cage, rodent/rabbit kind, …) */
  extras_patch?: Record<string, unknown> | null;
};

export type PetPhotoRow = {
  id: string;
  pet_id: string;
  user_id: string;
  storage_path: string | null;
  local_uri: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
};
