import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  ProRoleId,
  VetClinic,
  VetDoctor,
  VetPetChip,
  VetSpecializationId,
} from '@/src/types/vetDirectory';

export type { ProRoleId } from '@/src/types/vetDirectory';

const PRO_PROFILE_KEY = 'knowsnout:vet-pro-profile';

export const VET_PET_CHIPS: VetPetChip[] = [
  { id: 'pet-tukan', name: 'Тукан', speciesLabel: 'пес' },
  { id: 'pet-puh', name: 'Пух', speciesLabel: 'кіт' },
];

export const VET_SPECIALIZATIONS: { id: VetSpecializationId; label: string }[] =
  [
    { id: 'therapy', label: 'Терапія' },
    { id: 'dentistry', label: 'Стоматологія' },
    { id: 'dermatology', label: 'Дерматологія' },
    { id: 'cardiology', label: 'Кардіологія' },
    { id: 'ophthalmology', label: 'Офтальмологія' },
    { id: 'neurology', label: 'Неврологія' },
    { id: 'orthopedics', label: 'Ортопедія' },
    { id: 'surgery', label: 'Хірургія' },
  ];

const DOCTORS: VetDoctor[] = [
  {
    id: 'dr-shevchenko',
    name: 'Др. Ігор Шевчук',
    title: 'Ветеринарний лікар',
    yearsPractice: 9,
    rating: 4.9,
    reviewCount: 41,
    languages: ['укр', 'пол'],
    specializations: ['Кардіологія'],
    species: ['Собаки'],
    clinics: [
      {
        id: 'clinic-vola',
        name: 'ветклініка «Вола»',
        city: 'Варшава',
        schedule: 'вт, чт',
      },
    ],
    about:
      'Кардіологічна практика, УЗД серця. Спокійний підхід без зайвих призначень.',
    education: 'ЛНУВМБТ, кардіологія · стажування ESVC, 2020',
    verification: [
      { id: 'identity', labelKey: 'vets.verifyIdentity', verified: true },
      { id: 'docs', labelKey: 'vets.verifyDocs', verified: true },
    ],
    skillRatings: [{ label: 'Кардіологія', rating: 4.9, count: 41 }],
    listSubtitle: 'Кардіологія · ветклініка «Вола»',
    promoted: true,
    verificationTags: ['Документи', 'Особу'],
  },
  {
    id: 'dr-kravets',
    name: 'Др. Олена Кравець',
    title: 'Ветеринарний лікар',
    yearsPractice: 11,
    rating: 4.8,
    reviewCount: 63,
    languages: ['укр', 'пол'],
    specializations: ['Кардіологія', 'Терапія'],
    species: ['Собаки', 'Коти', 'Гризуни'],
    clinics: [
      {
        id: 'clinic-vetcare',
        name: 'VetCare Clinic',
        city: 'Варшава',
        schedule: 'пн, ср, пт',
      },
      {
        id: 'clinic-vola',
        name: 'Ветклініка «Вола»',
        city: 'Варшава',
        schedule: 'вт, чт',
      },
    ],
    about:
      'Веду кардіологічних пацієнтів, УЗД серця, підбір терапії при вадах клапанів. Працюю спокійно, без зайвих призначень.',
    education:
      'НУБіП, ветеринарна медицина · курс ESVC з кардіології, 2022',
    verification: [
      { id: 'identity', labelKey: 'vets.verifyIdentity', verified: true },
      {
        id: 'professional',
        labelKey: 'vets.verifyProfessional',
        verified: true,
      },
      { id: 'docs', labelKey: 'vets.verifyDocsMissing', verified: false },
    ],
    skillRatings: [
      { label: 'Кардіологія', rating: 4.9, count: 38 },
      { label: 'Терапія', rating: 4.6, count: 25 },
    ],
    featuredReview: {
      author: 'Марта К.',
      rating: 5.0,
      reason: 'кардіологія',
      text: 'Знайшла шум, який два роки ніхто не чув. Розписала терапію й пояснила, на що дивитися вдома.',
      confirmed: true,
    },
    listSubtitle: 'Терапія, кардіологія · 2 клініки',
    verificationTags: ['Документи', 'Особу'],
  },
  {
    id: 'dr-zielinski',
    name: 'Др. Marek Zieliński',
    title: 'Ветеринарний лікар',
    yearsPractice: 8,
    rating: 4.7,
    reviewCount: 29,
    languages: ['пол'],
    specializations: ['Кардіологія'],
    species: ['Собаки', 'Коти'],
    clinics: [
      {
        id: 'clinic-vetcare',
        name: 'VetCare Clinic',
        city: 'Варшава',
        schedule: 'пн, ср, пт',
      },
    ],
    about: 'Кардіолог, УЗД серця.',
    education: 'SGGW, кардіологія · 2018',
    verification: [
      { id: 'identity', labelKey: 'vets.verifyIdentity', verified: true },
      { id: 'docs', labelKey: 'vets.verifyDocs', verified: true },
    ],
    skillRatings: [{ label: 'Кардіологія', rating: 4.7, count: 29 }],
    listSubtitle: 'Кардіологія · VetCare Clinic',
    verificationTags: ['Документи', 'Особу'],
  },
  {
    id: 'dr-nowak',
    name: 'Др. Anna Nowak',
    title: 'Ветеринарний лікар',
    yearsPractice: 4,
    rating: 0,
    reviewCount: 0,
    languages: ['пол'],
    specializations: ['Терапія'],
    species: ['Собаки', 'Коти'],
    clinics: [
      {
        id: 'clinic-vetcare',
        name: 'VetCare Clinic',
        city: 'Варшава',
        schedule: 'пн–пт',
      },
    ],
    about: 'Загальна терапія, первинний прийом.',
    education: 'SGGW, ветеринарна медицина, 2021',
    verification: [
      { id: 'identity', labelKey: 'vets.verifyIdentity', verified: true },
    ],
    skillRatings: [],
    listSubtitle: 'Терапія · приватна практика',
    noReviewsYet: true,
    verificationTags: ['Особу'],
  },
];

