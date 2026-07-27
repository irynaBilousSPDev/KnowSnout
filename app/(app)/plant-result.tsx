import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import {
  getPlantHistoryItem,
  plantLevelTone,
  type PlantHistoryItem,
} from '@/src/services/plants';
import type { PlantToxicityLevel } from '@/src/types/plant';

function levelLabel(level: string) {
  switch (level as PlantToxicityLevel) {
    case 'safe':
      return t('plants.levelSafe');
    case 'mild':
      return t('plants.levelMild');
    case 'toxic':
      return t('plants.levelToxic');
    default:
      return t('plants.levelUnknown');
  }
}

export default function PlantResultScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<PlantHistoryItem | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        if (!id) {
          if (alive) {
            setItem(null);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const row = await getPlantHistoryItem(id);
        if (!alive) return;
        setItem(row);
        const url = row?.photo_uri
          ? await resolveCheckImageUrl(row.photo_uri)
          : null;
        if (alive) {
          setPhotoUrl(url);
          setLoading(false);
        }
      })();
      return () => {
        alive = false;
      };
    }, [id]),
  );

  if (loading) {
    return <LoadingState message={t('plants.loading')} />;
  }

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          title={t('journal.detailMissingTitle')}
          message={t('journal.detailMissingBody')}
          onRetry={() => router.replace('/(app)/(tabs)/history')}
        />
      </SafeAreaView>
    );
  }

  const tone = plantLevelTone(
    (['safe', 'mild', 'toxic', 'unknown'].includes(item.level)
      ? item.level
      : 'unknown') as PlantToxicityLevel,
  );
  const showPhoto = isNativeSafeImageUri(photoUrl);

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-2">
        {showPhoto ? (
          <Image
            source={{ uri: photoUrl! }}
            className="mb-5 h-56 w-full rounded-3xl bg-forest-100"
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="mb-5 h-40 w-full items-center justify-center rounded-3xl border border-dashed border-forest-200 bg-forest-50">
            <Text className="font-body text-sm text-forest-500">
              {t('journal.noPhoto')}
            </Text>
          </View>
        )}

        <Text className="text-center font-display text-2xl text-forest-800">
          {item.name_uk ?? item.query_text ?? t('plants.title')}
        </Text>
        {item.latin ? (
          <Text className="mt-2 text-center font-body text-sm text-forest-600">
            {item.latin}
            {item.name_en ? ` · ${item.name_en}` : ''}
          </Text>
        ) : null}

        <View
          className={`mt-5 self-center rounded-full border px-4 py-2 ${tone.bg} ${tone.border}`}
        >
          <Text className={`font-body-bold text-base ${tone.text}`}>
            {levelLabel(item.level)}
          </Text>
        </View>

        <View className="mt-6 rounded-3xl bg-white px-5 py-5">
          <Text className="mb-3 font-body-bold text-lg text-forest-800">
            {t('result.verdict')}
          </Text>
          {item.notes ? (
            <Text className="mb-4 font-body text-base leading-6 text-forest-700">
              {item.notes}
            </Text>
          ) : (
            <Text className="mb-4 font-body text-base leading-6 text-forest-600">
              {levelLabel(item.level)}
            </Text>
          )}
          <Text className="font-body text-xs leading-5 text-forest-500">
            {t('plants.forSpecies', {
              species:
                item.for_species === 'cat'
                  ? t('plants.speciesCat')
                  : t('plants.speciesDog'),
            })}
            {typeof item.confidence === 'number'
              ? ` · ${t('plants.confidence', {
                  pct: Math.round(item.confidence * 100),
                })}`
              : ''}
            {' · '}
            {new Date(item.created_at).toLocaleString('uk-UA')}
          </Text>
          <Text className="mt-4 font-body text-xs leading-5 text-forest-500">
            {t('plants.disclaimer')}
          </Text>
        </View>

        <View className="mt-6 gap-3">
          <PrimaryButton
            label={t('journal.openJournal')}
            variant="secondary"
            onPress={() => router.replace('/(app)/(tabs)/history')}
          />
          <PrimaryButton
            label={t('journal.checkAnotherPlant')}
            onPress={() => router.replace('/(app)/plant-safety')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
