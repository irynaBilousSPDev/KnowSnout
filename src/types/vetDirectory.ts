export type VetSpecializationId =
  | 'therapy'
  | 'dentistry'
  | 'dermatology'
  | 'cardiology'
  | 'ophthalmology'
  | 'neurology'
  | 'orthopedics'
  | 'surgery';

export type VetVerificationBadge = {
  id: string;
  labelKey: string;
  verified: boolean;
};

export type VetClinicRef = {
  id: string;
  name: string;
  city: string;
  schedule: string;
};

export type VetDoctor = {
  id: string;
  name: string;
  title: string;
  yearsPractice: number;
  rating: number;
  reviewCount: number;
  languages: string[];
  specializations: string[];
  species: string[];
  clinics: VetClinicRef[];
  about: string;
  education: string;
  verification: VetVerificationBadge[];
  skillRatings: { label: string; rating: number; count: number }[];
  featuredReview?: {
    author: string;
    rating: number;
    reason: string;
    text: string;
    confirmed: boolean;
  };
  listSubtitle?: string;
  promoted?: boolean;
  noReviewsYet?: boolean;
  verificationTags?: string[];
};

export type VetClinic = {
  id: string;
  name: string;
  address: string;
  city: string;
  openUntil?: string;
  weekendNote?: string;
  googleRating: number;
  googleCount: number;
  communityRating: number;
  communityCount: number;
  doctors: { id: string; name: string; subtitle: string; rating: number }[];
  featuredReview?: {
    author: string;
    rating: number;
    text: string;
    confirmed: boolean;
  };
};

export type VetPetChip = {
  id: string;
  name: string;
  speciesLabel: string;
};

export type ProRoleId = 'vet' | 'cynologist' | 'groomer';
