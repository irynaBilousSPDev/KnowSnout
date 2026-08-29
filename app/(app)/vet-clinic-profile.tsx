import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { VetDashedHero, VetPill } from '@/src/components/vets/VetUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { getVetClinic } from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 09.03 · Профіль клініки */
export default function VetClinicProfileScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const clinic = id ? getVetClinic(id) : getVetClinic('clinic-vetcare');

  if (!clinic) {
    return <LoadingState message={t('directories.missing')} />;
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t('vets.clinicTitle')}
        titleSize={20}
        right={
          <Pressable style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <VetDashedHero label={t('vets.clinicPhoto')} />
        <View style={styles.pad}>
          <Text style={styles.name}>{clinic.name}</Text>
          <Text style={styles.address}>{clinic.address}</Text>
          <View style={styles.statusRow}>
            {clinic.openUntil ? (
              <VetPill
                label={t('vets.openUntil', { time: clinic.openUntil })}
                tint="green"
              />
            ) : null}
            {clinic.weekendNote ? (
              <VetPill label={clinic.weekendNote} />
            ) : null}
          </View>

          <View style={styles.ratingsRow}>
            <View style={styles.ratingCard}>
              <Text style={styles.ratingLbl}>GOOGLE</Text>
              <Text style={styles.ratingNum}>★ {clinic.googleRating.toFixed(1)}</Text>
              <Text style={styles.ratingSub}>
                {clinic.googleCount} {t('vets.googleRatings')}
              </Text>
            </View>
            <View style={[styles.ratingCard, styles.ratingCardKs]}>
              <Text style={[styles.ratingLbl, styles.ratingLblKs]}>
                {t('vets.communityKs')}
              </Text>
              <Text style={[styles.ratingNum, styles.ratingNumKs]}>
                ★ {clinic.communityRating.toFixed(1)}
              </Text>
              <Text style={[styles.ratingSub, styles.ratingSubKs]}>
                {clinic.communityCount} {t('vets.communityReviews')}
              </Text>
            </View>
          </View>

          <View style={styles.actions}>
            <PrimaryButton
              label={t('vets.actionSite')}
              variant="secondary"
              size="sm"
              block={false}
              style={styles.actionBtn}
              onPress={() => {}}
            />
            <PrimaryButton
              label={t('vets.actionRoute')}
              variant="secondary"
              size="sm"
              block={false}
              style={styles.actionBtn}
              onPress={() => {}}
            />
            <PrimaryButton
              label={t('vets.actionCall')}
              size="sm"
              block={false}
              style={styles.actionBtn}
              onPress={() => {}}
            />
          </View>

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('vets.clinicDoctors')}</Text>
            <Text style={styles.sectionLink}>{t('vets.allDoctors', { count: 9 })}</Text>
          </View>
          {clinic.doctors.map((doc) => (
            <Pressable
              key={doc.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/vet-doctor-profile',
                  params: { id: doc.id },
                } as never)
              }
              style={styles.doctorRow}
            >
              <View style={styles.docAvatar} />
              <View style={styles.docCopy}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docSub}>
                  {doc.subtitle} · ★ {doc.rating.toFixed(1)}
                </Text>
              </View>
              <View style={styles.docCheck}>
                <Ionicons name="checkmark" size={14} color={brand.surfaceElevated} />
              </View>
            </Pressable>
          ))}

          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{t('vets.communityReviewsTitle')}</Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/directory-review',
                  params: { id: clinic.id },
                } as never)
              }
            >
              <Text style={styles.sectionLink}>{t('vets.writeReview')}</Text>
            </Pressable>
          </View>
          {clinic.featuredReview ? (
            <View style={styles.reviewCard}>
              <View style={styles.reviewTop}>
                <Text style={styles.reviewAuthor}>{clinic.featuredReview.author}</Text>
                <Text style={styles.reviewRating}>
                  ★ {clinic.featuredReview.rating.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.reviewBody}>{clinic.featuredReview.text}</Text>
              {clinic.featuredReview.confirmed ? (
                <View style={styles.confirmedBadge}>
                  <Text style={styles.confirmedText}>
                    ✓ {t('vets.confirmedVisit')}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <Text style={styles.footerNote}>{t('vets.clinicFooterNote')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
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
  name: {
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.ink,
  },
  address: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
    marginTop: -4,
  },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  ratingsRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  ratingCard: {
    flex: 1,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  ratingCardKs: {
    backgroundColor: brand.accentTint,
    borderColor: brand.accentTint,
  },
  ratingLbl: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    letterSpacing: 0.6,
    color: brand.muted,
  },
  ratingLblKs: { color: brand.accentDark },
  ratingNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: brand.ink,
    marginTop: 4,
  },
  ratingNumKs: { color: brand.accentDark },
  ratingSub: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: brand.muted,
  },
  ratingSubKs: { color: brand.accentDark },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  actionBtn: { flex: 1 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  sectionLink: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.accentDark,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  docAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: brand.accentTint,
  },
  docCopy: { flex: 1 },
  docName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  docSub: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
    marginTop: 2,
  },
  docCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: brand.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
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
  footerNote: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    lineHeight: 15,
    color: brand.mutedSoft,
    marginTop: 8,
  },
});
