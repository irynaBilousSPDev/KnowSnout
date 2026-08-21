import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ErrorState } from '@/src/components/ErrorState';
import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { guessMimeType, uriToBase64 } from '@/src/lib/image';
import { getPet } from '@/src/services/pets';
import {
  checkPlantByName,
  identifyPlantFromPhoto,
  listPlantsCatalog,
  plantLevelTone,
  savePlantCheck,
  searchPlants,
} from '@/src/services/plants';
import { PLANTS_SEED_COUNT } from '@/src/data/plantsSeed';
import { brand } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type {
  PlantCheckResult,
  PlantSpeciesTarget,
  PlantToxicityLevel,
} from '@/src/types/plant';

function speciesFromPet(pet: PetRow | null): PlantSpeciesTarget {
  if (pet?.species === 'cat') return 'cat';
  return 'dog';
}

function levelLabel(level: PlantToxicityLevel) {
  switch (level) {
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

function ResultCard({ result }: { result: PlantCheckResult }) {
  const tone = plantLevelTone(result.level);
  return (
    <View className={`mt-4 rounded-3xl border px-5 py-5 ${tone.bg} ${tone.border}`}>
      <Text className={`font-body-bold text-lg ${tone.text}`}>
        {levelLabel(result.level)}
      </Text>
      <Text className="mt-2 font-body-bold text-base text-forest-900">
        {result.plant.name_uk}
      </Text>
      <Text className="mt-1 font-body text-sm text-forest-600">
        {result.plant.latin}
        {result.plant.name_en ? ` · ${result.plant.name_en}` : ''}
      </Text>
      {result.notes ? (
        <Text className={`mt-3 font-body text-base leading-6 ${tone.text}`}>
          {result.notes}
        </Text>
      ) : null}
      <Text className="mt-3 font-body text-xs text-forest-500">
        {t('plants.forSpecies', {
          species:
            result.forSpecies === 'cat'
              ? t('plants.speciesCat')
              : t('plants.speciesDog'),
        })}
        {' · '}
        {t('plants.confidence', {
          pct: Math.round(result.confidence * 100),
        })}
      </Text>
    </View>
  );
}

export default function PlantSafetyScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [species, setSpecies] = useState<PlantSpeciesTarget>('dog');
  const [query, setQuery] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PlantCheckResult[]>([]);
  const [result, setResult] = useState<PlantCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [catalogCount, setCatalogCount] = useState(PLANTS_SEED_COUNT);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catalog = await listPlantsCatalog();
      setCatalogCount(catalog.length);
      if (!petId) {
        setPet(null);
        setSpecies('dog');
        return;
      }
      const nextPet = await getPet(petId);
      if (!nextPet) {
        setError(t('pets.notFound'));
        setPet(null);
        return;
      }
      setPet(nextPet);
      setSpecies(speciesFromPet(nextPet));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('plants.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onSearchChange = async (text: string) => {
    setQuery(text);
    setActionError(null);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const hits = await searchPlants(text, species, 6);
    setSuggestions(hits);
  };

  const applyResult = async (
    next: PlantCheckResult,
    queryText?: string,
    photo?: string | null,
  ) => {
    setResult(next);
    setSuggestions([]);
    const saved = await savePlantCheck({
      petId,
      result: next,
      queryText,
      photoUri: photo ?? photoUri,
    });
    router.push({
      pathname: '/(app)/plant-result',
      params: { id: saved.id },
    });
  };

  const onCheckName = async () => {
    const q = query.trim();
    if (q.length < 2) {
      setActionError(t('plants.queryShort'));
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const hit = await checkPlantByName(q, species);
      if (!hit) {
        setResult(null);
        setActionError(t('plants.notFound'));
        return;
      }
      await applyResult(hit, q);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : t('plants.checkError'),
      );
    } finally {
      setBusy(false);
    }
  };

  const onCheckPhoto = async () => {
    if (!photoUri) {
      setActionError(t('plants.photoRequired'));
      return;
    }
    setBusy(true);
    setActionError(null);
    try {
      const imageBase64 = await uriToBase64(photoUri);
      const hit = await identifyPlantFromPhoto({
        imageBase64,
        mimeType: guessMimeType(photoUri),
        species,
      });
      setQuery(hit.plant.name_uk);
      await applyResult(hit, hit.matchedQuery, photoUri);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : t('plants.checkError'),
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('plants.loading')} />;
  }

  if (error) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <ErrorState message={error} onRetry={() => void load()} />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('plants.title')} />
      <ScrollView
        contentContainerClassName="px-5 pb-12 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-body text-base leading-6 text-forest-600">
          {t('plants.subtitle')}
        </Text>
        <Text className="mt-1 font-body text-xs text-forest-500">
          {t('plants.catalogHint', { count: String(catalogCount) })}
        </Text>
        {pet ? (
          <Text className="mt-2 font-body-bold text-base text-forest-800">
            {t('plants.forPet', { name: pet.name })}
          </Text>
        ) : null}

        <Text className="mb-2 mt-5 font-body-bold text-sm text-forest-700">
          {t('plants.speciesLabel')}
        </Text>
        <View className="mb-4 flex-row gap-2">
          {(['dog', 'cat'] as PlantSpeciesTarget[]).map((s) => {
            const active = species === s;
            return (
              <Pressable
                key={s}
                onPress={() => {
                  setSpecies(s);
                  setResult(null);
                  setSuggestions([]);
                }}
                className={`flex-1 rounded-2xl border px-3 py-3 ${
                  active
                    ? 'border-forest-700 bg-forest-700'
                    : 'border-forest-100 bg-white'
                }`}
              >
                <Text
                  className={`text-center font-body-bold text-sm ${
                    active ? 'text-white' : 'text-forest-800'
                  }`}
                >
                  {s === 'cat' ? t('plants.speciesCat') : t('plants.speciesDog')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 font-body-bold text-sm text-forest-700">
          {t('plants.searchLabel')}
        </Text>
        <TextInput
          value={query}
          onChangeText={(text) => void onSearchChange(text)}
          placeholder={t('plants.searchPlaceholder')}
          placeholderTextColor="#9bbba5"
          className="mb-2 rounded-2xl border border-forest-100 bg-white px-4 py-3 font-body text-base text-forest-900"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {suggestions.length > 0 ? (
          <View className="mb-3 overflow-hidden rounded-2xl border border-forest-100 bg-white">
            {suggestions.map((s) => (
              <Pressable
                key={s.plant.id}
                onPress={() => void applyResult(s, query)}
                className="border-b border-forest-50 px-4 py-3 last:border-b-0"
              >
                <Text className="font-body-bold text-sm text-forest-900">
                  {s.plant.name_uk}
                </Text>
                <Text className="font-body text-xs text-forest-500">
                  {s.plant.latin}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <PrimaryButton
          label={t('plants.checkName')}
          onPress={() => void onCheckName()}
          disabled={busy}
        />

        <Text className="mb-2 mt-6 font-body-bold text-sm text-forest-700">
          {t('plants.photoLabel')}
        </Text>
        <Text className="mb-3 font-body text-sm leading-5 text-forest-500">
          {t('plants.mockHint')}
        </Text>
        <PhotoAttachField
          label={t('plants.photoAttach')}
          uri={photoUri}
          onChange={(uri) => {
            setPhotoUri(uri);
            setActionError(null);
            setResult(null);
          }}
          height={180}
          filePrefix="plant"
          emptyHint={t('plants.photoEmpty')}
        />
        <View className="mt-3">
          <PrimaryButton
            label={t('plants.checkPhoto')}
            onPress={() => void onCheckPhoto()}
            disabled={busy || !photoUri}
            loading={busy}
          />
        </View>

        {busy ? (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator color={brand.ink} />
            <Text className="font-body text-sm text-forest-600">
              {t('plants.checking')}
            </Text>
          </View>
        ) : null}

        {actionError ? (
          <Text className="mt-4 font-body text-sm leading-5 text-score-poor">
            {actionError}
          </Text>
        ) : null}

        {result ? <ResultCard result={result} /> : null}

        <Text className="mt-6 font-body text-xs leading-5 text-forest-500">
          {t('plants.disclaimer')}
        </Text>
      </ScrollView>
    </AppScreen>
  );
}
