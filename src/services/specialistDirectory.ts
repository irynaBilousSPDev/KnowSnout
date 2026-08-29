import type {
  BehaviorProblem,
  BehaviorProblemId,
  SpecialistPet,
  SpecialistProfile,
  SpecialistTariff,
} from '@/src/types/specialistDirectory';

export {
  BOOKING_DATES,
  BOOKING_SERVICES,
  BOOKING_TIMES,
  VET_BOOKING_SERVICES,
} from '@/src/services/booking';

export const DEMO_PETS: SpecialistPet[] = [
  { id: 'tukan', nameKey: 'specialist.pet.tukanName', metaKey: 'specialist.pet.tukanMeta' },
  { id: 'pukh', nameKey: 'specialist.pet.pukhName', metaKey: 'specialist.pet.pukhMeta' },
];

export const BEHAVIOR_PROBLEMS: BehaviorProblem[] = [
  {
    id: 'separation-anxiety',
    titleKey: 'specialist.problem.separationTitle',
    subtitleKey: 'specialist.problem.separationSub',
    iconTint: '#EAF7F3',
  },
  {
    id: 'aggression',
    titleKey: 'specialist.problem.aggressionTitle',
    subtitleKey: 'specialist.problem.aggressionSub',
    iconTint: '#F3E0D8',
  },
  {
    id: 'basic-training',
    titleKey: 'specialist.problem.trainingTitle',
    subtitleKey: 'specialist.problem.trainingSub',
    iconTint: '#EEFBF0',
  },
  {
    id: 'potty',
    titleKey: 'specialist.problem.pottyTitle',
    subtitleKey: 'specialist.problem.pottySub',
    iconTint: '#EAE7E2',
  },
  {
    id: 'shelter-adaptation',
    titleKey: 'specialist.problem.shelterTitle',
    subtitleKey: 'specialist.problem.shelterSub',
    iconTint: '#EDE8E4',
  },
  {
    id: 'other',
    titleKey: 'specialist.problem.otherTitle',
    subtitleKey: 'specialist.problem.otherSub',
    iconTint: '#EAE7E2',
  },
];

const SPECIALISTS: SpecialistProfile[] = [
  {
    id: 'natalia-dmytruk',
    name: 'Наталя Дмитрук',
    roles: ['Поведінковий спеціаліст', 'Кінолог'],
    yearsPractice: 8,
    rating: 4.9,
    reviewCount: 52,
    languages: ['укр', 'пол'],
    problems: ['Тривога розлуки', 'Реактивність', 'Адаптація з притулку', 'Страхи й фобії'],
    services: [
      {
        id: 'online',
        titleKey: 'specialist.service.onlineTitle',
        subtitleKey: 'specialist.service.onlineSub',
        priceUah: 900,
        iconTint: '#EAF7F3',
      },
      {
        id: 'home',
        titleKey: 'specialist.service.homeTitle',
        subtitleKey: 'specialist.service.homeSub',
        priceUah: 1800,
        iconTint: '#EAF7F3',
      },
      {
        id: 'course',
        titleKey: 'specialist.service.courseTitle',
        subtitleKey: 'specialist.service.courseSub',
        priceUah: 7500,
        iconTint: '#F3E0D8',
      },
    ],
    approachKey: 'specialist.nataliaApproach',
    verification: ['Особу', 'Професійні дані', 'Документи'],
    topicRatings: [
      { topicKey: 'specialist.topic.separation', count: 31, rating: 5.0 },
      { topicKey: 'specialist.topic.reactivity', count: 14, rating: 4.8 },
      { topicKey: 'specialist.topic.adaptation', count: 7, rating: 4.7 },
    ],
    sponsored: true,
    subtitleKey: 'specialist.card.nataliaSub',
    badges: [
      { labelKey: 'specialist.badge.separationCases', tint: 'green' },
    ],
  },
  {
    id: 'andriy-bondar',
    name: 'Андрій Бондар',
    roles: ['Кінолог'],
    yearsPractice: 6,
    rating: 4.8,
    reviewCount: 74,
    languages: ['укр'],
    problems: ['Реактивність', 'Базове навчання'],
    services: [],
    approachKey: 'specialist.andriyApproach',
    verification: ['Документи'],
    topicRatings: [],
    subtitleKey: 'specialist.card.andriySub',
    badges: [{ labelKey: 'specialist.badge.docs', tint: 'green' }],
  },
  {
    id: 'kasia-nowak',
    name: 'Kasia Nowak',
    roles: ['Зоопсихолог'],
    yearsPractice: 5,
    rating: 4.7,
    reviewCount: 39,
    languages: ['пол', 'англ'],
    problems: ['Тривога розлуки'],
    services: [],
    approachKey: 'specialist.kasiaApproach',
    verification: [],
    topicRatings: [],
    subtitleKey: 'specialist.card.kasiaSub',
    badges: [{ labelKey: 'specialist.badge.langPlEn', tint: 'grey' }],
  },
  {
    id: 'oleg-tkachenko',
    name: 'Олег Ткаченко',
    roles: ['Кінолог'],
    yearsPractice: 3,
    rating: 0,
    reviewCount: 0,
    languages: ['укр'],
    problems: ['Базове навчання'],
    services: [],
    approachKey: 'specialist.olegApproach',
    verification: [],
    topicRatings: [],
    subtitleKey: 'specialist.card.olegSub',
    badges: [{ labelKey: 'specialist.badge.noReviews', tint: 'grey' }],
  },
];

export const SPECIALIST_TARIFFS: SpecialistTariff[] = [
  {
    id: 'free',
    titleKey: 'specialist.tariff.freeTitle',
    priceKey: 'specialist.tariff.freePrice',
    bodyKey: 'specialist.tariff.freeBody',
    features: [],
    current: true,
  },
  {
    id: 'pro',
    titleKey: 'specialist.tariff.proTitle',
    priceKey: 'specialist.tariff.proPrice',
    bodyKey: 'specialist.tariff.proBody',
    features: [
      'specialist.tariff.proF1',
      'specialist.tariff.proF2',
      'specialist.tariff.proF3',
    ],
  },
  {
    id: 'premium',
    titleKey: 'specialist.tariff.premiumTitle',
    priceKey: 'specialist.tariff.premiumPrice',
    bodyKey: 'specialist.tariff.premiumBody',
    features: [
      'specialist.tariff.premiumF1',
      'specialist.tariff.premiumF2',
      'specialist.tariff.premiumF3',
    ],
  },
];

export function getBehaviorProblem(id: BehaviorProblemId): BehaviorProblem | null {
  return BEHAVIOR_PROBLEMS.find((p) => p.id === id) ?? null;
}

export function listSpecialistsForProblem(problemId: BehaviorProblemId): SpecialistProfile[] {
  if (problemId === 'separation-anxiety') return SPECIALISTS;
  return SPECIALISTS.filter((s) => s.id !== 'oleg-tkachenko');
}

export function getSpecialist(id: string): SpecialistProfile | null {
  return SPECIALISTS.find((s) => s.id === id) ?? null;
}

export function getProblemTitleKey(id: BehaviorProblemId): string {
  return getBehaviorProblem(id)?.titleKey ?? 'specialist.problem.separationTitle';
}
