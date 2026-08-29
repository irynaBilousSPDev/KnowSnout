import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';

import { getSettingsPrefs } from '@/src/services/settingsPrefs';
import type { ThemeMode } from '@/src/services/settingsPrefs';
import { getLocale, setLocale, type Locale } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

export type ThemeColors = {
  canvas: string;
  surfaceElevated: string;
  ink: string;
  muted: string;
  mutedSoft: string;
  mistBorder: string;
  creamDeep: string;
  accentTint: string;
  photoPlaceholder: string;
  isDark: boolean;
};

const lightColors: ThemeColors = {
  canvas: brand.canvas,
  surfaceElevated: brand.surfaceElevated,
  ink: brand.ink,
  muted: brand.muted,
  mutedSoft: brand.mutedSoft,
  mistBorder: brand.mistBorder,
  creamDeep: brand.creamDeep,
  accentTint: brand.accentTint,
  photoPlaceholder: '#EEEBE6',
  isDark: false,
};

const darkColors: ThemeColors = {
  canvas: '#121212',
  surfaceElevated: '#1E1E1E',
  ink: '#F4F3F1',
  muted: '#A8B0B8',
  mutedSoft: '#7A848C',
  mistBorder: '#2A2A2A',
  creamDeep: '#252525',
  accentTint: '#1A3330',
  photoPlaceholder: '#2A2A2A',
  isDark: true,
};

type ThemeContextValue = {
  mode: ThemeMode;
  locale: Locale;
  colors: ThemeColors;
  refreshTheme: () => Promise<void>;
};

export type ThemedStyles = {
  card: {
    backgroundColor: string;
    borderColor: string;
  };
  text: { color: string };
  mutedText: { color: string };
  softText: { color: string };
  chip: { backgroundColor: string };
  photoPlaceholder: { backgroundColor: string; borderColor: string };
};

function buildThemedStyles(colors: ThemeColors): ThemedStyles {
  return {
    card: {
      backgroundColor: colors.surfaceElevated,
      borderColor: colors.mistBorder,
    },
    text: { color: colors.ink },
    mutedText: { color: colors.muted },
    softText: { color: colors.mutedSoft },
    chip: { backgroundColor: colors.creamDeep },
    photoPlaceholder: {
      backgroundColor: colors.photoPlaceholder,
      borderColor: colors.mistBorder,
    },
  };
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: 'light',
  locale: 'uk',
  colors: lightColors,
  refreshTheme: async () => undefined,
});

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [locale, setLocaleState] = useState<Locale>(getLocale());

  const refreshTheme = useCallback(async () => {
    const prefs = await getSettingsPrefs();
    setMode(prefs.themeMode);
    setLocale(prefs.language);
    setLocaleState(prefs.language);
  }, []);

  useEffect(() => {
    void refreshTheme();
  }, [refreshTheme]);

  const colors = useMemo(() => {
    const resolved =
      mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    return resolved === 'dark' ? darkColors : lightColors;
  }, [mode, systemScheme]);

  const value = useMemo(
    () => ({ mode, locale, colors, refreshTheme }),
    [mode, locale, colors, refreshTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}

export function useThemedStyles(): ThemedStyles {
  const { colors } = useAppTheme();
  return useMemo(() => buildThemedStyles(colors), [colors]);
}
