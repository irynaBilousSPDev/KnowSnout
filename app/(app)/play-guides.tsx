import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import {
  getPlayPack,
  playPackForSpecies,
  PLAY_PACKS,
  type PlayPackId,
} from '@/src/constants/playGuides';
import { t } from '@/src/i18n';
import { getPet } from '@/src/services/pets';
import type { PetRow } from '@/src/types/pet';

export default function PlayGuidesScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [packId, setPackId] = useState<PlayPackId>('dog');
  const [loading, setLoading] = useState(Boolean(petId));
  const [error, setError] = useState<string | null>(null);

  const pack = useMemo(() => getPlayPack(packId), [packId]);

  const load = useCallback(async () => {
    if (!petId) {
      setPet(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const nextPet = await getPet(petId);
      if (!nextPet) {
        setError(t('pets.notFound'));
        setPet(null);
        return;
      }
      setPet(nextPet);
      setPackId(playPackForSpecies(nextPet.species).id);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('play.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return <LoadingState message={t('play.loading')} />;
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState message={error} onRetry={() => void load()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
        <Text className="font-display text-2xl text-forest-900">
          {t('play.title')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {pet
            ? `${pet.name} · ${t('play.subtitle')}`
            : t('play.subtitle')}
        </Text>

        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body text-xs leading-5 text-forest-700">
            {t('play.disclaimer')}
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2 rounded-2xl bg-forest-100 p-1">
          {PLAY_PACKS.map((p) => {
            const active = packId === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPackId(p.id)}
                className={`flex-1 min-w-[30%] items-center rounded-xl px-2 py-2.5 ${
                  active ? 'bg-forest-700' : ''
                }`}
              >
                <Text
                  className={`font-body-bold text-sm ${
                    active ? 'text-sand-50' : 'text-forest-700'
                  }`}
                >
                  {p.titleUk}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-5 font-body-bold text-lg text-forest-900">
          {pack.titleUk}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {pack.subtitleUk}
        </Text>

        {pack.cards.map((card) => (
          <View
            key={card.id}
            className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-4"
          >
            <Text className="font-body-bold text-base text-forest-900">
              {card.titleUk}
            </Text>
            <Text className="mt-2 font-body text-sm leading-5 text-forest-700">
              {card.bodyUk}
            </Text>
            {card.toysUk && card.toysUk.length > 0 ? (
              <View className="mt-3 rounded-2xl bg-forest-50 px-3 py-3">
                <Text className="font-body-medium text-xs uppercase tracking-wide text-forest-500">
                  {t('play.toysLabel')}
                </Text>
                {card.toysUk.map((toy) => (
                  <Text
                    key={toy}
                    className="mt-1 font-body text-sm text-forest-800"
                  >
                    · {toy}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
