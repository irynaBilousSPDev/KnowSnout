import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { env } from '@/src/lib/env';

const isBrowser = typeof window !== 'undefined';

function authStorageKey(): string | null {
  if (!env.supabaseUrl) return null;
  try {
    const ref = new URL(env.supabaseUrl).hostname.split('.')[0];
    return `sb-${ref}-auth-token`;
  } catch {
    return null;
  }
}

/**
 * Never use SecureStore on the auth hot path.
 * Background token refresh hits iOS Keychain → "User interaction is not allowed"
 * (LogBox console error from GoTrue autoRefresh). Session JSON also often
 * exceeds SecureStore's ~2048 byte limit.
 */
const authStorage = {
  getItem: async (key: string) => {
    if (!isBrowser && Platform.OS === 'web') return null;
    return AsyncStorage.getItem(key);
  },
  setItem: async (key: string, value: string) => {
    if (!isBrowser && Platform.OS === 'web') return;
    await AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (!isBrowser && Platform.OS === 'web') return;
    await AsyncStorage.removeItem(key);
  },
};

/** Move any leftover SecureStore session while the UI is foregrounded. */
export async function migrateLegacyAuthStorage(): Promise<void> {
  if (Platform.OS === 'web' || !env.hasSupabase) return;
  const key = authStorageKey();
  if (!key) return;
  try {
    const existing = await AsyncStorage.getItem(key);
    if (existing != null) {
      await SecureStore.deleteItemAsync(key).catch(() => undefined);
      return;
    }
    const legacy = await SecureStore.getItemAsync(key);
    if (legacy != null) {
      await AsyncStorage.setItem(key, legacy);
      await SecureStore.deleteItemAsync(key).catch(() => undefined);
    }
  } catch {
    /* Keychain locked — user can sign in again */
  }
}

export const supabase: SupabaseClient | null = env.hasSupabase
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: isBrowser || Platform.OS !== 'web',
        persistSession: isBrowser || Platform.OS !== 'web',
        detectSessionInUrl: false,
      },
    })
  : null;
