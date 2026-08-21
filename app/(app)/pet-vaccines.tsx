import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { TextField } from '@/src/components/TextField';
import {
  addMonthsIso,
  vaccineLabel,
  vaccinesForSpecies,
} from '@/src/constants/vaccines';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { addVaccineToDeviceCalendar } from '@/src/lib/deviceCalendar';
import { getPet } from '@/src/services/pets';
import {
  addPetVaccine,
  deletePetVaccine,
  listPetVaccines,
  vaccineDueStatus,
  vaccineDisplayName,
} from '@/src/services/vaccines';
import {
  cancelVaccineAppReminder,
  listVaccineReminderIds,
  scheduleVaccineAppReminder,
} from '@/src/services/vaccineReminders';
import { brand } from '@/src/theme/brand';
import type { CompanionSpecies, PetRow } from '@/src/types/pet';
import type { PetVaccineRow, VaccineDueStatus } from '@/src/types/vaccine';

function statusLabel(status: VaccineDueStatus) {
  if (status === 'overdue') return t('vaccines.statusOverdue');
  if (status === 'soon') return t('vaccines.statusSoon');
  if (status === 'ok') return t('vaccines.statusOk');
  return t('vaccines.statusNone');
}

function statusColor(status: VaccineDueStatus) {
  if (status === 'overdue') return brand.score.poor;
  if (status === 'soon') return brand.score.fair;
  if (status === 'ok') return brand.score.good;
  return brand.forest;
}

function displayName(row: PetVaccineRow) {
  return (
    vaccineLabel(row.vaccine_key) ??
    vaccineDisplayName(row)
  );
}

