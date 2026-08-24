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
import {
  getBreedHistoryItem,
  type BreedHistoryAlternative,
  type BreedHistoryItem,
} from '@/src/services/breedId';
import { resolveCheckImageUrl } from '@/src/services/checkImages';
import { brand, fonts } from '@/src/theme/brand';

type MatchRow = {
  name: string;
  confidence: number;
};

function buildMatches(item: BreedHistoryItem): MatchRow[] {
  const primaryName = item.breedNameUk ?? item.breedName;
  const primary: MatchRow = {
    name: primaryName,
    confidence: item.confidence,
  };
  const alts = (item.alternatives ?? [])
    .filter((a) => a.breedName.trim().length > 0)
    .map((a: BreedHistoryAlternative) => ({
      name: a.breedNameUk?.trim() || a.breedName.trim(),
      confidence: a.confidence,
    }))
    .filter(
      (a) => a.name.toLowerCase() !== primaryName.toLowerCase(),
    );
  return [primary, ...alts].slice(0, 4);
}

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
  const displayName = item.breedNameUk ?? item.breedName;
  const matches = buildMatches(item);
  const hasAlternatives = (item.alternatives?.length ?? 0) > 0;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('breed.resultTitle')} titleSize={18} />
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
            <Text style={styles.photoEmptyText}>{t('journal.noPhoto')}</Text>
          </View>
        )}

        <View style={styles.hero}>
          <Text style={styles.heroName}>{displayName}</Text>
          {hasAlternatives ? (
            <Text style={styles.heroNote}>{t('breed.mixedNote')}</Text>
          ) : null}
        </View>

        <Text style={styles.sectionLabel}>{t('breed.closestMatches')}</Text>

        {matches.map((row, index) => {
          const pct = Math.max(
            0,
            Math.min(100, Math.round(row.confidence * 100)),
          );
          const isTop = index === 0;
          return (
            <View key={`${row.name}-${index}`} style={styles.matchCard}>
              <Text style={styles.matchName} numberOfLines={1}>
                {row.name}
              </Text>
              <View style={styles.matchRight}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${pct}%`,
                        backgroundColor: isTop
                          ? brand.success
                          : brand.mutedSoft,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.matchPct}>{pct}%</Text>
              </View>
            </View>
          );
        })}

        <PrimaryButton
          label={t('breed.saveToProfile')}
          onPress={() =>
            router.push({
              pathname: '/(app)/pet-form',
              params: {
                breed: displayName,
                species: item.species,
              },
            })
          }
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 14,
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: 18,
    backgroundColor: brand.creamDeep,
  },
  photoEmpty: {
    height: 150,
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
  hero: {
    alignItems: 'center',
  },
  heroName: {
    fontFamily: fonts.bodyBold,
    fontSize: 19,
    color: brand.ink,
    textAlign: 'center',
  },
  heroNote: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  matchCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  matchName: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
  matchRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  barTrack: {
    width: 60,
    height: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: brand.radius.pill,
  },
  matchPct: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.ink,
    minWidth: 32,
    textAlign: 'right',
  },
});
