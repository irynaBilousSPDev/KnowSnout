import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { t } from '@/src/i18n';
import { saveQuizSession } from '@/src/services/quizResults';
import {
  createWikiQuizRound,
  type WikiQuizCategory,
  type WikiQuizRound,
} from '@/src/services/wikidataQuiz';
import { brand, fonts } from '@/src/theme/brand';

const LETTERS = ['A', 'B', 'C', 'D'] as const;

function parseCategory(raw?: string): WikiQuizCategory {
  if (raw === 'animal_group') return 'animal_group';
  return 'breed_origin';
}

function sessionTotal(category: WikiQuizCategory) {
  return category === 'animal_group' ? 12 : 10;
}

/** Screenshots 05.02 (origin) + 05.03 (group) */
export default function WikiQuizScreen() {
  const { category: categoryParam } = useLocalSearchParams<{
    category?: string;
  }>();
  const category = parseCategory(categoryParam);
  const total = sessionTotal(category);
  const isGroup = category === 'animal_group';

  const [round, setRound] = useState<WikiQuizRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [seconds, setSeconds] = useState(7);
  const savedRef = useRef(false);

  const loadRound = useCallback(
    async (index: number, skip: string[]) => {
      setLoading(true);
      setError(null);
      setPickedId(null);
      setSeconds(7);
      try {
        const next = await createWikiQuizRound(category, skip);
        setRound(next);
        setRoundIndex(index);
        setSessionDone(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('quiz.loadError'));
        setRound(null);
      } finally {
        setLoading(false);
      }
    },
    [category],
  );

  useFocusEffect(
    useCallback(() => {
      setScore(0);
      setAvoid([]);
      savedRef.current = false;
      void loadRound(1, []);
    }, [loadRound]),
  );

  useEffect(() => {
    if (isGroup || pickedId || sessionDone || loading) return;
    const id = setInterval(() => {
      setSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isGroup, pickedId, sessionDone, loading, roundIndex]);

  const finishSession = async (finalScore: number) => {
    setSessionDone(true);
    if (savedRef.current) return;
    savedRef.current = true;
    try {
      await saveQuizSession({
        category,
        score: finalScore,
        total,
      });
      router.replace({
        pathname: '/(app)/quiz-results',
        params: {
          score: String(finalScore),
          total: String(total),
          category,
        },
      } as never);
    } catch {
      savedRef.current = false;
    }
  };

  const onAnswer = (choiceId: string) => {
    if (!round || pickedId) return;
    setPickedId(choiceId);
    const ok = choiceId === round.correctId;
    const nextScore = ok ? score + 1 : score;
    if (ok) setScore(nextScore);
    const nextAvoid = [...avoid, round.subject].slice(-12);
    setAvoid(nextAvoid);
    setTimeout(() => {
      if (roundIndex >= total) {
        void finishSession(nextScore);
      } else {
        void loadRound(roundIndex + 1, nextAvoid);
      }
    }, 650);
  };

  const onRestart = () => {
    setScore(0);
    setAvoid([]);
    setSessionDone(false);
    savedRef.current = false;
    void loadRound(1, []);
  };

  if (loading && !round) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <View style={styles.loading}>
          <ActivityIndicator color={brand.accent} size="large" />
        </View>
      </AppScreen>
    );
  }

  if (error && !round) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <ErrorState message={error} onRetry={onRestart} />
      </AppScreen>
    );
  }

  if (!round || sessionDone) return null;

  if (isGroup) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <View style={styles.progressRow}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(roundIndex / total) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressN}>
            {roundIndex}/{total}
          </Text>
        </View>
        <ScrollView contentContainerStyle={styles.groupPad}>
          <Text style={styles.qTitle}>{t('quiz.groupPrompt')}</Text>
          <View style={styles.photoBox}>
            <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
            <Text style={styles.photoHint}>
              {t('quiz.breedPhotoHint', { name: round.subject })}
            </Text>
          </View>
          <View style={styles.grid}>
            {round.choices.slice(0, 4).map((choice, i) => {
              const on = pickedId === choice.id;
              const icons = [
                'water-outline',
                'locate-outline',
                'checkmark-circle-outline',
                'briefcase-outline',
              ] as const;
              return (
                <Pressable
                  key={choice.id}
                  onPress={() => onAnswer(choice.id)}
                  style={[styles.gridCard, on && styles.gridCardOn]}
                >
                  <Ionicons
                    name={icons[i] ?? 'ellipse-outline'}
                    size={22}
                    color={on ? brand.accent : brand.muted}
                  />
                  <Text style={[styles.gridLabel, on && styles.gridLabelOn]}>
                    {choice.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.heroWrap}>
        <View style={styles.hero}>
          <View style={styles.heroPh}>
            <Ionicons name="image-outline" size={32} color="#FFFFFF99" />
            <Text style={styles.heroPhT}>{t('quizHub.dailyPhotoHint')}</Text>
          </View>
        </View>
        <View style={styles.originTop}>
          <Pressable onPress={() => router.back()} style={styles.originBack}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.timerPill}>
            <Ionicons name="time-outline" size={14} color={brand.ink} />
            <Text style={styles.timerT}>
              0:{String(seconds).padStart(2, '0')}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.segRow}>
        {Array.from({ length: 4 }).map((_, i) => (
          <View
            key={i}
            style={[styles.seg, i < Math.min(roundIndex, 4) && styles.segOn]}
          />
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.originPad}>
        <Text style={styles.qTitle}>{t('quiz.originPrompt')}</Text>
        <View style={styles.originChoices}>
          {round.choices.slice(0, 4).map((choice, i) => {
            const on = pickedId === choice.id;
            return (
              <Pressable
                key={choice.id}
                onPress={() => onAnswer(choice.id)}
                style={[styles.letterChoice, on && styles.letterChoiceOn]}
              >
                <View style={[styles.letterBadge, on && styles.letterBadgeOn]}>
                  <Text style={[styles.letterT, on && styles.letterTOn]}>
                    {LETTERS[i] ?? String(i + 1)}
                  </Text>
                </View>
                <Text style={styles.letterLabel}>{choice.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.creamDeep,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: brand.accent,
    borderRadius: 2,
  },
  progressN: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  groupPad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  qTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 16,
  },
  photoBox: {
    aspectRatio: 1.4,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: '#EEEBE6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
  },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridCard: {
    width: '47%',
    flexGrow: 1,
    minHeight: 100,
    borderRadius: 18,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1.5,
    borderColor: 'transparent',
    padding: 16,
    gap: 10,
    justifyContent: 'center',
  },
  gridCardOn: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  gridLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  gridLabelOn: { color: brand.accent },
  heroWrap: { position: 'relative' },
  hero: { height: 220, backgroundColor: '#3A3A3A' },
  heroPh: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 220,
  },
  heroPhT: { fontFamily: fonts.body, fontSize: 13, color: '#FFFFFFAA' },
  originTop: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  timerT: { fontFamily: fonts.bodySemi, fontSize: 13, color: brand.ink },
  segRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  seg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: brand.creamDeep,
  },
  segOn: { backgroundColor: brand.accent },
  originPad: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 40 },
  originChoices: { gap: 10 },
  letterChoice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  letterChoiceOn: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  letterBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letterBadgeOn: { backgroundColor: brand.accent },
  letterT: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.muted,
  },
  letterTOn: { color: '#FFFFFF' },
  letterLabel: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
});
