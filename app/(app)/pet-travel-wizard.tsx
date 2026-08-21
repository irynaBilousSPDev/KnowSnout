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
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { notify } from '@/src/lib/notify';
import { t } from '@/src/i18n';
import { getPet } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
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

function destLabel(dest: DestType) {
  if (dest === 'city') return t('travelWizard.destCity');
  if (dest === 'schengen') return t('travelWizard.destSchengen');
  return t('travelWizard.destOther');
}

/** HTML kit · Подорож wizard with deadline banner. */
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

  const routeTitle =
    dest === 'schengen'
      ? 'Україна → ЄС'
      : dest === 'other'
        ? 'Україна → …'
        : 'Україна';

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.topBar}>
            <Pressable
              onPress={() => (step > 0 ? setStep(step - 1) : router.back())}
              style={styles.backBtn}
            >
              <Ionicons name="chevron-back" size={18} color={brand.ink} />
            </Pressable>
            <Text style={styles.routeTitle} numberOfLines={1}>
              {step === 2 ? `Маршрут: ${routeTitle}` : t('travelWizard.title')}
            </Text>
            <View style={styles.backSpacer} />
          </View>

          <Text style={styles.subtitle}>
            {pet.name} · {t('travelWizard.subtitle')}
          </Text>
          <Text style={styles.stepMeta}>{step + 1} / 3</Text>

          {step === 2 ? (
            <View style={styles.deadlineBanner}>
              <Ionicons name="time-outline" size={18} color={brand.accentDark} />
              <View style={styles.deadlineCopy}>
                <Text style={styles.deadlineTitle}>
                  {date || t('travelWizard.dateLabel')}
                </Text>
                <Text style={styles.deadlineMeta}>{destLabel(dest)}</Text>
              </View>
            </View>
          ) : null}

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
                placeholderTextColor={brand.mutedSoft}
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
              <View style={styles.timeline}>
                {(
                  [
                    ['done', t('travel.chipDone'), 'Мікрочипування'],
                    ['done', t('travel.chipDone'), 'Щеплення проти сказу'],
                    ['warn', destLabel(dest), date || '—'],
                    ['todo', t('travel.chipNeeded'), 'Ветеринарний паспорт ЄС'],
                  ] as const
                ).map(([state, meta, label], idx) => (
                  <View key={`${label}-${idx}`} style={styles.timelineRow}>
                    <View style={styles.rail}>
                      <View
                        style={[
                          styles.dot,
                          state === 'done' && styles.dotDone,
                          state === 'warn' && styles.dotWarn,
                          state === 'todo' && styles.dotTodo,
                        ]}
                      >
                        {state === 'done' ? (
                          <Ionicons name="checkmark" size={12} color="#fff" />
                        ) : state === 'warn' ? (
                          <Text style={styles.dotBang}>!</Text>
                        ) : null}
                      </View>
                      {idx < 3 ? <View style={styles.line} /> : null}
                    </View>
                    <View
                      style={[
                        styles.tlCard,
                        state === 'warn' && styles.tlCardWarn,
                        state === 'todo' && styles.tlCardDim,
                      ]}
                    >
                      <Text style={styles.tlTitle}>{label}</Text>
                      <Text style={styles.tlMeta}>{meta}</Text>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.hint}>{t('travelWizard.checklistHint')}</Text>
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
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: brand.chipTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { width: 34 },
  routeTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
    paddingHorizontal: 8,
  },
  subtitle: {
    marginBottom: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  stepMeta: {
    marginBottom: 14,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  deadlineBanner: {
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  deadlineCopy: { flex: 1 },
  deadlineTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  deadlineMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.accentDark,
  },
  stepTitle: {
    marginBottom: 14,
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
  },
  option: {
    marginBottom: 10,
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
  optionActive: {
    borderWidth: 1.5,
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  optionLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  optionLabelActive: { color: brand.accentDark },
  fieldLabel: {
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.label,
  },
  input: {
    borderRadius: brand.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    marginBottom: 8,
  },
  nextBtn: { marginTop: 8, marginBottom: 8 },
  timeline: { marginBottom: 8 },
  timelineRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 22, alignItems: 'center' },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotDone: { backgroundColor: brand.success },
  dotWarn: { backgroundColor: brand.accent },
  dotTodo: { backgroundColor: brand.mistBorder },
  dotBang: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: '#fff',
  },
  line: {
    width: 2,
    flex: 1,
    minHeight: 24,
    backgroundColor: brand.mistBorder,
  },
  tlCard: {
    flex: 1,
    marginBottom: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  tlCardWarn: {
    borderWidth: 1.5,
    borderColor: brand.accent,
  },
  tlCardDim: { opacity: 0.6 },
  tlTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  tlMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  hint: {
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
  },
});
