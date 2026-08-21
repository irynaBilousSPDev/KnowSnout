import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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
import { prefetchWikiQuizData } from '@/src/services/wikidataQuiz';
import { brand, fonts } from '@/src/theme/brand';

type QuizCategoryCard = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  bodyKey: string;
  href: string;
  tracked?: boolean;
};

const CATEGORIES: QuizCategoryCard[] = [
  {
    id: 'breed',
    icon: 'camera-outline',
    titleKey: 'quizHub.breedTitle',
    bodyKey: 'quizHub.breedBody',
    href: '/(app)/breed-quiz',
    tracked: true,
  },
  {
    id: 'breed_origin',
    icon: 'globe-outline',
    titleKey: 'quizHub.originTitle',
    bodyKey: 'quizHub.originBody',
    href: '/(app)/wiki-quiz?category=breed_origin',
    tracked: true,
  },
  {
    id: 'animal_group',
    icon: 'leaf-outline',
    titleKey: 'quizHub.groupTitle',
    bodyKey: 'quizHub.groupBody',
    href: '/(app)/wiki-quiz?category=animal_group',
    tracked: true,
  },
  {
    id: 'animals_trivia',
    icon: 'bulb-outline',
    titleKey: 'quizHub.triviaTitle',
    bodyKey: 'quizHub.triviaBody',
    href: '/(app)/trivia-quiz',
    tracked: true,
  },
  {
    id: 'zoom',
    icon: 'scan-outline',
    titleKey: 'quizHub.zoomTitle',
    bodyKey: 'quizHub.zoomBody',
    href: '/(app)/quiz-zoom',
  },
  {
    id: 'heavier',
    icon: 'school-outline',
    titleKey: 'quizHub.heavierTitle',
    bodyKey: 'quizHub.heavierBody',
    href: '/(app)/quiz-heavier',
  },
  {
    id: 'myth',
    icon: 'swap-horizontal-outline',
    titleKey: 'quizHub.mythTitle',
    bodyKey: 'quizHub.mythBody',
    href: '/(app)/quiz-myth',
  },
];

export default function QuizHubScreen() {
  const [stats, setStats] = useState<QuizStats>(emptyQuizStats());
  const [streak, setStreak] = useState<QuizStreakState>(emptyQuizStreak());
  const daily = getDailyQuizChallenge();
  const doneToday = playedQuizToday(streak);

  useFocusEffect(
    useCallback(() => {
      prefetchWikiQuizData();
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
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.scroll}>
        <HubHero
          title={t('quizHub.title')}
          lead={t('quizHub.subtitle')}
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
          const c =
            cat.tracked && cat.id in stats.byCategory
              ? stats.byCategory[cat.id as keyof typeof stats.byCategory]
              : null;
          return (
            <Pressable
              key={cat.id}
              onPress={() => router.push(cat.href as never)}
              style={({ pressed }) => pressed && styles.cardPressed}
            >
              <View style={styles.card}>
                <View style={styles.cardIcon}>
                  <Ionicons name={cat.icon} size={22} color={brand.accent} />
                </View>
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{t(cat.titleKey)}</Text>
                  <Text style={styles.cardBody}>{t(cat.bodyKey)}</Text>
                  {c && c.games > 0 ? (
                    <Text style={styles.cardStats}>
                      {t('quiz.categoryStatsShort', {
                        avg: c.averagePercent,
                        games: c.games,
                      })}
                    </Text>
                  ) : null}
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={brand.mutedSoft}
                />
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.hint}>{t('quizHub.wikidataNote')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const softCard = {
  backgroundColor: brand.surfaceElevated,
  shadowColor: brand.shadow.color,
  shadowOpacity: brand.shadow.opacity,
  shadowRadius: brand.shadow.radius,
  shadowOffset: brand.shadow.offset,
  elevation: 1,
} as const;

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  dailyCard: {
    marginBottom: 16,
    borderRadius: brand.radius.md,
    backgroundColor: brand.mist,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  dailyEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.accentDark,
  },
  dailyTitle: {
    marginTop: 6,
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  dailyBody: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  streakRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  streakValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  streakBest: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  doneToday: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.accentDark,
  },
  ratingCard: {
    marginBottom: 16,
    borderRadius: brand.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 16,
    ...softCard,
  },
  ratingLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  ratingValue: {
    marginTop: 4,
    fontFamily: fonts.title,
    fontSize: 36,
    lineHeight: 42,
    color: brand.ink,
  },
  ratingMeta: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  ratingBtn: { marginTop: 14 },
  lead: {
    marginBottom: 16,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  card: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: brand.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...softCard,
  },
  cardPressed: { opacity: 0.9 },
  cardIcon: {
    marginRight: 12,
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: brand.accentTint,
  },
  cardCopy: { flex: 1, paddingRight: 8 },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  cardStats: {
    marginTop: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.accentDark,
  },
  hint: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.mutedSoft,
  },
});
