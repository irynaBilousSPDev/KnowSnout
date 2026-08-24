import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
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
import { canUseAiScan, consumeAiScan } from '@/src/services/aiScanLimit';
import { getPet } from '@/src/services/pets';
import {
  checkPlantByName,
  identifyPlantFromPhoto,
  listPlantsCatalog,
  savePlantCheck,
  searchPlants,
} from '@/src/services/plants';
import { PLANTS_SEED_COUNT } from '@/src/data/plantsSeed';
import { brand, fonts } from '@/src/theme/brand';
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
  const safe = result.level === 'safe';
  return (
    <View
      style={[
        styles.resultCard,
        safe ? styles.resultSafe : styles.resultRisk,
      ]}
    >
      <Text
        style={[
          styles.resultLevel,
          { color: safe ? brand.successDark : brand.accentDark },
        ]}
      >
        {levelLabel(result.level)}
      </Text>
      <Text style={styles.resultName}>{result.plant.name_uk}</Text>
      <Text style={styles.resultLatin}>
        {result.plant.latin}
        {result.plant.name_en ? ` · ${result.plant.name_en}` : ''}
      </Text>
      {result.notes ? (
        <Text
          style={[
            styles.resultNotes,
            { color: safe ? brand.successDark : brand.accentDark },
          ]}
        >
          {result.notes}
        </Text>
      ) : null}
      <Text style={styles.resultMeta}>
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
    const allowed = await canUseAiScan();
    if (!allowed) {
      router.push('/(app)/ai-limit' as never);
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
      await consumeAiScan();
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
      <ScrHeader title={t('plants.title')} titleSize={18} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.subtitle}>{t('plants.subtitle')}</Text>
        <Text style={styles.hint}>
          {t('plants.catalogHint', { count: String(catalogCount) })}
        </Text>
        {pet ? (
          <Text style={styles.forPet}>
            {t('plants.forPet', { name: pet.name })}
          </Text>
        ) : null}

        <Text style={styles.label}>{t('plants.speciesLabel')}</Text>
        <View style={styles.speciesRow}>
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
                style={[styles.speciesChip, active && styles.speciesActive]}
              >
                <Text
                  style={[
                    styles.speciesText,
                    active && styles.speciesTextActive,
                  ]}
                >
                  {s === 'cat' ? t('plants.speciesCat') : t('plants.speciesDog')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>{t('plants.searchLabel')}</Text>
        <TextInput
          value={query}
          onChangeText={(text) => void onSearchChange(text)}
          placeholder={t('plants.searchPlaceholder')}
          placeholderTextColor={brand.mutedSoft}
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {suggestions.length > 0 ? (
          <View style={styles.suggestBox}>
            {suggestions.map((s) => (
              <Pressable
                key={s.plant.id}
                onPress={() => void applyResult(s, query)}
                style={styles.suggestRow}
              >
                <Text style={styles.suggestTitle}>{s.plant.name_uk}</Text>
                <Text style={styles.suggestMeta}>{s.plant.latin}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        <PrimaryButton
          label={t('plants.checkName')}
          onPress={() => void onCheckName()}
          disabled={busy}
        />

        <Text style={[styles.label, styles.labelGap]}>
          {t('plants.photoLabel')}
        </Text>
        <Text style={styles.photoHint}>{t('plants.mockHint')}</Text>
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
        <View style={styles.photoCta}>
          <PrimaryButton
            label={t('plants.checkPhoto')}
            onPress={() => void onCheckPhoto()}
            disabled={busy || !photoUri}
            loading={busy}
          />
        </View>

        {busy ? (
          <View style={styles.busyRow}>
            <ActivityIndicator color={brand.accent} />
            <Text style={styles.busyText}>{t('plants.checking')}</Text>
          </View>
        ) : null}

        {actionError ? (
          <Text style={styles.error}>{actionError}</Text>
        ) : null}

        {result ? <ResultCard result={result} /> : null}

        <Text style={styles.disclaimer}>{t('plants.disclaimer')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  hint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  forPet: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  label: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.label,
  },
  labelGap: { marginTop: 22 },
  speciesRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  speciesChip: {
    flex: 1,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingVertical: 10,
    alignItems: 'center',
  },
  speciesActive: { backgroundColor: brand.successTint },
  speciesText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  speciesTextActive: { color: brand.successDark },
  input: {
    borderRadius: brand.radius.pill,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    marginBottom: 10,
  },
  suggestBox: {
    marginBottom: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  suggestRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
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
  photoHint: {
    marginBottom: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brand.mutedSoft,
  },
  photoCta: { marginTop: 12 },
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
  resultCard: {
    marginTop: 16,
    borderRadius: brand.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  resultSafe: { backgroundColor: brand.successTint },
  resultRisk: { backgroundColor: brand.accentTint },
  resultLevel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
  },
  resultName: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  resultLatin: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  resultNotes: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  resultMeta: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  disclaimer: {
    marginTop: 22,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: brand.mutedSoft,
  },
});
