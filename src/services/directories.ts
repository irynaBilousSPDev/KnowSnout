import { getCloudUser } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { t } from '@/src/i18n';
import { supabase } from '@/src/services/supabase';

export type DirectoryCategoryId =
  | 'vets'
  | 'breeders'
  | 'transport'
  | 'sitters'
  | 'insurance'
  | 'lodging'
  | 'shops';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

export type DirectoryLanguage = {
  flag: string;
  label: string;
};

export type DirectoryPlace = {
  id: string;
  category: DirectoryCategoryId;
  name: string;
  city: string;
  specialty?: string;
  verification: VerificationStatus;
  rating: number;
  reviewCount: number;
  phone?: string;
  blurb: string;
  address?: string;
  specialties?: string[];
  languages?: DirectoryLanguage[];
  priceLevel?: number;
  tripCount?: number;
  complaintCount?: number;
  featuredReview?: string;
  thumbLabel?: string;
  heroLabel?: string;
  listSubtitle?: string;
  species?: string[];
  reportContext?: string;
  /** Transport / carriers */
  routes?: string[];
  vehicleType?: string;
  reviewsBlurb?: string;
};

export const DIRECTORY_CATEGORIES: { id: DirectoryCategoryId }[] = [
  { id: 'vets' },
  { id: 'breeders' },
  { id: 'transport' },
  { id: 'sitters' },
  { id: 'insurance' },
  { id: 'lodging' },
  { id: 'shops' },
];

/** 06.01 hub grid — six tiles on mock (shops elsewhere). */
export const DIRECTORY_HUB_CATEGORIES: { id: DirectoryCategoryId }[] = [
  { id: 'vets' },
  { id: 'breeders' },
  { id: 'transport' },
  { id: 'sitters' },
  { id: 'insurance' },
  { id: 'lodging' },
];

/**
 * Local seed + cloud merge (directory_places).
 * SQL: 20260321242000_directories_trust.sql + 244000 seeds.
 */
