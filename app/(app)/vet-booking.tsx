import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ServiceOfferCard } from '@/src/components/specialists/SpecialistUi';
import { VetDashedPhoto } from '@/src/components/vets/VetUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  BOOKING_DATES,
  BOOKING_TIMES,
  VET_BOOKING_SERVICES,
  confirmBooking,
  formatBookingWhen,
} from '@/src/services/booking';
import { getVetDoctor } from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 09 · Запис до лікаря (shared booking UI with 10.04) */
export default function VetBookingScreen() {
  const { id = 'dr-kravets' } = useLocalSearchParams<{ id?: string }>();
  const doctor = getVetDoctor(id);
  const [serviceId, setServiceId] = useState('online');
  const [dateId, setDateId] = useState('d2');
  const [time, setTime] = useState('12:30');

  if (!doctor) return null;

  const service =
    VET_BOOKING_SERVICES.find((s) => s.id === serviceId) ??
    VET_BOOKING_SERVICES[0];

  const confirm = async () => {
    const date = BOOKING_DATES.find((d) => d.id === dateId) ?? BOOKING_DATES[1];
    await confirmBooking({
      providerKind: 'vet',
      providerId: doctor.id,
      providerName: doctor.name,
      serviceId: service.id,
      serviceTitleKey: service.titleKey,
      dateId,
      dateLabel: date.label,
      day: date.day,
      time,
      priceUah: service.priceUah,
      durationMin: service.durationMin,
    });
    Alert.alert(
      t('specialist.booking.confirmedTitle'),
      `${t('vets.bookNote')} · ${formatBookingWhen({ dateId, time })}`,
    );
    router.back();
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('vets.book')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.specRow}>
            <VetDashedPhoto label={t('vets.photoLabel')} size={44} />
            <View style={styles.specCopy}>
              <Text style={styles.specName}>{doctor.name}</Text>
              <Text style={styles.specMeta}>
                {doctor.title} · {doctor.specializations[0] ?? t('vets.doctorTitle')}
              </Text>
            </View>
          </View>

          <Text style={styles.lbl}>{t('specialist.booking.serviceLabel')}</Text>
          <View style={styles.list}>
            {VET_BOOKING_SERVICES.map((svc) => (
              <ServiceOfferCard
                key={svc.id}
                title={`${t(svc.titleKey)} · ${svc.durationMin} ${t('specialist.booking.min')}`}
                subtitle={svc.subtitleKey ? t(svc.subtitleKey) : undefined}
                price={`₴${svc.priceUah.toLocaleString('uk-UA')}`}
                iconTint={brand.accentTint}
                selected={serviceId === svc.id}
                onPress={() => setServiceId(svc.id)}
              />
            ))}
          </View>

          <Text style={styles.lbl}>{t('specialist.booking.dateLabel')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.dateRow}>
              {BOOKING_DATES.map((d) => (
                <PrimaryButton
                  key={d.id}
                  label={`${d.label}\n${d.day}`}
                  variant={dateId === d.id ? 'primary' : 'secondary'}
                  size="sm"
                  block={false}
                  onPress={() => setDateId(d.id)}
                  style={styles.dateBtn}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.lbl}>{t('specialist.booking.timeLabel')}</Text>
          <View style={styles.timeRow}>
            {BOOKING_TIMES.map((slot) => (
              <PrimaryButton
                key={slot}
                label={slot}
                variant={time === slot ? 'primary' : 'secondary'}
                size="sm"
                block={false}
                onPress={() => setTime(slot)}
                style={styles.timeBtn}
              />
            ))}
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryNote}>
              {t('vets.bookNote')} · {t(service.titleKey)} · {time}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t('specialist.booking.confirm')} onPress={confirm} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 10,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 12,
  },
  specCopy: { flex: 1, gap: 2 },
  specName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  specMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  lbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  list: { gap: 8 },
  dateRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  dateBtn: { minWidth: 52 },
  timeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  timeBtn: { minWidth: 72 },
  summary: {
    marginTop: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  summaryNote: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: brand.muted,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
  },
});
