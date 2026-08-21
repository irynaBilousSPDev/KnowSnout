import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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
import { brand } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

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
            {pet.name} · {t('calendar.subtitle')}
          </Text>

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

          <View style={styles.form}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={t('calendar.titlePlaceholder')}
              placeholderTextColor="#9bbba5"
              style={styles.input}
            />
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder={t('calendar.datePlaceholder')}
              placeholderTextColor="#9bbba5"
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

          {events.length === 0 ? (
            <Text style={styles.empty}>{t('calendar.empty')}</Text>
          ) : (
            events.map((event) => (
              <ListRow
                key={event.id}
                title={event.title}
                meta={event.date}
                onPress={() => void onDelete(event)}
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
    marginBottom: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
  syncBtn: { marginBottom: 10 },
  form: {
    marginTop: 4,
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
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#5A6B7D',
  },
});
