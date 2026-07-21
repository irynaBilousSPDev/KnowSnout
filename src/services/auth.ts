import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, User } from '@supabase/supabase-js';

import { env } from '@/src/lib/env';
import { supabase } from '@/src/services/supabase';

const DEMO_SESSION_KEY = 'snoutscore.demo.session';

export type AuthUser = {
  id: string;
  email: string;
};

function toAuthUser(user: User): AuthUser {
  return { id: user.id, email: user.email ?? '' };
}

async function readDemoSession(): Promise<AuthUser | null> {
  const raw = await AsyncStorage.getItem(DEMO_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

async function writeDemoSession(user: AuthUser | null) {
  if (!user) {
    await AsyncStorage.removeItem(DEMO_SESSION_KEY);
    return;
  }
  await AsyncStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(user));
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  if (env.isDemoMode || !supabase) {
    return readDemoSession();
  }

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return toAuthUser(data.user);
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  if (env.isDemoMode || !supabase) {
    const user: AuthUser = {
      id: 'demo-user',
      email: email.trim() || 'demo@knowsnout.com',
    };
    await writeDemoSession(user);
    return user;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Unable to sign in');
  }
  return toAuthUser(data.user);
}

export async function signUp(email: string, password: string): Promise<AuthUser> {
  if (env.isDemoMode || !supabase) {
    return signIn(email, password);
  }

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });
  if (error || !data.user) {
    throw new Error(error?.message ?? 'Unable to create account');
  }
  return toAuthUser(data.user);
}

export async function signOut(): Promise<void> {
  if (env.isDemoMode || !supabase) {
    await writeDemoSession(null);
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export function onAuthStateChange(
  callback: (user: AuthUser | null) => void,
): () => void {
  if (env.isDemoMode || !supabase) {
    void readDemoSession().then(callback);
    return () => undefined;
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session: Session | null) => {
    callback(session?.user ? toAuthUser(session.user) : null);
  });

  return () => data.subscription.unsubscribe();
}
