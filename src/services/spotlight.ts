import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCloudUser } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { isUuid } from '@/src/lib/uuid';
import { supabase } from '@/src/services/supabase';

/** Spotlight: cloud when signed in + tables exist; guest votes stay local. */

const ENTRIES_KEY = 'knowsnout.spotlight.entries.v1';
const VOTES_KEY = 'knowsnout.spotlight.votes.v1';
const DEVICE_ID_KEY = 'knowsnout.spotlight.device_id.v1';
const GUEST_VOTES_KEY = 'knowsnout.spotlight.guest_votes.v1';

export type SpotlightContest = {
  id: string;
  title: string;
  brief: string;
  status: 'active' | 'closed';
  endsAt: string;
};

export type SpotlightEntry = {
  id: string;
  contestId: string;
  petName: string;
  caption: string;
  author: string;
  votes: number;
  createdAt: string;
};

export type SpotlightWinner = {
  contestId: string;
  contestTitle: string;
  petName: string;
  author: string;
  votes: number;
  wonAt: string;
};

const CONTESTS: SpotlightContest[] = [
  {
    id: 'sp-sunny',
    title: 'Сонячна мордочка',
    brief: 'Світло, вікно, прогулянка — лови момент, коли улюбленець сяє.',
    status: 'active',
    endsAt: '2026-08-28T21:00:00.000Z',
  },
  {
    id: 'sp-play',
    title: 'Гра тижня',
    brief: 'Іграшка, стрибок, «полювання» — покажи, як ви граєте разом.',
    status: 'active',
    endsAt: '2026-08-31T21:00:00.000Z',
  },
];

const RULES_UA = `1. Одна заявка на конкурс від акаунта.
2. Фото має бути твоє або з дозволу власника.
3. Без агресії, реклами й чужих брендів у підписі.
4. Голосування — сердечками; накрутка заборонена.
5. Переможців оголошуємо після дедлайну (демо-локально).`;

const SEED_ENTRIES: SpotlightEntry[] = [
  {
    id: 'se-1',
    contestId: 'sp-sunny',
    petName: 'Ада',
    caption: 'Ранкове сонце на підвіконні',
    author: 'Ірина',
    votes: 42,
    createdAt: '2026-08-18T10:00:00.000Z',
  },
  {
    id: 'se-2',
    contestId: 'sp-sunny',
    petName: 'Рекс',
    caption: 'Тінь і світло в парку',
    author: 'Максим',
    votes: 31,
    createdAt: '2026-08-19T12:00:00.000Z',
  },
  {
    id: 'se-3',
    contestId: 'sp-play',
    petName: 'Мурка',
    caption: 'Полювання на пір’їнку',
    author: 'Оля',
    votes: 27,
    createdAt: '2026-08-17T09:00:00.000Z',
  },
];

const WINNERS: SpotlightWinner[] = [
  {
    contestId: 'sp-past-july',
    contestTitle: 'Затишок липня',
    petName: 'Барон',
    author: 'Катя',
    votes: 118,
    wonAt: '2026-07-31T21:00:00.000Z',
  },
  {
    contestId: 'sp-past-june',
    contestTitle: 'Літня мордочка',
    petName: 'Луна',
    author: 'Діма',
    votes: 96,
    wonAt: '2026-06-30T21:00:00.000Z',
  },
];

async function readEntries(): Promise<SpotlightEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(ENTRIES_KEY);
    if (!raw) {
      await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(SEED_ENTRIES));
      return [...SEED_ENTRIES];
    }
    const parsed = JSON.parse(raw) as SpotlightEntry[];
    return Array.isArray(parsed) ? parsed : [...SEED_ENTRIES];
  } catch {
    return [...SEED_ENTRIES];
  }
}

async function writeEntries(list: SpotlightEntry[]) {
  await AsyncStorage.setItem(ENTRIES_KEY, JSON.stringify(list));
}

async function readVotes(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(VOTES_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as string[];
    return new Set(Array.isArray(ids) ? ids : []);
  } catch {
    return new Set();
  }
}

async function writeVotes(ids: Set<string>) {
  await AsyncStorage.setItem(VOTES_KEY, JSON.stringify([...ids]));
}

export function listSpotlightContests(): SpotlightContest[] {
  return CONTESTS;
}

export function getSpotlightContest(id: string): SpotlightContest | null {
  return CONTESTS.find((c) => c.id === id) ?? null;
}

export function getSpotlightRules(): string {
  return RULES_UA;
}

export async function listSpotlightEntries(
  contestId?: string,
): Promise<SpotlightEntry[]> {
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      let q = supabase
        .from('spotlight_entries')
        .select(
          'id, contest_id, pet_name, caption, author_name, vote_count, created_at',
        )
        .order('vote_count', { ascending: false });
      if (contestId) q = q.eq('contest_id', contestId);
      const { data, error } = await q;
      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: String(row.id),
          contestId: String(row.contest_id),
          petName: String(row.pet_name),
          caption: String(row.caption ?? ''),
          author: String(row.author_name || 'Користувач'),
          votes: Number(row.vote_count ?? 0),
          createdAt: String(row.created_at),
        }));
      }
      if (error && isMissingSchemaError(error.message)) {
        /* local */
      }
    } catch {
      /* local */
    }
  }

  const list = await readEntries();
  const filtered = contestId
    ? list.filter((e) => e.contestId === contestId)
    : list;
  return filtered.sort((a, b) => b.votes - a.votes);
}

