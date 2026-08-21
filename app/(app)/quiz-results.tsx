import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { HubHero } from '@/src/components/HubHero';
import { IconButton } from '@/src/components/IconButton';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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
import { brand, fonts } from '@/src/theme/brand';

function categoryLabel(category: QuizCategory) {
  switch (category) {
    case 'breed_origin':
      return t('quizHub.originTitle');
    case 'animal_group':
      return t('quizHub.groupTitle');
    case 'animals_trivia':
      return t('quizHub.triviaTitle');
    default:
      return t('quizHub.breedTitle');
  }
}

/** HTML kit · Історія результатів квізу. */
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
    return (
      <AppScreen>
        <LoadingState message={t('quiz.resultsLoading')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      {error ? (
        <View style={styles.pad}>
          <HubHero
            title={t('quiz.resultsTitle')}
            lead={t('quiz.resultsSubtitle')}
          />
          <ErrorState message={error} onRetry={() => void load()} />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={brand.accent}
            />
          }
          ListHeaderComponent={
            <View style={styles.headerBlock}>
              <HubHero
                title={t('quiz.resultsTitle')}
                lead={t('quiz.resultsSubtitle')}
              />
              <View style={styles.statsCard}>
                <Text style={styles.statsLabel}>{t('quiz.avgLabel')}</Text>
                <Text style={styles.statsValue}>
                  {stats.games > 0
                    ? t('quiz.avgValue', { value: stats.averagePercent })
                    : '—'}
                </Text>
                <Text style={styles.statsMeta}>
                  {t('quiz.statsLine', {
                    games: stats.games,
                    best: stats.bestPercent,
                  })}
                </Text>
              </View>

              {(
                [
                  'breed',
                  'breed_origin',
                  'animal_group',
                  'animals_trivia',
                ] as QuizCategory[]
              ).map((cat) => {
                const c = stats.byCategory[cat];
                return (
                  <View key={cat} style={styles.catCard}>
                    <Text style={styles.catTitle}>{categoryLabel(cat)}</Text>
                    <Text style={styles.catMeta}>
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

              <Text style={styles.historyTitle}>{t('quiz.historyTitle')}</Text>
            </View>
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('quiz.historyEmptyTitle')}>
              <Text style={styles.emptyBody}>{t('quiz.historyEmptyBody')}</Text>
              <View style={styles.emptyBtn}>
                <PrimaryButton
                  label={t('quiz.backToHub')}
                  variant="secondary"
                  onPress={() => router.replace('/(app)/(tabs)/quiz')}
                />
              </View>
            </Section>
          }
          renderItem={({ item }) => (
            <View style={styles.sessionCard}>
              <Pressable style={styles.sessionRow}>
                <View style={styles.sessionCopy}>
                  <Text style={styles.sessionTitle}>
                    {categoryLabel(item.category)}
                  </Text>
                  <Text style={styles.sessionMeta}>
                    {item.species === 'dog'
                      ? t('quiz.speciesDog')
                      : item.species === 'cat'
                        ? t('quiz.speciesCat')
                        : t('quiz.speciesAny')}
                    {' · '}
                    {new Date(item.created_at).toLocaleString('uk-UA')}
                  </Text>
                  <Text style={styles.sessionScore}>
                    {t('quiz.sessionScoreLine', {
                      score: item.score,
                      total: item.total,
                      percent: item.percent,
                    })}
                  </Text>
                </View>
                <View style={styles.percentBadge}>
                  <Text style={styles.percentText}>
                    {Math.round(item.percent)}%
                  </Text>
                </View>
              </Pressable>
              <View style={styles.deleteRow}>
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

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16 },
  list: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerBlock: { marginBottom: 8 },
  statsCard: {
    marginBottom: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  statsLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  statsValue: {
    marginTop: 4,
    fontFamily: fonts.title,
    fontSize: 36,
    lineHeight: 42,
    color: brand.ink,
  },
  statsMeta: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  catCard: {
    marginBottom: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  catTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  catMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  historyTitle: {
    marginTop: 16,
    marginBottom: 10,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  emptyBtn: { marginTop: 12 },
  sessionCard: {
    marginBottom: 10,
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
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionCopy: { flex: 1, paddingRight: 12 },
  sessionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  sessionMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  sessionScore: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.label,
  },
  percentBadge: {
    height: 48,
    width: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.accentTint,
  },
  percentText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  deleteRow: {
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});
