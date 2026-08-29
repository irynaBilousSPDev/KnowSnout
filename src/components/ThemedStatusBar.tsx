import { StatusBar } from 'expo-status-bar';

import { useAppTheme } from '@/src/theme/AppThemeProvider';

/** Status bar style synced with appearance settings (07.05). */
export function ThemedStatusBar() {
  const { colors } = useAppTheme();
  return <StatusBar style={colors.isDark ? 'light' : 'dark'} />;
}
