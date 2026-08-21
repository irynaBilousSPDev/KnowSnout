import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Calendar from 'expo-calendar';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { googleCalendarUrl } from '@/src/lib/deviceCalendar';
import {
  careProgress,
  getCareToday,
  updateCareToday,
} from '@/src/services/care';
import { addFeedingLog, hasFedToday } from '@/src/services/feeding';
import { getPet } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
import type { CareDayLog } from '@/src/types/care';
import type { PetRow } from '@/src/types/pet';

async function addPlayReminderToCalendar(petName: string) {
  const title = t('care.calendarPlayTitle', { pet: petName });
  const details = t('care.calendarPlayNotes');
  const start = new Date();
  start.setHours(start.getHours() + 1, 0, 0, 0);
  const end = new Date(start.getTime() + 15 * 60 * 1000);
  const dateIso = start.toISOString().slice(0, 10);

  if (Platform.OS === 'web') {
    await Linking.openURL(googleCalendarUrl({ title, dateIso, details }));
    return 'google-web' as const;
  }

  const perm = await Calendar.requestCalendarPermissionsAsync();
  if (perm.status !== 'granted') {
    await Linking.openURL(googleCalendarUrl({ title, dateIso, details }));
    return 'google-web' as const;
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const writable = calendars.filter((c) => c.allowsModifications);
  const google = writable.find((c) =>
    `${c.source?.name ?? ''} ${c.title ?? ''}`.toLowerCase().includes('google'),
  );
  const calendarId =
    google?.id ?? writable.find((c) => c.isPrimary)?.id ?? writable[0]?.id;
  if (!calendarId) {
    await Linking.openURL(googleCalendarUrl({ title, dateIso, details }));
    return 'google-web' as const;
  }

  await Calendar.createEventAsync(calendarId, {
    title,
    notes: details,
    startDate: start,
    endDate: end,
  });
  return 'device' as const;
}

function StatusChip({ done }: { done: boolean }) {
  return (
    <View style={[styles.chip, done ? styles.chipGood : styles.chipNeutral]}>
      <Text style={[styles.chipText, done && styles.chipTextGood]}>
        {done ? t('care.chipDone') : t('care.chipPending')}
      </Text>
    </View>
  );
}

function CheckRow({
  done,
  title,
  icon,
  onToggle,
}: {
  done: boolean;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.cardLeft}>
        <Ionicons name={icon} size={16} color={brand.ink} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <StatusChip done={done} />
    </Pressable>
  );
}

