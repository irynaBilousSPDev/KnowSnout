import '../global.css';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { LoadingState } from '@/src/components/LoadingState';
import { ThemedStatusBar } from '@/src/components/ThemedStatusBar';
import { WebPhoneFrame } from '@/src/components/WebPhoneFrame';
import { AuthProvider } from '@/src/hooks/useAuth';
import { ToastProvider } from '@/src/hooks/useToast';
import { migrateLegacyAuthStorage } from '@/src/services/supabase';
import { AppThemeProvider, useAppTheme } from '@/src/theme/AppThemeProvider';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

function RootNavigation() {
  const { colors } = useAppTheme();

  return (
    <View style={{ flex: 1, width: '100%', height: '100%' }}>
      <ThemedStatusBar />
      <WebPhoneFrame>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas, flex: 1 },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="spotlight-vote"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(app)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </WebPhoneFrame>
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Manrope_700Bold,
    Manrope_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (error) {
      console.warn('Font load failed, continuing with system fonts', error);
    }
  }, [error]);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
      void migrateLegacyAuthStorage();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <LoadingState message="Starting KnowSnout…" />;
  }

  return (
    <AuthProvider>
      <AppThemeProvider>
        <ToastProvider>
          <RootNavigation />
        </ToastProvider>
      </AppThemeProvider>
    </AuthProvider>
  );
}
