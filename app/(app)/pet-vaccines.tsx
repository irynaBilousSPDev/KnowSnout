import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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
import { brand, fonts } from '@/src/theme/brand';
import type { CompanionSpecies, PetRow } from '@/src/types/pet';
import type { PetVaccineRow, VaccineDueStatus } from '@/src/types/vaccine';

function statusLabel(status: VaccineDueStatus) {
  if (status === 'overdue') return t('vaccines.statusOverdue');
  if (status === 'soon') return t('vaccines.statusSoon');
  if (status === 'ok') return t('vaccines.statusOk');
  return t('vaccines.statusNone');
}

function displayName(row: PetVaccineRow) {
  return vaccineLabel(row.vaccine_key) ?? vaccineDisplayName(row);
}

function formatGiven(row: PetVaccineRow) {
  if (row.given_on && row.next_due_on) {
    return t('vaccines.givenUntil', {
      given: row.given_on,
      until: row.next_due_on,
    });
  }
  if (row.given_on) return t('vaccines.givenOnly', { given: row.given_on });
  if (row.next_due_on) return `${t('vaccines.nextDue')}: ${row.next_due_on}`;
  return null;
}

/** HTML kit · 19 Щеплення */
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
      <AppChromeHeader />
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('vaccines.title')}</Text>
          <Pressable
            onPress={openCompose}
            style={styles.addCircle}
            accessibilityRole="button"
            accessibilityLabel={t('vaccines.add')}
          >
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('vaccines.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('vaccines.emptyBody')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const status = vaccineDueStatus(item.next_due_on);
          const soon = status === 'soon' || status === 'overdue';
          const meta = formatGiven(item);
          return (
            <View style={[styles.card, soon && styles.cardWarn]}>
              <View style={styles.cardRow}>
                {soon ? (
                  <View style={styles.warnDot} />
                ) : (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={brand.successDark}
                  />
                )}
                <View style={styles.cardCopy}>
                  <Text style={styles.cardTitle}>{displayName(item)}</Text>
                  <Text
                    style={[
                      styles.cardMeta,
                      soon && styles.cardMetaWarn,
                    ]}
                  >
                    {soon ? statusLabel(status) : meta ?? statusLabel(status)}
                  </Text>
                  {!soon && meta && status !== 'ok' && status !== 'none' ? (
                    <Text style={styles.cardMeta}>{statusLabel(status)}</Text>
                  ) : null}
                </View>
                <Pressable onPress={() => void onDelete(item)}>
                  <Text style={styles.delete}>{t('pets.delete')}</Text>
                </Pressable>
              </View>
              {item.notes ? (
                <Text style={styles.notes}>{item.notes}</Text>
              ) : null}
              {item.next_due_on ? (
                <View style={styles.actions}>
                  <Pressable
                    onPress={() => void onToggleAppReminder(item)}
                    style={[
                      styles.miniPill,
                      reminded.has(item.id) && styles.miniPillOn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.miniPillText,
                        reminded.has(item.id) && styles.miniPillTextOn,
                      ]}
                    >
                      {reminded.has(item.id)
                        ? t('vaccines.reminderOn')
                        : t('vaccines.toAppReminder')}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => void onToCalendar(item)}
                    style={styles.miniPill}
                  >
                    <Text style={styles.miniPillText}>
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
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.modalHd}>
                <Pressable onPress={() => setComposeOpen(false)}>
                  <Text style={styles.modalCancel}>{t('common.cancel')}</Text>
                </Pressable>
                <Text style={styles.modalTitle}>{t('vaccines.title')}</Text>
                <Pressable onPress={() => void onSave()} disabled={saving}>
                  <Text style={styles.modalSave}>{t('common.save')}</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLbl}>{t('vaccines.pickType')}</Text>
              <View style={styles.chipWrap}>
                {catalog.map((item) => {
                  const active = vaccineKey === item.key;
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => onPickCatalog(item.key)}
                      style={[styles.segChip, active && styles.segChipOn]}
                    >
                      <Text
                        style={[
                          styles.segChipText,
                          active && styles.segChipTextOn,
                        ]}
                      >
                        {item.labelUk}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {vaccineKey === 'other' ? (
                <TextField
                  label={t('vaccines.customName')}
                  value={customName}
                  onChangeText={setCustomName}
                  placeholder={t('vaccines.customPlaceholder')}
                  autoCapitalize="sentences"
                />
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
              <PrimaryButton
                label={t('common.save')}
                loading={saving}
                onPress={() => void onSave()}
                style={styles.modalSaveBtn}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 26,
    color: brand.ink,
  },
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
  subtitle: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  disclaimer: {
    marginTop: 12,
    borderRadius: brand.radius.sm,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disclaimerText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brand.accentDark,
  },
  list: { paddingHorizontal: 20, paddingBottom: 40, flexGrow: 1 },
  empty: { marginTop: 48, paddingHorizontal: 16, alignItems: 'center' },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
    textAlign: 'center',
  },
  emptyBody: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textAlign: 'center',
  },
  card: {
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
  cardWarn: {
    borderWidth: 2,
    borderColor: brand.accentSoft,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  warnDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: brand.accent,
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
  cardMetaWarn: { color: brand.accentDark },
  delete: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  notes: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  actions: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniPill: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  miniPillOn: { backgroundColor: brand.accent },
  miniPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.ink,
  },
  miniPillTextOn: { color: '#FFFFFF' },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(21,34,51,0.4)',
  },
  modalSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: brand.canvas,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 16,
  },
  modalHd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalCancel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  modalTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  modalSave: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  fieldLbl: {
    marginBottom: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.label,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  segChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  segChipOn: { backgroundColor: brand.accent },
  segChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.ink,
  },
  segChipTextOn: { color: '#FFFFFF' },
  modalSaveBtn: { marginTop: 8 },
});
