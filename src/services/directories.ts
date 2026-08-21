import { getCloudUser } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { supabase } from '@/src/services/supabase';

export type DirectoryCategoryId =
  | 'vets'
  | 'breeders'
  | 'transport'
  | 'sitters'
  | 'insurance'
  | 'lodging';

export type VerificationStatus = 'verified' | 'pending' | 'unverified';

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
  /** Transport / carriers (F4b/c) */
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
];

/**
 * Local seed + cloud merge (directory_places).
 * SQL: 20260321242000_directories_trust.sql + 244000 seeds.
 */
const SEED: DirectoryPlace[] = [
  {
    id: 'vet-1',
    category: 'vets',
    name: 'Клініка «Лапка»',
    city: 'Київ',
    specialty: 'Загальна практика',
    verification: 'verified',
    rating: 4.8,
    reviewCount: 124,
    phone: '+380441112233',
    blurb: 'Mock клініка для тестів довідника.',
  },
  {
    id: 'vet-2',
    category: 'vets',
    name: 'VetCare Lviv',
    city: 'Львів',
    specialty: 'Хірургія',
    verification: 'pending',
    rating: 4.5,
    reviewCount: 38,
    blurb: 'Очікує верифікацію (mock).',
  },
  {
    id: 'br-1',
    category: 'breeders',
    name: 'FCI Kennel Nord',
    city: 'Варшава',
    specialty: 'Лабрадор',
    verification: 'verified',
    rating: 4.6,
    reviewCount: 22,
    blurb: 'Mock заводчик з FCI-статусом у UI.',
  },
  {
    id: 'tr-1',
    category: 'transport',
    name: 'PetRide UA',
    city: 'Київ',
    specialty: 'Міжміські рейси',
    verification: 'verified',
    rating: 4.2,
    reviewCount: 15,
    phone: '+380501112233',
    blurb: 'Перевезення тварин Київ ↔ Польща (mock).',
    routes: ['Київ → Варшава', 'Київ → Краків', 'Львів → Вроцлав'],
    vehicleType: 'Мінівен з клітками + клімат-контроль',
    reviewsBlurb: 'Власники хвалять спокійну посадку і SMS-статус у дорозі.',
  },
  {
    id: 'tr-2',
    category: 'transport',
    name: 'Snout Shuttle PL',
    city: 'Варшава',
    specialty: 'Аеропорт / EU',
    verification: 'verified',
    rating: 4.7,
    reviewCount: 48,
    phone: '+48221234567',
    blurb: 'Трансфер до аеропорту з вет-документами в чеклісті (mock).',
    routes: ['Варшава Chopin ↔ місто', 'Варшава → Берлін', 'Краків → Прага'],
    vehicleType: 'Фургон IATA-клітки',
    reviewsBlurb: 'Зручно для виїзду за кордон; просять паспорт тварини заздалегідь.',
  },
  {
    id: 'tr-3',
    category: 'transport',
    name: 'Лапка Експрес',
    city: 'Львів',
    specialty: 'Локальні поїздки',
    verification: 'pending',
    rating: 4.0,
    reviewCount: 11,
    blurb: 'Короткі рейси Львів область + Київ (mock, на перевірці).',
    routes: ['Львів → Київ', 'Львів → Ужгород'],
    vehicleType: 'Легковий автомобіль + переноска',
    reviewsBlurb: 'Добре для коротких поїздок; міжміські ще в тесті.',
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

export async function listDirectoryPlaces(
  category: DirectoryCategoryId,
  cityFilter?: string,
): Promise<DirectoryPlace[]> {
  const city = cityFilter?.trim().toLowerCase();
  const local = SEED.filter(
    (p) =>
      p.category === category &&
      (!city || p.city.toLowerCase().includes(city)),
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
    return [...byId.values()];
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
