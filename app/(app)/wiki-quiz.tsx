import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { saveQuizSession } from '@/src/services/quizResults';
import {
  createWikiQuizRound,
  type WikiQuizCategory,
  type WikiQuizRound,
} from '@/src/services/wikidataQuiz';
import { brand } from '@/src/theme/brand';

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
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView
        contentContainerClassName="px-5 pb-12 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-display text-xl text-forest-800">{title}</Text>
        <Text className="mt-2 font-body text-sm leading-5 text-forest-600">
          {t('quiz.wikiSubtitle')}
        </Text>

        <View className="mb-4 mt-4 flex-row items-center justify-between">
          <Text className="font-body-bold text-sm text-forest-700">
            {t('quiz.progress', {
              current: Math.min(roundIndex, SESSION_ROUNDS),
              total: SESSION_ROUNDS,
            })}
          </Text>
          <Text className="font-body-bold text-sm text-forest-700">
            {t('quiz.score', { score })}
          </Text>
        </View>

        {loading ? (
          <View className="items-center py-16">
            <ActivityIndicator color={brand.ink} size="large" />
            <Text className="mt-3 font-body text-sm text-forest-600">
              {t('quiz.wikiLoading')}
            </Text>
          </View>
        ) : error ? (
          <ErrorState message={error} onRetry={onRestart} />
        ) : sessionDone ? (
          <View className="rounded-3xl border border-forest-100 bg-white px-5 py-8">
            <Text className="text-center font-display text-2xl text-forest-800">
              {t('quiz.sessionTitle')}
            </Text>
            <Text className="mt-3 text-center font-body text-base text-forest-600">
              {t('quiz.sessionBody', { score, total: SESSION_ROUNDS })}
            </Text>
            <Text className="mt-2 text-center font-body text-sm text-forest-500">
              {saving ? t('quiz.saving') : t('quiz.savedToAccount')}
            </Text>
            <View className="mt-6 gap-3">
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
            <View className="rounded-3xl border border-forest-100 bg-white px-5 py-5">
              <Text className="font-body-bold text-lg leading-6 text-forest-900">
                {t(round.promptKey, { name: round.subject })}
              </Text>
            </View>

            <View className="mt-4 gap-2">
              {round.choices.map((choice) => {
                const selected = pickedId === choice.id;
                const isAnswer = choice.id === round.correctId;
                let style = 'border-forest-100 bg-white active:opacity-80';
                if (answered && isAnswer) {
                  style = 'border-forest-600 bg-forest-100';
                } else if (answered && selected && !isAnswer) {
                  style = 'border-red-300 bg-sand-100';
                }
                return (
                  <Pressable
                    key={choice.id}
                    disabled={answered}
                    onPress={() => onAnswer(choice.id)}
                    className={`rounded-2xl border px-4 py-3.5 ${style}`}
                  >
                    <Text className="font-body-bold text-base text-forest-900">
                      {choice.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {answered ? (
              <View className="mt-5 rounded-3xl border border-forest-100 bg-white px-5 py-5">
                <Text
                  className={`font-body-bold text-lg ${
                    isCorrect ? 'text-forest-800' : 'text-score-poor'
                  }`}
                >
                  {isCorrect
                    ? t('quiz.correct')
                    : t('quiz.wrong', { name: correctLabel })}
                </Text>
                <Text className="mt-4 font-body-bold text-base text-forest-900">
                  {t('quiz.learnTitle', { name: round.learn.title })}
                </Text>
                <Text className="mt-2 font-body text-sm leading-5 text-forest-700">
                  {round.learn.detail}
                </Text>
                <Text className="mt-3 font-body text-xs leading-5 text-forest-500">
                  {t('quiz.wikiTrustNote')}
                </Text>
                <Pressable
                  onPress={() => void Linking.openURL(round.learn.wikidataUrl)}
                  className="mt-3"
                >
                  <Text className="font-body-bold text-sm text-forest-700">
                    {t('quiz.openWikidata')}
                  </Text>
                </Pressable>
                <View className="mt-4">
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
      </ScrollView>
    </SafeAreaView>
  );
}
