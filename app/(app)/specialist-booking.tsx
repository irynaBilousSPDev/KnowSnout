import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  BOOKING_SERVICES,
  BOOKING_TIMES,
  getSpecialist,
} from '@/src/services/specialistDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 10.04 · Запис до спеціаліста */
export default function SpecialistBookingScreen() {
  const { id = 'natalia-dmytruk' } = useLocalSearchParams<{ id?: string }>();
  const specialist = getSpecialist(id);
  const [serviceId, setServiceId] = useState('home-visit');
  const [dateId, setDateId] = useState('d2');
  const [time, setTime] = useState('12:30');
  const [address, setAddress] = useState('ul. Marszałkowska 12, Варшава');

  if (!specialist) return null;

  const service =
    BOOKING_SERVICES.find((s) => s.id === serviceId) ?? BOOKING_SERVICES[0];

  const confirm = () => {
    Alert.alert(t('specialist.booking.confirmedTitle'), t('specialist.booking.confirmedBody'));
    router.back();
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('specialist.booking.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.specRow}>
            <VetDashedPhoto label="or brows..." size={44} />
            <View style={styles.specCopy}>
              <Text style={styles.specName}>{specialist.name}</Text>
              <Text style={styles.specMeta}>
                {t('specialist.pet.tukanName')} · {t('specialist.topic.separationShort')}
              </Text>
            </View>
          </View>

          <Text style={styles.lbl}>{t('specialist.booking.serviceLabel')}</Text>
          <View style={styles.list}>
            {BOOKING_SERVICES.map((svc) => (
              <ServiceOfferCard
                key={svc.id}
                title={`${t(svc.titleKey)} · ${svc.durationMin} ${t('specialist.booking.min')}`}
                subtitle={svc.subtitleKey ? t(svc.subtitleKey) : undefined}
                price={`₴${svc.priceUah.toLocaleString('uk-UA')}`}
                iconTint={svc.format === 'home-visit' ? brand.accentTint : brand.creamDeep}
                selected={serviceId === svc.id}
                onPress={() => setServiceId(svc.id)}
              />
            ))}
          </View>

          {service.format === 'home-visit' ? (
            <>
              <Text style={styles.lbl}>{t('specialist.booking.addressLabel')}</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                style={styles.input}
              />
            </>
          ) : null}

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
            <View style={styles.summaryTop}>
              <Text style={styles.summaryLbl}>
                {t(service.titleKey)} · 2 вересня, {time}
              </Text>
              <Text style={styles.summaryPrice}>
                ₴{service.priceUah.toLocaleString('uk-UA')}
              </Text>
            </View>
            <Text style={styles.summaryNote}>{t('specialist.booking.cancelNote')}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton
          label={t('specialist.booking.confirm')}
          onPress={confirm}
        />
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
  input: {
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  dateRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  dateBtn: { minWidth: 52 },
  timeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeBtn: { minWidth: 72 },
  summary: {
    marginTop: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 8,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLbl: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  summaryPrice: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
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
