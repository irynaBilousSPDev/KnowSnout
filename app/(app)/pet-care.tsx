import { useFocusEffect, useLocalSearchParams } from 'expo-router';
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
  const calendarId = google?.id ?? writable.find((c) => c.isPrimary)?.id ?? writable[0]?.id;
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
  const [waterNote, setWaterNote] = useState('');
  const [playNote, setPlayNote] = useState('');
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
      setPet(nextPet);
      setLog(care);
      setWaterNote(care.water_note ?? '');
      setPlayNote(care.play_note ?? '');
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

  const saveNotes = async () => {
    if (!petId || !log) return;
    const next = await updateCareToday(petId, {
      water_note: log.water_done ? waterNote : log.water_note,
      play_note: log.play_done ? playNote : log.play_note,
      play_minutes: log.play_done ? log.play_minutes ?? 5 : log.play_minutes,
    });
    setLog(next);
    Alert.alert(t('care.saved'));
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

  const progress = careProgress(log);
  const isCat = pet.species === 'cat';

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
        </View>

        <View className="mt-2 gap-3">
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
