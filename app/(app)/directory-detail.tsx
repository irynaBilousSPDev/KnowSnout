import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  getDirectoryPlace,
  type DirectoryPlace,
  type VerificationStatus,
} from '@/src/services/directories';
import { listReviewsForPlace } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

function verificationLabel(v: VerificationStatus) {
  if (v === 'verified') return t('directories.verified');
  if (v === 'pending') return t('directories.pending');
  return t('directories.unverified');
}

/** HTML kit · Картка місця — soft stats card, accent CTA. */
export default function DirectoryDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [place, setPlace] = useState<DirectoryPlace | null>(null);
  const [reviewCountLocal, setReviewCountLocal] = useState(0);
  const [loading, setLoading] = useState(true);

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
      <AppScreen>
        <View style={styles.pad}>
          <HubHero title={t('directories.missing')} />
        </View>
      </AppScreen>
    );
  }

  const isTransport = place.category === 'transport';
  const verified = place.verification === 'verified';

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero title={place.name} lead={place.city} />
          <View style={[styles.badge, verified && styles.badgeGood]}>
            <Text style={[styles.badgeText, verified && styles.badgeTextGood]}>
              {verificationLabel(place.verification)}
            </Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{place.rating.toFixed(1)}</Text>
              <Text style={styles.statLbl}>{t('directories.rating')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>
                {place.reviewCount + reviewCountLocal}
              </Text>
              <Text style={styles.statLbl}>
                {t('directories.ratingLine', {
                  rating: place.rating.toFixed(1),
                  count: place.reviewCount + reviewCountLocal,
                })}
              </Text>
            </View>
          </View>

          {place.specialty ? (
            <Text style={styles.meta}>{place.specialty}</Text>
          ) : null}
          {place.phone ? <Text style={styles.meta}>{place.phone}</Text> : null}
          <Text style={styles.body}>{place.blurb}</Text>

          {isTransport && place.vehicleType ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('directories.carriersVehicle')}
              </Text>
              <Text style={styles.sectionBody}>{place.vehicleType}</Text>
            </View>
          ) : null}

          {isTransport && place.routes && place.routes.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('directories.carriersRoutes')}
              </Text>
              {place.routes.map((route) => (
                <Text key={route} style={styles.routeLine}>
                  · {route}
                </Text>
              ))}
            </View>
          ) : null}

          {isTransport && place.reviewsBlurb ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t('directories.carriersReviewsBlurb')}
              </Text>
              <Text style={styles.sectionBody}>{place.reviewsBlurb}</Text>
            </View>
          ) : null}

          <View style={styles.gap} />
          <PrimaryButton
            label={t('directories.writePlace')}
            onPress={() =>
              router.push({
                pathname: '/(app)/directory-chat',
                params: { placeId: place.id },
              } as never)
            }
          />
          <View style={styles.gapSm} />
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
          <View style={styles.gapSm} />
          <PrimaryButton
            label={t('directories.reportFraud')}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/directory-report',
                params: { id: place.id },
              } as never)
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  badge: {
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeGood: { backgroundColor: brand.successTint },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.label,
  },
  badgeTextGood: { color: brand.successDark },
  stats: {
    flexDirection: 'row',
    marginBottom: 12,
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
    fontFamily: fonts.titleExtra,
    fontSize: 18,
    color: brand.accentDark,
  },
  statLbl: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  meta: {
    marginBottom: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  body: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  section: {
    marginTop: 16,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  sectionTitle: {
    marginBottom: 6,
    fontFamily: fonts.title,
    fontSize: 15,
    color: brand.ink,
  },
  sectionBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  routeLine: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  gap: { height: 16 },
  gapSm: { height: 10 },
});