const SEED: DirectoryPlace[] = [
  {
    id: 'vet-specvet',
    category: 'vets',
    name: 'SpecVet Mokotów',
    city: 'Варшава',
    specialty: 'Стоматологія · Офтальмологія',
    listSubtitle: 'Стоматологія · Офтальмологія',
    specialties: ['Стоматологія', 'Офтальмологія'],
    languages: [
      { flag: 'UA', label: 'укр' },
      { flag: 'GB', label: 'англ' },
    ],
    address: 'Józefa i Jana Rostafińskich 4, Варшава',
    verification: 'verified',
    rating: 4.8,
    reviewCount: 126,
    priceLevel: 2,
    phone: '+48221234567',
    blurb:
      'Прийом англійською та українською, запис онлайн. Стоматологічні операції — від 2000 zł (без аналізів).',
    thumbLabel: 'Клініка',
    heroLabel: 'Фото клініки',
  },
  {
    id: 'vet-saska',
    category: 'vets',
    name: 'SaskaVet',
    city: 'Варшава',
    specialty: 'Загальна практика · Вакцинація',
    listSubtitle: 'Загальна практика · Вакцинація',
    languages: [{ flag: 'UA', label: 'укр' }],
    verification: 'verified',
    rating: 4.9,
    reviewCount: 89,
    blurb: 'Загальна практика та вакцинація (mock).',
    thumbLabel: 'Клініка',
    heroLabel: 'Фото клініки',
  },
  {
    id: 'vet-zwiro',
    category: 'vets',
    name: 'ZwiroPolis',
    city: 'Варшава',
    specialty: 'Цілодобово · Невролог',
    listSubtitle: 'Цілодобово · Невролог',
    languages: [{ flag: 'PL', label: 'пол' }],
    verification: 'unverified',
    rating: 4.6,
    reviewCount: 34,
    blurb: 'Цілодобова клініка, неврологія (mock).',
    thumbLabel: 'Клініка',
    heroLabel: 'Фото клініки',
  },
  {
    id: 'br-shiba',
    category: 'breeders',
    name: 'Shiba Magical Bijin',
    city: 'під Краковом',
    specialty: 'Шиба-іну',
    listSubtitle: 'Шиба-іну · під Краковом',
    verification: 'verified',
    rating: 4.7,
    reviewCount: 18,
    blurb: 'Заводчик шиба-іну з FCI (mock).',
    thumbLabel: 'Собака',
    heroLabel: 'Фото розплідника',
  },
  {
    id: 'br-poodle',
    category: 'breeders',
    name: 'Toy Poodle Варшава',
    city: 'Варшава',
    specialty: 'Той-пудель',
    listSubtitle: 'Той-пудель',
    verification: 'unverified',
    rating: 4.2,
    reviewCount: 6,
    blurb: 'Той-пудель без підтвердження FCI (mock).',
    thumbLabel: 'Собака',
    heroLabel: 'Фото розплідника',
  },
  {
    id: 'tr-pettrans',
    category: 'transport',
    name: 'PetTrans UA-PL',
    city: 'UA → PL',
    specialty: 'Україна → Польща · Собаки, коти',
    listSubtitle: 'Україна → Польща · Собаки, коти',
    species: ['Собаки', 'Коти'],
    verification: 'verified',
    rating: 4.7,
    reviewCount: 42,
    tripCount: 42,
    complaintCount: 0,
    phone: '+380501112233',
    blurb: 'Регулярні рейси через Рава-Руська та Угринів',
    featuredReview:
      'Перевірили всі документи заздалегідь, попередили про 48-годинне вікно обробки від паразитів. Все пройшло без проблем.',
    routes: ['Україна → Польща'],
    vehicleType: 'Мінівен з клітками',
    thumbLabel: 'Авто',
    heroLabel: 'Фото перевізника',
    reportContext: 'Домовились за гроші, тварину не забрали вчасно',
  },
  {
    id: 'tr-private',
    category: 'transport',
    name: 'Приватний водій (Устилуг)',
    city: 'Устилуг',
    specialty: "Пропонує «вирішити на кордоні»",
    listSubtitle: "Пропонує «вирішити на кордоні»",
    verification: 'unverified',
    rating: 3.1,
    reviewCount: 8,
    complaintCount: 2,
    blurb: 'Приватний перевізник без верифікації (mock).',
    thumbLabel: 'Авто',
    heroLabel: 'Фото перевізника',
    reportContext: 'Домовились за гроші, тварину не забрали вчасно',
  },
  {
    id: 'sit-1',
    category: 'sitters',
    name: 'Ania Pet Sitter',
    city: 'Краків',
    verification: 'unverified',
    rating: 4.9,
    reviewCount: 9,
    blurb: 'Догляд вдома (mock).',
    thumbLabel: 'Профіль',
    heroLabel: 'Фото профілю',
  },
  {
    id: 'ins-1',
    category: 'insurance',
    name: 'SnoutCover',
    city: 'Онлайн',
    verification: 'pending',
    rating: 4.0,
    reviewCount: 5,
    blurb: 'Страхування — лише UI shell.',
    thumbLabel: 'Пакет',
    heroLabel: 'Логотип',
  },
  {
    id: 'lod-1',
    category: 'lodging',
    name: 'Paws Hotel',
    city: 'Одеса',
    verification: 'verified',
    rating: 4.7,
    reviewCount: 41,
    blurb: 'Pet-friendly житло (mock).',
    thumbLabel: 'Житло',
    heroLabel: 'Фото житла',
  },
  {
    id: 'shop-1',
    category: 'shops',
    name: 'MasterZoo',
    city: 'Київ',
    specialty: 'Мережа + інтернет-магазин',
    verification: 'verified',
    rating: 4.5,
    reviewCount: 210,
    blurb: 'Mock пет-магазин UA. Живі офери — пізніше (партнер/API).',
    thumbLabel: 'Магазин',
    heroLabel: 'Фото магазину',
  },
  {
    id: 'shop-2',
    category: 'shops',
    name: 'Kakadu',
    city: 'Warszawa',
    specialty: 'Мережа PL',
    verification: 'verified',
    rating: 4.4,
    reviewCount: 88,
    blurb: 'Mock стаціонарний магазин PL (≤30 км на результаті скану — мок).',
    thumbLabel: 'Магазин',
    heroLabel: 'Фото магазину',
  },
  {
    id: 'shop-3',
    category: 'shops',
    name: 'Allegro (маркетплейс)',
    city: 'Онлайн · PL',
    specialty: 'Онлайн',
    verification: 'pending',
    rating: 4.6,
    reviewCount: 0,
    blurb: 'Один з PL онлайн-каналів, не єдина платформа.',
    thumbLabel: 'Магазин',
    heroLabel: 'Фото магазину',
  },
];

