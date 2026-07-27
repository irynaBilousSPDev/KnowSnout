import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';

import { ErrorState } from '@/src/components/ErrorState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  createBreedQuizRound,
  type BreedQuizRound,
} from '@/src/services/breedQuiz';
import { saveQuizSession } from '@/src/services/quizResults';
import {
  enrichBreedFromWikidata,
  type BreedEnrichment,
} from '@/src/services/wikidataQuiz';
import { brand } from '@/src/theme/brand';
import type { CompanionBreedSpecies } from '@/src/types/breed';

const SESSION_ROUNDS = 5;

export default function BreedQuizScreen() {
  const [species, setSpecies] = useState<CompanionBreedSpecies>('dog');
  const [round, setRound] = useState<BreedQuizRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [recentCorrectIds, setRecentCorrectIds] = useState<string[]>([]);
  const [sessionDone, setSessionDone] = useState(false);
  const [wiki, setWiki] = useState<BreedEnrichment | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedRef = useRef(false);

  const loadRound = useCallback(
    async (
      nextSpecies: CompanionBreedSpecies,
      avoid: string[],
      index: number,
    ) => {
      setLoading(true);
      setError(null);
      setPickedId(null);
      setWiki(null);
      try {
        const next = await createBreedQuizRound(nextSpecies, avoid);
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
    [],
  );

  useFocusEffect(
    useCallback(() => {
      setScore(0);
      setRecentCorrectIds([]);
      savedRef.current = false;
      void loadRound(species, [], 1);
    }, [loadRound, species]),
  );

  const finishSession = async (finalScore: number) => {
    setSessionDone(true);
    if (savedRef.current) return;
    savedRef.current = true;
    setSaving(true);
    try {
      await saveQuizSession({
        category: 'breed',
        score: finalScore,
        total: SESSION_ROUNDS,
        species,
      });
    } catch {
      savedRef.current = false;
    } finally {
      setSaving(false);
    }
  };

  const onPickSpecies = (next: CompanionBreedSpecies) => {
    if (next === species) return;
    setSpecies(next);
    setScore(0);
    setRecentCorrectIds([]);
    setSessionDone(false);
    savedRef.current = false;
  };

  const onAnswer = (choiceId: string) => {
    if (!round || pickedId) return;
    setPickedId(choiceId);
    const correct = choiceId === round.correctId;
    if (correct) setScore((s) => s + 1);
    setRecentCorrectIds((prev) =>
      [...prev, round.correctId].slice(-12),
    );
    const name = round.fact.name;
    setWikiLoading(true);
    void enrichBreedFromWikidata(name)
      .then((hit) => setWiki(hit))
      .finally(() => setWikiLoading(false));
  };

  const onNext = () => {
    if (roundIndex >= SESSION_ROUNDS) {
      void finishSession(score);
      return;
    }
    void loadRound(species, recentCorrectIds, roundIndex + 1);
  };

  const onRestart = () => {
    setScore(0);
    setRecentCorrectIds([]);
    setSessionDone(false);
    savedRef.current = false;
    void loadRound(species, [], 1);
  };

  const answered = Boolean(pickedId);
  const isCorrect = answered && pickedId === round?.correctId;
  const correctName =
    round?.choices.find((c) => c.id === round.correctId)?.name ?? '';

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView
        contentContainerClassName="px-5 pb-12 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-body text-base leading-6 text-forest-600">
          {t('quiz.subtitle')}
        </Text>

        <Text className="mb-2 mt-5 font-body-bold text-sm text-forest-700">
          {t('quiz.speciesLabel')}
        </Text>
        <View className="mb-4 flex-row gap-2">
          {(['dog', 'cat'] as CompanionBreedSpecies[]).map((s) => {
            const active = species === s;
            return (
              <Pressable
                key={s}
                onPress={() => onPickSpecies(s)}
                className={`flex-1 rounded-2xl border px-3 py-3 ${
                  active
                    ? 'border-forest-700 bg-forest-700'
                    : 'border-forest-100 bg-white'
                }`}
              >
                <Text
                  className={`text-center font-body-bold text-sm ${
                    active ? 'text-white' : 'text-forest-800'
                  }`}
                >
                  {s === 'cat' ? t('quiz.speciesCat') : t('quiz.speciesDog')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="mb-4 flex-row items-center justify-between">
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
              {t('quiz.loading')}
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
              <PrimaryButton
                label={t('quiz.playAgain')}
                onPress={onRestart}
              />
            </View>
          </View>
        ) : round ? (
          <>
            <View className="overflow-hidden rounded-3xl border border-forest-100 bg-white">
              <Image
                source={{ uri: round.imageUrl }}
                className="h-64 w-full bg-forest-100"
                resizeMode="cover"
                accessibilityIgnoresInvertColors
              />
              <Text className="px-4 py-3 font-body-bold text-base text-forest-900">
                {t('quiz.prompt')}
              </Text>
            </View>

            <View className="mt-4 gap-2">
              {round.choices.map((choice) => {
                const selected = pickedId === choice.id;
                const isAnswer = choice.id === round.correctId;
                let style =
                  'border-forest-100 bg-white active:opacity-80';
                if (answered && isAnswer) {
                  style = 'border-forest-600 bg-forest-100';
                } else if (answered && selected && !isAnswer) {
                  style = 'border-red-300 bg-sand-100';
                } else if (selected) {
                  style = 'border-forest-700 bg-forest-50';
                }
                return (
                  <Pressable
                    key={choice.id}
                    disabled={answered}
                    onPress={() => onAnswer(choice.id)}
                    className={`rounded-2xl border px-4 py-3.5 ${style}`}
                  >
                    <Text className="font-body-bold text-base text-forest-900">
                      {choice.name}
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
                    : t('quiz.wrong', { name: correctName })}
                </Text>

                <Text className="mt-4 font-body-bold text-base text-forest-900">
                  {t('quiz.learnTitle', { name: round.fact.name })}
                </Text>

                {round.fact.description ? (
                  <Text className="mt-2 font-body text-sm leading-5 text-forest-700">
                    {round.fact.description}
                  </Text>
                ) : null}

                <View className="mt-3 gap-1.5">
                  {round.fact.breedGroup ? (
                    <Text className="font-body text-sm text-forest-700">
                      {t('quiz.factGroup', { value: round.fact.breedGroup })}
                    </Text>
                  ) : null}
                  {round.fact.temperament ? (
                    <Text className="font-body text-sm leading-5 text-forest-700">
                      {t('quiz.factTemperament', {
                        value: round.fact.temperament,
                      })}
                    </Text>
                  ) : null}
                  {round.fact.origin ? (
                    <Text className="font-body text-sm text-forest-700">
                      {t('quiz.factOrigin', { value: round.fact.origin })}
                    </Text>
                  ) : null}
                  {round.fact.bredFor ? (
                    <Text className="font-body text-sm text-forest-700">
                      {t('quiz.factBredFor', { value: round.fact.bredFor })}
                    </Text>
                  ) : null}
                  {round.fact.lifeSpan ? (
                    <Text className="font-body text-sm text-forest-700">
                      {t('quiz.factLifeSpan', { value: round.fact.lifeSpan })}
                    </Text>
                  ) : null}
                  {round.fact.weightMetric ? (
                    <Text className="font-body text-sm text-forest-700">
                      {t('quiz.factWeight', {
                        value: round.fact.weightMetric,
                      })}
                    </Text>
                  ) : null}
                  {round.fact.heightMetric ? (
                    <Text className="font-body text-sm text-forest-700">
                      {t('quiz.factHeight', {
                        value: round.fact.heightMetric,
                      })}
                    </Text>
                  ) : null}
                </View>

                <Text className="mt-4 font-body text-xs leading-5 text-forest-500">
                  {t('quiz.trustNote', {
                    source:
                      round.fact.sourceLabel === 'thedogapi'
                        ? 'TheDogAPI'
                        : 'TheCatAPI',
                  })}
                </Text>

                {wikiLoading ? (
                  <Text className="mt-3 font-body text-xs text-forest-500">
                    {t('quiz.wikiLoading')}
                  </Text>
                ) : null}
                {wiki?.description ? (
                  <Text className="mt-3 font-body text-sm leading-5 text-forest-700">
                    {t('quiz.wikidataEnrich', { value: wiki.description })}
                  </Text>
                ) : null}
                {wiki?.origin ? (
                  <Text className="mt-1 font-body text-sm text-forest-700">
                    {t('quiz.factOrigin', { value: wiki.origin })}
                  </Text>
                ) : null}
                {wiki?.wikidataUrl ? (
                  <Pressable
                    onPress={() => void Linking.openURL(wiki.wikidataUrl)}
                    className="mt-2"
                  >
                    <Text className="font-body-bold text-sm text-forest-700">
                      {t('quiz.openWikidata')}
                    </Text>
                  </Pressable>
                ) : null}

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

        <Text className="mt-6 font-body text-xs leading-5 text-forest-500">
          {t('quiz.attribution')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
