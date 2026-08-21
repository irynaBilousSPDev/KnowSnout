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

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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
import { brand } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

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
            {pet.name} · {t('habits.subtitle')}
          </Text>

          <View style={styles.form}>
            <TextInput
              value={label}
              onChangeText={setLabel}
              placeholder={t('habits.labelPlaceholder')}
              placeholderTextColor="#9bbba5"
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

          {habits.length === 0 ? (
            <Text style={styles.empty}>{t('habits.empty')}</Text>
          ) : (
            habits.map((habit) => (
              <ListRow
                key={habit.id}
                title={habit.label}
                meta={
                  habit.kind === 'good'
                    ? t('habits.kindGood')
                    : t('habits.kindBad')
                }
                onPress={() => void onDelete(habit)}
                showChevron={false}
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 },
  subtitle: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A7A72',
  },
  form: {
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    gap: 10,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  kindRow: { flexDirection: 'row', gap: 8 },
  kindChip: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surface,
    paddingVertical: 10,
    alignItems: 'center',
  },
  kindChipActive: {
    backgroundColor: brand.tealPressed,
    borderColor: brand.tealPressed,
  },
  kindLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: brand.ink,
  },
  kindLabelActive: { color: '#FFFFFF' },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#5A7A72',
  },
});
