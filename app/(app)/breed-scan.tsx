import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { guessMimeType, uriToBase64 } from '@/src/lib/image';
import {
  identifyBreedFromPhoto,
  saveBreedHistoryItem,
  searchBreeds,
} from '@/src/services/breedId';
import { brand, fonts } from '@/src/theme/brand';
import type {
  BreedGuess,
  CompanionBreedSpecies,
} from '@/src/types/breed';

/** HTML «10 · Порода: форма» — photo first, manual name secondary. */
export default function BreedScanScreen() {
  const [species, setSpecies] = useState<CompanionBreedSpecies>('dog');
  const [query, setQuery] = useState('');
  const [manualOpen, setManualOpen] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<BreedGuess[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (text: string) => {
    setQuery(text);
    setError(null);
    if (text.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(await searchBreeds(text, species));
  };

  const applyGuess = async (guess: BreedGuess, photo?: string | null) => {
    const saved = await saveBreedHistoryItem({
      species,
      breedName: guess.name,
      breedNameUk: guess.nameUk,
      confidence: guess.confidence,
      photoUri: photo ?? null,
      temperament: guess.temperament,
      origin: guess.origin,
      bredFor: guess.bredFor,
      alternatives: [],
    });
    router.push({ pathname: '/(app)/breed-result', params: { id: saved.id } });
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
      const next = await identifyBreedFromPhoto({
        species,
        imageBase64,
        mimeType: guessMimeType(photoUri),
      });
      const saved = await saveBreedHistoryItem({
        species,
        breedName: next.primary.name,
        breedNameUk: next.primary.nameUk,
        confidence: next.primary.confidence,
        photoUri,
        temperament: next.primary.temperament,
        origin: next.primary.origin,
        bredFor: next.primary.bredFor,
        alternatives: next.alternatives.map((a) => ({
          breedName: a.name,
          breedNameUk: a.nameUk,
          confidence: a.confidence,
        })),
      });
      router.push({ pathname: '/(app)/breed-result', params: { id: saved.id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('breed.checkError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('breed.askTitle')}</Text>

        <View style={styles.speciesRow}>
          {(['dog', 'cat'] as CompanionBreedSpecies[]).map((s) => {
            const active = species === s;
            return (
              <Pressable
                key={s}
                onPress={() => {
                  setSpecies(s);
                  setSuggestions([]);
                }}
                style={[styles.speciesChip, active && styles.speciesActive]}
              >
                <Text
                  style={[styles.speciesText, active && styles.speciesTextActive]}
                >
                  {s === 'cat' ? t('breed.speciesCat') : t('breed.speciesDog')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <PhotoAttachField
          label={t('breed.photoAttach')}
          uri={photoUri}
          onChange={(uri) => {
            setPhotoUri(uri);
            setError(null);
          }}
          height={220}
          filePrefix="breed"
          emptyHint={t('breed.photoEmpty')}
        />

        <View style={styles.cta}>
          <PrimaryButton
            label={t('breed.identifyCta')}
            onPress={() => void onPhoto()}
            disabled={busy || !photoUri}
            loading={busy}
          />
        </View>

        <Pressable
          onPress={() => setManualOpen((v) => !v)}
          style={styles.manualBtn}
        >
          <Text style={styles.manualText}>{t('breed.manualCta')}</Text>
        </Pressable>

        {manualOpen ? (
          <View style={styles.manualBox}>
            <TextInput
              value={query}
              onChangeText={(text) => void onSearch(text)}
              placeholder={t('breed.searchPlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {suggestions.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => void applyGuess(s)}
                style={styles.suggest}
              >
                <Text style={styles.suggestTitle}>{s.nameUk ?? s.name}</Text>
                <Text style={styles.suggestMeta}>{s.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {busy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator color={brand.accent} />
            <Text style={styles.busyText}>{t('breed.checking')}</Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.disclaimer}>{t('breed.disclaimer')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginBottom: 14,
  },
  speciesRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  speciesChip: {
    flex: 1,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingVertical: 10,
    alignItems: 'center',
  },
  speciesActive: { backgroundColor: brand.accent },
  speciesText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  speciesTextActive: { color: '#FFFFFF' },
  cta: { marginTop: 14 },
  manualBtn: {
    marginTop: 14,
    minHeight: 46,
    borderRadius: brand.radius.pill,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accentDark,
  },
  manualBox: { marginTop: 12 },
  input: {
    borderRadius: brand.radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(21,34,51,0.12)',
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  suggest: {
    marginTop: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  suggestTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  suggestMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  busyRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  busyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  error: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.score.poor,
  },
  disclaimer: {
    marginTop: 20,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: brand.mutedSoft,
  },
});
