import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCloudUser, orderedFriendPair } from '@/src/lib/cloudUser';
import { isMissingSchemaError } from '@/src/lib/schemaErrors';
import { isUuid } from '@/src/lib/uuid';
import { supabase } from '@/src/services/supabase';

/** Friends: cloud invites/friendships when signed in; seed list stays local. */

const FRIENDS_KEY = 'knowsnout.friends.v1';
const REQUESTS_KEY = 'knowsnout.friend_requests.v1';
const INVITES_KEY = 'knowsnout.friend_invites.v1';

export type FriendUser = {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatarKey: string;
  city?: string;
};

export type FriendRequest = {
  id: string;
  from: FriendUser;
  createdAt: string;
};

export type FriendInvite = {
  token: string;
  createdAt: string;
  createdByName: string;
};

const SEED_FRIENDS: FriendUser[] = [
  {
    id: 'fu-1',
    name: 'Ірина К.',
    handle: '@iryna_pets',
    bio: 'Дві кішки й один балкон',
    avatarKey: 'woman-1',
    city: 'Київ',
  },
  {
    id: 'fu-2',
    name: 'Максим',
    handle: '@rex_walks',
    bio: 'Ранок = прогулянка з Рексом',
    avatarKey: 'man-1',
    city: 'Львів',
  },
];

const SEED_REQUESTS: FriendRequest[] = [
  {
    id: 'fr-1',
    from: {
      id: 'fu-3',
      name: 'Оля',
      handle: '@olia_murka',
      bio: 'Мурці 4 роки',
      avatarKey: 'woman-2',
      city: 'Одеса',
    },
    createdAt: '2026-08-20T08:00:00.000Z',
  },
];

