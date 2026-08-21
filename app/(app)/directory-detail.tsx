import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  getDirectoryPlace,
  type DirectoryPlace,
  type VerificationStatus,
} from '@/src/services/directories';
import { listReviewsForPlace } from '@/src/services/directoryReviews';
import { brand } from '@/src/theme/brand';

function verificationLabel(v: VerificationStatus) {
  if (v === 'verified') return t('directories.verified');
  if (v === 'pending') return t('directories.pending');
  return t('directories.unverified');
}

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
          <ScreenHeader title={t('directories.missing')} />
        </View>
      </AppScreen>
    );
  }

  const isTransport = place.category === 'transport';

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={place.name} subtitle={place.city} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {verificationLabel(place.verification)}
            </Text>
          </View>
          {place.specialty ? (
            <Text style={styles.meta}>{place.specialty}</Text>
          ) : null}
          <Text style={styles.meta}>
            {t('directories.ratingLine', {
              rating: place.rating.toFixed(1),
              count: place.reviewCount + reviewCountLocal,
            })}
          </Text>
          {place.phone ? (
            <Text style={styles.meta}>{place.phone}</Text>
          ) : null}
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
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: brand.mist,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 12,
    color: brand.navy,
  },
  meta: {
    marginBottom: 4,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#5A6B7D',
  },
  body: {
    marginTop: 10,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  section: {
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  sectionTitle: {
    marginBottom: 6,
    fontFamily: 'Figtree_700Bold',
    fontSize: 14,
    color: brand.ink,
  },
  sectionBody: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
  routeLine: {
    marginTop: 2,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A6B7D',
  },
  gap: { height: 16 },
  gapSm: { height: 10 },
});
