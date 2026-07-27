import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Calendar from 'expo-calendar';

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
import { brand } from '@/src/theme/brand';
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
    await Linking.openURL(
      googleCalendarUrl({ title, dateIso, details }),
    );
    return 'google-web' as const;
  }

  const perm = await Calendar.requestCalendarPermissionsAsync();
  if (perm.status !== 'granted') {
    await Linking.openURL(
      googleCalendarUrl({ title, dateIso, details }),
    );
    return 'google-web' as const;
  }

  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  const writable = calendars.filter((c) => c.allowsModifications);
  const google = writable.find((c) =>
    `${c.source?.name ?? ''} ${c.title ?? ''}`
      .toLowerCase()
      .includes('google'),
  );
  const calendarId =
    google?.id ?? writable.find((c) => c.isPrimary)?.id ?? writable[0]?.id;
  if (!calendarId) {
    await Linking.openURL(
      googleCalendarUrl({ title, dateIso, details }),
    );
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

function CheckRow({
  done,
  title,
  subtitle,
  onToggle,
}: {
  done: boolean;
  title: string;
  subtitle: string;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      className={`mb-3 rounded-3xl border px-4 py-4 ${
        done ? 'border-forest-200 bg-forest-100' : 'border-forest-100 bg-white'
      }`}
    >
      <View className="flex-row items-start">
        <View
          className={`mr-3 mt-0.5 h-7 w-7 items-center justify-center rounded-full ${
            done ? 'bg-forest-700' : 'border border-forest-300'
          }`}
        >
          {done ? (
            <Ionicons name="checkmark" size={16} color={brand.surface} />
          ) : null}
        </View>
        <View className="flex-1">
          <Text className="font-body-bold text-base text-forest-900">
            {title}
          </Text>
          <Text className="mt-1 font-body text-sm leading-5 text-forest-600">
            {subtitle}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

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
      feed_note:
        log.feed_done || fedFromLogs ? feedNote : log.feed_note,
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
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </SafeAreaView>
    );
  }

  const progress = careProgress(log, { fedFromLogs });
  const isCat = pet.species === 'cat';
  const feedDone = progress.feed;

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
        <Text className="font-display text-2xl text-forest-900">
          {t('care.title')}
        </Text>
        <Text className="mt-1 font-body text-sm text-forest-600">
          {pet.name} · {t('care.subtitle')}
        </Text>

        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body text-xs leading-5 text-forest-700">
            {t('care.disclaimer')}
          </Text>
        </View>

        <Text className="mt-4 font-body-medium text-sm text-forest-800">
          {t('care.progress', {
            done: progress.done,
            total: progress.total,
          })}
        </Text>

        <View className="mt-4">
          <CheckRow
            done={log.water_done}
            title={t('care.waterAction')}
            subtitle={t('care.waterHint')}
            onToggle={() => void toggleWater()}
          />
          {log.water_done ? (
            <TextInput
              value={waterNote}
              onChangeText={setWaterNote}
              placeholder={t('care.waterNotePlaceholder')}
              className="mb-3 rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-sm text-forest-900"
              placeholderTextColor="#7FD9C9"
            />
          ) : null}

          <CheckRow
            done={log.play_done}
            title={isCat ? t('care.playActionCat') : t('care.playAction')}
            subtitle={
              isCat ? t('care.playHintCat') : t('care.playHint')
            }
            onToggle={() => void togglePlay()}
          />
          {log.play_done ? (
            <TextInput
              value={playNote}
              onChangeText={setPlayNote}
              placeholder={t('care.playNotePlaceholder')}
              className="mb-3 rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-sm text-forest-900"
              placeholderTextColor="#7FD9C9"
            />
          ) : null}

          <CheckRow
            done={feedDone}
            title={t('care.feedAction')}
            subtitle={
              pet.favorite_food
                ? t('care.feedHint')
                : t('care.feedHintNoFavorite')
            }
            onToggle={() => void toggleFeed()}
          />
          {feedDone ? (
            <TextInput
              value={feedNote}
              onChangeText={setFeedNote}
              placeholder={t('care.feedNotePlaceholder')}
              className="mb-3 rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-sm text-forest-900"
              placeholderTextColor="#7FD9C9"
            />
          ) : null}
          {pet.favorite_food ? (
            <View className="mb-3">
              <PrimaryButton
                label={t('care.feedLogFavorite')}
                variant="secondary"
                loading={savingFeed}
                onPress={() => void onLogFavoriteFeed()}
              />
              <Text className="mt-2 font-body text-xs text-forest-500">
                {pet.favorite_food}
              </Text>
            </View>
          ) : null}
        </View>

        <View className="mt-2 gap-3">
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
      </ScrollView>
    </SafeAreaView>
  );
}
