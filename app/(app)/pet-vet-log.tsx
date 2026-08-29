import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
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
import { ScrHeader } from '@/src/components/ScrHeader';
import { TextField } from '@/src/components/TextField';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { getPet } from '@/src/services/pets';
import {
  addPetVetLog,
  deletePetVetLog,
  listPetVetLogs,
} from '@/src/services/vetLogs';
import { brand, fonts } from '@/src/theme/brand';
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

/** HTML kit · 20 Ліки та візити */
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
      <ScrHeader
        title={t('vetLog.title')}
        titleSize={20}
        right={
          <Pressable
            onPress={openCompose}
            style={styles.addCircle}
            accessibilityRole="button"
            accessibilityLabel={t('vetLog.add')}
          >
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        }
      />

      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{t('vetLog.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('vetLog.emptyBody')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isVisit = item.entry_type === 'visit';
          const metaParts = [
            item.entry_type === 'meds' && item.next_due_on
              ? `${t('vetLog.nextDue')} ${item.next_due_on}`
              : null,
            item.logged_on,
            item.notes?.trim() || null,
          ].filter(Boolean);

          return (
            <View style={styles.card}>
              <View style={[styles.typeChip, isVisit ? styles.chipGood : styles.chipWarn]}>
                <Text
                  style={[
                    styles.typeChipText,
                    isVisit && styles.typeChipTextGood,
                  ]}
                >
                  {typeLabel(item.entry_type)}
                </Text>
              </View>
              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>{metaParts.join(' · ')}</Text>
              </View>
              <Pressable onPress={() => void onDelete(item)}>
                <Text style={styles.delete}>{t('pets.delete')}</Text>
              </Pressable>
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
                <Text style={styles.modalTitle}>
                  {entryType === 'meds'
                    ? t('vetLog.typeMeds')
                    : t('vetLog.add')}
                </Text>
                <Pressable onPress={() => void onSave()} disabled={saving}>
                  <Text style={styles.modalSave}>{t('common.save')}</Text>
                </Pressable>
              </View>

              <Text style={styles.fieldLbl}>{t('vetLog.pickType')}</Text>
              <View style={styles.chipWrap}>
                {ENTRY_TYPES.map((option) => {
                  const active = entryType === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setEntryType(option.id)}
                      style={[styles.segChip, active && styles.segChipOn]}
                    >
                      <Text
                        style={[
                          styles.segChipText,
                          active && styles.segChipTextOn,
                        ]}
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
              <PrimaryButton
                label={t('common.save')}
                onPress={() => void onSave()}
                loading={saving}
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
  typeChip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  chipWarn: { backgroundColor: brand.accentTint },
  chipGood: { backgroundColor: brand.successTint },
  typeChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  typeChipTextGood: { color: brand.successDark },
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
  delete: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
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
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  segChipOn: { backgroundColor: brand.accent },
  segChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  segChipTextOn: { color: '#FFFFFF' },
  modalSaveBtn: { marginTop: 8 },
});
