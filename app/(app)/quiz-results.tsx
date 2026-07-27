import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { IconButton } from '@/src/components/IconButton';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { Section } from '@/src/components/Section';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import {
  deleteQuizSession,
  getQuizStats,
  listQuizSessions,
  type QuizCategory,
  type QuizSessionRow,
  type QuizStats,
  emptyQuizStats,
} from '@/src/services/quizResults';
import { brand } from '@/src/theme/brand';

function categoryLabel(category: QuizCategory) {
  switch (category) {
    case 'breed_origin':
      return t('quizHub.originTitle');
    case 'animal_group':
      return t('quizHub.groupTitle');
    default:
      return t('quizHub.breedTitle');
  }
}

export default function QuizResultsScreen() {
  const [sessions, setSessions] = useState<QuizSessionRow[]>([]);
  const [stats, setStats] = useState<QuizStats>(emptyQuizStats());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [list, nextStats] = await Promise.all([
        listQuizSessions(80),
        getQuizStats(),
      ]);
      setSessions(list);
      setStats(nextStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('quiz.resultsLoadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onDelete = async (row: QuizSessionRow) => {
    const ok = await confirmAction({
      title: t('quiz.deleteTitle'),
      message: t('quiz.deleteMessage'),
      confirmLabel: t('history.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deleteQuizSession(row.id);
      setSessions((prev) => prev.filter((s) => s.id !== row.id));
      setStats(await getQuizStats());
    } catch (err) {
      Alert.alert(
        t('history.deleteFailed'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  if (loading) {
    return <LoadingState message={t('quiz.resultsLoading')} />;
  }

  return (
    <AppScreen>
      <View className="px-5 pb-2 pt-2">
        <ScreenHeader
          title={t('quiz.resultsTitle')}
          subtitle={t('quiz.resultsSubtitle')}
        />
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-10"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor="#00A894"
            />
          }
          ListHeaderComponent={
            <View className="mb-4">
              <View className="rounded-3xl border border-forest-100 bg-white px-5 py-5">
                <Text className="font-body text-sm text-forest-600">
                  {t('quiz.avgLabel')}
                </Text>
                <Text className="mt-1 font-display text-4xl text-forest-800">
                  {stats.games > 0
                    ? t('quiz.avgValue', { value: stats.averagePercent })
                    : '—'}
                </Text>
                <Text className="mt-2 font-body text-sm text-forest-600">
                  {t('quiz.statsLine', {
                    games: stats.games,
                    best: stats.bestPercent,
                  })}
                </Text>
              </View>

              <View className="mt-3 gap-2">
                {(
                  [
                    'breed',
                    'breed_origin',
                    'animal_group',
                  ] as QuizCategory[]
                ).map((cat) => {
                  const c = stats.byCategory[cat];
                  return (
                    <View
                      key={cat}
                      className="rounded-2xl border border-forest-100 bg-white px-4 py-3"
                    >
                      <Text className="font-body-bold text-sm text-forest-900">
                        {categoryLabel(cat)}
                      </Text>
                      <Text className="mt-1 font-body text-xs text-forest-600">
                        {c.games === 0
                          ? t('quiz.categoryEmpty')
                          : t('quiz.categoryStats', {
                              games: c.games,
                              avg: c.averagePercent,
                              best: c.bestPercent,
                            })}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text className="mb-2 mt-5 font-body-bold text-base text-forest-800">
                {t('quiz.historyTitle')}
              </Text>
            </View>
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('quiz.historyEmptyTitle')}>
              <Text className="font-body text-sm leading-5 text-forest-600">
                {t('quiz.historyEmptyBody')}
              </Text>
              <View className="mt-3">
                <PrimaryButton
                  label={t('quiz.backToHub')}
                  variant="secondary"
                  onPress={() => router.replace('/(app)/(tabs)/quiz')}
                />
              </View>
            </Section>
          }
          renderItem={({ item }) => (
            <View className="mb-3 rounded-2xl border border-forest-100 bg-white px-4 py-4">
              <Pressable className="flex-row items-center justify-between">
                <View className="flex-1 pr-3">
                  <Text className="font-body-bold text-base text-forest-900">
                    {categoryLabel(item.category)}
                  </Text>
                  <Text className="mt-1 font-body text-xs text-forest-500">
                    {item.species === 'dog'
                      ? t('quiz.speciesDog')
                      : item.species === 'cat'
                        ? t('quiz.speciesCat')
                        : t('quiz.speciesAny')}
                    {' · '}
                    {new Date(item.created_at).toLocaleString('uk-UA')}
                  </Text>
                  <Text className="mt-2 font-body text-sm text-forest-700">
                    {t('quiz.sessionScoreLine', {
                      score: item.score,
                      total: item.total,
                      percent: item.percent,
                    })}
                  </Text>
                </View>
                <View className="h-12 w-12 items-center justify-center rounded-full bg-forest-100">
                  <Text className="font-body-bold text-sm text-forest-800">
                    {Math.round(item.percent)}%
                  </Text>
                </View>
              </Pressable>
              <View className="mt-2 flex-row justify-end">
                <IconButton
                  name="trash-outline"
                  color={brand.score.poor}
                  accessibilityLabel={t('history.delete')}
                  onPress={() => void onDelete(item)}
                />
              </View>
            </View>
          )}
        />
      )}
    </AppScreen>
  );
}
