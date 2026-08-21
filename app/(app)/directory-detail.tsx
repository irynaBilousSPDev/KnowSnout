import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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
  if (v === 'verified') return t('directories.verifiedCheck');
  if (v === 'pending') return t('directories.pending');
  return t('directories.unverifiedShort');
}

/** HTML phones F3 / F4c — place / carrier card. */
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

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Ionicons name="business-outline" size={40} color={brand.mutedSoft} />
        </View>
        <View style={styles.pad}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{place.name}</Text>
            <Text style={[styles.badge, verified && styles.badgeGood]}>
              {verificationLabel(place.verification)}
            </Text>
          </View>
          <Text style={styles.address}>
            {place.city}
            {place.specialty ? ` · ${place.specialty}` : ''}
          </Text>

          <View style={styles.tagRow}>
            {place.specialty ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{place.specialty}</Text>
              </View>
            ) : null}
            {verified ? (
              <View style={styles.tag}>
                <Text style={styles.tagText}>
                  {t('directories.docsChecked')}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{place.rating.toFixed(1)}</Text>
              <Text style={styles.statLbl}>{t('directories.rating')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, styles.statNumInk]}>
                {reviewsTotal}
              </Text>
              <Text style={styles.statLbl}>{t('directories.reviewsCount')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNum, styles.statNumInk]}>₴₴</Text>
              <Text style={styles.statLbl}>{t('directories.priceLevel')}</Text>
            </View>
          </View>

          <Text style={styles.aboutLbl}>{t('directories.aboutPlace')}</Text>
          <Text style={styles.body}>{place.blurb}</Text>

          {isTransport && place.vehicleType ? (
            <Text style={styles.metaLine}>
              {t('directories.carriersVehicle')}: {place.vehicleType}
            </Text>
          ) : null}
          {isTransport && place.routes?.length ? (
            <Text style={styles.metaLine}>
              {t('directories.carriersRoutes')}: {place.routes.join(' · ')}
            </Text>
          ) : null}

          <PrimaryButton
            label={t('directories.writePlace')}
            onPress={() =>
              router.push({
                pathname: '/(app)/directory-chat',
                params: { placeId: place.id },
              } as never)
            }
            style={styles.btn}
          />
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
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/directory-report',
                params: { id: place.id },
              } as never)
            }
            style={styles.report}
          >
            <Text style={styles.reportText}>
              {t('directories.reportProblem')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 170,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  badgeGood: { color: brand.successDark },
  address: {
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
  metaLine: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  btn: { marginTop: 6 },
  report: { alignItems: 'center', paddingVertical: 8 },
  reportText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11.5,
    color: brand.mutedSoft,
  },
});
