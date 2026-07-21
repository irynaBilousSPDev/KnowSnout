import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { env } from '@/src/lib/env';

const isBrowser = typeof window !== 'undefined';

const authStorage = {
  getItem: (key: string) => {
    if (!isBrowser && Platform.OS === 'web') {
      return Promise.resolve(null);
    }
    if (Platform.OS === 'web') {
      return AsyncStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    if (!isBrowser && Platform.OS === 'web') {
      return Promise.resolve();
    }
    if (Platform.OS === 'web') {
      return AsyncStorage.setItem(key, value);
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    if (!isBrowser && Platform.OS === 'web') {
      return Promise.resolve();
    }
    if (Platform.OS === 'web') {
      return AsyncStorage.removeItem(key);
    }
    return SecureStore.deleteItemAsync(key);
  },
};

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
