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
          headerShown: false,
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
        name="pet-hub"
        options={{
          headerShown: true,
          title: t('petHub.title'),
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
        name="pet-passport"
        options={{
          headerShown: true,
          title: t('passport.title'),
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
        name="messages"
        options={{
          headerShown: true,
          title: t('dm.title'),
        }}
      />
      <Stack.Screen
        name="dm/[userId]"
        options={{
          headerShown: true,
          title: t('dm.title'),
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
          title: t('plants.resultTitle'),
        }}
      />
      <Stack.Screen
        name="breed-result"
        options={{
          headerShown: true,
          title: t('breed.resultTitle'),
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: true,
          title: t('onboarding.title'),
        }}
      />
      <Stack.Screen
        name="compare-food"
        options={{
          headerShown: true,
          title: t('compare.title'),
        }}
      />
      <Stack.Screen
        name="pet-habits"
        options={{
          headerShown: true,
          title: t('habits.title'),
        }}
      />
      <Stack.Screen
        name="pet-calendar"
        options={{
          headerShown: true,
          title: t('calendar.title'),
        }}
      />
      <Stack.Screen
        name="pet-travel-wizard"
        options={{
          headerShown: true,
          title: t('travelWizard.title'),
        }}
      />
      <Stack.Screen
        name="spotlight-hub"
        options={{ headerShown: true, title: t('spotlight.title') }}
      />
      <Stack.Screen
        name="spotlight-rules"
        options={{ headerShown: true, title: t('spotlight.rulesTitle') }}
      />
      <Stack.Screen
        name="spotlight-apply"
        options={{ headerShown: true, title: t('spotlight.applyTitle') }}
      />
      <Stack.Screen
        name="spotlight-ranking"
        options={{ headerShown: true, title: t('spotlight.rankingTitle') }}
      />
      <Stack.Screen
        name="spotlight-winners"
        options={{ headerShown: true, title: t('spotlight.winnersTitle') }}
      />
      <Stack.Screen
        name="spotlight-won"
        options={{ headerShown: true, title: t('spotlight.wonTitle') }}
      />
      <Stack.Screen
        name="spotlight-guest-vote"
        options={{ headerShown: true, title: t('spotlight.guestVoteTitle') }}
      />
      <Stack.Screen
        name="friends"
        options={{ headerShown: true, title: t('friends.title') }}
      />
      <Stack.Screen
        name="friend-requests"
        options={{ headerShown: true, title: t('friends.requestsTitle') }}
      />
      <Stack.Screen
        name="friend-search"
        options={{ headerShown: true, title: t('friends.searchTitle') }}
      />
      <Stack.Screen
        name="friend-invite"
        options={{ headerShown: true, title: t('friends.inviteTitle') }}
      />
      <Stack.Screen
        name="friend-invite-accept"
        options={{ headerShown: true, title: t('friends.inviteAcceptTitle') }}
      />
      <Stack.Screen
        name="user-profile"
        options={{ headerShown: true, title: t('profile.title') }}
      />
      <Stack.Screen
        name="walk-plan"
        options={{ headerShown: true, title: t('walks.title') }}
      />
      <Stack.Screen
        name="activity"
        options={{ headerShown: true, title: t('activity.title') }}
      />
      <Stack.Screen
        name="search"
        options={{ headerShown: true, title: t('search.title') }}
      />
      <Stack.Screen
        name="quiz-zoom"
        options={{ headerShown: true, title: t('quizZoom.title') }}
      />
      <Stack.Screen
        name="quiz-heavier"
        options={{ headerShown: true, title: t('quizHeavier.title') }}
      />
      <Stack.Screen
        name="quiz-myth"
        options={{ headerShown: true, title: t('quizMyth.title') }}
      />
      <Stack.Screen
        name="quiz-leaderboard"
        options={{ headerShown: true, title: t('leaderboard.title') }}
      />
      <Stack.Screen
        name="achievements"
        options={{ headerShown: true, title: t('achievements.title') }}
      />
      <Stack.Screen
        name="forum"
        options={{ headerShown: true, title: t('forum.title') }}
      />
      <Stack.Screen
        name="forum-category"
        options={{ headerShown: true, title: t('forum.categoryTitle') }}
      />
      <Stack.Screen
        name="forum-thread"
        options={{ headerShown: true, title: t('forum.threadTitle') }}
      />
      <Stack.Screen
        name="forum-new"
        options={{ headerShown: true, title: t('forum.newTitle') }}
      />
      <Stack.Screen
        name="forum-rules"
        options={{ headerShown: true, title: t('forum.rulesTitle') }}
      />
      <Stack.Screen
        name="forum-search"
        options={{ headerShown: true, title: t('forum.searchTitle') }}
      />
      <Stack.Screen
        name="forum-author"
        options={{ headerShown: true, title: t('forum.authorTitle') }}
      />
      <Stack.Screen
        name="forum-notifications"
        options={{ headerShown: true, title: t('forum.notificationsTitle') }}
      />
      <Stack.Screen
        name="blog"
        options={{ headerShown: true, title: t('blog.title') }}
      />
      <Stack.Screen
        name="blog-article"
        options={{ headerShown: true, title: t('blog.title') }}
      />
      <Stack.Screen
        name="blog-bookmarks"
        options={{ headerShown: true, title: t('blog.bookmarksTitle') }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: true, title: t('notifications.title') }}
      />
      <Stack.Screen
        name="help"
        options={{ headerShown: true, title: t('help.title') }}
      />
      <Stack.Screen
        name="help-article"
        options={{ headerShown: true, title: t('help.title') }}
      />
      <Stack.Screen
        name="support"
        options={{ headerShown: true, title: t('support.title') }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: true, title: t('settings.title') }}
      />
      <Stack.Screen
        name="subscription"
        options={{ headerShown: true, title: t('subscription.title') }}
      />
      <Stack.Screen
        name="edit-account"
        options={{ headerShown: true, title: t('editAccount.title') }}
      />
      <Stack.Screen
        name="blocked-users"
        options={{ headerShown: true, title: t('blocked.title') }}
      />
      <Stack.Screen
        name="delete-account"
        options={{ headerShown: true, title: t('deleteAccount.title') }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: true, title: t('privacy.title') }}
      />
      <Stack.Screen
        name="directory-list"
        options={{ headerShown: true, title: t('directories.listTitle') }}
      />
      <Stack.Screen
        name="directory-carriers"
        options={{ headerShown: true, title: t('directories.carriersTitle') }}
      />
      <Stack.Screen
        name="directory-detail"
        options={{ headerShown: true, title: t('directories.detailTitle') }}
      />
      <Stack.Screen
        name="directory-chat"
        options={{ headerShown: true, title: t('directories.chatTitle') }}
      />
      <Stack.Screen
        name="directory-review"
        options={{ headerShown: true, title: t('directories.reviewTitle') }}
      />
      <Stack.Screen
        name="directory-report"
        options={{ headerShown: true, title: t('directories.reportTitle') }}
      />
    </Stack>
  );
}
