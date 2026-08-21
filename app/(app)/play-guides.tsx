import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import {
  getPlayPack,
  playPackForSpecies,
  PLAY_PACKS,
  type PlayPackId,
} from '@/src/constants/playGuides';
import { t } from '@/src/i18n';
import { petAgeLabel, speciesLabel } from '@/src/lib/petMeta';
import { getPet } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

const ICON_TONES = [
  brand.successTint,
  brand.accentTint,
  brand.chipTrack,
] as const;
const ICON_COLORS = [
  brand.successDark,
  brand.accentDark,
  brand.ink,
] as const;

/** HTML kit · Ігри та активності */
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
      <AppScreen edges={['bottom']}>
        <ErrorState message={error} onRetry={() => void load()} />
      </AppScreen>
    );
  }

  const age = pet ? petAgeLabel(pet.birth_date) : null;

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>
          {pet ? t('play.titleFor', { name: pet.name }) : t('play.title')}
        </Text>

        {pet ? (
          <View style={styles.metaRow}>
            <View style={[styles.chip, styles.chipGood]}>
              <Text style={[styles.chipText, styles.chipTextGood]}>
                {[pet.breed?.trim(), speciesLabel(pet.species)]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </View>
            {age ? (
              <View style={styles.chip}>
                <Text style={styles.chipText}>{age}</Text>
              </View>
            ) : null}
          </View>
        ) : (
          <View style={styles.seg}>
            {PLAY_PACKS.map((p) => {
              const active = packId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPackId(p.id)}
                  style={[styles.segOpt, active && styles.segOptOn]}
                >
                  <Text
                    style={[styles.segOptText, active && styles.segOptTextOn]}
                  >
                    {p.titleUk}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {pack.cards.map((card, index) => {
          const tone = ICON_TONES[index % ICON_TONES.length]!;
          const color = ICON_COLORS[index % ICON_COLORS.length]!;
          return (
            <View key={card.id} style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: tone }]}>
                <Ionicons name="football-outline" size={19} color={color} />
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{card.titleUk}</Text>
                <Text style={styles.cardMeta} numberOfLines={2}>
                  {card.bodyUk}
                </Text>
                {card.toysUk && card.toysUk.length > 0 ? (
                  <Text style={styles.toys}>
                    {card.toysUk.slice(0, 2).join(' · ')}
                  </Text>
                ) : null}
              </View>
              {index === 0 ? (
                <View style={[styles.chip, styles.chipGood]}>
                  <Text style={[styles.chipText, styles.chipTextGood]}>
                    {t('play.favorite')}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })}

        <Text style={styles.hint}>{t('play.disclaimer')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: {
    fontFamily: fonts.title,
    fontSize: 19,
    lineHeight: 24,
    color: brand.ink,
    marginBottom: 10,
  },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: brand.muted,
  },
  chipTextGood: { color: brand.successDark },
  seg: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
    backgroundColor: brand.chipTrack,
    borderRadius: brand.radius.md,
    padding: 4,
  },
  segOpt: {
    flexGrow: 1,
    minWidth: '30%',
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 10,
  },
  segOptOn: { backgroundColor: brand.accent },
  segOptText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  segOptTextOn: { color: '#FFFFFF' },
  card: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCopy: { flex: 1, minWidth: 0 },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  cardMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  toys: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  hint: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
});