/** HTML kit · 14 Догляд сьогодні — Вода / Гра / Годування chips. */
export default function PetCareScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const petId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [log, setLog] = useState<CareDayLog | null>(null);
  const [fedFromLogs, setFedFromLogs] = useState(false);
  const [waterNote, setWaterNote] = useState('');
  const [playNote, setPlayNote] = useState('');
  const [feedNote, setFeedNote] = useState('');
  const [savingFeed, setSavingFeed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      const care = await getCareToday(petId);
      const fed = await hasFedToday(petId);
      setPet(nextPet);
      setLog(care);
      setFedFromLogs(fed);
      setWaterNote(care.water_note ?? '');
      setPlayNote(care.play_note ?? '');
      setFeedNote(care.feed_note ?? '');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('care.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const toggleWater = async () => {
    if (!petId || !log) return;
    const next = await updateCareToday(petId, {
      water_done: !log.water_done,
      water_note: !log.water_done ? waterNote : null,
    });
    setLog(next);
  };

  const togglePlay = async () => {
    if (!petId || !log) return;
    const next = await updateCareToday(petId, {
      play_done: !log.play_done,
      play_minutes: !log.play_done ? 5 : null,
      play_note: !log.play_done ? playNote : null,
    });
    setLog(next);
  };

  const toggleFeed = async () => {
    if (!petId || !log) return;
    if (fedFromLogs) {
      if (!log.feed_done) {
        const next = await updateCareToday(petId, {
          feed_done: true,
          feed_note: feedNote || null,
        });
        setLog(next);
      }
      return;
    }
    const next = await updateCareToday(petId, {
      feed_done: !log.feed_done,
      feed_note: !log.feed_done ? feedNote : null,
    });
    setLog(next);
  };

  const saveNotes = async () => {
    if (!petId || !log) return;
    const next = await updateCareToday(petId, {
      water_note: log.water_done ? waterNote : log.water_note,
      play_note: log.play_done ? playNote : log.play_note,
      play_minutes: log.play_done ? log.play_minutes ?? 5 : log.play_minutes,
      feed_note: log.feed_done || fedFromLogs ? feedNote : log.feed_note,
    });
    setLog(next);
    Alert.alert(t('care.saved'));
  };

  const onLogFavoriteFeed = async () => {
    if (!petId || !pet) return;
    const productName = pet.favorite_food?.trim();
    if (!productName) {
      Alert.alert(t('common.error'), t('pets.noScansForFavorite'));
      return;
    }
    setSavingFeed(true);
    try {
      await addFeedingLog({
        petId,
        productName,
        productId: pet.favorite_product_id,
        note: feedNote,
      });
      const next = await updateCareToday(petId, {
        feed_done: true,
        feed_note: feedNote || null,
      });
      setLog(next);
      setFedFromLogs(true);
      Alert.alert(t('pets.feedingSaved'));
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setSavingFeed(false);
    }
  };

  const onCalendar = async () => {
    if (!pet) return;
    try {
      const mode = await addPlayReminderToCalendar(pet.name);
      Alert.alert(
        t('care.title'),
        mode === 'device'
          ? t('care.calendarAdded')
          : t('care.calendarOpenedGoogle'),
      );
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  if (loading) {
    return <LoadingState message={t('care.loading')} />;
  }

  if (error || !pet || !log) {
    return (
      <AppScreen edges={['bottom']}>
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </AppScreen>
    );
  }

  const progress = careProgress(log, { fedFromLogs });
  const isCat = pet.species === 'cat';
  const feedDone = progress.feed;

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('care.title')}</Text>
          <Text style={styles.subtitle}>
            {pet.name} · {t('care.subtitle')}
          </Text>

          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>{t('care.disclaimer')}</Text>
          </View>

          <Text style={styles.progress}>
            {t('care.progress', {
              done: progress.done,
              total: progress.total,
            })}
          </Text>

          <CheckRow
            done={log.water_done}
            title={t('care.waterAction')}
            icon="water-outline"
            onToggle={() => void toggleWater()}
          />
          {log.water_done ? (
            <TextInput
              value={waterNote}
              onChangeText={setWaterNote}
              placeholder={t('care.waterNotePlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.note}
            />
          ) : null}

          <CheckRow
            done={log.play_done}
            title={isCat ? t('care.playActionCat') : t('care.playAction')}
            icon="sunny-outline"
            onToggle={() => void togglePlay()}
          />
          {log.play_done ? (
            <TextInput
              value={playNote}
              onChangeText={setPlayNote}
              placeholder={t('care.playNotePlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.note}
            />
          ) : null}

          <CheckRow
            done={feedDone}
            title={t('care.feedAction')}
            icon="nutrition-outline"
            onToggle={() => void toggleFeed()}
          />
          {feedDone ? (
            <TextInput
              value={feedNote}
              onChangeText={setFeedNote}
              placeholder={t('care.feedNotePlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.note}
            />
          ) : null}

          {pet.favorite_food ? (
            <View style={styles.favBlock}>
              <PrimaryButton
                label={t('care.feedLogFavorite')}
                variant="secondary"
                loading={savingFeed}
                onPress={() => void onLogFavoriteFeed()}
              />
              <Text style={styles.favMeta}>{pet.favorite_food}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            <PrimaryButton
              label={t('play.open')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/play-guides',
                  params: { petId: pet.id },
                })
              }
            />
            <PrimaryButton
              label={t('care.saveNotes')}
              variant="secondary"
              onPress={() => void saveNotes()}
            />
            <PrimaryButton
              label={t('care.addPlayReminder')}
              onPress={() => void onCalendar()}
            />
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
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
  progress: {
    marginTop: 14,
    marginBottom: 10,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.label,
  },
  card: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  pressed: { opacity: 0.9 },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontFamily: fonts.bodySemi,
    fontSize: 13.5,
    color: brand.ink,
  },
  chip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipNeutral: { backgroundColor: brand.chipTrack },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: brand.muted,
  },
  chipTextGood: { color: brand.successDark },
  note: {
    marginTop: -4,
    marginBottom: 12,
    borderRadius: brand.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
  favBlock: { marginBottom: 12 },
  favMeta: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  actions: { marginTop: 8, gap: 10 },
});
