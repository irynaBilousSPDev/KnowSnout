import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import {
  getTravelPack,
  TRAVEL_PACKS,
  type TravelPackId,
} from '@/src/constants/travelChecklists';
import { t } from '@/src/i18n';
import { getPet } from '@/src/services/pets';
import {
  getTravelProgress,
  setTravelItemDone,
  travelProgressCount,
} from '@/src/services/travel';
import { brand } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

export default function PetTravelScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [packId, setPackId] = useState<TravelPackId>('schengen');
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pack = useMemo(() => getTravelPack(packId), [packId]);
  const counts = travelProgressCount(progress, pack.items.length);

  const load = useCallback(async () => {
    if (!petId) {
      setError(t('pets.notFound'));
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
      setProgress(await getTravelProgress(petId, packId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('travel.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId, packId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const toggle = async (itemId: string) => {
    if (!petId) return;
    const next = await setTravelItemDone({
      petId,
      packId,
      itemId,
      done: !progress[itemId],
    });
    setProgress(next);
  };

  if (loading) {
    return <LoadingState message={t('travel.loading')} />;
  }

  if (error || !pet) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
        <Text className="font-display text-2xl text-forest-900">
          {t('travel.title')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {pet.name} · {t('travel.subtitle')}
        </Text>

        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body text-xs leading-5 text-forest-700">
            {t('travel.disclaimer')}
          </Text>
        </View>

        <View className="mt-4 flex-row rounded-2xl bg-forest-100 p-1">
          {TRAVEL_PACKS.map((p) => {
            const active = packId === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPackId(p.id)}
                className={`flex-1 items-center rounded-xl py-2.5 ${
                  active ? 'bg-forest-700' : ''
                }`}
              >
                <Text
                  className={`font-body-bold text-xs ${
                    active ? 'text-sand-50' : 'text-forest-700'
                  }`}
                >
                  {p.titleUk}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mt-4 font-body text-sm leading-5 text-forest-600">
          {pack.subtitleUk}
        </Text>
        <Text className="mt-2 font-body-medium text-sm text-forest-800">
          {t('travel.progress', { done: counts.done, total: counts.total })}
        </Text>

        <View className="mt-4 gap-2">
          {pack.items.map((item) => {
            const done = Boolean(progress[item.id]);
            return (
              <Pressable
                key={item.id}
                onPress={() => void toggle(item.id)}
                className={`rounded-3xl border px-4 py-4 ${
                  done
                    ? 'border-forest-200 bg-forest-100'
                    : 'border-forest-100 bg-white'
                }`}
              >
                <View className="flex-row items-start">
                  <View
                    className={`mt-0.5 mr-3 h-6 w-6 items-center justify-center rounded-full ${
                      done ? 'bg-forest-700' : 'border border-forest-300'
                    }`}
                  >
                    {done ? (
                      <Ionicons name="checkmark" size={14} color={brand.surface} />
                    ) : null}
                  </View>
                  <View className="flex-1">
                    <Text
                      className={`font-body-bold text-base ${
                        done ? 'text-forest-700' : 'text-forest-900'
                      }`}
                    >
                      {item.labelUk}
                    </Text>
                    {item.tipUk ? (
                      <Text className="mt-1 font-body text-xs leading-5 text-forest-500">
                        {item.tipUk}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
