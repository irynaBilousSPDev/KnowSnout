import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'knowsnout.settings_prefs.v1';

export type AppLanguage = 'uk' | 'pl' | 'en';
export type ThemePref = 'light' | 'dark';

export type SettingsPrefs = {
  language: AppLanguage;
  theme: ThemePref;
  notifyVaccines: boolean;
  notifyCare: boolean;
  notifyQuiz: boolean;
  notifyFeed: boolean;
};

const DEFAULTS: SettingsPrefs = {
  language: 'uk',
  theme: 'light',
  notifyVaccines: true,
  notifyCare: true,
  notifyQuiz: false,
  notifyFeed: false,
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
      notifyVaccines: parsed.notifyVaccines ?? DEFAULTS.notifyVaccines,
      notifyCare: parsed.notifyCare ?? DEFAULTS.notifyCare,
      notifyQuiz: parsed.notifyQuiz ?? DEFAULTS.notifyQuiz,
      notifyFeed: parsed.notifyFeed ?? DEFAULTS.notifyFeed,
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
    notifyVaccines: patch.notifyVaccines ?? prev.notifyVaccines,
    notifyCare: patch.notifyCare ?? prev.notifyCare,
    notifyQuiz: patch.notifyQuiz ?? prev.notifyQuiz,
    notifyFeed: patch.notifyFeed ?? prev.notifyFeed,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
