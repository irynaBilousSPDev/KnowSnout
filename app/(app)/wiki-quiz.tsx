import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ErrorState } from '@/src/components/ErrorState';
import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { saveQuizSession } from '@/src/services/quizResults';
import {
  createWikiQuizRound,
  type WikiQuizCategory,
  type WikiQuizRound,
} from '@/src/services/wikidataQuiz';
import { brand, fonts } from '@/src/theme/brand';

const SESSION_ROUNDS = 5;

function parseCategory(raw?: string): WikiQuizCategory {
  if (raw === 'animal_group') return 'animal_group';
  return 'breed_origin';
}

export default function WikiQuizScreen() {
  const { category: categoryParam } = useLocalSearchParams<{
    category?: string;
  }>();
  const category = parseCategory(categoryParam);

  const [round, setRound] = useState<WikiQuizRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [avoid, setAvoid] = useState<string[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  const loadRound = useCallback(
    async (index: number, skip: string[]) => {
      setLoading(true);
      setError(null);
      setPickedId(null);
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

  const finishSession = async (finalScore: number) => {
    setSessionDone(true);
    if (savedRef.current) return;
    savedRef.current = true;
    setSaving(true);
    try {
      await saveQuizSession({
        category,
        score: finalScore,
        total: SESSION_ROUNDS,
      });
    } catch {
      savedRef.current = false;
    } finally {
      setSaving(false);
    }
  };

  const onAnswer = (choiceId: string) => {
    if (!round || pickedId) return;
    setPickedId(choiceId);
    if (choiceId === round.correctId) setScore((s) => s + 1);
    setAvoid((prev) => [...prev, round.subject].slice(-12));
  };

  const onNext = () => {
    if (roundIndex >= SESSION_ROUNDS) {
      void finishSession(score);
      return;
    }
    void loadRound(roundIndex + 1, avoid);
  };

  const onRestart = () => {
    setScore(0);
    setAvoid([]);
    setSessionDone(false);
    savedRef.current = false;
    void loadRound(1, []);
  };

  const answered = Boolean(pickedId);
  const isCorrect = answered && pickedId === round?.correctId;
  const correctLabel =
    round?.choices.find((c) => c.id === round.correctId)?.label ?? '';

  const title =
    category === 'animal_group'
      ? t('quizHub.groupTitle')
      : t('quizHub.originTitle');

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={title} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.scroll}>
          <Text style={styles.subtitle}>{t('quiz.wikiSubtitle')}</Text>

          <View style={styles.metaRow}>
            <Text style={styles.meta}>
              {t('quiz.progress', {
                current: Math.min(roundIndex, SESSION_ROUNDS),
                total: SESSION_ROUNDS,
              })}
            </Text>
            <Text style={styles.meta}>{t('quiz.score', { score })}</Text>
          </View>

          {loading ? (
            <View style={styles.loading}>
              <ActivityIndicator color={brand.ink} size="large" />
              <Text style={styles.loadingText}>{t('quiz.wikiLoading')}</Text>
            </View>
          ) : error ? (
            <ErrorState message={error} onRetry={onRestart} />
          ) : sessionDone ? (
            <View style={styles.card}>
              <Text style={styles.sessionTitle}>{t('quiz.sessionTitle')}</Text>
              <Text style={styles.sessionBody}>
                {t('quiz.sessionBody', { score, total: SESSION_ROUNDS })}
              </Text>
              <Text style={styles.sessionMeta}>
                {saving ? t('quiz.saving') : t('quiz.savedToAccount')}
              </Text>
              <View style={styles.gap}>
                <PrimaryButton
                  label={t('quiz.viewResults')}
                  variant="secondary"
                  onPress={() => router.push('/(app)/quiz-results')}
                />
                <PrimaryButton label={t('quiz.playAgain')} onPress={onRestart} />
              </View>
            </View>
          ) : round ? (
            <>
              <View style={styles.card}>
                <Text style={styles.prompt}>
                  {t(round.promptKey, { name: round.subject })}
                </Text>
              </View>

              <View style={styles.choices}>
                {round.choices.map((choice) => {
                  const selected = pickedId === choice.id;
                  const isAnswer = choice.id === round.correctId;
                  const choiceStyle: StyleProp<ViewStyle> = [
                    styles.choice,
                    answered && isAnswer && styles.choiceCorrect,
                    answered && selected && !isAnswer && styles.choiceWrong,
                  ];
                  return (
                    <Pressable
                      key={choice.id}
                      disabled={answered}
                      onPress={() => onAnswer(choice.id)}
                      style={({ pressed }) => [
                        pressed && !answered && styles.pressed,
                      ]}
                    >
                      <View style={choiceStyle}>
                        <Text style={styles.choiceLabel}>{choice.label}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>

              {answered ? (
                <View style={styles.card}>
                  <Text
                    style={[
                      styles.verdict,
                      isCorrect ? styles.verdictOk : styles.verdictBad,
                    ]}
                  >
                    {isCorrect
                      ? t('quiz.correct')
                      : t('quiz.wrong', { name: correctLabel })}
                  </Text>
                  <Text style={styles.learnTitle}>
                    {t('quiz.learnTitle', { name: round.learn.title })}
                  </Text>
                  <Text style={styles.learnBody}>{round.learn.detail}</Text>
                  <Text style={styles.trust}>{t('quiz.wikiTrustNote')}</Text>
                  <Pressable
                    onPress={() => void Linking.openURL(round.learn.wikidataUrl)}
                    style={styles.linkWrap}
                  >
                    <Text style={styles.link}>{t('quiz.openWikidata')}</Text>
                  </Pressable>
                  <View style={styles.nextWrap}>
                    <PrimaryButton
                      label={
                        roundIndex >= SESSION_ROUNDS
                          ? t('quiz.seeResult')
                          : t('quiz.next')
                      }
                      onPress={onNext}
                    />
                  </View>
                </View>
              ) : null}
            </>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 48,
  },
  subtitle: {
    marginTop: 0,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  metaRow: {
    marginTop: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: brand.navy,
  },
  loading: { alignItems: 'center', paddingVertical: 64 },
  loadingText: {
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  prompt: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    lineHeight: 26,
    color: brand.ink,
  },
  choices: { marginTop: 16, gap: 8 },
  choice: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  choiceCorrect: {
    borderColor: brand.navy,
    backgroundColor: brand.mist,
  },
  choiceWrong: {
    borderColor: '#F0B4A4',
    backgroundColor: '#FFF6F3',
  },
  choiceLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: brand.ink,
  },
  pressed: { opacity: 0.85 },
  verdict: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
  },
  verdictOk: { color: brand.ink },
  verdictBad: { color: brand.score.poor },
  learnTitle: {
    marginTop: 16,
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: brand.ink,
  },
  learnBody: {
    marginTop: 8,
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
  trust: {
    marginTop: 12,
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#8A9AAB',
  },
  linkWrap: { marginTop: 12 },
  link: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: brand.navy,
  },
  nextWrap: { marginTop: 16 },
  sessionTitle: {
    textAlign: 'center',
    fontFamily: 'Manrope_700Bold',
    fontSize: 24,
    color: brand.ink,
  },
  sessionBody: {
    marginTop: 12,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#5A6B7D',
  },
  sessionMeta: {
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#8A9AAB',
  },
  gap: { marginTop: 24, gap: 12 },
});
