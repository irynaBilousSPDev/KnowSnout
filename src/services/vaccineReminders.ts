import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { vaccineLabel } from '@/src/constants/vaccines';
import { t } from '@/src/i18n';
import { vaccineDisplayName } from '@/src/services/vaccines';
import type { PetVaccineRow } from '@/src/types/vaccine';

const MAP_KEY = 'snoutscore.vaccine_reminder_ids_v1';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

type ReminderMap = Record<string, string>;

async function readMap(): Promise<ReminderMap> {
  const raw = await AsyncStorage.getItem(MAP_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ReminderMap;
  } catch {
    return {};
  }
}

async function writeMap(map: ReminderMap) {
  await AsyncStorage.setItem(MAP_KEY, JSON.stringify(map));
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  if (
    current.granted ||
    current.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  ) {
    return true;
  }
  const asked = await Notifications.requestPermissionsAsync();
  return (
    asked.granted ||
    asked.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

function reminderTitle(petName: string, row: PetVaccineRow): string {
  const vax = vaccineLabel(row.vaccine_key) ?? vaccineDisplayName(row);
  return t('vaccines.reminderTitle', { pet: petName, vaccine: vax });
}

function triggerDate(nextDueOn: string): Date {
  // Morning of due day (10:00 local)
  const d = new Date(`${nextDueOn}T10:00:00`);
  // If already past, schedule ~1 minute from now for demo feedback
  if (d.getTime() <= Date.now()) {
    return new Date(Date.now() + 60 * 1000);
  }
  return d;
}

export async function hasVaccineAppReminder(
  vaccineId: string,
): Promise<boolean> {
  const map = await readMap();
  return Boolean(map[vaccineId]);
}

export async function listVaccineReminderIds(): Promise<Set<string>> {
  const map = await readMap();
  return new Set(Object.keys(map));
}

export async function cancelVaccineAppReminder(
  vaccineId: string,
): Promise<void> {
  const map = await readMap();
  const notifId = map[vaccineId];
  if (notifId) {
    await Notifications.cancelScheduledNotificationAsync(notifId);
    delete map[vaccineId];
    await writeMap(map);
  }
}

/**
 * Schedule a local in-app notification for the vaccine next-due date.
 */
export async function scheduleVaccineAppReminder(input: {
  petName: string;
  vaccine: PetVaccineRow;
}): Promise<{ scheduledFor: string }> {
  if (Platform.OS === 'web') {
    throw new Error(t('vaccines.reminderWebOnly'));
  }
  if (!input.vaccine.next_due_on) {
    throw new Error(t('vaccines.calendarNeedDue'));
  }

  const ok = await ensureNotificationPermission();
  if (!ok) {
    throw new Error(t('vaccines.reminderPermission'));
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('vaccines', {
      name: t('vaccines.reminderChannel'),
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  // Replace previous reminder for this vaccine
  await cancelVaccineAppReminder(input.vaccine.id);

  const when = triggerDate(input.vaccine.next_due_on);
  const notifId = await Notifications.scheduleNotificationAsync({
    content: {
      title: reminderTitle(input.petName, input.vaccine),
      body: t('vaccines.reminderBody', {
        date: input.vaccine.next_due_on,
      }),
      data: {
        type: 'vaccine',
        vaccineId: input.vaccine.id,
        petName: input.petName,
      },
      ...(Platform.OS === 'android' ? { channelId: 'vaccines' } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
    },
  });

  const map = await readMap();
  map[input.vaccine.id] = notifId;
  await writeMap(map);

  return { scheduledFor: when.toISOString() };
}
