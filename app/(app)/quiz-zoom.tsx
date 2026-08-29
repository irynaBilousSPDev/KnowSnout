import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { addQuizXp } from '@/src/services/gamification';
import { getZoomQuestions } from '@/src/services/quizMocks';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.05 — Зум-загадка */
export default function QuizZoomScreen() {
  const insets = useSafeAreaInsets();
  const questions = useMemo(() => getZoomQuestions(), []);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(0);

  const q = questions[index];

  const onPick = async (choice: string) => {
    if (picked || !q) return;
    setPicked(choice);
    const ok = choice === q.answer;
    const nextScore = ok ? score + 1 : score;
    if (ok) setScore(nextScore);
    setTimeout(async () => {
      if (index + 1 >= questions.length) {
        await addQuizXp(nextScore * 20, 'b-zoom');
        router.replace({
          pathname: '/(app)/quiz-results',
          params: {
            score: String(nextScore),
            total: String(questions.length),
            category: 'zoom',
          },
        } as never);
        return;
      }
      setIndex((i) => i + 1);
      setPicked(null);
      setZoomLevel(0);
    }, 500);
  };

  if (!q) return null;

  return (
    <AppScreen edges={[]}>
      <View style={[styles.dark, { paddingTop: insets.top + 8 }]}>
        <View style={styles.darkBar}>
          <Pressable onPress={() => router.back()} style={styles.darkBack}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
          </Pressable>
          <View style={styles.darkPill} />
        </View>
        <View style={styles.zoomStage}>
          <Ionicons name="image-outline" size={36} color="#FFFFFF66" />
          <Text style={styles.zoomHint}>{t('quizZoom.photoHint')}</Text>
          <Text style={styles.zoomBrowse}>{t('quiz.photoBrowse')}</Text>
          <Text style={styles.zoomLevel}>×{1 + zoomLevel * 0.5}</Text>
        </View>
      </View>

      <View style={styles.sheet}>
        <Text style={styles.title}>{t('quizZoom.prompt')}</Text>
        <Pressable
          onPress={() => setZoomLevel((z) => Math.min(3, z + 1))}
          style={styles.zoomBtn}
        >
          <Ionicons name="search-outline" size={18} color={brand.accent} />
          <Text style={styles.zoomBtnT}>{t('quizZoom.zoomMore')}</Text>
        </Pressable>
        <View style={styles.choices}>
          {q.choices.slice(0, 3).map((c) => {
            const on = picked === c;
            return (
              <Pressable
                key={c}
                onPress={() => void onPick(c)}
                style={[styles.choice, on && styles.choiceOn]}
              >
                <Text style={[styles.choiceT, on && styles.choiceTOn]}>
                  {c}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  dark: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingBottom: 24,
    minHeight: 260,
  },
  darkBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  darkBack: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkPill: {
    width: 36,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  zoomStage: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 140,
  },
  zoomHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: '#FFFFFF99',
    textAlign: 'center',
  },
  zoomBrowse: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: '#FFFFFF66',
  },
  zoomLevel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: '#FFFFFF66',
  },
  sheet: {
    flex: 1,
    backgroundColor: brand.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -16,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 32,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginBottom: 14,
  },
  zoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: brand.accent,
    paddingVertical: 12,
    marginBottom: 16,
  },
  zoomBtnT: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accent,
  },
  choices: { gap: 10 },
  choice: {
    borderRadius: 16,
    backgroundColor: brand.canvas,
    borderWidth: 1.5,
    borderColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  choiceOn: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  choiceT: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
    textAlign: 'center',
  },
  choiceTOn: { color: brand.accent },
});
