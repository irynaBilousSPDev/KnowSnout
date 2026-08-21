import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { addQuizXp } from '@/src/services/gamification';
import { getMythCards } from '@/src/services/quizMocks';
import { brand } from '@/src/theme/brand';

export default function QuizMythScreen() {
  const cards = useMemo(() => getMythCards(), []);
  const [index, setIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [correctPick, setCorrectPick] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const card = cards[index];

  const pick = async (sayMyth: boolean) => {
    if (answered || !card) return;
    const ok = sayMyth === card.isMyth;
    setCorrectPick(ok);
    setAnswered(true);
    if (ok) setScore((s) => s + 1);
  };

  const onNext = async () => {
    if (index + 1 >= cards.length) {
      setDone(true);
      await addQuizXp(score * 25, score >= 5 ? 'b-myth' : undefined);
      return;
    }
    setIndex((i) => i + 1);
    setAnswered(false);
    setCorrectPick(false);
  };

  const restart = () => {
    setIndex(0);
    setAnswered(false);
    setCorrectPick(false);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <AppScreen>
        <ScrollView>
          <View style={styles.pad}>
            <ScreenHeader title={t('quizMyth.title')} subtitle={t('quizMyth.done')} />
            <Text style={styles.score}>
              {t('quizMyth.score', { score, total: cards.length })}
            </Text>
            <PrimaryButton label={t('quizMyth.again')} onPress={restart} />
          </View>
        </ScrollView>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('quizMyth.title')}
            subtitle={t('quizMyth.progress', {
              n: index + 1,
              total: cards.length,
            })}
          />
          <View style={styles.card}>
            <Text style={styles.claimLabel}>{t('quizMyth.claim')}</Text>
            <Text style={styles.claim}>{card?.claim}</Text>
          </View>

          {!answered ? (
            <View style={styles.row}>
              <View style={styles.half}>
                <PrimaryButton
                  label={t('quizMyth.myth')}
                  onPress={() => void pick(true)}
                />
              </View>
              <View style={styles.half}>
                <PrimaryButton
                  label={t('quizMyth.fact')}
                  variant="secondary"
                  onPress={() => void pick(false)}
                />
              </View>
            </View>
          ) : (
            <>
              <Text style={correctPick ? styles.ok : styles.bad}>
                {correctPick ? t('quizMyth.correct') : t('quizMyth.wrong')}
              </Text>
              <Text style={styles.explain}>{card?.explain}</Text>
              <PrimaryButton label={t('quizMyth.next')} onPress={() => void onNext()} />
            </>
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 18,
  },
  claimLabel: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.tealPressed,
  },
  claim: {
    marginTop: 10,
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    lineHeight: 28,
    color: brand.ink,
  },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  ok: {
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: brand.score.good,
  },
  bad: {
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: brand.score.poor,
  },
  explain: {
    marginBottom: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#3A5A54',
  },
  score: {
    marginBottom: 16,
    fontFamily: 'DMSans_700Bold',
    fontSize: 22,
    color: brand.ink,
  },
});
