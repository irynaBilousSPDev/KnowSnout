import AsyncStorage from '@react-native-async-storage/async-storage';

import { env } from '@/src/lib/env';
import { isUuid } from '@/src/lib/uuid';
import { getCurrentUser } from '@/src/services/auth';
import { supabase } from '@/src/services/supabase';

const STORAGE_KEY = 'knowsnout.dm.v1';

export type DmPeer = {
  userId: string;
  name: string;
  avatarKey?: string;
};

export type DmMessage = {
  id: string;
  threadId: string;
  senderId: string;
  body: string;
  createdAt: string;
  mine?: boolean;
};

export type DmThread = {
  id: string;
  peer: DmPeer;
  updatedAt: string;
  lastBody?: string | null;
};

type Store = {
  threads: DmThread[];
  messages: Record<string, DmMessage[]>;
};

function emptyStore(): Store {
  return { threads: [], messages: {} };
}

async function readStore(): Promise<Store> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      threads: Array.isArray(parsed.threads) ? parsed.threads : [],
      messages:
        parsed.messages && typeof parsed.messages === 'object'
          ? parsed.messages
          : {},
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: Store) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function localThreadId(me: string, peerId: string) {
  return `local:${[me, peerId].sort().join('|')}`;
}

async function cloudUser() {
  if (env.isDemoMode || !supabase) return null;
  const user = await getCurrentUser();
  if (!user || !isUuid(user.id)) return null;
  return user;
}

function orderedPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

export async function listDmThreads(): Promise<DmThread[]> {
  const me = await getCurrentUser();
  if (!me) return [];
  const store = await readStore();
  const local = [...store.threads].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );

  const user = await cloudUser();
  if (!user || !supabase) return local;

  try {
    const { data, error } = await supabase
      .from('dm_threads')
      .select('id, user_a, user_b, updated_at')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .order('updated_at', { ascending: false });
    if (error || !data?.length) return local;

    const mapped: DmThread[] = data.map((row) => {
      const peerId =
        String(row.user_a) === user.id
          ? String(row.user_b)
          : String(row.user_a);
      const cached = local.find((t) => t.peer.userId === peerId);
      return {
        id: String(row.id),
        peer: cached?.peer ?? {
          userId: peerId,
          name: peerId.slice(0, 8),
        },
        updatedAt: String(row.updated_at),
        lastBody: cached?.lastBody ?? null,
      };
    });

    // Prefer cloud ids; keep local-only peers (seeds)
    const cloudPeerIds = new Set(mapped.map((t) => t.peer.userId));
    const localOnly = local.filter((t) => !cloudPeerIds.has(t.peer.userId));
    return [...mapped, ...localOnly].sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  } catch {
    return local;
  }
}

export async function openDmThread(peer: DmPeer): Promise<DmThread> {
  const me = await getCurrentUser();
  if (!me) throw new Error('AUTH_REQUIRED');
  if (!peer.userId || peer.userId === me.id) throw new Error('INVALID_PEER');

  const store = await readStore();
  const existing = store.threads.find((t) => t.peer.userId === peer.userId);
  if (existing) {
    existing.peer = { ...existing.peer, ...peer };
    await writeStore(store);
    return existing;
  }

  const user = await cloudUser();
  if (user && isUuid(peer.userId) && supabase) {
    const [user_a, user_b] = orderedPair(user.id, peer.userId);
    const { data: found } = await supabase
      .from('dm_threads')
      .select('id, updated_at')
      .eq('user_a', user_a)
      .eq('user_b', user_b)
      .maybeSingle();

    let threadId = found?.id ? String(found.id) : '';
    let updatedAt = found?.updated_at
      ? String(found.updated_at)
      : new Date().toISOString();

    if (!threadId) {
      const { data: created, error } = await supabase
        .from('dm_threads')
        .insert({ user_a, user_b })
        .select('id, updated_at')
        .single();
      if (!error && created) {
        threadId = String(created.id);
        updatedAt = String(created.updated_at);
      }
    }

    if (threadId) {
      const thread: DmThread = {
        id: threadId,
        peer,
        updatedAt,
        lastBody: null,
      };
      store.threads = [thread, ...store.threads.filter((t) => t.id !== threadId)];
      await writeStore(store);
      return thread;
    }
  }

  const thread: DmThread = {
    id: localThreadId(me.id, peer.userId),
    peer,
    updatedAt: new Date().toISOString(),
    lastBody: null,
  };
  store.threads = [thread, ...store.threads];
  await writeStore(store);
  return thread;
}

export async function listDmMessages(threadId: string): Promise<DmMessage[]> {
  const me = await getCurrentUser();
  const store = await readStore();
  const local = store.messages[threadId] ?? [];

  if (!isUuid(threadId) || !(await cloudUser()) || !supabase) {
    return local.map((m) => ({
      ...m,
      mine: Boolean(me && m.senderId === me.id),
    }));
  }

  try {
    const { data, error } = await supabase
      .from('dm_messages')
      .select('id, thread_id, sender_id, body, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(200);
    if (error || !data) {
      return local.map((m) => ({
        ...m,
        mine: Boolean(me && m.senderId === me.id),
      }));
    }
    const messages: DmMessage[] = data.map((row) => ({
      id: String(row.id),
      threadId: String(row.thread_id),
      senderId: String(row.sender_id),
      body: String(row.body),
      createdAt: String(row.created_at),
      mine: Boolean(me && String(row.sender_id) === me.id),
    }));
    store.messages[threadId] = messages;
    await writeStore(store);
    return messages;
  } catch {
    return local.map((m) => ({
      ...m,
      mine: Boolean(me && m.senderId === me.id),
    }));
  }
}

export async function sendDmMessage(
  threadId: string,
  body: string,
): Promise<DmMessage> {
  const me = await getCurrentUser();
  if (!me) throw new Error('AUTH_REQUIRED');
  const text = body.trim();
  if (!text) throw new Error('EMPTY');
  if (text.length > 2000) throw new Error('TOO_LONG');

  const store = await readStore();
  const thread = store.threads.find((t) => t.id === threadId);
  if (!thread) throw new Error('THREAD_NOT_FOUND');

  const user = await cloudUser();
  if (user && isUuid(threadId) && supabase) {
    const { data, error } = await supabase
      .from('dm_messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        body: text,
      })
      .select('id, thread_id, sender_id, body, created_at')
      .single();
    if (!error && data) {
      await supabase
        .from('dm_threads')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', threadId);
      const msg: DmMessage = {
        id: String(data.id),
        threadId: String(data.thread_id),
        senderId: String(data.sender_id),
        body: String(data.body),
        createdAt: String(data.created_at),
        mine: true,
      };
      const prev = store.messages[threadId] ?? [];
      store.messages[threadId] = [...prev, msg];
      thread.updatedAt = msg.createdAt;
      thread.lastBody = msg.body;
      await writeStore(store);
      return msg;
    }
  }

  const msg: DmMessage = {
    id: `local-msg-${Date.now()}`,
    threadId,
    senderId: me.id,
    body: text,
    createdAt: new Date().toISOString(),
    mine: true,
  };
  const prev = store.messages[threadId] ?? [];
  store.messages[threadId] = [...prev, msg];
  thread.updatedAt = msg.createdAt;
  thread.lastBody = msg.body;
  await writeStore(store);
  return msg;
}
