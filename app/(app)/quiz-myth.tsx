import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { addQuizXp } from '@/src/services/gamification';
import { getMythCards } from '@/src/services/quizMocks';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.07 — Правда чи міф */
export default function QuizMythScreen() {
  const cards = useMemo(() => getMythCards(), []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [locked, setLocked] = useState(false);

  const card = cards[index];
  const total = cards.length;

  const pick = async (sayMyth: boolean) => {
    if (locked || !card) return;
    setLocked(true);
    const ok = sayMyth === card.isMyth;
    const nextScore = ok ? score + 1 : score;
    if (ok) setScore(nextScore);
    setTimeout(async () => {
      if (index + 1 >= total) {
        await addQuizXp(nextScore * 25, nextScore >= 5 ? 'b-myth' : undefined);
        router.replace({
          pathname: '/(app)/quiz-results',
          params: {
            score: String(nextScore),
            total: String(total),
            category: 'myth',
          },
        } as never);
        return;
      }
      setIndex((i) => i + 1);
      setLocked(false);
    }, 450);
  };

  if (!card) return null;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('quizMyth.titleProgress', { n: index + 1, total })}
        titleSize={16}
      />
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.claim}>{card.claim}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable onPress={() => void pick(false)} style={styles.action}>
            <Text style={styles.actionT}>{t('quizMyth.truth')}</Text>
          </Pressable>
          <Pressable onPress={() => void pick(true)} style={styles.action}>
            <Text style={styles.actionT}>{t('quizMyth.myth')}</Text>
          </Pressable>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 28,
  },
  card: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  claim: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 30,
    color: brand.ink,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
  },
  action: { paddingVertical: 12, paddingHorizontal: 8 },
  actionT: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: brand.ink,
  },
});
