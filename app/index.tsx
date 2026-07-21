import { Redirect } from 'expo-router';

import { LoadingState } from '@/src/components/LoadingState';
import { useAuth } from '@/src/hooks/useAuth';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState message="Starting KnowSnout…" />;
  }

  if (user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
