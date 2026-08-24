import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { isNativeSafeImageUri } from '@/src/lib/image';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import {
  getPlantHistoryItem,
  listPlantsCatalog,
  type PlantHistoryItem,
} from '@/src/services/plants';
import { brand, fonts } from '@/src/theme/brand';
import type { PlantRecord, PlantToxicityLevel } from '@/src/types/plant';

type SpeciesKey = 'dog' | 'cat' | 'bird';

type SpeciesCard = {
  key: SpeciesKey;
  level: PlantToxicityLevel;
  notes: string | null;
};

function isSafeLevel(level: PlantToxicityLevel) {
  return level === 'safe';
}

function shortNotes(notes: string | null): string | null {
  if (!notes) return null;
  const trimmed = notes.trim();
  if (trimmed.length <= 48) return trimmed;
  return `${trimmed.slice(0, 45).trim()}…`;
}

function verdictWord(level: PlantToxicityLevel) {
  switch (level) {
    case 'safe':
      return t('plants.verdictSafeShort');
    case 'mild':
      return t('plants.verdictMildShort');
    case 'toxic':
      return t('plants.verdictToxicShort');
    default:
      return t('plants.verdictUnknownShort');
  }
}

function speciesLabel(key: SpeciesKey) {
  switch (key) {
    case 'dog':
      return t('plants.speciesDogs');
    case 'cat':
      return t('plants.speciesCats');
    case 'bird':
      return t('plants.speciesBirds');
  }
}

function cardTitle(card: SpeciesCard) {
  const base = `${speciesLabel(card.key)} — ${verdictWord(card.level)}`;
  if (isSafeLevel(card.level) || card.level === 'unknown') return base;
  const notes = shortNotes(card.notes);
  return notes ? `${base} (${notes})` : base;
}

function matchPlant(
  item: PlantHistoryItem,
  catalog: PlantRecord[],
): PlantRecord | null {
  const latin = item.latin?.trim().toLowerCase();
  if (latin) {
    const byLatin = catalog.find((p) => p.latin.toLowerCase() === latin);
    if (byLatin) return byLatin;
  }
  const nameUk = item.name_uk?.trim().toLowerCase();
  if (nameUk) {
    const byUk = catalog.find((p) => p.name_uk.toLowerCase() === nameUk);
    if (byUk) return byUk;
  }
  const q = (item.query_text ?? '').trim().toLowerCase();
  if (q) {
    const byQuery = catalog.find(
      (p) =>
        p.name_uk.toLowerCase() === q ||
        p.name_en.toLowerCase() === q ||
        p.latin.toLowerCase() === q ||
        p.aliases.some((a) => a.toLowerCase() === q),
    );
    if (byQuery) return byQuery;
  }
  return null;
}

function toxicityCards(
  item: PlantHistoryItem,
  plant: PlantRecord | null,
): SpeciesCard[] {
  const forDog =
    plant?.toxicity.find((row) => row.species === 'dog') ?? null;
  const forCat =
    plant?.toxicity.find((row) => row.species === 'cat') ?? null;

  const fallbackLevel = (
    ['safe', 'mild', 'toxic', 'unknown'].includes(item.level)
      ? item.level
      : 'unknown'
  ) as PlantToxicityLevel;

  return [
    {
      key: 'dog',
      level:
        forDog?.level ??
        (item.for_species === 'dog' ? fallbackLevel : 'unknown'),
      notes:
        forDog?.notes ??
        (item.for_species === 'dog' ? item.notes ?? null : null),
    },
    {
      key: 'cat',
      level:
        forCat?.level ??
        (item.for_species === 'cat' ? fallbackLevel : 'unknown'),
      notes:
        forCat?.notes ??
        (item.for_species === 'cat' ? item.notes ?? null : null),
    },
    {
      key: 'bird',
      // Calcium-oxalate houseplants are unsafe for birds in kit copy (02.08).
      level:
        forCat?.level === 'toxic' || forDog?.level === 'toxic'
          ? 'toxic'
          : 'unknown',
      notes: null,
    },
  ];
}

