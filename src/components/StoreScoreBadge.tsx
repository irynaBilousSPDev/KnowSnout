import { Linking, Pressable, Text, View } from 'react-native';

import { t } from '@/src/i18n';
import type { StoreScore } from '@/src/types/storeScore';

type Props = {
  score: StoreScore | null;
  loading?: boolean;
};

function formatScore(value: number) {
  return value.toFixed(1).replace('.', ',');
}

export function StoreScoreBadge({ score, loading }: Props) {
  if (loading) {
    return (
      <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-4">
        <Text className="font-body text-sm text-forest-500">
          {t('storeScore.loading')}
        </Text>
      </View>
    );
  }

  if (!score) return null;

  const onOpen = () => {
    void Linking.openURL(score.url);
  };

  return (
    <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-body-bold text-base text-forest-900">
          {t('storeScore.title')}
        </Text>
        {score.source === 'mock' ? (
          <Text className="font-body text-xs text-forest-500">
            {t('storeScore.demo')}
          </Text>
        ) : null}
      </View>

      {score.scoreOutOf5 != null ? (
        <Text className="mt-2 font-display text-2xl text-forest-800">
          {formatScore(score.scoreOutOf5)}
          <Text className="font-body text-base text-forest-600"> / 5</Text>
        </Text>
      ) : (
        <Text className="mt-2 font-body text-sm text-forest-600">
          {t('storeScore.noRating')}
        </Text>
      )}

      {score.reviewCount != null ? (
        <Text className="mt-1 font-body text-xs text-forest-500">
          {t('storeScore.reviews', { count: score.reviewCount })}
        </Text>
      ) : null}

      <Text className="mt-2 font-body text-xs leading-5 text-forest-500">
        {t('storeScore.disclaimer')}
      </Text>

      <Pressable
        onPress={onOpen}
        className="mt-3 items-center rounded-2xl bg-forest-100 px-4 py-3 active:opacity-70"
      >
        <Text className="font-body-bold text-sm text-forest-800">
          {t('storeScore.openAllegro')}
        </Text>
      </Pressable>
    </View>
  );
}