export async function listEntriesForContest(
  contestId: string,
): Promise<SpotlightEntry[]> {
  return listSpotlightEntries(contestId);
}

async function getOrCreateDeviceId(): Promise<string> {
  try {
    const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (existing) return existing;
  } catch {
    /* create new */
  }
  const id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}

type GuestVoteMap = Record<string, string[]>;

async function readGuestVotes(): Promise<GuestVoteMap> {
  try {
    const raw = await AsyncStorage.getItem(GUEST_VOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as GuestVoteMap;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeGuestVotes(map: GuestVoteMap) {
  await AsyncStorage.setItem(GUEST_VOTES_KEY, JSON.stringify(map));
}

export async function listGuestVotedEntryIds(
  contestId?: string,
): Promise<Set<string>> {
  const deviceId = await getOrCreateDeviceId();
  const map = await readGuestVotes();
  const ids = map[deviceId] ?? [];
  if (!contestId) return new Set(ids);
  const entries = await listEntriesForContest(contestId);
  const contestEntryIds = new Set(entries.map((e) => e.id));
  return new Set(ids.filter((id) => contestEntryIds.has(id)));
}

export async function castGuestVote(entryId: string): Promise<boolean> {
  const deviceId = await getOrCreateDeviceId();
  const map = await readGuestVotes();
  const voted = new Set(map[deviceId] ?? []);
  if (voted.has(entryId)) return false;

  const list = await readEntries();
  const idx = list.findIndex((e) => e.id === entryId);
  if (idx < 0) return false;

  list[idx] = { ...list[idx], votes: list[idx].votes + 1 };
  voted.add(entryId);
  map[deviceId] = [...voted];
  await writeEntries(list);
  await writeGuestVotes(map);
  return true;
}

export async function applySpotlightEntry(input: {
  contestId: string;
  petName: string;
  caption: string;
  author?: string;
}): Promise<SpotlightEntry> {
  const author = input.author?.trim() || 'Ти';
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('spotlight_entries')
        .insert({
          contest_id: input.contestId,
          user_id: user.id,
          pet_name: input.petName.trim(),
          caption: input.caption.trim(),
          author_name: author,
          vote_count: 0,
        })
        .select(
          'id, contest_id, pet_name, caption, author_name, vote_count, created_at',
        )
        .single();
      if (!error && data) {
        return {
          id: String(data.id),
          contestId: String(data.contest_id),
          petName: String(data.pet_name),
          caption: String(data.caption ?? ''),
          author: String(data.author_name || author),
          votes: Number(data.vote_count ?? 0),
          createdAt: String(data.created_at),
        };
      }
    } catch {
      /* local */
    }
  }

  const list = await readEntries();
  const entry: SpotlightEntry = {
    id: `se-${Date.now()}`,
    contestId: input.contestId,
    petName: input.petName.trim(),
    caption: input.caption.trim(),
    author,
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  await writeEntries(list);
  return entry;
}

export async function voteSpotlightEntry(entryId: string): Promise<boolean> {
  const user = await getCloudUser();
  if (user && supabase && isUuid(entryId)) {
    try {
      const { data, error } = await supabase.rpc('cast_spotlight_vote', {
        p_entry_id: entryId,
      });
      if (!error && data === true) {
        const votes = await readVotes();
        votes.add(entryId);
        await writeVotes(votes);
        return true;
      }
      if (error && !isMissingSchemaError(error.message)) {
        /* fall local for non-uuid seed ids */
      }
    } catch {
      /* local */
    }
  }

  const votes = await readVotes();
  if (votes.has(entryId)) return false;
  const list = await readEntries();
  const idx = list.findIndex((e) => e.id === entryId);
  if (idx < 0) return false;
  list[idx] = { ...list[idx], votes: list[idx].votes + 1 };
  votes.add(entryId);
  await writeEntries(list);
  await writeVotes(votes);
  return true;
}

export async function listVotedEntryIds(): Promise<Set<string>> {
  const local = await readVotes();
  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { data, error } = await supabase
        .from('spotlight_votes')
        .select('entry_id')
        .eq('user_id', user.id);
      if (!error && data) {
        for (const row of data) local.add(String(row.entry_id));
      }
    } catch {
      /* local only */
    }
  }
  return local;
}

export function listSpotlightWinners(): SpotlightWinner[] {
  return WINNERS;
}

export async function getMyBestRank(
  contestId: string,
): Promise<{ entry: SpotlightEntry; rank: number } | null> {
  const ranked = await listSpotlightEntries(contestId);
  const mine = ranked.find((e) => e.author === 'Ти');
  if (!mine) return null;
  return { entry: mine, rank: ranked.findIndex((e) => e.id === mine.id) + 1 };
}
