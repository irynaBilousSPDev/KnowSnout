import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { addQuizXp } from '@/src/services/gamification';
import { getZoomQuestions } from '@/src/services/quizMocks';
import { brand, fonts } from '@/src/theme/brand';

export default function QuizZoomScreen() {
  const questions = useMemo(() => getZoomQuestions(), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const answered = Boolean(picked);

  const onPick = (choice: string) => {
    if (picked || !q) return;
    setPicked(choice);
    if (choice === q.answer) setScore((s) => s + 1);
  };

  const onNext = async () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      await addQuizXp(score * 20, 'b-zoom');
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  const restart = () => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  if (done) {
    return (
      <AppScreen>
        <ScrollView>
          <View style={styles.pad}>
            <ScreenHeader title={t('quizZoom.title')} subtitle={t('quizZoom.done')} />
            <Text style={styles.score}>
              {t('quizZoom.score', { score, total: questions.length })}
            </Text>
            <PrimaryButton label={t('quizZoom.again')} onPress={restart} />
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
            title={t('quizZoom.title')}
            subtitle={t('quizZoom.progress', {
              n: index + 1,
              total: questions.length,
            })}
          />
          <View style={styles.zoomCard}>
            <Text style={styles.zoomLabel}>{t('quizZoom.zoomHint')}</Text>
            <Text style={styles.zoomBody}>{q?.hint}</Text>
          </View>
          {q?.choices.map((c) => {
            const isPicked = picked === c;
            const correct = answered && c === q.answer;
            const wrong = isPicked && c !== q.answer;
            return (
              <Pressable
                key={c}
                onPress={() => onPick(c)}
                style={[
                  styles.choice,
                  correct && styles.choiceOk,
                  wrong && styles.choiceBad,
                ]}
              >
                <Text style={styles.choiceText}>{c}</Text>
              </Pressable>
            );
          })}
          {answered ? (
            <View style={styles.gap}>
              <PrimaryButton label={t('quizZoom.next')} onPress={() => void onNext()} />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  zoomCard: {
    marginBottom: 14,
    borderRadius: brand.radius.md,
        backgroundColor: brand.mist,
    padding: 18,
    minHeight: 120,
    justifyContent: 'center',
  },
  zoomLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.navy,
  },
  zoomBody: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: brand.ink,
  },
  choice: {
    marginBottom: 10,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  choiceOk: { borderColor: brand.score.good, backgroundColor: '#E8F8F2' },
  choiceBad: { borderColor: brand.score.poor, backgroundColor: '#FBEDEA' },
  choiceText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: brand.ink,
  },
  score: {
    marginBottom: 16,
    fontFamily: fonts.bodyBold,
    fontSize: 22,
    color: brand.ink,
  },
  gap: { marginTop: 8 },
});
