import type { UserAvatarKey, UserGender } from '@/src/constants/userAvatars';
import type {
  CoatType,
  PetOrigin,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';

export type ContestPeriod = 'day' | 'week' | 'month' | 'year';

/** Public-facing pet fields shown on a contest entry (no private medical/vet data). */
export type ContestPublicPet = {
  breed?: string | null;
  sex?: PetSex | null;
  birthDate?: string | null;
  colorCoat?: string | null;
  coatType?: CoatType | null;
  sizeCategory?: SizeCategory | null;
  personality?: string | null;
  distinctiveMarks?: string | null;
  origin?: PetOrigin | null;
  /** Public album URIs (local or remote) */
  galleryUris?: string[];
};

export type ContestPublicOwner = {
  displayName: string;
  avatarKey?: UserAvatarKey | string;
  avatarUri?: string | null;
  gender?: UserGender;
};

export type ContestEntry = {
  id: string;
  period: ContestPeriod;
  /** Editorial spotlight theme id (scaffold) */
  contestId?: string | null;
  /** Optional Stories post this entry was copied from */
  storyPostId?: string | null;
  petName: string;
  caption: string;
  species: 'dog' | 'cat';
  avatarKey: string;
  imageUri?: string | null;
  hearts: number;
  mine?: boolean;
  createdAt: string;
  petId?: string | null;
  publicPet?: ContestPublicPet | null;
  owner?: ContestPublicOwner | null;
};

export const CONTEST_PERIODS: {
  id: ContestPeriod;
  titleKey: string;
  hintKey: string;
}[] = [
  { id: 'day', titleKey: 'contests.periodDay', hintKey: 'contests.hintDay' },
  { id: 'week', titleKey: 'contests.periodWeek', hintKey: 'contests.hintWeek' },
  {
    id: 'month',
    titleKey: 'contests.periodMonth',
    hintKey: 'contests.hintMonth',
  },
  { id: 'year', titleKey: 'contests.periodYear', hintKey: 'contests.hintYear' },
];
