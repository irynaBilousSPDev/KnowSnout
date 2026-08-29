export type BehaviorProblemId =
  | 'separation-anxiety'
  | 'aggression'
  | 'basic-training'
  | 'potty'
  | 'shelter-adaptation'
  | 'other';

export type WorkFormatId = 'online' | 'home-visit' | 'at-specialist';

export type SpecialistPet = {
  id: string;
  nameKey: string;
  metaKey: string;
};

export type BehaviorProblem = {
  id: BehaviorProblemId;
  titleKey: string;
  subtitleKey: string;
  iconTint: string;
};

export type SpecialistService = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  priceUah: number;
  iconTint: string;
};

export type TopicRating = {
  topicKey: string;
  count: number;
  rating: number;
};

export type SpecialistProfile = {
  id: string;
  name: string;
  roles: string[];
  yearsPractice: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  problems: string[];
  services: SpecialistService[];
  approachKey: string;
  verification: string[];
  topicRatings: TopicRating[];
  sponsored?: boolean;
  subtitleKey?: string;
  badges?: { labelKey: string; tint?: 'green' | 'grey' | 'ad' }[];
};

export type BookingService = {
  id: string;
  titleKey: string;
  subtitleKey?: string;
  durationMin: number;
  priceUah: number;
  format: WorkFormatId;
};

export type SpecialistTariff = {
  id: 'free' | 'pro' | 'premium';
  titleKey: string;
  priceKey: string;
  bodyKey: string;
  features: string[];
  current?: boolean;
};
