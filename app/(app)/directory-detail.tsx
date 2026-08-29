import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { DirectoryReportSheet } from '@/src/components/directories/DirectoryReportSheet';
import {
  DirectoryDashedHero,
  priceLevelDisplay,
  verificationBadgeLabel,
} from '@/src/components/directories/DirectoryUi';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  directoryReportContextLine,
  getDirectoryPlace,
  type DirectoryPlace,
} from '@/src/services/directories';
import { listReviewsForPlace } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

/** 06.03 / 06.06 — facility & carrier detail */
export default function DirectoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [place, setPlace] = useState<DirectoryPlace | null>(null);
  const [reviewCountLocal, setReviewCountLocal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!id) {
        setPlace(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      void Promise.all([getDirectoryPlace(id), listReviewsForPlace(id)])
        .then(([p, reviews]) => {
          setPlace(p);
          setReviewCountLocal(reviews.length);
        })
        .finally(() => setLoading(false));
    }, [id]),
  );

  if (loading) {
    return <LoadingState message={t('common.loading')} />;
  }

  if (!place) {
    return (
      <AppScreen edges={['bottom']}>
        <AppChromeHeader />
        <View style={styles.pad}>
          <Text style={styles.title}>{t('directories.missing')}</Text>
        </View>
      </AppScreen>
    );
  }

  const isTransport = place.category === 'transport';
  const verified = place.verification === 'verified';
  const reviewsTotal = place.reviewCount + reviewCountLocal;
  const badge = verificationBadgeLabel(place);
  const heroLabel =
    place.heroLabel ??
    (isTransport ? t('directories.heroCarrier') : t('directories.heroClinic'));

  const tagPills = isTransport
    ? [
        ...(place.species ?? []),
        ...(verified ? [t('directories.docsChecked')] : []),
      ]
    : [
        ...(place.specialties ?? (place.specialty ? [place.specialty] : [])),
        ...(place.languages?.length
          ? [place.languages.map((l) => l.flag).join(' ')]
          : []),
      ];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <DirectoryDashedHero label={heroLabel} />
        <View style={styles.pad}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{place.name}</Text>
            {badge ? (
              <Text style={[styles.badge, verified && styles.badgeGood]}>
                {badge}
              </Text>
            ) : null}
          </View>

          <Text style={styles.subline}>
            {isTransport
              ? place.blurb
              : place.address ?? `${place.city}${place.specialty ? ` · ${place.specialty}` : ''}`}
          </Text>

          {tagPills.length ? (
            <View style={styles.tagRow}>
              {tagPills.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{place.rating.toFixed(1)}</Text>
              <Text style={styles.statLbl}>{t('directories.ratingLabel')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, styles.statNumInk]}>
                {isTransport ? (place.tripCount ?? reviewsTotal) : reviewsTotal}
              </Text>
              <Text style={styles.statLbl}>
                {isTransport
                  ? t('directories.statTrips')
                  : t('directories.reviewsCount')}
              </Text>
            </View>
            <View style={styles.stat}>
              {isTransport ? (
                <>
                  <Text style={[styles.statNum, styles.statNumInk]}>
                    {place.complaintCount ?? 0}
                  </Text>
                  <Text style={styles.statLbl}>
                    {t('directories.statComplaints')}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.statNum}>
                    {priceLevelDisplay(place.priceLevel ?? 2).filled}
                    <Text style={styles.statNumFade}>
                      {priceLevelDisplay(place.priceLevel ?? 2).faded}
                    </Text>
                  </Text>
                  <Text style={styles.statLbl}>{t('directories.priceLevel')}</Text>
                </>
              )}
            </View>
          </View>

          {isTransport && place.featuredReview ? (
            <>
              <Text style={styles.aboutLbl}>{t('directories.userReview')}</Text>
              <Text style={styles.quote}>«{place.featuredReview}»</Text>
            </>
          ) : (
            <>
              <Text style={styles.aboutLbl}>{t('directories.aboutPlace')}</Text>
              <Text style={styles.body}>{place.blurb}</Text>
            </>
          )}

          <PrimaryButton
            label={
              isTransport
                ? t('directories.writeCarrier')
                : t('directories.writePlace')
            }
            onPress={() =>
              router.push({
                pathname: '/(app)/directory-chat',
                params: { placeId: place.id },
              } as never)
            }
            style={styles.btn}
          />

          {!isTransport ? (
            <PrimaryButton
              label={t('directories.writeReview')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/directory-review',
                  params: { id: place.id },
                } as never)
              }
            />
          ) : null}

          <Pressable
            onPress={() => setReportOpen(true)}
            style={styles.report}
          >
            <Text style={styles.reportText}>
              {t('directories.reportProblem')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <DirectoryReportSheet
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        placeId={place.id}
        contextLine={directoryReportContextLine(place)}
      />
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  title: {
    flex: 1,
    fontFamily: fonts.title,
    fontSize: 20,
    color: brand.ink,
  },
  badge: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.mutedSoft,
    marginTop: 4,
  },
  badgeGood: { color: brand.successDark },
  subline: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
    marginTop: -4,
  },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.ink,
  },
  stats: {
    flexDirection: 'row',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  stat: { flex: 1, alignItems: 'center' },
  statNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  statNumInk: { color: brand.ink },
  statNumFade: { color: brand.mistBorder },
  statLbl: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: brand.muted,
  },
  aboutLbl: {
    marginTop: 4,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: brand.ink,
    marginTop: -4,
  },
  quote: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 19,
    color: brand.ink,
    fontStyle: 'italic',
    marginTop: -4,
  },
  btn: { marginTop: 6 },
  report: { alignItems: 'center', paddingVertical: 8 },
  reportText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11.5,
    color: brand.mutedSoft,
  },
});
