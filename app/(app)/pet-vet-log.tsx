import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { getPet } from '@/src/services/pets';
import {
  addPetVetLog,
  deletePetVetLog,
  listPetVetLogs,
} from '@/src/services/vetLogs';
import type { PetRow } from '@/src/types/pet';
import type { PetVetLogRow, VetLogEntryType } from '@/src/types/vetLog';

const ENTRY_TYPES: { id: VetLogEntryType; labelKey: string }[] = [
  { id: 'meds', labelKey: 'vetLog.typeMeds' },
  { id: 'visit', labelKey: 'vetLog.typeVisit' },
  { id: 'note', labelKey: 'vetLog.typeNote' },
];

function isValidDate(raw: string) {
  if (!raw.trim()) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.trim())) return false;
  const d = new Date(`${raw.trim()}T12:00:00`);
  return !Number.isNaN(d.getTime());
}

function typeLabel(type: VetLogEntryType) {
  if (type === 'meds') return t('vetLog.typeMeds');
  if (type === 'visit') return t('vetLog.typeVisit');
  return t('vetLog.typeNote');
}

export default function PetVetLogScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [rows, setRows] = useState<PetVetLogRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [entryType, setEntryType] = useState<VetLogEntryType>('meds');
  const [title, setTitle] = useState('');
  const [loggedOn, setLoggedOn] = useState('');
  const [nextDueOn, setNextDueOn] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    if (!petId) {
      setError(t('pets.notFound'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextPet, nextRows] = await Promise.all([
        getPet(petId),
        listPetVetLogs(petId),
      ]);
      if (!nextPet) {
        setError(t('pets.notFound'));
        setPet(null);
        return;
      }
      setPet(nextPet);
      setRows(nextRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('vetLog.loadError'));
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
    setEntryType('meds');
    setTitle('');
    setNotes('');
    setNextDueOn('');
    setLoggedOn(new Date().toISOString().slice(0, 10));
    setComposeOpen(true);
  };

  const onSave = async () => {
    if (!petId) return;
    if (!title.trim()) {
      Alert.alert(t('common.error'), t('vetLog.titleRequired'));
      return;
    }
    if (!isValidDate(loggedOn) || !isValidDate(nextDueOn)) {
      Alert.alert(t('common.error'), t('pets.dateInvalid'));
      return;
    }
    setSaving(true);
    try {
      await addPetVetLog({
        petId,
        entryType,
        title,
        loggedOn,
        nextDueOn,
        notes,
      });
      setComposeOpen(false);
      await load();
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('vetLog.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row: PetVetLogRow) => {
    const ok = await confirmAction({
      title: t('vetLog.deleteTitle'),
      message: t('vetLog.deleteMessage', { name: row.title }),
      confirmLabel: t('pets.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    try {
      await deletePetVetLog(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  if (loading) {
    return <LoadingState message={t('vetLog.loading')} />;
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
          {t('vetLog.title')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {pet.name} · {t('vetLog.subtitle')}
        </Text>
        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body text-xs leading-5 text-forest-700">
            {t('vetLog.disclaimer')}
          </Text>
        </View>
        <View className="mt-4">
          <PrimaryButton label={t('vetLog.add')} onPress={openCompose} />
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-10 pt-2"
        ListEmptyComponent={
          <View className="mt-12 items-center px-6">
            <Text className="text-center font-body-bold text-lg text-forest-800">
              {t('vetLog.emptyTitle')}
            </Text>
            <Text className="mt-2 text-center font-body text-sm text-forest-600">
              {t('vetLog.emptyBody')}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mb-3 rounded-3xl border border-forest-100 bg-white px-4 py-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <Text className="font-body-medium text-xs uppercase tracking-wide text-forest-500">
                  {typeLabel(item.entry_type)}
                </Text>
                <Text className="mt-1 font-body-bold text-base text-forest-900">
                  {item.title}
                </Text>
              </View>
              <Pressable onPress={() => void onDelete(item)}>
                <Text className="font-body text-xs text-forest-500">
                  {t('pets.delete')}
                </Text>
              </Pressable>
            </View>
            <Text className="mt-2 font-body text-sm text-forest-600">
              {t('vetLog.loggedOn')}: {item.logged_on}
            </Text>
            {item.next_due_on ? (
              <Text className="mt-1 font-body text-sm text-forest-600">
                {t('vetLog.nextDue')}: {item.next_due_on}
              </Text>
            ) : null}
            {item.notes ? (
              <Text className="mt-2 font-body text-sm text-forest-500">
                {item.notes}
              </Text>
            ) : null}
          </View>
        )}
      />

      <Modal visible={composeOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[88%] rounded-t-3xl bg-sand-50 px-5 pb-10 pt-5">
            <Text className="font-display text-2xl text-forest-900">
              {t('vetLog.add')}
            </Text>
            <Text className="mb-2 mt-4 font-body-medium text-sm text-forest-700">
              {t('vetLog.pickType')}
            </Text>
            <View className="mb-3 flex-row flex-wrap gap-2">
              {ENTRY_TYPES.map((option) => {
                const active = entryType === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setEntryType(option.id)}
                    className={`rounded-2xl px-4 py-2.5 ${
                      active ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`font-body-bold text-sm ${
                        active ? 'text-sand-50' : 'text-forest-700'
                      }`}
                    >
                      {t(option.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <TextField
              label={t('vetLog.entryTitle')}
              value={title}
              onChangeText={setTitle}
              placeholder={t('vetLog.entryTitlePlaceholder')}
              autoCapitalize="sentences"
            />
            <TextField
              label={t('vetLog.loggedOn')}
              value={loggedOn}
              onChangeText={setLoggedOn}
              placeholder="YYYY-MM-DD"
              autoCapitalize="none"
            />
            <TextField
              label={t('vetLog.nextDue')}
              value={nextDueOn}
              onChangeText={setNextDueOn}
              placeholder={t('vetLog.nextDueOptional')}
              autoCapitalize="none"
            />
            <TextField
              label={t('vetLog.notes')}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('vetLog.notesPlaceholder')}
              autoCapitalize="sentences"
              multiline
            />
            <View className="mt-4 gap-3">
              <PrimaryButton
                label={t('common.save')}
                onPress={() => void onSave()}
                loading={saving}
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
