import '../global.css';

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
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
import { migrateLegacyAuthStorage } from '@/src/services/supabase';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Fraunces_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
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
      {/* Single flex child under #root — avoids blank web layout with sibling StatusBar */}
      <View style={{ flex: 1, width: '100%', height: '100%' }}>
        <StatusBar style="dark" />
        <WebPhoneFrame>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: '#F7FAF9', flex: 1 },
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(app)" />
          </Stack>
        </WebPhoneFrame>
      </View>
    </AuthProvider>
  );
}
