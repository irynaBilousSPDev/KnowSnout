import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { uriToBase64 } from '@/src/lib/image';
import {
  identifyBreedFromPhoto,
  saveBreedHistoryItem,
  searchBreeds,
} from '@/src/services/breedId';
import { brand } from '@/src/theme/brand';
import type {
  BreedCheckResult,
  BreedGuess,
  CompanionBreedSpecies,
} from '@/src/types/breed';

export default function BreedScanScreen() {
  const [species, setSpecies] = useState<CompanionBreedSpecies>('dog');
  const [query, setQuery] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<BreedGuess[]>([]);
  const [result, setResult] = useState<BreedCheckResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (text: string) => {
    setQuery(text);
    setError(null);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const hits = await searchBreeds(text, species);
    setSuggestions(hits);
  };

  const applyGuess = async (guess: BreedGuess, photo?: string | null) => {
    const next: BreedCheckResult = {
      species,
      primary: guess,
      alternatives: [],
      disclaimer: true,
    };
    setResult(next);
    setSuggestions([]);
    await saveBreedHistoryItem({
      species,
      breedName: guess.name,
      breedNameUk: guess.nameUk,
      confidence: guess.confidence,
      photoUri: photo ?? null,
      temperament: guess.temperament,
      origin: guess.origin,
      bredFor: guess.bredFor,
    });
  };

  const onPhoto = async () => {
    if (!photoUri) {
      setError(t('breed.photoRequired'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const imageBase64 = await uriToBase64(photoUri);
      const next = await identifyBreedFromPhoto({ species, imageBase64 });
      setResult(next);
      await saveBreedHistoryItem({
        species,
        breedName: next.primary.name,
        breedNameUk: next.primary.nameUk,
        confidence: next.primary.confidence,
        photoUri,
        temperament: next.primary.temperament,
        origin: next.primary.origin,
        bredFor: next.primary.bredFor,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('breed.checkError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView
        contentContainerClassName="px-5 pb-12 pt-2"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="font-body text-base leading-6 text-forest-600">
          {t('breed.subtitle')}
        </Text>

        <Text className="mb-2 mt-5 font-body-bold text-sm text-forest-700">
          {t('breed.speciesLabel')}
        </Text>
        <View className="mb-4 flex-row gap-2">
          {(['dog', 'cat'] as CompanionBreedSpecies[]).map((s) => {
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
                  {s === 'cat' ? t('breed.speciesCat') : t('breed.speciesDog')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text className="mb-2 font-body-bold text-sm text-forest-700">
          {t('breed.searchLabel')}
        </Text>
        <TextInput
          value={query}
          onChangeText={(text) => void onSearch(text)}
          placeholder={t('breed.searchPlaceholder')}
          placeholderTextColor="#9bbba5"
          className="mb-2 rounded-2xl border border-forest-100 bg-white px-4 py-3 font-body text-base text-forest-900"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {suggestions.length > 0 ? (
          <View className="mb-3 overflow-hidden rounded-2xl border border-forest-100 bg-white">
            {suggestions.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => void applyGuess(s)}
                className="border-b border-forest-50 px-4 py-3"
              >
                <Text className="font-body-bold text-sm text-forest-900">
                  {s.nameUk ?? s.name}
                </Text>
                <Text className="font-body text-xs text-forest-500">
                  {s.name}
                  {s.source !== 'mock' ? ` · ${s.source}` : ''}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        <Text className="mb-2 mt-4 font-body-bold text-sm text-forest-700">
          {t('breed.photoLabel')}
        </Text>
        <Text className="mb-3 font-body text-sm leading-5 text-forest-500">
          {t('breed.photoTapHint')} {t('breed.mockHint')}
        </Text>
        <PhotoAttachField
          label={t('breed.photoAttach')}
          uri={photoUri}
          onChange={(uri) => {
            setPhotoUri(uri);
            setError(null);
            setResult(null);
          }}
          height={180}
          filePrefix="breed"
          emptyHint={t('breed.photoEmpty')}
        />
        <View className="mt-3">
          <PrimaryButton
            label={t('breed.checkPhoto')}
            onPress={() => void onPhoto()}
            disabled={busy || !photoUri}
            loading={busy}
          />
        </View>

        {busy ? (
          <View className="mt-4 flex-row items-center gap-2">
            <ActivityIndicator color={brand.ink} />
            <Text className="font-body text-sm text-forest-600">
              {t('breed.checking')}
            </Text>
          </View>
        ) : null}

        {error ? (
          <Text className="mt-4 font-body text-sm leading-5 text-score-poor">
            {error}
          </Text>
        ) : null}

        {result ? (
          <View className="mt-5 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="font-body-bold text-lg text-forest-900">
              {result.primary.nameUk ?? result.primary.name}
            </Text>
            <Text className="mt-1 font-body text-sm text-forest-600">
              {result.primary.name}
            </Text>
            <Text className="mt-3 font-body text-sm text-forest-700">
              {t('breed.confidence', {
                pct: Math.round(result.primary.confidence * 100),
              })}
            </Text>
            {result.primary.temperament ? (
              <Text className="mt-2 font-body text-sm leading-5 text-forest-700">
                {result.primary.temperament}
              </Text>
            ) : null}
            {result.primary.origin ? (
              <Text className="mt-1 font-body text-xs text-forest-500">
                {result.primary.origin}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text className="mt-6 font-body text-xs leading-5 text-forest-500">
          {t('breed.disclaimer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
