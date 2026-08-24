import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { ScrHeader } from '@/src/components/ScrHeader';
import {
  getPassportPack,
  PASSPORT_PACKS,
  type PassportPackId,
} from '@/src/constants/passportChecklists';
import { t } from '@/src/i18n';
import { getPet } from '@/src/services/pets';
import {
  getPassportProgress,
  passportProgressCount,
  setPassportItemDone,
} from '@/src/services/passportDocs';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

/** HTML kit · Документи — Вдома / В межах ЄС / Поза Шенгеном */
export default function PetPassportScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [packId, setPackId] = useState<PassportPackId>('home');
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pack = useMemo(() => getPassportPack(packId), [packId]);
  const counts = passportProgressCount(progress, pack.items.length);

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
      setProgress(await getPassportProgress(petId, packId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('passport.loadError'));
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
    const next = await setPassportItemDone({
      petId,
      packId,
      itemId,
      done: !progress[itemId],
    });
    setProgress(next);
  };

  if (loading) {
    return <LoadingState message={t('passport.loading')} />;
  }

  if (error || !pet) {
    return (
      <AppScreen edges={['bottom']}>
      <AppChromeHeader />
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('passport.title')} />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.subtitle}>{t('passport.subtitle')}</Text>

        <View style={styles.seg}>
          {PASSPORT_PACKS.map((p) => {
            const active = packId === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPackId(p.id)}
                style={[styles.segOpt, active && styles.segOptOn]}
              >
                <Text
                  style={[styles.segOptText, active && styles.segOptTextOn]}
                  numberOfLines={1}
                >
                  {p.titleUk}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{t('passport.disclaimer')}</Text>
        </View>

        {pack.items.map((item) => {
          const done = Boolean(progress[item.id]);
          return (
            <Pressable
              key={item.id}
              onPress={() => void toggle(item.id)}
              style={[styles.card, !done && styles.cardDim]}
            >
              <View style={styles.cardLeft}>
                {done ? (
                  <Ionicons
                    name="checkmark"
                    size={17}
                    color={brand.successDark}
                  />
                ) : null}
                <Text style={styles.cardTitle}>{item.labelUk}</Text>
              </View>
              <View
                style={[
                  styles.chip,
                  done ? styles.chipGood : styles.chipNeutral,
                ]}
              >
                <Text
                  style={[styles.chipText, done && styles.chipTextGood]}
                >
                  {done ? t('passport.chipDone') : t('passport.chipNeeded')}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.progressCard}>
          <Text style={styles.progressText}>
            {t('passport.progress', {
              done: counts.done,
              total: counts.total,
            })}
          </Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
    marginBottom: 12,
    textAlign: 'center',
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: brand.chipTrack,
    borderRadius: brand.radius.md,
    padding: 4,
    marginBottom: 12,
  },
  segOpt: {
    flex: 1,
    alignItems: 'center',
    borderRadius: brand.radius.pill,
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  segOptOn: { backgroundColor: brand.surfaceElevated },
  segOptText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.muted,
  },
  segOptTextOn: { color: brand.ink },
  disclaimer: {
    marginBottom: 12,
    borderRadius: brand.radius.sm,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disclaimerText: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: brand.accentDark,
  },
  card: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  cardDim: { opacity: 0.7 },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
  chip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipNeutral: { backgroundColor: brand.chipTrack },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: brand.muted,
  },
  chipTextGood: { color: brand.successDark },
  progressCard: {
    marginTop: 4,
    borderRadius: brand.radius.md,
    backgroundColor: brand.successTint,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  progressText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.successDark,
  },
});