export default function PlantResultScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [item, setItem] = useState<PlantHistoryItem | null>(null);
  const [cards, setCards] = useState<SpeciesCard[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      void (async () => {
        if (!id) {
          if (alive) {
            setItem(null);
            setCards([]);
            setLoading(false);
          }
          return;
        }
        setLoading(true);
        const row = await getPlantHistoryItem(id);
        if (!alive) return;
        setItem(row);
        if (!row) {
          setCards([]);
          setPhotoUrl(null);
          setLoading(false);
          return;
        }
        const catalog = await listPlantsCatalog();
        if (!alive) return;
        const plant = matchPlant(row, catalog);
        setCards(toxicityCards(row, plant));
        const url = row.photo_uri
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
      <AppScreen edges={['bottom']}>
        <ErrorState
          title={t('journal.detailMissingTitle')}
          message={t('journal.detailMissingBody')}
          onRetry={() => router.replace('/(app)/(tabs)/history')}
        />
      </AppScreen>
    );
  }

  const showPhoto = isNativeSafeImageUri(photoUrl);
  const displayName = item.name_uk ?? item.query_text ?? t('plants.resultTitle');
  const latin = item.latin ?? item.name_en ?? '';

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('plants.resultTitle')} titleSize={18} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {showPhoto ? (
          <Image
            source={{ uri: photoUrl! }}
            style={styles.photo}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View style={styles.photoEmpty}>
            <Text style={styles.photoEmptyText}>
              {t('plants.photoPlaceholder')}
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.heroName}>{displayName}</Text>
          <Text style={styles.heroMeta}>
            {t('plants.careLine', {
              latin: latin || '—',
              care: t('plants.careMedium'),
            })}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>
          {t('plants.toxicityBySpecies')}
        </Text>

        {cards.map((card) => {
          const safe = isSafeLevel(card.level);
          return (
            <View
              key={card.key}
              style={[
                styles.toxCard,
                safe ? styles.toxCardSafe : styles.toxCardRisk,
              ]}
            >
              <Ionicons
                name={safe ? 'checkmark' : 'warning-outline'}
                size={17}
                color={safe ? brand.successDark : brand.accentDark}
              />
              <Text
                style={[
                  styles.toxText,
                  { color: safe ? brand.successDark : brand.accentDark },
                ]}
              >
                {cardTitle(card)}
              </Text>
            </View>
          );
        })}

        <View style={styles.actions}>
          <View style={styles.actionHalf}>
            <PrimaryButton
              label={t('plants.saveToHistory')}
              variant="secondary"
              onPress={() => router.replace('/(app)/(tabs)/history')}
            />
          </View>
          <View style={styles.actionHalf}>
            <PrimaryButton
              label={t('plants.attachToPet')}
              onPress={() => router.push('/(app)/(tabs)/pets')}
            />
          </View>
        </View>

        <View style={styles.disclaimerRow}>
          <Ionicons
            name="information-circle-outline"
            size={12}
            color={brand.mutedSoft}
          />
          <Text style={styles.disclaimerSolo}>
            {t('plants.disclaimerShort')}
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 12,
  },
  photo: {
    width: '100%',
    height: 160,
    borderRadius: 18,
    backgroundColor: brand.creamDeep,
  },
  photoEmpty: {
    height: 160,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEmptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  heroName: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    color: brand.ink,
  },
  heroMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  toxCard: {
    borderRadius: brand.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toxCardSafe: {
    backgroundColor: brand.successTint,
  },
  toxCardRisk: {
    backgroundColor: brand.accentTint,
  },
  toxText: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionHalf: { flex: 1 },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 4,
  },
  disclaimerSolo: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: brand.mutedSoft,
  },
});
