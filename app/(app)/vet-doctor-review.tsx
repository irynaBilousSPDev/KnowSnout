import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { VetDashedPhoto, VetPill } from '@/src/components/vets/VetUi';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { getVetDoctor, VET_PET_CHIPS } from '@/src/services/vetDirectory';
import { saveDirectoryReview } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

const REASONS = ['Кардіологія', 'Терапія', 'Профілактика'];

/** 09.05 · Відгук про лікаря */
export default function VetDoctorReviewScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const doctor = id ? getVetDoctor(id) : getVetDoctor('dr-kravets');
  const [petId, setPetId] = useState(VET_PET_CHIPS[0]?.id ?? '');
  const [reason, setReason] = useState(REASONS[0]);
  const [rating, setRating] = useState(4);
  const [text, setText] = useState(
    'Знайшла шум, який два роки ніхто не чув. Розписала терапію й пояснила, на що дивитися вдома.',
  );
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!doctor) return;
  }, [doctor]);

  if (!doctor) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await saveDirectoryReview({
        placeId: doctor.id,
        rating,
        text: `[${reason}] ${text.trim()}`,
      });
      notify(t('common.ok'), t('directories.reviewSaved'));
      router.back();
    } catch {
      notify(t('common.error'), t('directories.reviewError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.actionBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.barTitle}>{t('vets.reviewBarTitle')}</Text>
        <Pressable onPress={() => void submit()} disabled={busy}>
          <Text style={styles.send}>{t('vets.reviewSend')}</Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.doctorCard}>
            <VetDashedPhoto label="or browse" browse="" size={48} />
            <View style={styles.doctorCopy}>
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Text style={styles.doctorSub}>
                {doctor.clinics[0]?.name ?? ''} · 14.08.26
              </Text>
            </View>
          </View>

          <Text style={styles.label}>{t('vets.reviewForPet')}</Text>
          <View style={styles.chipRow}>
            {VET_PET_CHIPS.map((pet) => {
              const on = petId === pet.id;
              return (
                <Pressable
                  key={pet.id}
                  onPress={() => setPetId(pet.id)}
                  style={[styles.petChip, on && styles.petChipOn]}
                >
                  <View style={styles.petDot} />
                  <Text style={[styles.petChipText, on && styles.petChipTextOn]}>
                    {pet.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.label}>{t('vets.reviewReasonLabel')}</Text>
          <View style={styles.chipRow}>
            {REASONS.map((r) => (
              <Pressable key={r} onPress={() => setReason(r)}>
                <VetPill label={r} tint={reason === r ? 'green' : 'grey'} />
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('directories.rating')}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <Text style={styles.star}>{n <= rating ? '★' : '☆'}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>{t('vets.reviewKnow')}</Text>
          <TextInput
            value={text}
            onChangeText={setText}
            multiline
            style={styles.area}
            placeholderTextColor={brand.mutedSoft}
          />

          <View style={styles.confirmedBanner}>
            <Text style={styles.confirmedTitle}>✓ {t('vets.confirmedVisit')}</Text>
            <Text style={styles.confirmedSub}>{t('vets.confirmedVisitSub')}</Text>
          </View>

          <Text style={styles.disclaimer}>{t('vets.reviewDisclaimer')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.muted,
    width: 80,
  },
  barTitle: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
  },
  send: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.accentDark,
    width: 80,
    textAlign: 'right',
  },
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  doctorCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  doctorCopy: { flex: 1, justifyContent: 'center' },
  doctorName: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  doctorSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
    marginTop: 2,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  petChipOn: { backgroundColor: brand.successTint },
  petDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: brand.mistBorder,
  },
  petChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  petChipTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  stars: { flexDirection: 'row', gap: 6 },
  star: {
    fontSize: 28,
    color: brand.accentDark,
  },
  area: {
    minHeight: 100,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.accentDark,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  confirmedBanner: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.successTint,
    padding: 14,
    gap: 4,
    marginTop: 6,
  },
  confirmedTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.successDark,
  },
  confirmedSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.successDark,
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: brand.mutedSoft,
    marginTop: 4,
  },
});
