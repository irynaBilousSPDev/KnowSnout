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

/** Demo-friendly password reset request (UI flow 01.06 → 01.07). */
export async function requestPasswordReset(email: string): Promise<void> {
  const trimmed = email.trim();
  if (!trimmed) throw new Error('Email required');

  if (env.isDemoMode || !supabase) {
    await AsyncStorage.setItem(
      'knowsnout.auth.reset.email',
      trimmed.toLowerCase(),
    );
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(trimmed);
  if (error) throw new Error(error.message);
}

/** Demo accepts any 6-digit code; live Supabase OTP wiring comes later. */
export async function verifyResetCode(
  email: string,
  code: string,
): Promise<void> {
  const trimmed = email.trim().toLowerCase();
  const digits = code.replace(/\D/g, '');
  if (digits.length !== 6) throw new Error('Invalid code');

  if (env.isDemoMode || !supabase) {
    const stored = await AsyncStorage.getItem('knowsnout.auth.reset.email');
    if (stored && stored !== trimmed) {
      throw new Error('Email mismatch');
    }
    await AsyncStorage.removeItem('knowsnout.auth.reset.email');
    return;
  }

  // Live path: email OTP verification for recovery will be wired with Supabase settings.
  const { error } = await supabase.auth.verifyOtp({
    email: trimmed,
    token: digits,
    type: 'recovery',
  });
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
