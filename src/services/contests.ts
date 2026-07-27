import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  ContestEntry,
  ContestPeriod,
  ContestPublicOwner,
  ContestPublicPet,
} from '@/src/types/contest';
import type { PetPhotoRow, PetRow } from '@/src/types/pet';
import type { UserProfile } from '@/src/types/userProfile';

const ENTRIES_KEY = 'snoutscore.contest_entries_v2';
const HEARTS_KEY = 'snoutscore.contest_hearted_v1';

export function buildContestPublicPet(
  pet: PetRow,
  photos: PetPhotoRow[],
): ContestPublicPet {
  const galleryUris = photos
    .map((p) => p.local_uri)
    .filter((uri): uri is string => Boolean(uri));
  return {
    breed: pet.breed,
    sex: pet.sex,
    birthDate: pet.birth_date,
    colorCoat: pet.color_coat,
    coatType: pet.coat_type,
    sizeCategory: pet.size_category,
    personality: pet.personality,
    distinctiveMarks: pet.distinctive_marks,
    origin: pet.origin,
    galleryUris,
  };
}

export function buildContestPublicOwner(
  profile: UserProfile | null,
): ContestPublicOwner {
  return {
    displayName: profile?.display_name?.trim() || 'Учасник KnowSnout',
    avatarKey: profile?.avatar_key,
    avatarUri: profile?.avatar_uri,
    gender: profile?.gender,
  };
}

function seedEntries(): ContestEntry[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'seed-day-1',
      period: 'day',
      contestId: 'day-sunny-snout',
      petName: 'Ада',
      caption: 'Сонячний ранок',
      species: 'cat',
      avatarKey: 'cat-1',
      hearts: 42,
      createdAt: now,
      owner: {
        displayName: 'Ірина',
        avatarKey: 'woman-1',
        gender: 'woman',
      },
      publicPet: {
        breed: 'Британська короткошерста',
        sex: 'female',
        birthDate: '2021-04-12',
        colorCoat: 'блакитний',
        coatType: 'short',
        sizeCategory: 'medium',
        personality: 'Лагідна, любить підвіконня і ранкове сонце',
        distinctiveMarks: 'Біла цятка на грудях',
        origin: 'home',
        galleryUris: [],
      },
    },
    {
      id: 'seed-day-2',
      period: 'day',
      contestId: 'day-sunny-snout',
      petName: 'Мурка',
      caption: 'Очі як два ліхтарі',
      species: 'cat',
      avatarKey: 'cat-2',
      hearts: 28,
      createdAt: now,
      owner: {
        displayName: 'Оля',
        avatarKey: 'woman-2',
        gender: 'woman',
      },
      publicPet: {
        breed: 'Домашня',
        sex: 'female',
        birthDate: '2019-08-01',
        colorCoat: 'триколірна',
        coatType: 'short',
        sizeCategory: 'small',
        personality: 'Допитлива й голосна, коли хоче їсти',
        origin: 'shelter',
        galleryUris: [],
      },
    },
    {
      id: 'seed-week-1',
      period: 'week',
      contestId: 'week-play-time',
      petName: 'Рекс',
      caption: 'Переможець прогулянок',
      species: 'dog',
      avatarKey: 'dog-1',
      hearts: 128,
      createdAt: now,
      owner: {
        displayName: 'Андрій',
        avatarKey: 'man-1',
        gender: 'man',
      },
      publicPet: {
        breed: 'Лабрадор',
        sex: 'male',
        birthDate: '2020-06-15',
        colorCoat: 'золотистий',
        coatType: 'short',
        sizeCategory: 'large',
        personality: 'Дружній до всіх на майданчику',
        origin: 'home',
        galleryUris: [],
      },
    },
    {
      id: 'seed-month-1',
      period: 'month',
      contestId: 'month-cozy',
      petName: 'Белла',
      caption: 'Мордочка місяця',
      species: 'cat',
      avatarKey: 'cat-2',
      hearts: 510,
      createdAt: now,
      owner: {
        displayName: 'Марта',
        avatarKey: 'woman-3',
        gender: 'woman',
      },
      publicPet: {
        breed: 'Мейн-кун',
        sex: 'female',
        birthDate: '2022-01-20',
        colorCoat: 'рудий з білим',
        coatType: 'long',
        sizeCategory: 'large',
        personality: 'Королева дивану',
        distinctiveMarks: 'Пишний хвіст',
        origin: 'home',
        galleryUris: [],
      },
    },
    {
      id: 'seed-year-1',
      period: 'year',
      contestId: 'year-star',
      petName: 'Бім',
      caption: 'Зірка року (демо)',
      species: 'dog',
      avatarKey: 'dog-2',
      hearts: 2048,
      createdAt: now,
      owner: {
        displayName: 'Ігор',
        avatarKey: 'man-2',
        gender: 'man',
      },
      publicPet: {
        breed: 'Коргі',
        sex: 'male',
        birthDate: '2018-11-03',
        colorCoat: 'рудий з білим',
        coatType: 'short',
        sizeCategory: 'small',
        personality: 'Усміхнений оптиміст',
        origin: 'home',
        galleryUris: [],
      },
    },
  ];
}

