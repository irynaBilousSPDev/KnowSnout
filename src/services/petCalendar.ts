import AsyncStorage from '@react-native-async-storage/async-storage';

export type PetCalendarEvent = {
  id: string;
  petId: string;
  title: string;
  /** ISO day YYYY-MM-DD */
  date: string;
};

const STORAGE_KEY = 'knowsnout.pet_calendar';

function todayIsoDay(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeDay(value: string): string | null {
  const day = value.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const parsed = new Date(`${day}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return day;
}

async function readAll(): Promise<PetCalendarEvent[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as PetCalendarEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(rows: PetCalendarEvent[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

export async function listEvents(petId: string): Promise<PetCalendarEvent[]> {
  const rows = await readAll();
  return rows
    .filter((r) => r.petId === petId)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function listUpcoming(
  petId: string,
  fromDay = todayIsoDay(),
): Promise<PetCalendarEvent[]> {
  const rows = await listEvents(petId);
  return rows.filter((r) => r.date >= fromDay);
}

export async function addEvent(input: {
  petId: string;
  title: string;
  date: string;
}): Promise<PetCalendarEvent> {
  const title = input.title.trim();
  const date = normalizeDay(input.date);
  if (!title) throw new Error('EMPTY_TITLE');
  if (!date) throw new Error('BAD_DATE');
  const row: PetCalendarEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    petId: input.petId,
    title,
    date,
  };
  const rows = await readAll();
  rows.push(row);
  await writeAll(rows);
  return row;
}

export async function deleteEvent(id: string): Promise<void> {
  const rows = await readAll();
  await writeAll(rows.filter((r) => r.id !== id));
}

/** YYYYMMDD for Google / ICS all-day events */
function dayToCompact(day: string): string {
  return day.replace(/-/g, '');
}

/** Next calendar day (exclusive end for all-day Google events). */
function nextDayCompact(day: string): string {
  const d = new Date(`${day}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return dayToCompact(todayIsoDay(d));
}

/**
 * Opens Google Calendar "create event" template for one event.
 * Full OAuth two-way sync is later — this is a useful deep-link stub.
 */
export function buildGoogleCalendarRenderUrl(event: {
  title: string;
  date: string;
  details?: string;
}): string | null {
  const day = normalizeDay(event.date);
  if (!day) return null;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dayToCompact(day)}/${nextDayCompact(day)}`,
  });
  if (event.details?.trim()) {
    params.set('details', event.details.trim());
  }
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Minimal ICS calendar body for Share / copy (all-day events). */
export function buildIcsContent(input: {
  petName: string;
  events: PetCalendarEvent[];
}): string {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}Z$/, 'Z');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//KnowSnout//PetCalendar//UA',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:KnowSnout · ${input.petName}`,
  ];
  for (const event of input.events) {
    const day = normalizeDay(event.date);
    if (!day) continue;
    const start = dayToCompact(day);
    const end = nextDayCompact(day);
    const uid = `${event.id}@knowsnout.local`;
    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${escapeIcsText(event.title)}`,
      `DESCRIPTION:${escapeIcsText(`KnowSnout · ${input.petName}`)}`,
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/** Plain-text export for Share sheet when ICS file download is unavailable. */
export function buildEventsExportText(input: {
  petName: string;
  events: PetCalendarEvent[];
}): string {
  if (input.events.length === 0) {
    return `KnowSnout · ${input.petName}\n(немає подій)`;
  }
  const body = input.events
    .map((e) => `• ${e.date} — ${e.title}`)
    .join('\n');
  return `KnowSnout · ${input.petName}\n\n${body}\n\n---\nICS:\n${buildIcsContent(input)}`;
}
