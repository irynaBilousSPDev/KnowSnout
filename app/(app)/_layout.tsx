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
        contentStyle: { backgroundColor: brand.canvas },
        headerBackTitle: 'Назад',
        headerBackButtonDisplayMode: 'minimal',
        headerTintColor: brand.ink,
        headerStyle: { backgroundColor: brand.canvas },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="story-compose"
        options={{ headerShown: false, title: t('stories.composeTitle') }}
      />
      <Stack.Screen
        name="story-tag"
        options={{ headerShown: false, title: t('stories.tagTitle') }}
      />
      <Stack.Screen
        name="story-post"
        options={{ headerShown: false, title: t('stories.postTitle') }}
      />
      <Stack.Screen
        name="my-profile"
        options={{ headerShown: false, title: t('profile.mine') }}
      />
      <Stack.Screen
        name="scan-food"
        options={{
          headerShown: false,
          title: t('check.foodTitle'),
        }}
      />
      <Stack.Screen
        name="food-not-found"
        options={{
          headerShown: false,
          title: t('foodMissing.title'),
        }}
      />
      <Stack.Screen
        name="ai-limit"
        options={{
          headerShown: false,
          title: t('aiLimit.title'),
        }}
      />
      <Stack.Screen
        name="breed-scan"
        options={{
          headerShown: false,
          title: t('breed.title'),
        }}
      />
      <Stack.Screen
        name="breed-quiz"
        options={{
          headerShown: false,
          title: t('quizHub.breedTitle'),
        }}
      />
      <Stack.Screen
        name="wiki-quiz"
        options={{
          headerShown: false,
          title: t('tabs.quiz'),
        }}
      />
      <Stack.Screen
        name="trivia-quiz"
        options={{
          headerShown: false,
          title: t('quizHub.triviaTitle'),
        }}
      />
      <Stack.Screen
        name="quiz-results"
        options={{
          headerShown: false,
          title: t('quiz.resultsTitle'),
        }}
      />
      <Stack.Screen
        name="data-sources"
        options={{
          headerShown: false,
          title: t('sources.title'),
        }}
      />
      <Stack.Screen
        name="result"
        options={{
          headerShown: false,
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
        name="pet-species"
        options={{
          headerShown: false,
          title: t('pets.speciesAsk'),
        }}
      />
      <Stack.Screen
        name="pet-profile"
        options={{
          headerShown: false,
          title: t('pets.profileTitle'),
        }}
      />
      <Stack.Screen
        name="pet-hub"
        options={{
          headerShown: false,
          title: t('petHub.title'),
        }}
      />
      <Stack.Screen
        name="my-data"
        options={{
          headerShown: false,
          title: t('me.title'),
        }}
      />
      <Stack.Screen
        name="pet-vaccines"
        options={{
          headerShown: false,
          title: t('vaccines.title'),
        }}
      />
      <Stack.Screen
        name="pet-vet-log"
        options={{
          headerShown: false,
          title: t('vetLog.title'),
        }}
      />
      <Stack.Screen
        name="pet-travel"
        options={{
          headerShown: false,
          title: t('travel.title'),
        }}
      />
      <Stack.Screen
        name="pet-passport"
        options={{
          headerShown: false,
          title: t('passport.title'),
        }}
      />
      <Stack.Screen
        name="play-guides"
        options={{
          headerShown: false,
          title: t('play.title'),
        }}
      />
      <Stack.Screen
        name="contests"
        options={{
          headerShown: false,
          title: t('contests.title'),
        }}
      />
      <Stack.Screen
        name="contest-entry"
        options={{
          headerShown: false,
          title: t('contests.entryTitle'),
        }}
      />
      <Stack.Screen
        name="story-comments"
        options={{
          headerShown: false,
          title: t('stories.commentsTitle'),
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          headerShown: false,
          title: t('dm.title'),
        }}
      />
      <Stack.Screen
        name="dm/[userId]"
        options={{
          headerShown: false,
          title: t('dm.title'),
        }}
      />
      <Stack.Screen
        name="care-hub"
        options={{
          headerShown: false,
          title: t('care.hubTitle'),
        }}
      />
      <Stack.Screen
        name="pet-care"
        options={{
          headerShown: false,
          title: t('care.title'),
        }}
      />
      <Stack.Screen
        name="plant-safety"
        options={{
          headerShown: false,
          title: t('plants.title'),
        }}
      />
      <Stack.Screen
        name="plant-result"
        options={{
          headerShown: false,
          title: t('plants.resultTitle'),
        }}
      />
      <Stack.Screen
        name="breed-result"
        options={{
          headerShown: false,
          title: t('breed.resultTitle'),
        }}
      />
      <Stack.Screen
        name="onboarding"
        options={{
          headerShown: false,
          title: t('onboarding.title'),
        }}
      />
      <Stack.Screen
        name="compare-food"
        options={{
          headerShown: false,
          title: t('compare.title'),
        }}
      />
      <Stack.Screen
        name="pet-habits"
        options={{
          headerShown: false,
          title: t('habits.title'),
        }}
      />
      <Stack.Screen
        name="pet-calendar"
        options={{
          headerShown: false,
          title: t('calendar.title'),
        }}
      />
      <Stack.Screen
        name="pet-travel-wizard"
        options={{
          headerShown: false,
          title: t('travelWizard.title'),
        }}
      />
      <Stack.Screen
        name="spotlight-hub"
        options={{ headerShown: false, title: t('spotlight.title') }}
      />
      <Stack.Screen
        name="spotlight-rules"
        options={{ headerShown: false, title: t('spotlight.rulesTitle') }}
      />
      <Stack.Screen
        name="spotlight-apply"
        options={{ headerShown: false, title: t('spotlight.applyTitle') }}
      />
      <Stack.Screen
        name="spotlight-entry"
        options={{ headerShown: false, title: t('spotlight.participantTitle') }}
      />
      <Stack.Screen
        name="spotlight-ranking"
        options={{ headerShown: false, title: t('spotlight.rankingTitle') }}
      />
      <Stack.Screen
        name="spotlight-winners"
        options={{ headerShown: false, title: t('spotlight.winnersTitle') }}
      />
      <Stack.Screen
        name="spotlight-won"
        options={{ headerShown: false, title: t('spotlight.wonTitle') }}
      />
      <Stack.Screen
        name="spotlight-guest-vote"
        options={{ headerShown: false, title: t('spotlight.guestVoteTitle') }}
      />
      <Stack.Screen
        name="friends"
        options={{ headerShown: false, title: t('friends.title') }}
      />
      <Stack.Screen
        name="friend-requests"
        options={{ headerShown: false, title: t('friends.requestsTitle') }}
      />
      <Stack.Screen
        name="friend-search"
        options={{ headerShown: false, title: t('friends.searchTitle') }}
      />
      <Stack.Screen
        name="friend-invite"
        options={{ headerShown: false, title: t('friends.inviteTitle') }}
      />
      <Stack.Screen
        name="friend-invite-accept"
        options={{ headerShown: false, title: t('friends.inviteAcceptTitle') }}
      />
      <Stack.Screen
        name="user-profile"
        options={{ headerShown: false, title: t('profile.title') }}
      />
      <Stack.Screen
        name="walk-plan"
        options={{ headerShown: false, title: t('walks.title') }}
      />
      <Stack.Screen
        name="activity"
        options={{ headerShown: false, title: t('activity.title') }}
      />
      <Stack.Screen
        name="search"
        options={{ headerShown: false, title: t('search.title') }}
      />
      <Stack.Screen
        name="quiz-zoom"
        options={{ headerShown: false, title: t('quizZoom.title') }}
      />
      <Stack.Screen
        name="quiz-heavier"
        options={{ headerShown: false, title: t('quizHeavier.title') }}
      />
      <Stack.Screen
        name="quiz-myth"
        options={{ headerShown: false, title: t('quizMyth.title') }}
      />
      <Stack.Screen
        name="quiz-leaderboard"
        options={{ headerShown: false, title: t('leaderboard.title') }}
      />
      <Stack.Screen
        name="achievements"
        options={{ headerShown: false, title: t('achievements.title') }}
      />
      <Stack.Screen
        name="forum"
        options={{ headerShown: false, title: t('forum.title') }}
      />
      <Stack.Screen
        name="forum-category"
        options={{ headerShown: false, title: t('forum.categoryTitle') }}
      />
      <Stack.Screen
        name="forum-thread"
        options={{ headerShown: false, title: t('forum.threadTitle') }}
      />
      <Stack.Screen
        name="forum-new"
        options={{ headerShown: false, title: t('forum.newTitle') }}
      />
      <Stack.Screen
        name="forum-rules"
        options={{ headerShown: false, title: t('forum.rulesTitle') }}
      />
      <Stack.Screen
        name="forum-search"
        options={{ headerShown: false, title: t('forum.searchTitle') }}
      />
      <Stack.Screen
        name="forum-author"
        options={{ headerShown: false, title: t('forum.authorTitle') }}
      />
      <Stack.Screen
        name="forum-notifications"
        options={{ headerShown: false, title: t('forum.notificationsTitle') }}
      />
      <Stack.Screen
        name="blog"
        options={{ headerShown: false, title: t('blog.title') }}
      />
      <Stack.Screen
        name="blog-category"
        options={{ headerShown: false, title: t('blog.title') }}
      />
      <Stack.Screen
        name="blog-article"
        options={{ headerShown: false, title: t('blog.title') }}
      />
      <Stack.Screen
        name="blog-bookmarks"
        options={{ headerShown: false, title: t('blog.bookmarksTitle') }}
      />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false, title: t('notifications.title') }}
      />
      <Stack.Screen
        name="help"
        options={{ headerShown: false, title: t('help.title') }}
      />
      <Stack.Screen
        name="help-article"
        options={{ headerShown: false, title: t('help.title') }}
      />
      <Stack.Screen
        name="support"
        options={{ headerShown: false, title: t('support.title') }}
      />
      <Stack.Screen
        name="settings"
        options={{ headerShown: false, title: t('settings.title') }}
      />
      <Stack.Screen
        name="payments"
        options={{ headerShown: false, title: t('payments.title') }}
      />
      <Stack.Screen
        name="appearance"
        options={{ headerShown: false, title: t('appearance.title') }}
      />
      <Stack.Screen
        name="subscription"
        options={{ headerShown: false, title: t('subscription.title') }}
      />
      <Stack.Screen
        name="edit-account"
        options={{ headerShown: false, title: t('editAccount.title') }}
      />
      <Stack.Screen
        name="blocked-users"
        options={{ headerShown: false, title: t('blocked.title') }}
      />
      <Stack.Screen
        name="delete-account"
        options={{ headerShown: false, title: t('deleteAccount.title') }}
      />
      <Stack.Screen
        name="privacy"
        options={{ headerShown: false, title: t('privacy.title') }}
      />
      <Stack.Screen
        name="directory-list"
        options={{ headerShown: false, title: t('directories.listTitle') }}
      />
      <Stack.Screen
        name="directory-carriers"
        options={{ headerShown: false, title: t('directories.carriersTitle') }}
      />
      <Stack.Screen
        name="directory-detail"
        options={{ headerShown: false, title: t('directories.detailTitle') }}
      />
      <Stack.Screen
        name="directory-chat"
        options={{ headerShown: false, title: t('directories.chatTitle') }}
      />
      <Stack.Screen
        name="directory-review"
        options={{ headerShown: false, title: t('directories.reviewTitle') }}
      />
      <Stack.Screen
        name="directory-report"
        options={{ headerShown: false, title: t('directories.reportTitle') }}
      />
      <Stack.Screen
        name="vet-hub"
        options={{ headerShown: false, title: t('vets.hubTitle') }}
      />
      <Stack.Screen
        name="vet-doctors-search"
        options={{ headerShown: false, title: t('vets.cardiologistsTitle') }}
      />
      <Stack.Screen
        name="vet-clinic-profile"
        options={{ headerShown: false, title: t('vets.clinicTitle') }}
      />
      <Stack.Screen
        name="vet-doctor-profile"
        options={{ headerShown: false, title: t('vets.doctorTitle') }}
      />
      <Stack.Screen
        name="vet-doctor-review"
        options={{ headerShown: false, title: t('vets.reviewBarTitle') }}
      />
      <Stack.Screen
        name="vet-pro-setup"
        options={{ headerShown: false, title: t('vets.proSetupTitle') }}
      />
      <Stack.Screen
        name="vet-pro-cabinet"
        options={{ headerShown: false, title: t('vets.cabinetTitle') }}
      />
    </Stack>
  );
}
