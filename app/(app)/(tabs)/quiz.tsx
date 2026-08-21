import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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
  titleKey: string;
  bodyKey: string;
  href: string;
  chip?: 'daily' | 'new' | 'count';
  chipLabelKey?: string;
  tracked?: boolean;
};

/** HTML phone “30 · Квіз-хаб”. */
const CATEGORIES: QuizCategoryCard[] = [
  {
    id: 'breed_origin',
    titleKey: 'quizHub.originTitle',
    bodyKey: 'quizHub.originBody',
    href: '/(app)/wiki-quiz?category=breed_origin',
    chip: 'daily',
    chipLabelKey: 'quizHub.chipDaily',
    tracked: true,
  },
  {
    id: 'animal_group',
    titleKey: 'quizHub.groupTitle',
    bodyKey: 'quizHub.groupBody',
    href: '/(app)/wiki-quiz?category=animal_group',
    chip: 'count',
    chipLabelKey: 'quizHub.chipQuestions',
    tracked: true,
  },
  {
    id: 'breed',
    titleKey: 'quizHub.breedTitle',
    bodyKey: 'quizHub.breedBody',
    href: '/(app)/breed-quiz',
    chip: 'count',
    chipLabelKey: 'quizHub.chipBreedQs',
    tracked: true,
  },
  {
    id: 'zoom',
    titleKey: 'quizHub.zoomTitle',
    bodyKey: 'quizHub.zoomBody',
    href: '/(app)/quiz-zoom',
    chip: 'new',
    chipLabelKey: 'quizHub.chipNew',
  },
  {
    id: 'heavier',
    titleKey: 'quizHub.heavierTitle',
    bodyKey: 'quizHub.heavierBody',
    href: '/(app)/quiz-heavier',
    chip: 'new',
    chipLabelKey: 'quizHub.chipNew',
  },
  {
    id: 'myth',
    titleKey: 'quizHub.mythTitle',
    bodyKey: 'quizHub.mythBody',
    href: '/(app)/quiz-myth',
    chip: 'new',
    chipLabelKey: 'quizHub.chipNew',
  },
  {
    id: 'animals_trivia',
    titleKey: 'quizHub.triviaTitle',
    bodyKey: 'quizHub.triviaBody',
    href: '/(app)/trivia-quiz',
    tracked: true,
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

  const toRecord = Math.max(0, streak.bestStreak - streak.currentStreak);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.scroll}>
          <Text style={styles.title}>{t('quizHub.title')}</Text>

          <View style={styles.streakCard}>
            <View style={styles.streakRing}>
              <Ionicons name="flame" size={24} color={brand.successDark} />
            </View>
            <View style={styles.streakCopy}>
              <Text style={styles.streakValue}>
                {t('quizStreak.daysInARow', { count: streak.currentStreak })}
              </Text>
              <Text style={styles.streakMeta}>
                {t('quizStreak.toRecord', {
                  record: streak.bestStreak || 21,
                  left: toRecord || Math.max(1, 21 - streak.currentStreak),
                })}
                {' · '}
                {t('quizStreak.xpLine', {
                  level: Math.max(1, Math.floor(stats.games / 3) + 1),
                  xp: Math.min(500, stats.games * 40),
                  next: 500,
                })}
              </Text>
            </View>
          </View>

          <View style={styles.wikiNote}>
            <Ionicons name="globe-outline" size={13} color={brand.mutedSoft} />
            <Text style={styles.wikiNoteText}>{t('quizHub.wikidataNote')}</Text>
          </View>

          <View style={styles.dailyCard}>
            <Text style={styles.dailyEyebrow}>{t('quizStreak.dailyTitle')}</Text>
            <Text style={styles.dailyTitle}>{t(daily.titleKey)}</Text>
            <Text style={styles.dailyBody}>{t(daily.bodyKey)}</Text>
            {doneToday ? (
              <Text style={styles.doneToday}>{t('quizStreak.doneToday')}</Text>
            ) : null}
            <PrimaryButton
              label={
                doneToday
                  ? t('quizStreak.playAgain')
                  : t('quizStreak.playDaily')
              }
              onPress={() => router.push(daily.href as never)}
              style={styles.dailyBtn}
            />
          </View>

          {CATEGORIES.map((cat) => {
            const chipGood = cat.chip === 'daily' || cat.chip === 'new';
            return (
              <Pressable
                key={cat.id}
                onPress={() => router.push(cat.href as never)}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <Text style={styles.rowTitle}>{t(cat.titleKey)}</Text>
                {cat.chipLabelKey ? (
                  <View
                    style={[styles.chip, chipGood ? styles.chipGood : styles.chipNeutral]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        chipGood && styles.chipTextGood,
                      ]}
                    >
                      {t(cat.chipLabelKey)}
                    </Text>
                  </View>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={brand.mutedSoft}
                  />
                )}
              </Pressable>
            );
          })}

          <Pressable
            onPress={() => router.push('/(app)/quiz-leaderboard' as never)}
            style={styles.friendsCard}
          >
            <Text style={styles.friendsLabel}>{t('quizHub.friendsTop')}</Text>
            <Text style={styles.friendsMeta}>{t('quizHub.friendsTopHint')}</Text>
          </Pressable>

          <PrimaryButton
            label={t('quiz.viewResults')}
            variant="secondary"
            onPress={() => router.push('/(app)/quiz-results')}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: brand.radius.md,
    backgroundColor: brand.successTint,
    padding: 16,
  },
  streakRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 5,
    borderColor: brand.successSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surfaceElevated,
  },
  streakCopy: { flex: 1 },
  streakValue: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.successDark,
  },
  streakMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.successDark,
  },
  wikiNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wikiNoteText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  dailyCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  dailyEyebrow: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.accentDark,
  },
  dailyTitle: {
    marginTop: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  dailyBody: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  doneToday: {
    marginTop: 8,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.successDark,
  },
  dailyBtn: { marginTop: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  chip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: brand.creamDeep,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipNeutral: { backgroundColor: brand.creamDeep },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  chipTextGood: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  friendsCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  friendsLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
    marginBottom: 6,
  },
  friendsMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
});
