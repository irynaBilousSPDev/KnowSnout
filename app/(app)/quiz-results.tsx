import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  emptyQuizStats,
  getQuizStats,
  listQuizSessions,
  type QuizSessionRow,
  type QuizStats,
} from '@/src/services/quizResults';
import {
  emptyQuizStreak,
  getQuizStreak,
  type QuizStreakState,
} from '@/src/services/quizStreak';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.08 celebration when score params present; else history. */
export default function QuizResultsScreen() {
  const params = useLocalSearchParams<{
    score?: string;
    total?: string;
  }>();
  const scoreN = Number(params.score);
  const totalN = Number(params.total);
  const showCelebration =
    Number.isFinite(scoreN) &&
    Number.isFinite(totalN) &&
    totalN > 0 &&
    params.score != null;

  const [sessions, setSessions] = useState<QuizSessionRow[]>([]);
  const [stats, setStats] = useState<QuizStats>(emptyQuizStats());
  const [streak, setStreak] = useState<QuizStreakState>(emptyQuizStreak());
  const [loading, setLoading] = useState(!showCelebration);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (soft?: boolean) => {
    if (!soft) setLoading(true);
    setError(null);
    try {
      const [list, nextStats, nextStreak] = await Promise.all([
        listQuizSessions(80),
        getQuizStats(),
        getQuizStreak(),
      ]);
      setSessions(list);
      setStats(nextStats);
      setStreak(nextStreak);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('quiz.resultsLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void getQuizStreak().then(setStreak).catch(() => undefined);
      if (!showCelebration) void load();
    }, [load, showCelebration]),
  );

  if (showCelebration) {
    const speed = 20;
    const accuracy = Math.round((scoreN / totalN) * 40);
    const streakBonus = 50;
    const streakDays = streak.currentStreak || 13;
    const great = scoreN / totalN >= 0.7;

    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <View style={styles.celeb}>
          <View style={styles.ring}>
            <Text style={styles.ringScore}>
              {scoreN}/{totalN}
            </Text>
          </View>
          <Text style={styles.celebTitle}>
            {great ? t('quiz.greatResult') : t('quiz.sessionTitle')}
          </Text>
          <View style={styles.streakLine}>
            <Ionicons name="paw" size={14} color={brand.accent} />
            <Text style={styles.streakT}>
              {t('quiz.streakNow', { count: streakDays })}
            </Text>
          </View>
          <View style={styles.xpCard}>
            {(
              [
                ['quiz.xpSpeed', speed],
                ['quiz.xpAccuracy', accuracy],
                ['quiz.xpStreakBonus', streakBonus],
              ] as const
            ).map(([key, xp]) => (
              <View key={key} style={styles.xpRow}>
                <Text style={styles.xpLabel}>{t(key)}</Text>
                <Text style={styles.xpVal}>+{xp} XP</Text>
              </View>
            ))}
          </View>
          <PrimaryButton
            label={t('quiz.nextQuiz')}
            onPress={() => router.replace('/(app)/(tabs)/quiz' as never)}
          />
          <PrimaryButton
            label={t('quiz.viewResults')}
            variant="secondary"
            onPress={() =>
              router.replace('/(app)/quiz-results' as never)
            }
            style={{ marginTop: 10 }}
          />
        </View>
      </AppScreen>
    );
  }

  if (loading) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <ScrHeader title={t('quiz.resultsTitle')} />
        <LoadingState />
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <ScrHeader title={t('quiz.resultsTitle')} />
        <ErrorState message={error} onRetry={() => void load()} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('quiz.resultsTitle')} />
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load(true);
            }}
            tintColor={brand.accent}
          />
        }
        ListHeaderComponent={
          <Text style={styles.stats}>
            {t('quiz.gamesPlayed', { n: stats.games })} ·{' '}
            {t('quiz.avgScore', {
              avg: stats.games ? Math.round(stats.averagePercent) : 0,
            })}
          </Text>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>{t('quiz.resultsEmpty')}</Text>
        }
        renderItem={({ item }) => (
          <Pressable style={styles.row}>
            <Text style={styles.rowTitle}>
              {item.score}/{item.total}
            </Text>
            <Text style={styles.rowMeta}>{item.category}</Text>
          </Pressable>
        )}
      />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  celeb: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  ring: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  ringScore: {
    fontFamily: fonts.titleExtra,
    fontSize: 28,
    color: brand.ink,
  },
  celebTitle: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: brand.ink,
    textAlign: 'center',
  },
  streakLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    marginBottom: 20,
  },
  streakT: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.accent,
  },
  xpCard: {
    alignSelf: 'stretch',
    backgroundColor: brand.surfaceElevated,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  xpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  xpLabel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  xpVal: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  stats: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    marginBottom: 12,
  },
  empty: {
    textAlign: 'center',
    marginTop: 40,
    fontFamily: fonts.body,
    color: brand.muted,
  },
  row: {
    backgroundColor: brand.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  rowTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  rowMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
});