export default function PetVaccinesScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [rows, setRows] = useState<PetVaccineRow[]>([]);
  const [reminded, setReminded] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [vaccineKey, setVaccineKey] = useState('rabies');
  const [customName, setCustomName] = useState('');
  const [givenOn, setGivenOn] = useState('');
  const [nextDueOn, setNextDueOn] = useState('');
  const [notes, setNotes] = useState('');

  const catalog = useMemo(
    () => vaccinesForSpecies((pet?.species ?? 'dog') as CompanionSpecies),
    [pet?.species],
  );

  const load = useCallback(async () => {
    if (!petId) {
      setError(t('pets.notFound'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextPet, nextRows, reminderIds] = await Promise.all([
        getPet(petId),
        listPetVaccines(petId),
        listVaccineReminderIds(),
      ]);
      if (!nextPet) {
        setError(t('pets.notFound'));
        setPet(null);
        return;
      }
      setPet(nextPet);
      setRows(nextRows);
      setReminded(reminderIds);
      const first = vaccinesForSpecies(nextPet.species)[0]?.key ?? 'rabies';
      setVaccineKey(first);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('vaccines.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openCompose = () => {
    const item = catalog.find((c) => c.key === vaccineKey) ?? catalog[0];
    setCustomName('');
    setNotes('');
    const today = new Date().toISOString().slice(0, 10);
    setGivenOn(today);
    setNextDueOn(
      item?.typicalMonths ? addMonthsIso(today, item.typicalMonths) : '',
    );
    setComposeOpen(true);
  };

  const onPickCatalog = (key: string) => {
    setVaccineKey(key);
    const item = catalog.find((c) => c.key === key);
    if (givenOn && item?.typicalMonths) {
      setNextDueOn(addMonthsIso(givenOn, item.typicalMonths));
    }
  };

  const onSave = async () => {
    if (!petId) return;
    setSaving(true);
    try {
      await addPetVaccine({
        petId,
        vaccineKey,
        customName: vaccineKey === 'other' ? customName : null,
        givenOn,
        nextDueOn,
        notes,
      });
      setComposeOpen(false);
      await load();
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('vaccines.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row: PetVaccineRow) => {
    const ok = await confirmAction({
      title: t('vaccines.deleteTitle'),
      message: t('vaccines.deleteMessage', { name: displayName(row) }),
      confirmLabel: t('pets.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePetVaccine(row.id);
      await cancelVaccineAppReminder(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      setReminded((prev) => {
        const next = new Set(prev);
        next.delete(row.id);
        return next;
      });
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onToCalendar = async (row: PetVaccineRow) => {
    if (!pet) return;
    try {
      const result = await addVaccineToDeviceCalendar({
        petName: pet.name,
        vaccine: row,
      });
      Alert.alert(
        t('vaccines.title'),
        result.mode === 'device'
          ? t('vaccines.calendarAdded')
          : t('vaccines.calendarOpenedGoogle'),
      );
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onToggleAppReminder = async (row: PetVaccineRow) => {
    if (!pet) return;
    try {
      if (reminded.has(row.id)) {
        await cancelVaccineAppReminder(row.id);
        setReminded((prev) => {
          const next = new Set(prev);
          next.delete(row.id);
          return next;
        });
        Alert.alert(t('vaccines.title'), t('vaccines.reminderCancelled'));
        return;
      }
      const result = await scheduleVaccineAppReminder({
        petName: pet.name,
        vaccine: row,
      });
      setReminded((prev) => new Set(prev).add(row.id));
      Alert.alert(
        t('vaccines.title'),
        t('vaccines.reminderScheduled', {
          date: row.next_due_on ?? result.scheduledFor.slice(0, 10),
        }),
      );
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  if (loading) {
    return <LoadingState message={t('vaccines.loading')} />;
  }

  if (error || !pet) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <View className="px-5 pb-2 pt-2">
        <Text className="font-display text-2xl text-forest-900">
          {t('vaccines.title')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {pet.name} · {t('vaccines.subtitle')}
        </Text>
        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body text-xs leading-5 text-forest-700">
            {t('vaccines.disclaimer')}
          </Text>
        </View>
        <View className="mt-4">
          <PrimaryButton label={t('vaccines.add')} onPress={openCompose} />
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-10 pt-2"
        ListEmptyComponent={
          <View className="mt-12 items-center px-6">
            <Text className="text-center font-body-bold text-lg text-forest-800">
              {t('vaccines.emptyTitle')}
            </Text>
            <Text className="mt-2 text-center font-body text-sm text-forest-600">
              {t('vaccines.emptyBody')}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = vaccineDueStatus(item.next_due_on);
          return (
            <View className="mb-3 rounded-3xl border border-forest-100 bg-white px-4 py-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="font-body-bold text-base text-forest-900">
                    {displayName(item)}
                  </Text>
                  <Text
                    className="mt-1 font-body-medium text-xs"
                    style={{ color: statusColor(status) }}
                  >
                    {statusLabel(status)}
                  </Text>
                </View>
                <Pressable onPress={() => void onDelete(item)}>
                  <Text className="font-body text-xs text-forest-500">
                    {t('pets.delete')}
                  </Text>
                </Pressable>
              </View>
              {item.given_on ? (
                <Text className="mt-2 font-body text-sm text-forest-600">
                  {t('vaccines.givenOn')}: {item.given_on}
                </Text>
              ) : null}
              {item.next_due_on ? (
                <Text className="mt-1 font-body text-sm text-forest-600">
                  {t('vaccines.nextDue')}: {item.next_due_on}
                </Text>
              ) : null}
              {item.notes ? (
                <Text className="mt-2 font-body text-sm text-forest-500">
                  {item.notes}
                </Text>
              ) : null}
              {item.next_due_on ? (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <Pressable
                    onPress={() => void onToggleAppReminder(item)}
                    className={`rounded-2xl px-3 py-2 active:opacity-70 ${
                      reminded.has(item.id) ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`font-body-bold text-xs ${
                        reminded.has(item.id)
                          ? 'text-sand-50'
                          : 'text-forest-800'
                      }`}
                    >
                      {reminded.has(item.id)
                        ? t('vaccines.reminderOn')
                        : t('vaccines.toAppReminder')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void onToCalendar(item)}
                    className="rounded-2xl bg-forest-100 px-3 py-2 active:opacity-70"
                  >
                    <Text className="font-body-bold text-xs text-forest-800">
                      {t('vaccines.toCalendar')}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          );
        }}
      />

      <Modal visible={composeOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[88%] rounded-t-3xl bg-sand-50 px-5 pb-10 pt-5">
            <Text className="font-display text-2xl text-forest-900">
              {t('vaccines.add')}
            </Text>

            <Text className="mt-4 font-body-medium text-sm text-forest-700">
              {t('vaccines.pickType')}
            </Text>
            <View className="mt-2 flex-row flex-wrap gap-2">
              {catalog.map((item) => {
                const active = vaccineKey === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => onPickCatalog(item.key)}
                    className={`rounded-2xl px-3 py-2 ${
                      active ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`font-body-bold text-xs ${
                        active ? 'text-sand-50' : 'text-forest-800'
                      }`}
                    >
                      {item.labelUk}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {vaccineKey === 'other' ? (
              <View className="mt-3">
                <TextField
                  label={t('vaccines.customName')}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder={t('vaccines.customPlaceholder')}
                  autoCapitalize="sentences"
                />
              </View>
            ) : null}

            <TextField
              label={t('vaccines.givenOn')}
              value={givenOn}
              onChangeText={(v) => {
                setGivenOn(v);
                const item = catalog.find((c) => c.key === vaccineKey);
                if (v.length === 10 && item?.typicalMonths) {
                  setNextDueOn(addMonthsIso(v, item.typicalMonths));
                }
              }}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
            <TextField
              label={t('vaccines.nextDue')}
              value={nextDueOn}
              onChangeText={setNextDueOn}
              placeholder="YYYY-MM-DD"
              keyboardType="numbers-and-punctuation"
            />
            <TextField
              label={t('vaccines.notes')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('vaccines.notesPlaceholder')}
              autoCapitalize="sentences"
              multiline
            />

            <View className="mt-2 gap-3">
              <PrimaryButton
                label={t('common.save')}
                loading={saving}
                onPress={() => void onSave()}
              />
              <PrimaryButton
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => setComposeOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
