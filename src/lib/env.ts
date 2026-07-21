const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';
const useMockAi = process.env.EXPO_PUBLIC_USE_MOCK_AI !== 'false';
const demoModeFlag = process.env.EXPO_PUBLIC_DEMO_MODE === 'true';

export const env = {
  supabaseUrl,
  supabaseAnonKey,
  useMockAi,
  /** True when Supabase is not configured or demo mode is forced */
  isDemoMode:
    demoModeFlag ||
    !supabaseUrl ||
    !supabaseAnonKey ||
    supabaseUrl.includes('YOUR_PROJECT_REF'),
  hasSupabase:
    Boolean(supabaseUrl && supabaseAnonKey) &&
    !supabaseUrl.includes('YOUR_PROJECT_REF'),
};
