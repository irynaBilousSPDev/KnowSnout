import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { addQuizXp } from '@/src/services/gamification';
import { getHeavierQuestions } from '@/src/services/quizMocks';
import { brand } from '@/src/theme/brand';

export default function QuizHeavierScreen() {
  const questions = useMemo(() => getHeavierQuestions(), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[index];
  const answered = Boolean(picked);

  const onPick = (id: string) => {
    if (picked || !q) return;
    setPicked(id);
    if (id === q.correctId) setScore((s) => s + 1);
  };

  const onNext = async () => {
    if (index + 1 >= questions.length) {
      setDone(true);
      await addQuizXp(
        score * 30,
        score === questions.length ? 'b-heavy' : undefined,
      );
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
            <ScreenHeader
              title={t('quizHeavier.title')}
              subtitle={t('quizHeavier.done')}
            />
            <Text style={styles.score}>
              {t('quizHeavier.score', { score, total: questions.length })}
            </Text>
            <PrimaryButton label={t('quizHeavier.again')} onPress={restart} />
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
            title={t('quizHeavier.title')}
            subtitle={t('quizHeavier.progress', {
              n: index + 1,
              total: questions.length,
            })}
          />
          <Text style={styles.prompt}>{q?.prompt}</Text>
          {q?.choices.map((c) => {
            const isPicked = picked === c.id;
            const correct = answered && c.id === q.correctId;
            const wrong = isPicked && c.id !== q.correctId;
            return (
              <Pressable
                key={c.id}
                onPress={() => onPick(c.id)}
                style={[
                  styles.choice,
                  correct && styles.choiceOk,
                  wrong && styles.choiceBad,
                ]}
              >
                <Text style={styles.choiceText}>{c.label}</Text>
              </Pressable>
            );
          })}
          {answered && q ? (
            <>
              <Text style={styles.explain}>{q.explain}</Text>
              <PrimaryButton label={t('quizHeavier.next')} onPress={() => void onNext()} />
            </>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  prompt: {
    marginBottom: 14,
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    lineHeight: 26,
    color: brand.ink,
  },
  choice: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  choiceOk: { borderColor: brand.score.good, backgroundColor: '#E8F8F2' },
  choiceBad: { borderColor: brand.score.poor, backgroundColor: '#FBEDEA' },
  choiceText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: brand.ink,
  },
  explain: {
    marginVertical: 12,
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
