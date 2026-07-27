import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  emptyQuizStats,
  getQuizStats,
  type QuizStats,
} from '@/src/services/quizResults';
import {
  emptyQuizStreak,
  getDailyQuizChallenge,
  getQuizStreak,
  playedQuizToday,
  type QuizStreakState,
} from '@/src/services/quizStreak';
import { brand } from '@/src/theme/brand';

type QuizCategoryCard = {
  id: 'breed' | 'breed_origin' | 'animal_group' | 'animals_trivia';
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  bodyKey: string;
  href: string;
};

const CATEGORIES: QuizCategoryCard[] = [
  {
    id: 'breed',
    icon: 'camera-outline',
    titleKey: 'quizHub.breedTitle',
    bodyKey: 'quizHub.breedBody',
    href: '/(app)/breed-quiz',
  },
  {
    id: 'breed_origin',
    icon: 'globe-outline',
    titleKey: 'quizHub.originTitle',
    bodyKey: 'quizHub.originBody',
    href: '/(app)/wiki-quiz?category=breed_origin',
  },
  {
    id: 'animal_group',
    icon: 'leaf-outline',
    titleKey: 'quizHub.groupTitle',
    bodyKey: 'quizHub.groupBody',
    href: '/(app)/wiki-quiz?category=animal_group',
  },
  {
    id: 'animals_trivia',
    icon: 'bulb-outline',
    titleKey: 'quizHub.triviaTitle',
    bodyKey: 'quizHub.triviaBody',
    href: '/(app)/trivia-quiz',
  },
];

export default function QuizHubScreen() {
  const [stats, setStats] = useState<QuizStats>(emptyQuizStats());
  const [streak, setStreak] = useState<QuizStreakState>(emptyQuizStreak());
  const daily = getDailyQuizChallenge();
  const doneToday = playedQuizToday(streak);

  useFocusEffect(
    useCallback(() => {
      void getQuizStats()
        .then(setStats)
        .catch(() => setStats(emptyQuizStats()));
      void getQuizStreak()
        .then(setStreak)
        .catch(() => setStreak(emptyQuizStreak()));
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={t('quizHub.title')}
          subtitle={t('quizHub.subtitle')}
        />

        <View style={styles.dailyCard}>
          <Text style={styles.dailyEyebrow}>{t('quizStreak.dailyTitle')}</Text>
          <Text style={styles.dailyTitle}>{t(daily.titleKey)}</Text>
          <Text style={styles.dailyBody}>{t(daily.bodyKey)}</Text>
          <View style={styles.streakRow}>
            <Text style={styles.streakValue}>
              {t('quizStreak.current', { count: streak.currentStreak })}
            </Text>
            <Text style={styles.streakBest}>
              {t('quizStreak.best', { count: streak.bestStreak })}
            </Text>
          </View>
          {doneToday ? (
            <Text style={styles.doneToday}>{t('quizStreak.doneToday')}</Text>
          ) : null}
          <View style={styles.ratingBtn}>
            <PrimaryButton
              label={
                doneToday
                  ? t('quizStreak.playAgain')
                  : t('quizStreak.playDaily')
              }
              onPress={() => router.push(daily.href as never)}
            />
          </View>
        </View>

        <View style={styles.ratingCard}>
          <Text style={styles.ratingLabel}>{t('quiz.avgLabel')}</Text>
          <Text style={styles.ratingValue}>
            {stats.games > 0
              ? t('quiz.avgValue', { value: stats.averagePercent })
              : '—'}
          </Text>
          <Text style={styles.ratingMeta}>
            {stats.games > 0
              ? t('quiz.statsLine', {
                  games: stats.games,
                  best: stats.bestPercent,
                })
              : t('quiz.statsEmpty')}
          </Text>
          <View style={styles.ratingBtn}>
            <PrimaryButton
              label={t('quiz.viewResults')}
              variant="secondary"
              onPress={() => router.push('/(app)/quiz-results')}
            />
          </View>
        </View>

        <Text style={styles.lead}>{t('quizHub.lead')}</Text>

        {CATEGORIES.map((cat) => {
          const c = stats.byCategory[cat.id];
          return (
            <Pressable
              key={cat.id}
              onPress={() => router.push(cat.href as never)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <View style={styles.cardIcon}>
                <Ionicons name={cat.icon} size={26} color={brand.tealPressed} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{t(cat.titleKey)}</Text>
                <Text style={styles.cardBody}>{t(cat.bodyKey)}</Text>
                {c.games > 0 ? (
                  <Text style={styles.cardStats}>
                    {t('quiz.categoryStatsShort', {
                      avg: c.averagePercent,
                      games: c.games,
                    })}
                  </Text>
                ) : null}
              </View>
              <Ionicons name="chevron-forward" size={20} color="#7FD9C9" />
            </Pressable>
          );
        })}

        <Text style={styles.hint}>{t('quizHub.wikidataNote')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  dailyCard: {
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.mist,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  dailyEyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.tealPressed,
  },
  dailyTitle: {
    marginTop: 6,
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: brand.ink,
  },
  dailyBody: {
    marginTop: 6,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#3A5A54',
  },
  streakRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  streakValue: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  streakBest: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#3A5A54',
  },
  doneToday: {
    marginTop: 8,
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    color: brand.tealPressed,
  },
  ratingCard: {
    marginBottom: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  ratingLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#3A5A54',
  },
  ratingValue: {
    marginTop: 4,
    fontFamily: 'DMSans_700Bold',
    fontSize: 36,
    color: brand.ink,
  },
  ratingMeta: {
    marginTop: 6,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#3A5A54',
  },
  ratingBtn: {
    marginTop: 14,
  },
  lead: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#3A5A54',
  },
  card: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardIcon: {
    marginRight: 12,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: brand.mist,
  },
  cardCopy: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#3A5A54',
  },
  cardStats: {
    marginTop: 6,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: brand.tealPressed,
  },
  hint: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#7A9A92',
  },
});
