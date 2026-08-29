import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import {
  VetDashedPhoto,
  VetPill,
  VetSkillBar,
} from '@/src/components/vets/VetUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { getVetDoctor } from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 09.04 · Профіль лікаря */
export default function VetDoctorProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const doctor = id ? getVetDoctor(id) : getVetDoctor('dr-kravets');

  if (!doctor) {
    return <LoadingState message={t('directories.missing')} />;
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('vets.doctorTitle')}
        titleSize={20}
        right={
          <Pressable style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.heroRow}>
            <VetDashedPhoto label={t('vets.photoLabel')} size={88} />
            <View style={styles.heroCopy}>
              <Text style={styles.name}>{doctor.name}</Text>
              <Text style={styles.titleLine}>
                {doctor.title} · {doctor.yearsPractice} {t('vets.yearsPractice')}
              </Text>
              <Text style={styles.ratingLine}>
                ★ {doctor.rating.toFixed(1)} · {doctor.reviewCount}
              </Text>
              <View style={styles.langRow}>
                {doctor.languages.map((lang) => (
                  <VetPill key={lang} label={lang} />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.verifyCard}>
            <Text style={styles.verifyTitle}>{t('vets.verifyTitle')}</Text>
            <View style={styles.verifyRow}>
              {doctor.verification.map((v) => (
                <VetPill
                  key={v.id}
                  label={t(v.labelKey)}
                  tint={v.verified ? 'green' : 'grey'}
                />
              ))}
            </View>
            <Text style={styles.verifyNote}>{t('vets.verifyNote')}</Text>
          </View>

          <Text style={styles.sectionLbl}>{t('vets.specializations')}</Text>
          <View style={styles.tagRow}>
            {doctor.specializations.map((s) => (
              <VetPill key={s} label={s} tint="green" />
            ))}
          </View>

          <Text style={styles.sectionLbl}>{t('vets.species')}</Text>
          <View style={styles.tagRow}>
            {doctor.species.map((s) => (
              <VetPill key={s} label={s} />
            ))}
          </View>

          <Text style={styles.sectionLbl}>{t('vets.clinicsSection')}</Text>
          {doctor.clinics.map((clinic) => (
            <Pressable
              key={clinic.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/vet-clinic-profile',
                  params: { id: clinic.id },
                } as never)
              }
              style={styles.clinicRow}
            >
              <View style={styles.clinicIcon} />
              <View style={styles.clinicCopy}>
                <Text style={styles.clinicName}>{clinic.name}</Text>
                <Text style={styles.clinicSub}>
                  {clinic.city} · {clinic.schedule}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>{t('vets.aboutDoctor')}</Text>
          <Text style={styles.body}>{doctor.about}</Text>

          <Text style={styles.sectionTitle}>{t('vets.education')}</Text>
          <View style={styles.eduCard}>
            <Text style={styles.body}>{doctor.education}</Text>
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('vets.reviewsSection')}</Text>
            <Text style={styles.sectionLink}>
              {t('vets.allReviews', { count: doctor.reviewCount })}
            </Text>
          </View>

          <View style={styles.reviewsCard}>
            <View style={styles.overallRow}>
              <Text style={styles.overallLbl}>{t('vets.overallRating')}</Text>
              <Text style={styles.overallNum}>★ {doctor.rating.toFixed(1)}</Text>
            </View>
            {doctor.skillRatings.map((skill) => (
              <VetSkillBar
                key={skill.label}
                label={skill.label}
                rating={skill.rating}
                count={skill.count}
              />
            ))}
            <Text style={styles.reviewHint}>{t('vets.reviewSkillHint')}</Text>
          </View>

          {doctor.featuredReview ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewAuthor}>
                  {doctor.featuredReview.author}
                </Text>
                <Text style={styles.reviewRating}>
                  ★ {doctor.featuredReview.rating.toFixed(1)}
                </Text>
              </View>
              <VetPill
                label={t('vets.reviewReason', {
                  reason: doctor.featuredReview.reason,
                })}
                tint="green"
              />
              <Text style={styles.reviewBody}>{doctor.featuredReview.text}</Text>
              {doctor.featuredReview.confirmed ? (
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedText}>
                    ✓ {t('vets.confirmedVisit')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={styles.bottomActions}>
            <PrimaryButton
              label={t('vets.contact')}
              onPress={() =>
                router.push({
                  pathname: '/(app)/directory-chat',
                  params: { placeId: doctor.id },
                } as never)
              }
              style={styles.bottomBtn}
            />
            <PrimaryButton
              label={t('vets.book')}
              variant="secondary"
              onPress={() => {}}
              style={styles.bottomBtn}
            />
          </View>
          <Text style={styles.bookNote}>{t('vets.bookNote')}</Text>

          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/vet-doctor-review',
                params: { id: doctor.id },
              } as never)
            }
            style={styles.writeReview}
          >
            <Text style={styles.writeReviewText}>{t('vets.writeDoctorReview')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroRow: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  heroCopy: { flex: 1, gap: 4 },
  name: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  titleLine: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  ratingLine: {
    fontFamily: fonts.bodyBold,
    fontSize: 12.5,
    color: brand.successDark,
  },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  verifyCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.creamDeep,
    padding: 14,
    gap: 8,
  },
  verifyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  verifyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  verifyNote: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: brand.muted,
  },
  sectionLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.accentDark,
    marginTop: 6,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  clinicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  clinicIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: brand.accentTint,
  },
  clinicCopy: { flex: 1 },
  clinicName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  clinicSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
    marginTop: 2,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: brand.ink,
  },
  eduCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.creamDeep,
    padding: 14,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.accentDark,
  },
  reviewsCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  overallRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  overallLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  overallNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  reviewHint: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: brand.mutedSoft,
  },
  reviewCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    gap: 8,
  },
  reviewTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reviewAuthor: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  reviewRating: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.successDark,
  },
  reviewBody: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.ink,
  },
  confirmedBadge: {
    alignSelf: 'flex-start',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.successTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  confirmedText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: brand.successDark,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  bottomBtn: { flex: 1 },
  bookNote: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
  writeReview: { alignItems: 'center', paddingVertical: 8 },
  writeReviewText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.accentDark,
  },
});