const CLINICS: VetClinic[] = [
  {
    id: 'clinic-vetcare',
    name: 'VetCare Clinic',
    address: 'ul. Wolska 14, Варшава',
    city: 'Варшава',
    openUntil: '20:00',
    weekendNote: 'Цілодобово у вихідні',
    googleRating: 4.6,
    googleCount: 580,
    communityRating: 4.8,
    communityCount: 124,
    phone: '+48221234567',
    website: 'https://vetcare.example.pl',
    doctors: [
      {
        id: 'dr-zielinski',
        name: 'Др. Marek Zieliński',
        subtitle: 'Кардіологія',
        rating: 4.7,
      },
      {
        id: 'dr-kravets',
        name: 'Др. Олена Кравець',
        subtitle: 'Терапія, кардіологія',
        rating: 4.8,
      },
    ],
    featuredReview: {
      author: 'Марта К.',
      rating: 5.0,
      text: 'Приймали ввечері без запису, чесно сказали, що аналізи не потрібні. Не намагалися продати зайве.',
      confirmed: true,
    },
  },
  {
    id: 'clinic-vola',
    name: 'Ветклініка «Вола»',
    address: 'Варшава',
    city: 'Варшава',
    openUntil: '19:00',
    googleRating: 4.5,
    googleCount: 210,
    communityRating: 4.7,
    communityCount: 56,
    phone: '+48229876543',
    website: 'https://vola-vet.example.pl',
    doctors: [
      {
        id: 'dr-kravets',
        name: 'Др. Олена Кравець',
        subtitle: 'Терапія, кардіологія',
        rating: 4.8,
      },
    ],
  },
];

export function listVetDoctors(filters?: {
  specialization?: string;
}): VetDoctor[] {
  let rows = [...DOCTORS];
  if (filters?.specialization) {
    const q = filters.specialization.toLowerCase();
    rows = rows.filter((d) =>
      d.specializations.some((s) => s.toLowerCase().includes(q)),
    );
  }
  return rows;
}

export function getVetDoctor(id: string): VetDoctor | null {
  return DOCTORS.find((d) => d.id === id) ?? null;
}

export function getVetClinic(id: string): VetClinic | null {
  return CLINICS.find((c) => c.id === id) ?? null;
}

export function listVetClinics(): VetClinic[] {
  return [...CLINICS];
}

export type ProProfileDraft = {
  role: ProRoleId;
  fullName: string;
  city: string;
  createdAt: string;
};

export async function loadProProfile(): Promise<ProProfileDraft | null> {
  const raw = await AsyncStorage.getItem(PRO_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ProProfileDraft;
  } catch {
    return null;
  }
}

export async function saveProProfile(draft: ProProfileDraft): Promise<void> {
  await AsyncStorage.setItem(PRO_PROFILE_KEY, JSON.stringify(draft));
}

export const PRO_CABINET_STATS = {
  views: 248,
  opens: 31,
  rating: 4.8,
};
