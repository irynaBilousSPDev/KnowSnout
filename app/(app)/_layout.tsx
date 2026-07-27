import { Redirect, Stack } from 'expo-router';

import { LoadingState } from '@/src/components/LoadingState';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

export default function AppLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: brand.surface },
        headerBackTitle: 'Назад',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: brand.ink,
        headerStyle: { backgroundColor: brand.surface },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="scan-food"
        options={{
          headerShown: true,
          title: t('check.foodTitle'),
        }}
      />
      <Stack.Screen
        name="breed-scan"
        options={{
          headerShown: true,
          title: t('breed.title'),
        }}
      />
      <Stack.Screen
        name="breed-quiz"
        options={{
          headerShown: true,
          title: t('quizHub.breedTitle'),
        }}
      />
      <Stack.Screen
        name="wiki-quiz"
        options={{
          headerShown: true,
          title: t('tabs.quiz'),
        }}
      />
      <Stack.Screen
        name="trivia-quiz"
        options={{
          headerShown: true,
          title: t('quizHub.triviaTitle'),
        }}
      />
      <Stack.Screen
        name="quiz-results"
        options={{
          headerShown: true,
          title: t('quiz.resultsTitle'),
        }}
      />
      <Stack.Screen
        name="data-sources"
        options={{
          headerShown: true,
          title: t('sources.title'),
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          headerShown: true,
          title: t('result.title'),
        }}
      />
      <Stack.Screen
        name="pet-form"
        options={{
          headerShown: true,
          title: t('pets.formAddTitle'),
        }}
      />
      <Stack.Screen
        name="pet-profile"
        options={{
          headerShown: true,
          title: t('pets.profileTitle'),
        }}
      />
      <Stack.Screen
        name="my-data"
        options={{
          headerShown: true,
          title: t('me.title'),
        }}
      />
      <Stack.Screen
        name="pet-vaccines"
        options={{
          headerShown: true,
          title: t('vaccines.title'),
        }}
      />
      <Stack.Screen
        name="pet-vet-log"
        options={{
          headerShown: true,
          title: t('vetLog.title'),
        }}
      />
      <Stack.Screen
        name="pet-travel"
        options={{
          headerShown: true,
          title: t('travel.title'),
        }}
      />
      <Stack.Screen
        name="play-guides"
        options={{
          headerShown: true,
          title: t('play.title'),
        }}
      />
      <Stack.Screen
        name="contests"
        options={{
          headerShown: true,
          title: t('contests.title'),
        }}
      />
      <Stack.Screen
        name="contest-entry"
        options={{
          headerShown: true,
          title: t('contests.entryTitle'),
        }}
      />
      <Stack.Screen
        name="story-comments"
        options={{
          headerShown: true,
          title: t('stories.commentsTitle'),
        }}
      />
      <Stack.Screen
        name="care-hub"
        options={{
          headerShown: true,
          title: t('care.hubTitle'),
        }}
      />
      <Stack.Screen
        name="pet-care"
        options={{
          headerShown: true,
          title: t('care.title'),
        }}
      />
      <Stack.Screen
        name="plant-safety"
        options={{
          headerShown: true,
          title: t('plants.title'),
        }}
      />
      <Stack.Screen
        name="plant-result"
        options={{
          headerShown: true,
          title: t('journal.plantDetailTitle'),
        }}
      />
      <Stack.Screen
        name="breed-result"
        options={{
          headerShown: true,
          title: t('journal.breedDetailTitle'),
        }}
      />
    </Stack>
  );
}
