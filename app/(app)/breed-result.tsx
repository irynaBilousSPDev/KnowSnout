import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { SourceLangNote } from '@/src/components/SourceLangNote';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import {
  getBreedHistoryItem,
  type BreedHistoryItem,
} from '@/src/services/breedId';
import { resolveCheckImageUrl } from '@/src/services/checkImages';

export default function BreedResultScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<BreedHistoryItem | null>(null);
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
        const row = await getBreedHistoryItem(id);
        if (!alive) return;
        setItem(row);
        const url = row?.photoUri
          ? await resolveCheckImageUrl(row.photoUri)
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
    return <LoadingState message={t('breed.checking')} />;
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
          {item.breedNameUk ?? item.breedName}
        </Text>
        <Text className="mt-2 text-center font-body text-sm text-forest-600">
          {item.breedName}
        </Text>

        <View className="mt-5 self-center rounded-full border border-forest-200 bg-forest-100 px-4 py-2">
          <Text className="font-body-bold text-base text-forest-800">
            {t('breed.confidence', {
              pct: Math.round(item.confidence * 100),
            })}
          </Text>
        </View>

        <View className="mt-6 rounded-3xl bg-white px-5 py-5">
          <Text className="mb-3 font-body-bold text-lg text-forest-800">
            {t('result.verdict')}
          </Text>
          {item.temperament ? (
            <SourceLangNote value={item.temperament} className="mb-3" />
          ) : null}
          {item.bredFor ? (
            <SourceLangNote value={item.bredFor} className="mb-3" />
          ) : null}
          <Text className="font-body text-xs leading-5 text-forest-500">
            {item.species === 'cat'
              ? t('breed.speciesCat')
              : t('breed.speciesDog')}
            {' · '}
            {new Date(item.createdAt).toLocaleString('uk-UA')}
          </Text>
          {item.origin ? (
            <SourceLangNote value={item.origin} className="mt-2" />
          ) : null}
          <Text className="mt-4 font-body text-xs leading-5 text-forest-500">
            {t('breed.disclaimer')}
          </Text>
        </View>

        <View className="mt-6 gap-3">
          <PrimaryButton
            label={t('journal.openJournal')}
            variant="secondary"
            onPress={() => router.replace('/(app)/(tabs)/history')}
          />
          <PrimaryButton
            label={t('journal.checkAnotherBreed')}
            onPress={() => router.replace('/(app)/breed-scan')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
