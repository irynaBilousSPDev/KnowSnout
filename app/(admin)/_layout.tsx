import { Stack } from 'expo-router';

import { brand } from '@/src/theme/brand';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: brand.surface },
      }}
    />
  );
}
