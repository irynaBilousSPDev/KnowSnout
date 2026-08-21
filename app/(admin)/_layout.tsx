import { Stack } from 'expo-router';

import { brand } from '@/src/theme/brand';
import { t } from '@/src/i18n';

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: brand.surface },
        headerBackTitle: 'Назад',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: brand.ink,
        headerStyle: { backgroundColor: brand.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: t('admin.title') }} />
      <Stack.Screen
        name="moderation"
        options={{ title: t('admin.moderation') }}
      />
      <Stack.Screen
        name="moderation-item"
        options={{ title: t('admin.moderationItem') }}
      />
      <Stack.Screen name="cms" options={{ title: t('admin.cms') }} />
      <Stack.Screen
        name="spotlight-admin"
        options={{ title: t('admin.spotlight') }}
      />
      <Stack.Screen name="blog-admin" options={{ title: t('admin.blog') }} />
      <Stack.Screen
        name="products-admin"
        options={{ title: t('admin.products') }}
      />
      <Stack.Screen name="quiz-bank" options={{ title: t('admin.quizBank') }} />
      <Stack.Screen
        name="monetization"
        options={{ title: t('admin.monetization') }}
      />
      <Stack.Screen name="team" options={{ title: t('admin.team') }} />
    </Stack>
  );
}
