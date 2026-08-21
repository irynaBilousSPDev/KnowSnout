import '../global.css';

import { Caprasimo_400Regular } from '@expo-google-fonts/caprasimo';
import {
  Figtree_400Regular,
  Figtree_500Medium,
  Figtree_600SemiBold,
  Figtree_700Bold,
} from '@expo-google-fonts/figtree';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { LoadingState } from '@/src/components/LoadingState';
import { WebPhoneFrame } from '@/src/components/WebPhoneFrame';
import { AuthProvider } from '@/src/hooks/useAuth';
import { ToastProvider } from '@/src/hooks/useToast';
import { migrateLegacyAuthStorage } from '@/src/services/supabase';
import { brand } from '@/src/theme/brand';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Caprasimo_400Regular,
    Figtree_400Regular,
    Figtree_500Medium,
    Figtree_600SemiBold,
    Figtree_700Bold,
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
      <ToastProvider>
        <View style={{ flex: 1, width: '100%', height: '100%' }}>
          <StatusBar style="dark" />
          <WebPhoneFrame>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: brand.surface, flex: 1 },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="spotlight-vote" options={{ headerShown: false }} />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(app)" />
              <Stack.Screen name="(admin)" />
            </Stack>
          </WebPhoneFrame>
        </View>
      </ToastProvider>
    </AuthProvider>
  );
}
