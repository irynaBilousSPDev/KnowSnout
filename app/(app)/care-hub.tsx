import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  careProgress,
  listCareTodayForPets,
} from '@/src/services/care';
import { hasFedToday } from '@/src/services/feeding';
import { listPets } from '@/src/services/pets';
import { brand } from '@/src/theme/brand';
import type { CareDayLog } from '@/src/types/care';
import type { PetRow } from '@/src/types/pet';

type HubRow = {
  pet: PetRow;
  log: CareDayLog;
  fedFromLogs: boolean;
};

export default function CareHubScreen() {
  const [rows, setRows] = useState<HubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const pets = await listPets();
      const logs = await listCareTodayForPets(pets.map((p) => p.id));
      const fedFlags = await Promise.all(
        pets.map(async (p) => ({ id: p.id, fed: await hasFedToday(p.id) })),
      );
      const fedMap = Object.fromEntries(fedFlags.map((f) => [f.id, f.fed]));
      setRows(
        pets.map((pet) => ({
          pet,
          log: logs[pet.id]!,
          fedFromLogs: Boolean(fedMap[pet.id]),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('care.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return <LoadingState message={t('care.loading')} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <View className="px-5 pb-2 pt-2">
        <Text className="font-display text-2xl text-forest-900">
          {t('care.hubTitle')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {t('care.hubSubtitle')}
        </Text>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.pet.id}
          contentContainerClassName="px-5 pb-12"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={brand.tealDeep}
            />
          }
          ListHeaderComponent={
            rows.length > 0 ? (
              <Text className="mb-3 font-body-medium text-sm text-forest-700">
                {t('care.hubPickPet')}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View className="mt-6 rounded-3xl bg-forest-100 px-5 py-6">
              <Text className="font-body-bold text-lg text-forest-900">
                {t('care.hubEmptyTitle')}
              </Text>
              <Text className="mt-2 font-body text-sm leading-5 text-forest-700">
                {t('care.hubEmptyBody')}
              </Text>
              <View className="mt-4">
                <PrimaryButton
                  label={t('pets.add')}
                  onPress={() => router.push('/(app)/pet-form')}
                />
              </View>
            </View>
          }
          renderItem={({ item }) => {
            const progress = careProgress(item.log, {
              fedFromLogs: item.fedFromLogs,
            });
            const chips = [
              progress.water ? t('care.waterDoneShort') : null,
              progress.play ? t('care.playDoneShort') : null,
              progress.feed ? t('care.feedDoneShort') : null,
            ].filter(Boolean);

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(app)/pet-care',
                    params: { petId: item.pet.id },
                  })
                }
                className="mb-3 flex-row items-center rounded-3xl border border-forest-100 bg-white px-4 py-4"
              >
                <PetAvatar
                  avatarKey={item.pet.avatar_key}
                  avatarUri={item.pet.avatar_uri}
                  species={item.pet.species}
                  size={52}
                  name={item.pet.name}
                />
                <View className="ml-3 flex-1">
                  <Text className="font-body-bold text-base text-forest-900">
                    {item.pet.name}
                  </Text>
                  <Text className="mt-1 font-body text-sm text-forest-600">
                    {t('care.progress', {
                      done: progress.done,
                      total: progress.total,
                    })}
                  </Text>
                  {chips.length > 0 ? (
                    <Text className="mt-1 font-body text-xs text-forest-500">
                      {chips.join(' · ')}
                    </Text>
                  ) : null}
                </View>
                <Ionicons name="chevron-forward" size={18} color="#5A7A72" />
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
