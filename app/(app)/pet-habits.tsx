import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { confirmAction } from '@/src/lib/confirm';
import { notify } from '@/src/lib/notify';
import { t } from '@/src/i18n';
import { useToast } from '@/src/hooks/useToast';
import { getPet } from '@/src/services/pets';
import {
  addHabit,
  deleteHabit,
  listHabits,
  type HabitKind,
  type PetHabit,
} from '@/src/services/petHabits';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

/** HTML kit · Звички (добрі й погані) */
export default function PetHabitsScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;
  const { showToast } = useToast();

  const [pet, setPet] = useState<PetRow | null>(null);
  const [habits, setHabits] = useState<PetHabit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<HabitKind>('good');
  const [saving, setSaving] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);

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
      setHabits(await listHabits(petId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('habits.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onAdd = async () => {
    if (!petId || !label.trim()) return;
    setSaving(true);
    try {
      const row = await addHabit({ petId, label, kind });
      setHabits((prev) => [row, ...prev]);
      setLabel('');
      setComposeOpen(false);
      showToast(t('toast.habitSaved'));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('habits.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (habit: PetHabit) => {
    const ok = await confirmAction({
      title: t('habits.deleteTitle'),
      message: t('habits.deleteMessage', { name: habit.label }),
      confirmLabel: t('pets.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    await deleteHabit(habit.id);
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
  };

  if (loading) {
    return <LoadingState message={t('habits.loading')} />;
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

  const good = habits.filter((h) => h.kind === 'good');
  const work = habits.filter((h) => h.kind === 'bad');

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('habits.titleFor', { name: pet.name })}
        titleSize={19}
        right={
          <Pressable
            onPress={() => setComposeOpen((v) => !v)}
            style={styles.addCircle}
            accessibilityRole="button"
            accessibilityLabel={t('habits.add')}
          >
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {composeOpen ? (
            <View style={styles.form}>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder={t('habits.labelPlaceholder')}
                placeholderTextColor={brand.mutedSoft}
                style={styles.input}
              />
              <View style={styles.kindRow}>
                {(['good', 'bad'] as const).map((value) => {
                  const active = kind === value;
                  return (
                    <Pressable
                      key={value}
                      onPress={() => setKind(value)}
                      style={[styles.kindChip, active && styles.kindChipActive]}
                    >
                      <Text
                        style={[
                          styles.kindLabel,
                          active && styles.kindLabelActive,
                        ]}
                      >
                        {value === 'good'
                          ? t('habits.kindGood')
                          : t('habits.kindBad')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <PrimaryButton
                label={t('habits.add')}
                onPress={() => void onAdd()}
                loading={saving}
                disabled={!label.trim()}
              />
            </View>
          ) : null}

          <Text style={styles.sectionGood}>{t('habits.sectionGood')}</Text>
          {good.length === 0 ? (
            <Text style={styles.empty}>{t('habits.empty')}</Text>
          ) : (
            good.map((habit, i) => (
              <Pressable
                key={habit.id}
                onLongPress={() => void onDelete(habit)}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{habit.label}</Text>
                <View style={[styles.chip, styles.chipGood]}>
                  <Text style={[styles.chipText, styles.chipTextGood]}>
                    {i === 0 ? t('habits.freqOften') : t('habits.freqAlways')}
                  </Text>
                </View>
              </Pressable>
            ))
          )}

          <Text style={styles.sectionWork}>{t('habits.sectionWork')}</Text>
          {work.length === 0 ? (
            <Text style={styles.empty}>{t('habits.empty')}</Text>
          ) : (
            work.map((habit, i) => (
              <Pressable
                key={habit.id}
                onLongPress={() => void onDelete(habit)}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{habit.label}</Text>
                <View style={[styles.chip, styles.chipWarn]}>
                  <Text style={[styles.chipText, styles.chipTextWarn]}>
                    {i === 0 ? t('habits.freqOften') : t('habits.freqSometimes')}
                  </Text>
                </View>
              </Pressable>
            ))
          )}

          <PrimaryButton
            label={t('habits.addPill')}
            variant="secondary"
            onPress={() => setComposeOpen(true)}
            style={styles.addPill}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  addCircle: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 22,
    color: brand.ink,
  },
  form: {
    marginBottom: 18,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    gap: 10,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  input: {
    borderRadius: brand.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.canvas,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindChip: {
    flex: 1,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingVertical: 10,
    alignItems: 'center',
  },
  kindChipActive: { backgroundColor: brand.accent },
  kindLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  kindLabelActive: { color: '#FFFFFF' },
  sectionGood: {
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.successDark,
  },
  sectionWork: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.accentDark,
  },
  card: {
    marginBottom: 8,
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
  cardTitle: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  chip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipWarn: { backgroundColor: brand.accentTint },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  chipTextGood: { color: brand.successDark },
  chipTextWarn: { color: brand.accentDark },
  empty: {
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  addPill: { marginTop: 12 },
});
