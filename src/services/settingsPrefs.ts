import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'knowsnout.settings_prefs.v1';

export type AppLanguage = 'uk' | 'pl' | 'en';
export type ThemePref = 'light' | 'dark';

export type SettingsPrefs = {
  language: AppLanguage;
  theme: ThemePref;
};

const DEFAULTS: SettingsPrefs = {
  language: 'uk',
  theme: 'light',
};

export async function getSettingsPrefs(): Promise<SettingsPrefs> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<SettingsPrefs>;
    return {
      language:
        parsed.language === 'pl' || parsed.language === 'en'
          ? parsed.language
          : 'uk',
      theme: parsed.theme === 'dark' ? 'dark' : 'light',
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export async function saveSettingsPrefs(
  patch: Partial<SettingsPrefs>,
): Promise<SettingsPrefs> {
  const prev = await getSettingsPrefs();
  const next: SettingsPrefs = {
    language: patch.language ?? prev.language,
    theme: patch.theme ?? prev.theme,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
