import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProsConsList } from '@/src/components/ProsConsList';
import { ScoreGauge } from '@/src/components/ScoreGauge';
import { t } from '@/src/i18n';
import { getPendingAnalysis, setPendingAnalysis } from '@/src/lib/resultStore';
import { buildScanShareMessage, shareText } from '@/src/lib/share';
import { resolveSpecies } from '@/src/lib/species';
import { listPets, setPetFavoriteFood } from '@/src/services/pets';
import { saveScan } from '@/src/services/scans';
import type { PetRow } from '@/src/types/pet';
import type { PetSpecies } from '@/src/types/scan';

const SPECIES_OPTIONS: { id: PetSpecies; labelKey: string }[] = [
  { id: 'dog', labelKey: 'history.speciesDog' },
  { id: 'cat', labelKey: 'history.speciesCat' },
  { id: 'unknown', labelKey: 'history.filterOther' },
];

export default function ResultScreen() {
  const pending = getPendingAnalysis();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(Boolean(pending?.saved));
  const [error, setError] = useState<string | null>(null);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [assignedPetId, setAssignedPetId] = useState<string | null>(null);
  const [species, setSpecies] = useState<PetSpecies>(() =>
    resolveSpecies(
      pending?.species,
      pending?.result?.productName,
      pending?.result?.summary,
    ),
  );

  useFocusEffect(
    useCallback(() => {
      void listPets()
        .then(setPets)
        .catch(() => setPets([]));
    }, []),
  );

  if (!pending?.result) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          title={t('result.noResultTitle')}
          message={t('result.noResultBody')}
          onRetry={() => router.replace('/(app)/(tabs)')}
        />
      </SafeAreaView>
    );
  }

  const { result, imageUri } = pending;

  const onSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const row = await saveScan(result, imageUri, {
        barcode: pending.barcode,
        productId: pending.productId,
        species,
      });
      setSaved(true);
      setPendingAnalysis({
        ...pending,
        scanId: row.id,
        saved: true,
        species,
      });
      Alert.alert(t('result.saved'), t('result.savedBody'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('result.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const onAssign = async (pet: PetRow) => {
    setAssigningId(pet.id);
    try {
      await setPetFavoriteFood(pet.id, {
        productName: result.productName,
        productId: pending.productId ?? null,
      });
      setAssignedPetId(pet.id);
      Alert.alert(t('result.saved'), t('result.assignDone'));
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('result.assignError'),
      );
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-10 pt-2">
        <Text className="mb-6 text-center font-display text-2xl text-forest-800">
          {result.productName}
        </Text>

        <ScoreGauge score={result.score} />

        <View className="mt-6">
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('result.speciesAsk')}
          </Text>
          <View className="flex-row gap-2">
            {SPECIES_OPTIONS.map((option) => {
              const active = species === option.id;
              return (
                <Pressable
                  key={option.id}
                  onPress={() => setSpecies(option.id)}
                  disabled={saved}
                  className={`flex-1 items-center rounded-2xl py-3 ${
                    active ? 'bg-forest-700' : 'bg-forest-100'
                  } ${saved ? 'opacity-70' : ''}`}
                >
                  <Text
                    className={`font-body-bold text-sm ${
                      active ? 'text-sand-50' : 'text-forest-700'
                    }`}
                  >
                    {t(option.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View className="mt-6 rounded-3xl bg-white px-5 py-5">
          <Text className="mb-3 font-body-bold text-lg text-forest-800">
            {t('result.verdict')}
          </Text>
          <Text className="mb-4 font-body text-base leading-6 text-forest-700">
            {result.summary}
          </Text>
          <Text className="mb-6 font-body text-xs leading-5 text-forest-500">
            {t('result.enNote')}
          </Text>
          <ProsConsList pros={result.pros} cons={result.cons} />
        </View>

        <View className="mt-6 rounded-3xl border border-forest-100 bg-white px-5 py-5">
          <Text className="font-body-bold text-lg text-forest-900">
            {t('result.assignTitle')}
          </Text>
          <Text className="mt-1 font-body text-sm text-forest-600">
            {t('result.assignHint')}
          </Text>
          {pets.length === 0 ? (
            <Text className="mt-4 font-body text-sm text-forest-500">
              {t('result.noPetsForAssign')}
            </Text>
          ) : (
            <View className="mt-4 gap-2">
              {pets.map((pet) => {
                const active = assignedPetId === pet.id;
                return (
                  <Pressable
                    key={pet.id}
                    onPress={() => void onAssign(pet)}
                    disabled={assigningId === pet.id}
                    className={`flex-row items-center rounded-2xl px-3 py-3 ${
                      active ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <PetAvatar
                      avatarKey={pet.avatar_key}
                      avatarUri={pet.avatar_uri}
                      species={pet.species}
                      size={40}
                      name={pet.name}
                    />
                    <Text
                      className={`ml-3 flex-1 font-body-bold text-base ${
                        active ? 'text-sand-50' : 'text-forest-900'
                      }`}
                    >
                      {pet.name}
                    </Text>
                    {active ? (
                      <Text className="font-body text-xs text-sand-50">✓</Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {error ? (
          <View className="mt-4">
            <ErrorState message={error} />
          </View>
        ) : null}

        <View className="mt-6 gap-3">
          {!saved ? (
            <PrimaryButton
              label={t('result.save')}
              onPress={onSave}
              loading={saving}
            />
          ) : (
            <PrimaryButton
              label={t('result.viewHistory')}
              variant="secondary"
              onPress={() => router.push('/(app)/(tabs)/history')}
            />
          )}
          <PrimaryButton
            label={t('result.share')}
            variant="secondary"
            onPress={() =>
              void shareText({
                title: t('share.dialogTitle'),
                message: buildScanShareMessage({
                  productName: result.productName,
                  score: result.score,
                }),
              })
            }
          />
          <PrimaryButton
            label={t('result.scanAnother')}
            variant="ghost"
            onPress={() => router.replace('/(app)/(tabs)')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