async function readAll(): Promise<ContestEntry[]> {
  const raw = await AsyncStorage.getItem(ENTRIES_KEY);
  if (!raw) {
    // One-time migrate from v1 if present
    const legacy = await AsyncStorage.getItem('snoutscore.contest_entries_v1');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy) as ContestEntry[];
        const merged = mergeWithSeedDefaults(parsed);
        await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(merged));
        return merged;
      } catch {
        /* fall through to fresh seed */
      }
    }
    const seed = seedEntries();
    await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(seed));
    return seed;
  }
  try {
    return JSON.parse(raw) as ContestEntry[];
  } catch {
    return seedEntries();
  }
}

/** Attach rich demo public profiles when migrating thin v1 seed rows. */
function mergeWithSeedDefaults(entries: ContestEntry[]): ContestEntry[] {
  const byId = new Map(seedEntries().map((e) => [e.id, e]));
  const out = entries.map((e) => {
    const rich = byId.get(e.id);
    if (!rich) return e;
    return {
      ...rich,
      ...e,
      publicPet: e.publicPet ?? rich.publicPet,
      owner: e.owner ?? rich.owner,
    };
  });
  for (const seed of byId.values()) {
    if (!out.some((e) => e.id === seed.id)) out.push(seed);
  }
  return out;
}

async function writeAll(entries: ContestEntry[]) {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

async function readHearted(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(HEARTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function listContestEntries(
  period: ContestPeriod,
): Promise<ContestEntry[]> {
  const all = await readAll();
  return all
    .filter((e) => e.period === period)
    .sort(
      (a, b) =>
        b.hearts - a.hearts || b.createdAt.localeCompare(a.createdAt),
    );
}

export async function getContestEntry(
  id: string,
): Promise<ContestEntry | null> {
  const all = await readAll();
  return all.find((e) => e.id === id) ?? null;
}

export async function getContestWinner(
  period: ContestPeriod,
): Promise<ContestEntry | null> {
  const list = await listContestEntries(period);
  return list[0] ?? null;
}

export async function addContestEntry(input: {
  period: ContestPeriod;
  contestId?: string | null;
  storyPostId?: string | null;
  petName: string;
  caption: string;
  species: 'dog' | 'cat';
  avatarKey: string;
  imageUri?: string | null;
  petId?: string | null;
  publicPet?: ContestPublicPet | null;
  owner?: ContestPublicOwner | null;
}): Promise<ContestEntry> {
  const all = await readAll();
  const entry: ContestEntry = {
    id: `mine-contest-${Date.now()}`,
    period: input.period,
    contestId: input.contestId ?? null,
    storyPostId: input.storyPostId ?? null,
    petName: input.petName.trim() || 'Мій улюбленець',
    caption: input.caption.trim() || 'Учасник конкурсу',
    species: input.species,
    avatarKey: input.avatarKey,
    imageUri: input.imageUri ?? null,
    hearts: 1,
    mine: true,
    createdAt: new Date().toISOString(),
    petId: input.petId ?? null,
    publicPet: input.publicPet ?? null,
    owner: input.owner ?? null,
  };
  await writeAll([entry, ...all]);
  return entry;
}

export async function toggleContestHeart(
  id: string,
): Promise<{ hearts: number; hearted: boolean }> {
  const all = await readAll();
  const hearted = await readHearted();
  const isOn = hearted.includes(id);
  const nextHearted = isOn
    ? hearted.filter((h) => h !== id)
    : [...hearted, id];
  await AsyncStorage.setItem(HEARTS_KEY, JSON.stringify(nextHearted));

  const next = all.map((e) => {
    if (e.id !== id) return e;
    return { ...e, hearts: Math.max(0, e.hearts + (isOn ? -1 : 1)) };
  });
  await writeAll(next);
  const row = next.find((e) => e.id === id);
  return { hearts: row?.hearts ?? 0, hearted: !isOn };
}

export async function listHeartedIds(): Promise<Set<string>> {
  return new Set(await readHearted());
}
