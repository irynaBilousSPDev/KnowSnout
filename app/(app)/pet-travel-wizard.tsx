import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { notify } from '@/src/lib/notify';
import { t } from '@/src/i18n';
import { getPet } from '@/src/services/pets';
import { brand } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

type DestType = 'city' | 'schengen' | 'other';

type TripStub = {
  id: string;
  petId: string;
  destinationType: DestType;
  date: string;
  createdAt: string;
};

const TRIPS_KEY = 'knowsnout.pet_trips';

async function saveTripStub(trip: TripStub) {
  const raw = await AsyncStorage.getItem(TRIPS_KEY);
  let rows: TripStub[] = [];
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as TripStub[];
      rows = Array.isArray(parsed) ? parsed : [];
    } catch {
      rows = [];
    }
  }
  rows.unshift(trip);
  await AsyncStorage.setItem(TRIPS_KEY, JSON.stringify(rows));
}

export default function PetTravelWizardScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [dest, setDest] = useState<DestType>('city');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('travelWizard.loadError'),
      );
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onConfirm = async () => {
    if (!petId) return;
    const day = date.trim().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      notify(t('common.error'), t('travelWizard.needDate'));
      return;
    }
    setSaving(true);
    try {
      await saveTripStub({
        id: `trip-${Date.now()}`,
        petId,
        destinationType: dest,
        date: day,
        createdAt: new Date().toISOString(),
      });
      notify(t('travelWizard.saved'));
      router.replace({
        pathname: '/(app)/pet-travel',
        params: { petId },
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('travelWizard.loading')} />;
  }

  if (error || !pet) {
    return (
      <AppScreen edges={['bottom']}>
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.subtitle}>
            {pet.name} · {t('travelWizard.subtitle')}
          </Text>
          <Text style={styles.stepMeta}>{step + 1} / 3</Text>

          {step === 0 ? (
            <View>
              <Text style={styles.stepTitle}>{t('travelWizard.step1')}</Text>
              {(
                [
                  ['city', 'travelWizard.destCity'],
                  ['schengen', 'travelWizard.destSchengen'],
                  ['other', 'travelWizard.destOther'],
                ] as const
              ).map(([value, key]) => {
                const active = dest === value;
                return (
                  <Pressable
                    key={value}
                    onPress={() => setDest(value)}
                    style={[styles.option, active && styles.optionActive]}
                  >
                    <Text
                      style={[
                        styles.optionLabel,
                        active && styles.optionLabelActive,
                      ]}
                    >
                      {t(key)}
                    </Text>
                  </Pressable>
                );
              })}
              <PrimaryButton
                label={t('common.next')}
                onPress={() => setStep(1)}
                style={styles.nextBtn}
              />
            </View>
          ) : null}

          {step === 1 ? (
            <View>
              <Text style={styles.stepTitle}>{t('travelWizard.step2')}</Text>
              <Text style={styles.fieldLabel}>
                {t('travelWizard.dateLabel')}
              </Text>
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder={t('travelWizard.datePlaceholder')}
                placeholderTextColor="#9bbba5"
                autoCapitalize="none"
                style={styles.input}
              />
              <PrimaryButton
                label={t('common.next')}
                onPress={() => setStep(2)}
                style={styles.nextBtn}
              />
              <PrimaryButton
                label={t('common.back')}
                variant="ghost"
                onPress={() => setStep(0)}
              />
            </View>
          ) : null}

          {step === 2 ? (
            <View>
              <Text style={styles.stepTitle}>{t('travelWizard.step3')}</Text>
              <View style={styles.summary}>
                <Text style={styles.summaryLine}>
                  {dest === 'city'
                    ? t('travelWizard.destCity')
                    : dest === 'schengen'
                      ? t('travelWizard.destSchengen')
                      : t('travelWizard.destOther')}
                </Text>
                <Text style={styles.summaryLine}>{date || '—'}</Text>
                <Text style={styles.hint}>{t('travelWizard.checklistHint')}</Text>
              </View>
              <PrimaryButton
                label={t('travelWizard.confirm')}
                onPress={() => void onConfirm()}
                loading={saving}
                style={styles.nextBtn}
              />
              <PrimaryButton
                label={t('common.back')}
                variant="ghost"
                onPress={() => setStep(1)}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  subtitle: {
    marginBottom: 8,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
  stepMeta: {
    marginBottom: 16,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#8A9AAB',
  },
  stepTitle: {
    marginBottom: 14,
    fontFamily: 'Caprasimo_400Regular',
    fontSize: 24,
    color: brand.ink,
  },
  option: {
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  optionActive: {
    borderColor: brand.navy,
    backgroundColor: brand.mist,
  },
  optionLabel: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  optionLabelActive: { color: brand.navy },
  fieldLabel: {
    marginBottom: 8,
    fontFamily: 'Figtree_700Bold',
    fontSize: 13,
    color: '#5A6B7D',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: brand.ink,
    marginBottom: 8,
  },
  nextBtn: { marginTop: 8, marginBottom: 8 },
  summary: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    marginBottom: 8,
  },
  summaryLine: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 15,
    color: brand.ink,
    marginBottom: 6,
  },
  hint: {
    marginTop: 6,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 19,
    color: '#5A6B7D',
  },
});
