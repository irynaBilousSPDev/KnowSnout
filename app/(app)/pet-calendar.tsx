import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { confirmAction } from '@/src/lib/confirm';
import { notify } from '@/src/lib/notify';
import { shareText } from '@/src/lib/share';
import { t } from '@/src/i18n';
import {
  addEvent,
  buildEventsExportText,
  buildGoogleCalendarRenderUrl,
  deleteEvent,
  listUpcoming,
  type PetCalendarEvent,
} from '@/src/services/petCalendar';
import { getPet } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

const MONTHS_UA = [
  'СІЧ',
  'ЛЮТ',
  'БЕР',
  'КВІ',
  'ТРА',
  'ЧЕР',
  'ЛИП',
  'СЕР',
  'ВЕР',
  'ЖОВ',
  'ЛИС',
  'ГРУ',
];

function dateParts(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(d.getTime())) return { day: '—', mon: '' };
  return {
    day: String(d.getDate()),
    mon: MONTHS_UA[d.getMonth()] ?? '',
  };
}

/** HTML kit · Календар догляду + Google sync */
export default function PetCalendarScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [events, setEvents] = useState<PetCalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
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
      setEvents(await listUpcoming(petId));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('calendar.loadError'));
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
    if (!petId || !title.trim() || !date.trim()) return;
    setSaving(true);
    try {
      await addEvent({ petId, title, date });
      setTitle('');
      setDate('');
      setComposeOpen(false);
      setEvents(await listUpcoming(petId));
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('calendar.saveError'),
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (event: PetCalendarEvent) => {
    const ok = await confirmAction({
      title: t('calendar.deleteTitle'),
      message: t('calendar.deleteMessage', { name: event.title }),
      confirmLabel: t('pets.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    await deleteEvent(event.id);
    setEvents((prev) => prev.filter((e) => e.id !== event.id));
  };

  const onGoogleSync = async () => {
    const upcoming = events[0];
    if (!upcoming) {
      notify(t('calendar.googleSync'), t('calendar.googleNoEvents'));
      return;
    }
    const url = buildGoogleCalendarRenderUrl({
      title: upcoming.title,
      date: upcoming.date,
      details: pet
        ? t('calendar.googleDetails', { pet: pet.name })
        : undefined,
    });
    if (!url) {
      notify(t('common.error'), t('calendar.googleOpenError'));
      return;
    }
    try {
      await Linking.openURL(url);
      notify(t('calendar.googleOpened'), t('calendar.googleSoon'));
    } catch {
      notify(t('common.error'), t('calendar.googleOpenError'));
    }
  };

  const onExport = async () => {
    if (!pet) return;
    const text = buildEventsExportText({
      petName: pet.name,
      events,
    });
    await shareText({
      title: t('calendar.exportTitle'),
      message: text,
    });
  };

  if (loading) {
    return <LoadingState message={t('calendar.loading')} />;
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
      <ScrHeader
        title={t('calendar.titleFor', { name: pet.name })}
        titleSize={19}
        right={
          <Pressable
            onPress={() => setComposeOpen((v) => !v)}
            style={styles.addCircle}
            accessibilityRole="button"
            accessibilityLabel={t('calendar.add')}
          >
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <PrimaryButton
            label={t('calendar.googleSync')}
            variant="secondary"
            onPress={() => void onGoogleSync()}
            style={styles.syncBtn}
          />
          <PrimaryButton
            label={t('calendar.exportShare')}
            variant="secondary"
            onPress={() => void onExport()}
            style={styles.syncBtn}
          />

          {composeOpen ? (
            <View style={styles.form}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={t('calendar.titlePlaceholder')}
                placeholderTextColor={brand.mutedSoft}
                style={styles.input}
              />
              <TextInput
                value={date}
                onChangeText={setDate}
                placeholder={t('calendar.datePlaceholder')}
                placeholderTextColor={brand.mutedSoft}
                autoCapitalize="none"
                style={styles.input}
              />
              <PrimaryButton
                label={t('calendar.add')}
                onPress={() => void onAdd()}
                loading={saving}
                disabled={!title.trim() || !date.trim()}
              />
            </View>
          ) : null}

          {events.length === 0 ? (
            <Text style={styles.empty}>{t('calendar.empty')}</Text>
          ) : (
            events.map((event, index) => {
              const { day, mon } = dateParts(event.date);
              const highlight = index === 0;
              return (
                <Pressable
                  key={event.id}
                  onLongPress={() => void onDelete(event)}
                  style={[styles.card, highlight && styles.cardHighlight]}
                >
                  <View style={styles.dateCol}>
                    <Text
                      style={[
                        styles.dayNum,
                        highlight && styles.dayNumHighlight,
                      ]}
                    >
                      {day}
                    </Text>
                    <Text style={styles.monLabel}>{mon}</Text>
                  </View>
                  <View style={styles.cardCopy}>
                    <Text style={styles.cardTitle}>{event.title}</Text>
                    <Text style={styles.cardMeta}>{event.date}</Text>
                  </View>
                  {index === 1 ? (
                    <Ionicons
                      name="calendar-outline"
                      size={16}
                      color={brand.successDark}
                    />
                  ) : null}
                </Pressable>
              );
            })
          )}
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
  syncBtn: { marginBottom: 10 },
  form: {
    marginBottom: 16,
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
  empty: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
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
  cardHighlight: {
    borderWidth: 2,
    borderColor: brand.accentSoft,
  },
  dateCol: { width: 36, alignItems: 'center' },
  dayNum: {
    fontFamily: fonts.title,
    fontSize: 15,
    color: brand.ink,
  },
  dayNumHighlight: { color: brand.accentDark },
  monLabel: {
    fontFamily: fonts.body,
    fontSize: 9.5,
    color: brand.muted,
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
});
