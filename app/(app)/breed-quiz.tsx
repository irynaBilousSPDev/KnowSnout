import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { t } from '@/src/i18n';
import {
  clearBreedQuizCatalogCache,
  createBreedQuizRound,
  type BreedQuizRound,
} from '@/src/services/breedQuiz';
import { saveQuizSession } from '@/src/services/quizResults';
import { brand, fonts } from '@/src/theme/brand';

const SESSION_ROUNDS = 15;

/** Screenshot 05.04 — Вгадай породу за фото */
export default function BreedQuizScreen() {
  const [round, setRound] = useState<BreedQuizRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [recentCorrectIds, setRecentCorrectIds] = useState<string[]>([]);
  const savedRef = useRef(false);

  const loadRound = useCallback(async (avoid: string[], index: number) => {
    setLoading(true);
    setError(null);
    setImageFailed(false);
    setPickedId(null);
    try {
      const next = await createBreedQuizRound('dog', avoid);
      setRound(next);
      setRoundIndex(index);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('quiz.catalogUnavailable'),
      );
      setRound(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setScore(0);
      setRecentCorrectIds([]);
      savedRef.current = false;
      void loadRound([], 1);
    }, [loadRound]),
  );

  const finish = async (finalScore: number) => {
    if (savedRef.current) return;
    savedRef.current = true;
    try {
      await saveQuizSession({
        category: 'breed',
        score: finalScore,
        total: SESSION_ROUNDS,
        species: 'dog',
      });
      router.replace({
        pathname: '/(app)/quiz-results',
        params: {
          score: String(finalScore),
          total: String(SESSION_ROUNDS),
          category: 'breed',
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
    const nextAvoid = [...recentCorrectIds, round.correctId].slice(-12);
    setRecentCorrectIds(nextAvoid);
    setTimeout(() => {
      if (roundIndex >= SESSION_ROUNDS) {
        void finish(nextScore);
      } else {
        void loadRound(nextAvoid, roundIndex + 1);
      }
    }, 550);
  };

  if (loading && !round) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <View style={styles.center}>
          <ActivityIndicator color={brand.accent} size="large" />
        </View>
      </AppScreen>
    );
  }

  if (error && !round) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <ErrorState
          message={error}
          onRetry={() => {
            clearBreedQuizCatalogCache();
            void loadRound([], 1);
          }}
        />
      </AppScreen>
    );
  }

  if (!round) return null;

  const choices = round.choices.slice(0, 3);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${(roundIndex / SESSION_ROUNDS) * 100}%` },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>{t('quiz.breedPrompt')}</Text>
        <View style={styles.photo}>
          {round.imageUrl && !imageFailed ? (
            <Image
              source={{ uri: round.imageUrl }}
              style={styles.photoImg}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <>
              <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
              <Text style={styles.photoHint}>{t('quiz.photoBreed')}</Text>
            </>
          )}
        </View>
        <View style={styles.choices}>
          {choices.map((c) => {
            const on = pickedId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => onAnswer(c.id)}
                style={styles.choiceRow}
              >
                <Text style={[styles.choiceT, on && styles.choiceOn]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  progressTrack: {
    height: 3,
    backgroundColor: brand.creamDeep,
    marginHorizontal: 0,
  },
  progressFill: { height: '100%', backgroundColor: brand.accent },
  pad: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 16,
  },
  photo: {
    aspectRatio: 1.25,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: '#EEEBE6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    overflow: 'hidden',
    marginBottom: 20,
  },
  photoImg: { width: '100%', height: '100%' },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  choices: { gap: 4 },
  choiceRow: { paddingVertical: 14 },
  choiceT: {
    fontFamily: fonts.body,
    fontSize: 17,
    color: brand.ink,
  },
  choiceOn: {
    fontFamily: fonts.bodyBold,
    color: brand.accent,
  },
});