function mapCloudPlace(row: Record<string, unknown>): DirectoryPlace {
  return {
    id: String(row.id),
    category: row.category as DirectoryCategoryId,
    name: String(row.name),
    city: String(row.city),
    specialty: row.specialty ? String(row.specialty) : undefined,
    verification: (row.verification as VerificationStatus) || 'unverified',
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    phone: row.phone ? String(row.phone) : undefined,
    blurb: String(row.blurb ?? ''),
    routes: Array.isArray(row.routes)
      ? (row.routes as string[])
      : undefined,
    vehicleType: row.vehicle_type ? String(row.vehicle_type) : undefined,
    reviewsBlurb: row.reviews_blurb ? String(row.reviews_blurb) : undefined,
  };
}

function sortSeed(category: DirectoryCategoryId, rows: DirectoryPlace[]): DirectoryPlace[] {
  const order: Partial<Record<DirectoryCategoryId, string[]>> = {
    vets: ['vet-specvet', 'vet-saska', 'vet-zwiro'],
    breeders: ['br-shiba', 'br-poodle'],
    transport: ['tr-pettrans', 'tr-private'],
  };
  const ids = order[category];
  if (!ids) return rows;
  return [...rows].sort((a, b) => {
    const ai = ids.indexOf(a.id);
    const bi = ids.indexOf(b.id);
    if (ai === -1 && bi === -1) return 0;
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

export async function listDirectoryPlaces(
  category: DirectoryCategoryId,
  cityFilter?: string,
): Promise<DirectoryPlace[]> {
  const city = cityFilter?.trim().toLowerCase();
  const local = sortSeed(
    category,
    SEED.filter(
      (p) =>
        p.category === category &&
        (!city || p.city.toLowerCase().includes(city)),
    ),
  );

  const user = await getCloudUser();
  if (!user || !supabase) return local;

  try {
    let q = supabase
      .from('directory_places')
      .select(
        'id, category, name, city, specialty, verification, rating, review_count, phone, blurb, routes, vehicle_type, reviews_blurb',
      )
      .eq('category', category);
    if (city) q = q.ilike('city', `%${cityFilter!.trim()}%`);
    const { data, error } = await q;
    if (error) {
      if (isMissingSchemaError(error.message)) return local;
      return local;
    }
    if (!data?.length) return local;
    const cloud = data.map((row) => mapCloudPlace(row as Record<string, unknown>));
    const byId = new Map<string, DirectoryPlace>();
    for (const p of [...local, ...cloud]) byId.set(p.id, p);
    return sortSeed(category, [...byId.values()]);
  } catch {
    return local;
  }
}

export async function listCarriers(
  cityFilter?: string,
): Promise<DirectoryPlace[]> {
  return listDirectoryPlaces('transport', cityFilter);
}

export async function getDirectoryPlace(
  id: string,
): Promise<DirectoryPlace | null> {
  const fromSeed = SEED.find((p) => p.id === id);
  if (fromSeed) return fromSeed;

  const user = await getCloudUser();
  if (!user || !supabase) return null;
  try {
    const { data, error } = await supabase
      .from('directory_places')
      .select(
        'id, category, name, city, specialty, verification, rating, review_count, phone, blurb, routes, vehicle_type, reviews_blurb',
      )
      .eq('id', id)
      .maybeSingle();
    if (error || !data) return null;
    return mapCloudPlace(data as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function listCarrierCities(): string[] {
  const set = new Set(
    SEED.filter((p) => p.category === 'transport').map((p) => p.city),
  );
  return [...set].sort((a, b) => a.localeCompare(b, 'uk'));
}

export function directoryReportContextLine(place: DirectoryPlace): string | undefined {
  if (!place.reportContext) return undefined;
  const type = t(`directories.reportType.${place.category}`);
  return `${type} · «${place.reportContext}»`;
}
