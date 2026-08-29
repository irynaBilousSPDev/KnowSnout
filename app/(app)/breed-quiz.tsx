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
import { ScrHeader } from '@/src/components/ScrHeader';
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
const MAX_IMAGE_SKIPS = 6;

/** Screenshot 05.04 — Вгадай породу за фото (+ resilient image load) */
export default function BreedQuizScreen() {
  const [round, setRound] = useState<BreedQuizRound | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [roundIndex, setRoundIndex] = useState(0);
  const [recentCorrectIds, setRecentCorrectIds] = useState<string[]>([]);
  const savedRef = useRef(false);
  const imageSkipsRef = useRef(0);

  const loadRound = useCallback(async (avoid: string[], index: number) => {
    setLoading(true);
    setError(null);
    setImageFailed(false);
    setImageReady(false);
    setPickedId(null);
    try {
      const next = await createBreedQuizRound('dog', avoid);
      setRound(next);
      setRoundIndex(index);
      imageSkipsRef.current = 0;
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
      imageSkipsRef.current = 0;
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

  const skipBrokenImage = () => {
    if (!round) return;
    if (imageSkipsRef.current >= MAX_IMAGE_SKIPS) {
      setImageFailed(true);
      return;
    }
    imageSkipsRef.current += 1;
    const nextAvoid = [...recentCorrectIds, round.correctId].slice(-20);
    setRecentCorrectIds(nextAvoid);
    void loadRound(nextAvoid, roundIndex);
  };

  const onAnswer = (choiceId: string) => {
    if (!round || pickedId || imageFailed || !imageReady) return;
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
        <ScrHeader title={t('quizHub.breedTitle')} titleSize={18} />
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
        <ScrHeader title={t('quizHub.breedTitle')} titleSize={18} />
        <ErrorState
          message={
            error === 'BREED_IMAGE_UNAVAILABLE'
              ? t('quiz.imageFailed')
              : error
          }
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
      <ScrHeader title={t('quizHub.breedTitle')} titleSize={18} />
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${(roundIndex / SESSION_ROUNDS) * 100}%` },
          ]}
        />
      </View>
      <ScrollView contentContainerStyle={styles.pad}>
        <View style={styles.photoCard}>
          {imageFailed ? (
            <View style={styles.photoFail}>
              <Text style={styles.failText}>{t('quiz.imageFailed')}</Text>
              <Pressable
                onPress={() => {
                  imageSkipsRef.current = 0;
                  const nextAvoid = [...recentCorrectIds, round.correctId];
                  setRecentCorrectIds(nextAvoid);
                  void loadRound(nextAvoid, roundIndex);
                }}
                style={styles.failBtn}
              >
                <Text style={styles.failBtnT}>{t('common.tryAgain')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.photoWrap}>
              {!imageReady ? (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
                  <Text style={styles.photoHint}>{t('quiz.photoBreed')}</Text>
                  <Text style={styles.photoBrowse}>{t('quiz.photoBrowse')}</Text>
                </View>
              ) : null}
              <Image
                key={round.imageUrl}
                source={{ uri: round.imageUrl }}
                style={[styles.photoImg, !imageReady && styles.photoHidden]}
                resizeMode="cover"
                onLoad={() => setImageReady(true)}
                onError={skipBrokenImage}
              />
            </View>
          )}
          <View style={styles.photoFooter}>
            <Text style={styles.title}>{t('quiz.breedPrompt')}</Text>
          </View>
        </View>

        <View style={styles.choices}>
          {choices.map((c) => {
            const on = pickedId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => onAnswer(c.id)}
                disabled={!imageReady || imageFailed}
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
  },
  progressFill: { height: '100%', backgroundColor: brand.accent },
  pad: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 40 },
  photoCard: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: brand.surfaceElevated,
    marginBottom: 16,
  },
  photoWrap: {
    aspectRatio: 1.2,
    backgroundColor: brand.accentTint,
  },
  photoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: '#EEEBE6',
    zIndex: 1,
  },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  photoBrowse: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  photoImg: { width: '100%', height: '100%' },
  photoHidden: { opacity: 0 },
  photoFail: {
    aspectRatio: 1.2,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  failText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
    textAlign: 'center',
  },
  failBtn: {
    backgroundColor: brand.surfaceElevated,
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  failBtnT: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  photoFooter: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: brand.surfaceElevated,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: brand.ink,
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
