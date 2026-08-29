import AsyncStorage from '@react-native-async-storage/async-storage';

import { t } from '@/src/i18n';
import type { BookingService } from '@/src/types/specialistDirectory';

const STORAGE_KEY = 'knowsnout:bookings.v1';

export type BookingProviderKind = 'vet' | 'specialist';

export type BookingDraft = {
  providerKind: BookingProviderKind;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceTitleKey: string;
  dateId: string;
  dateLabel: string;
  day: string;
  time: string;
  address?: string;
  priceUah: number;
  durationMin: number;
};

export type StoredBooking = BookingDraft & {
  id: string;
  createdAt: string;
  status: 'confirmed' | 'cancelled';
};

export const BOOKING_SERVICES: BookingService[] = [
  {
    id: 'home-visit',
    titleKey: 'specialist.booking.homeTitle',
    subtitleKey: 'specialist.booking.homeHint',
    durationMin: 90,
    priceUah: 1800,
    format: 'home-visit',
  },
  {
    id: 'online',
    titleKey: 'specialist.booking.onlineTitle',
    durationMin: 60,
    priceUah: 900,
    format: 'online',
  },
];

export const VET_BOOKING_SERVICES: BookingService[] = [
  {
    id: 'online',
    titleKey: 'specialist.booking.onlineTitle',
    durationMin: 45,
    priceUah: 350,
    format: 'online',
  },
  {
    id: 'clinic',
    titleKey: 'specialist.booking.clinicTitle',
    subtitleKey: 'specialist.booking.clinicHint',
    durationMin: 60,
    priceUah: 450,
    format: 'clinic',
  },
];

export const BOOKING_DATES = [
  { id: 'd1', label: 'Пн', day: '1' },
  { id: 'd2', label: 'Вт', day: '2' },
  { id: 'd3', label: 'Ср', day: '3' },
  { id: 'd4', label: 'Чт', day: '4' },
  { id: 'd5', label: 'Пт', day: '5' },
];

export const BOOKING_TIMES = ['10:00', '12:30', '15:00', '17:30'];

export function servicesForProvider(kind: BookingProviderKind): BookingService[] {
  return kind === 'vet' ? VET_BOOKING_SERVICES : BOOKING_SERVICES;
}

async function readBookings(): Promise<StoredBooking[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as StoredBooking[];
  } catch {
    return [];
  }
}

async function writeBookings(rows: StoredBooking[]) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

/** Mock confirm — persists locally until Supabase appointments exist. */
export async function confirmBooking(draft: BookingDraft): Promise<StoredBooking> {
  const row: StoredBooking = {
    ...draft,
    id: `bk-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
  };
  const rows = await readBookings();
  rows.unshift(row);
  await writeBookings(rows.slice(0, 50));
  return row;
}

export async function listBookings(): Promise<StoredBooking[]> {
  return readBookings();
}

/** ICS-like summary for device calendar stub (Wave C mock). */
export function buildBookingCalendarNotes(booking: StoredBooking): string {
  const service = t(booking.serviceTitleKey);
  return `${service} · ${booking.providerName}\n${t('vets.bookNote')}`;
}

export function formatBookingWhen(
  booking: Pick<StoredBooking, 'dateId' | 'time'>,
): string {
  const date = BOOKING_DATES.find((d) => d.id === booking.dateId);
  return `${date?.label ?? ''} ${date?.day ?? ''} · ${booking.time}`;
}
