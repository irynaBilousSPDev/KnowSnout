import { Text, View } from 'react-native';

import {
  getScoreLabel,
  getScoreTone,
  SCORE_COLORS,
} from '@/src/constants/analysis';

type Props = {
  score: number;
};

export function ScoreGauge({ score }: Props) {
  const tone = getScoreTone(score);
  const color = SCORE_COLORS[tone];
  const clamped = Math.max(0, Math.min(100, score));

  return (
    <View className="items-center">
      <View
        className="h-36 w-36 items-center justify-center rounded-full border-8 bg-sand-50"
        style={{ borderColor: color }}
      >
        <Text className="font-display text-5xl" style={{ color }}>
          {clamped}
        </Text>
        <Text className="font-body-medium text-sm text-forest-600">/ 100</Text>
      </View>
      <Text
        className="mt-3 font-body-bold text-lg uppercase tracking-wide"
        style={{ color }}
      >
        {getScoreLabel(clamped)}
      </Text>
    </View>
  );
}
