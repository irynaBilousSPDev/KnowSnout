import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { addQuizXp } from '@/src/services/gamification';
import { getHeavierQuestions } from '@/src/services/quizMocks';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.06 — Хто важчий? */
export default function QuizHeavierScreen() {
  const questions = useMemo(() => getHeavierQuestions(), []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);

  const q = questions[index];
  const total = questions.length;

  const onPick = async (id: string) => {
    if (!q) return;
    const ok = id === q.correctId;
    const nextScore = ok ? score + 1 : score;
    if (ok) setScore(nextScore);
    setTimeout(async () => {
      if (index + 1 >= total) {
        await addQuizXp(
          nextScore * 30,
          nextScore === total ? 'b-heavy' : undefined,
        );
        router.replace({
          pathname: '/(app)/quiz-results',
          params: {
            score: String(nextScore),
            total: String(total),
            category: 'heavier',
          },
        } as never);
        return;
      }
      setIndex((i) => i + 1);
    }, 400);
  };

  if (!q) return null;

  const left = q.choices[0];
  const right = q.choices[1];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('quizHeavier.titleProgress', {
          n: index + 1,
          total,
        })}
        titleSize={16}
      />
      <View style={styles.pad}>
        <Text style={styles.prompt}>{t('quizHeavier.prompt')}</Text>
        <View style={styles.vsRow}>
          <Pressable
            onPress={() => void onPick(left.id)}
            style={styles.vsCard}
          >
            <Ionicons name="image-outline" size={26} color={brand.mutedSoft} />
            <Text style={styles.vsBrowse}>{t('quiz.photoBrowse')}</Text>
            <Text style={styles.vsName}>{left.label}</Text>
          </Pressable>
          <Text style={styles.vs}>{t('quizHeavier.vs')}</Text>
          <Pressable
            onPress={() => void onPick(right.id)}
            style={styles.vsCard}
          >
            <Ionicons name="image-outline" size={26} color={brand.mutedSoft} />
            <Text style={styles.vsBrowse}>{t('quiz.photoBrowse')}</Text>
            <Text style={styles.vsName}>{right.label}</Text>
          </Pressable>
        </View>
        <View style={styles.labels}>
          <Text style={styles.label}>{left.label}</Text>
          <Text style={styles.label}>{right.label}</Text>
        </View>
        <View style={styles.footer}>
          <Ionicons name="globe-outline" size={14} color={brand.mutedSoft} />
          <Text style={styles.footerT}>{t('quizHeavier.wikidataNote')}</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
  prompt: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 22,
  },
  vsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  vsCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: '#EEEBE6',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 10,
  },
  vsName: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  vsBrowse: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  vs: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.mutedSoft,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingHorizontal: 4,
  },
  label: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  footerT: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
});
