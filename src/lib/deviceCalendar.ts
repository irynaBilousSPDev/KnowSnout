import { Linking, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';

import { t } from '@/src/i18n';
import { vaccineLabel } from '@/src/constants/vaccines';
import type { PetVaccineRow } from '@/src/types/vaccine';
import { vaccineDisplayName } from '@/src/services/vaccines';

function eventTitle(petName: string, row: PetVaccineRow): string {
  const vax =
    vaccineLabel(row.vaccine_key) ?? vaccineDisplayName(row);
  return t('vaccines.calendarTitle', { pet: petName, vaccine: vax });
}

function eventNotes(row: PetVaccineRow): string {
  const parts = [t('vaccines.calendarNotes')];
  if (row.notes?.trim()) parts.push(row.notes.trim());
  return parts.join('\n');
}

/** Google Calendar “create event” URL (works on web + as optional open). */
export function googleCalendarUrl(input: {
  title: string;
  dateIso: string;
  details?: string;
}): string {
  const start = input.dateIso.replace(/-/g, '');
  const endDate = new Date(`${input.dateIso}T12:00:00`);
  endDate.setDate(endDate.getDate() + 1);
  const end = endDate.toISOString().slice(0, 10).replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: input.title,
    dates: `${start}/${end}`,
    details: input.details ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

async function ensureCalendarPermission(): Promise<boolean> {
  const current = await Calendar.getCalendarPermissionsAsync();
  if (current.status === 'granted') return true;
  const asked = await Calendar.requestCalendarPermissionsAsync();
  return asked.status === 'granted';
}

async function pickWritableCalendarId(): Promise<string | null> {
  const calendars = await Calendar.getCalendarsAsync(
    Calendar.EntityTypes.EVENT,
  );
  const writable = calendars.filter((c) => c.allowsModifications);
  if (writable.length === 0) return null;

  // Prefer a Google calendar when the user has one synced on the device.
  const google = writable.find((c) =>
    `${c.source?.name ?? ''} ${c.source?.type ?? ''} ${c.title ?? ''}`
      .toLowerCase()
      .includes('google'),
  );
  if (google) return google.id;

  const primary = writable.find((c) => c.isPrimary);
  return primary?.id ?? writable[0]?.id ?? null;
}

/**
 * Optional: add next-due vaccine to the phone calendar.
 * If Google Calendar is signed in on the device, the event syncs there.
 * On web (or if calendar API unavailable) opens Google Calendar template.
 */
export async function addVaccineToDeviceCalendar(input: {
  petName: string;
  vaccine: PetVaccineRow;
}): Promise<{ mode: 'device' | 'google-web' }> {
  const due = input.vaccine.next_due_on;
  if (!due) {
    throw new Error(t('vaccines.calendarNeedDue'));
  }

  const title = eventTitle(input.petName, input.vaccine);
  const notes = eventNotes(input.vaccine);

  if (Platform.OS === 'web') {
    const url = googleCalendarUrl({ title, dateIso: due, details: notes });
    await Linking.openURL(url);
    return { mode: 'google-web' };
  }

  const ok = await ensureCalendarPermission();
  if (!ok) {
    throw new Error(t('vaccines.calendarPermission'));
  }

  const calendarId = await pickWritableCalendarId();
  if (!calendarId) {
    // Fallback: open Google in browser
    const url = googleCalendarUrl({ title, dateIso: due, details: notes });
    await Linking.openURL(url);
    return { mode: 'google-web' };
  }

  const start = new Date(`${due}T10:00:00`);
  const end = new Date(`${due}T11:00:00`);

  await Calendar.createEventAsync(calendarId, {
    title,
    notes,
    startDate: start,
    endDate: end,
    allDay: false,
    timeZone: undefined,
  });

  return { mode: 'device' };
}
