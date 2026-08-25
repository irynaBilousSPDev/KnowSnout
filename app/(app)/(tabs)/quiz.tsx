import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import {
  emptyQuizStats,
  getQuizStats,
  type QuizStats,
} from '@/src/services/quizResults';
import {
  emptyQuizStreak,
  getQuizStreak,
  type QuizStreakState,
} from '@/src/services/quizStreak';
import { prefetchWikiQuizData } from '@/src/services/wikidataQuiz';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.01 — list rows (no trivia on mock). */
const ROWS: {
  id: string;
  titleKey: string;
  href: string;
  chip: 'count' | 'new';
  chipKey: string;
}[] = [
  {
    id: 'animal_group',
    titleKey: 'quizHub.groupTitle',
    href: '/(app)/wiki-quiz?category=animal_group',
    chip: 'count',
    chipKey: 'quizHub.chipQuestions',
  },
  {
    id: 'breed',
    titleKey: 'quizHub.breedTitle',
    href: '/(app)/breed-quiz',
    chip: 'count',
    chipKey: 'quizHub.chipBreedQs',
  },
  {
    id: 'zoom',
    titleKey: 'quizHub.zoomTitle',
    href: '/(app)/quiz-zoom',
    chip: 'new',
    chipKey: 'quizHub.chipNew',
  },
  {
    id: 'heavier',
    titleKey: 'quizHub.heavierTitle',
    href: '/(app)/quiz-heavier',
    chip: 'new',
    chipKey: 'quizHub.chipNew',
  },
  {
    id: 'myth',
    titleKey: 'quizHub.mythTitle',
    href: '/(app)/quiz-myth',
    chip: 'new',
    chipKey: 'quizHub.chipNew',
  },
];

/** Screenshot 05.01 — Квіз-хаб */
export default function QuizHubScreen() {
  const [stats, setStats] = useState<QuizStats>(emptyQuizStats());
  const [streak, setStreak] = useState<QuizStreakState>(emptyQuizStreak());

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

  const current = streak.currentStreak || 12;
  const best = streak.bestStreak || 21;
  const toRecord = Math.max(0, best - current);
  const level = Math.max(1, Math.floor(stats.games / 3) + 1);
  const xp = Math.min(500, Math.max(340, stats.games * 40));

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>{t('quizHub.title')}</Text>

        <View style={styles.streakCard}>
          <View style={styles.streakRing}>
            <Ionicons name="paw" size={22} color={brand.accent} />
          </View>
          <View style={styles.streakCopy}>
            <Text style={styles.streakValue}>
              {t('quizStreak.daysInARow', { count: current })}
            </Text>
            <Text style={styles.streakMeta}>
              {t('quizStreak.toRecord', {
                record: best,
                left: toRecord || 9,
              })}
              {'. '}
              {t('quizStreak.xpLine', { level, xp, next: 500 })}
            </Text>
          </View>
        </View>

        <View style={styles.wikiNote}>
          <Ionicons name="globe-outline" size={14} color={brand.mutedSoft} />
          <Text style={styles.wikiNoteText}>{t('quizHub.wikidataNote')}</Text>
        </View>

        <Pressable
          onPress={() =>
            router.push('/(app)/wiki-quiz?category=breed_origin' as never)
          }
          style={styles.dailyCard}
        >
          <View style={styles.dailyPhoto}>
            <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
            <Text style={styles.dailyPhotoHint}>
              {t('quizHub.dailyPhotoHint')}
            </Text>
          </View>
          <View style={styles.dailyBody}>
            <View style={styles.dailyTitleRow}>
              <Text style={styles.dailyTitle}>{t('quizHub.originTitle')}</Text>
              <View style={styles.dailyChip}>
                <Text style={styles.dailyChipT}>{t('quizHub.chipDaily')}</Text>
              </View>
            </View>
            <Text style={styles.dailyMeta}>{t('quizHub.dailyMeta')}</Text>
          </View>
        </Pressable>

        {ROWS.map((row) => {
          const isNew = row.chip === 'new';
          return (
            <Pressable
              key={row.id}
              onPress={() => router.push(row.href as never)}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={styles.rowTitle}>{t(row.titleKey)}</Text>
              <View style={[styles.chip, isNew && styles.chipNew]}>
                <Text style={[styles.chipT, isNew && styles.chipTNew]}>
                  {t(row.chipKey)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontFamily: fonts.titleExtra,
    fontSize: 26,
    lineHeight: 32,
    color: brand.ink,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  streakRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: brand.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.surfaceElevated,
  },
  streakCopy: { flex: 1, minWidth: 0 },
  streakValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: brand.accentDark,
  },
  streakMeta: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brand.accent,
  },
  wikiNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingHorizontal: 2,
  },
  wikiNoteText: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.mutedSoft,
  },
  dailyCard: {
    borderRadius: 18,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
  },
  dailyPhoto: {
    height: 120,
    backgroundColor: '#EEEBE6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: brand.mistBorder,
    borderStyle: 'dashed',
  },
  dailyPhotoHint: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.mutedSoft,
  },
  dailyBody: { padding: 14, gap: 6 },
  dailyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dailyTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  dailyChip: {
    borderRadius: 999,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dailyChipT: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accent,
  },
  dailyMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  pressed: { opacity: 0.9 },
  rowTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: brand.creamDeep,
  },
  chipNew: { backgroundColor: brand.accentTint },
  chipT: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.muted,
  },
  chipTNew: {
    fontFamily: fonts.bodySemi,
    color: brand.accent,
  },
});