const SEARCH_SEED: FriendUser[] = [
  ...SEED_FRIENDS,
  SEED_REQUESTS[0].from,
  {
    id: 'fu-4',
    name: 'Катя',
    handle: '@katya_baron',
    bio: 'Барон — зірка липня',
    avatarKey: 'woman-3',
    city: 'Харків',
  },
  {
    id: 'fu-5',
    name: 'Діма',
    handle: '@dima_luna',
    bio: 'Луна й кава',
    avatarKey: 'man-2',
    city: 'Дніпро',
  },
  {
    id: 'seed-iryna',
    name: 'Iryna',
    handle: '@iryna',
    bio: 'Сонячні коти',
    avatarKey: 'woman-1',
    city: 'Київ',
  },
  {
    id: 'seed-andrii',
    name: 'Andrii',
    handle: '@andrii',
    bio: 'Белла й іграшки',
    avatarKey: 'man-1',
    city: 'Львів',
  },
  {
    id: 'seed-marta',
    name: 'Marta',
    handle: '@marta',
    bio: 'Рекс після дощу',
    avatarKey: 'woman-2',
    city: 'Одеса',
  },
];

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) {
      await AsyncStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

function friendFromUuid(id: string, label?: string): FriendUser {
  const short = id.slice(0, 8);
  return {
    id,
    name: label?.trim() || `Друг ${short}`,
    handle: `@u_${short}`,
    bio: 'З хмарного графа друзів',
    avatarKey: 'woman-1',
    city: 'Україна',
  };
}

export async function listFriends(): Promise<FriendUser[]> {
  const local = await readJson(FRIENDS_KEY, SEED_FRIENDS);
  const user = await getCloudUser();
  if (!user || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('user_a, user_b, created_at')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`);
    if (error) {
      if (isMissingSchemaError(error.message)) return local;
      return local;
    }
    if (!data?.length) return local;

    const cloudFriends = data.map((row) => {
      const other =
        String(row.user_a) === user.id
          ? String(row.user_b)
          : String(row.user_a);
      return friendFromUuid(other);
    });

    const byId = new Map<string, FriendUser>();
    for (const f of [...local, ...cloudFriends]) byId.set(f.id, f);
    return [...byId.values()];
  } catch {
    return local;
  }
}

export async function listFriendRequests(): Promise<FriendRequest[]> {
  return readJson(REQUESTS_KEY, SEED_REQUESTS);
}

export async function acceptFriendRequest(requestId: string): Promise<void> {
  const [requests, friends] = await Promise.all([
    listFriendRequests(),
    listFriends(),
  ]);
  const req = requests.find((r) => r.id === requestId);
  if (!req) return;
  if (!friends.some((f) => f.id === req.from.id)) {
    friends.push(req.from);
    await writeJson(FRIENDS_KEY, friends);
  }
  const user = await getCloudUser();
  if (user && supabase && isUuid(req.from.id)) {
    const pair = orderedFriendPair(user.id, req.from.id);
    if (pair) {
      await supabase.from('friendships').upsert(pair, {
        onConflict: 'user_a,user_b',
        ignoreDuplicates: true,
      });
    }
  }
  await writeJson(
    REQUESTS_KEY,
    requests.filter((r) => r.id !== requestId),
  );
}

export async function declineFriendRequest(requestId: string): Promise<void> {
  const requests = await listFriendRequests();
  await writeJson(
    REQUESTS_KEY,
    requests.filter((r) => r.id !== requestId),
  );
}

export async function removeFriend(userId: string): Promise<void> {
  const friends = await listFriends();
  await writeJson(
    FRIENDS_KEY,
    friends.filter((f) => f.id !== userId),
  );
  const user = await getCloudUser();
  if (user && supabase && isUuid(userId)) {
    const pair = orderedFriendPair(user.id, userId);
    if (pair) {
      await supabase
        .from('friendships')
        .delete()
        .eq('user_a', pair.user_a)
        .eq('user_b', pair.user_b);
    }
  }
}

export async function searchUsers(query: string): Promise<FriendUser[]> {
  const q = query.trim().toLowerCase();
  const friends = await listFriends();
  const friendIds = new Set(friends.map((f) => f.id));
  const pool = SEARCH_SEED.filter((u) => !friendIds.has(u.id));
  if (!q) return pool;
  return pool.filter(
    (u) =>
      u.name.toLowerCase().includes(q) ||
      u.handle.toLowerCase().includes(q) ||
      u.bio.toLowerCase().includes(q),
  );
}

export async function sendFriendRequest(userId: string): Promise<boolean> {
  const user = SEARCH_SEED.find((u) => u.id === userId);
  if (!user && !isUuid(userId)) return false;
  const friends = await listFriends();
  if (friends.some((f) => f.id === userId)) return false;
  const requests = await listFriendRequests();
  if (requests.some((r) => r.from.id === userId)) return false;

  const me = await getCloudUser();
  if (me && supabase && isUuid(userId)) {
    const pair = orderedFriendPair(me.id, userId);
    if (pair) {
      const { error } = await supabase.from('friendships').upsert(pair, {
        onConflict: 'user_a,user_b',
        ignoreDuplicates: true,
      });
      if (!error || isMissingSchemaError(error.message)) {
        /* ok or missing schema */
      }
    }
  }

  const toAdd =
    user ??
    friendFromUuid(userId);
  friends.push(toAdd);
  await writeJson(FRIENDS_KEY, friends);
  return true;
}

export async function getKnownUser(userId: string): Promise<FriendUser | null> {
  if (!userId) return null;
  const friends = await listFriends();
  const fromFriends = friends.find((f) => f.id === userId);
  if (fromFriends) return fromFriends;
  return SEARCH_SEED.find((u) => u.id === userId) ?? null;
}

function makeInviteToken(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

export function buildInviteLink(token: string): string {
  return `https://knowsnout.com/invite/${encodeURIComponent(token)}`;
}

export async function createInviteToken(
  createdByName = 'Ти',
): Promise<FriendInvite> {
  const token = makeInviteToken();
  const invite: FriendInvite = {
    token,
    createdAt: new Date().toISOString(),
    createdByName: createdByName.trim() || 'Ти',
  };

  const user = await getCloudUser();
  if (user && supabase) {
    try {
      const { error } = await supabase.from('friend_invites').insert({
        token,
        created_by: user.id,
      });
      if (error && !isMissingSchemaError(error.message)) {
        /* still keep local */
      }
    } catch {
      /* local */
    }
  }

  const invites = await readJson<FriendInvite[]>(INVITES_KEY, []);
  await writeJson(INVITES_KEY, [invite, ...invites].slice(0, 20));
  return invite;
}

export async function getLatestInvite(): Promise<FriendInvite | null> {
  const invites = await readJson<FriendInvite[]>(INVITES_KEY, []);
  return invites[0] ?? null;
}

export async function acceptInviteToken(
  tokenRaw: string,
): Promise<{ ok: boolean; friend?: FriendUser; reason?: string }> {
  const token = tokenRaw.trim().toUpperCase();
  if (!token || token.length < 4) {
    return { ok: false, reason: 'invalid' };
  }

  const me = await getCloudUser();
  if (me && supabase) {
    try {
      const { data: invite, error } = await supabase
        .from('friend_invites')
        .select('id, token, created_by, accepted_by')
        .eq('token', token)
        .maybeSingle();

      if (!error && invite) {
        if (invite.accepted_by && String(invite.accepted_by) === me.id) {
          return { ok: false, reason: 'already' };
        }
        if (String(invite.created_by) === me.id) {
          return { ok: false, reason: 'invalid' };
        }

        await supabase
          .from('friend_invites')
          .update({
            accepted_by: me.id,
            accepted_at: new Date().toISOString(),
          })
          .eq('id', invite.id);

        const pair = orderedFriendPair(me.id, String(invite.created_by));
        if (pair) {
          await supabase.from('friendships').upsert(pair, {
            onConflict: 'user_a,user_b',
            ignoreDuplicates: true,
          });
        }

        const friend = friendFromUuid(String(invite.created_by), 'Друг (інвайт)');
        const friends = await listFriends();
        if (!friends.some((f) => f.id === friend.id)) {
          friends.push(friend);
          await writeJson(FRIENDS_KEY, friends);
        }
        return { ok: true, friend };
      }
    } catch {
      /* local demo path */
    }
  }

  const invites = await readJson<FriendInvite[]>(INVITES_KEY, []);
  const known = invites.find((i) => i.token.toUpperCase() === token);

  const friends = await listFriends();
  const friendId = `invite-${token.toLowerCase()}`;
  if (friends.some((f) => f.id === friendId)) {
    return { ok: false, reason: 'already' };
  }

  const friend: FriendUser = {
    id: friendId,
    name: known?.createdByName
      ? `${known.createdByName} (інвайт)`
      : `Друг ${token.slice(0, 4)}`,
    handle: `@invite_${token.slice(0, 4).toLowerCase()}`,
    bio: 'Додано за інвайт-кодом',
    avatarKey: 'woman-1',
    city: 'Україна',
  };

  friends.push(friend);
  await writeJson(FRIENDS_KEY, friends);

  if (!known) {
    await writeJson(
      INVITES_KEY,
      [
        {
          token,
          createdAt: new Date().toISOString(),
          createdByName: 'Гість',
        },
        ...invites,
      ].slice(0, 20),
    );
  }

  return { ok: true, friend };
}
