import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { t } from '@/src/i18n';
import { STATIONARY_RADIUS_KM } from '@/src/services/marketOffers';
import { brand, fonts } from '@/src/theme/brand';
import type { ProductOffer, WhereToBuyResult } from '@/src/types/marketOffer';

type Props = {
  data: WhereToBuyResult | null;
  loading?: boolean;
  onOpenSettings?: () => void;
};

function OfferRow({ offer }: { offer: ProductOffer }) {
  const metaBits = [
    offer.priceLabel,
    offer.channel === 'stationary' && offer.distanceKm != null
      ? t('buy.km', { km: offer.distanceKm })
      : null,
    offer.channel === 'stationary' && offer.city ? offer.city : null,
    offer.ratingOutOf5 != null
      ? `${offer.ratingOutOf5.toFixed(1)}`
      : null,
  ].filter(Boolean);

  return (
    <View style={styles.offerRow}>
      <View style={styles.offerCopy}>
        <Text style={styles.offerName}>{offer.retailerName}</Text>
        {metaBits.length > 0 ? (
          <Text style={styles.offerMeta}>{metaBits.join(' · ')}</Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => void Linking.openURL(offer.url)}
        accessibilityRole="link"
      >
        <Text style={styles.open}>{t('result.openStore')}</Text>
      </Pressable>
    </View>
  );
}

export function WhereToBuyBlock({ data, loading, onOpenSettings }: Props) {
  if (loading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{t('buy.title')}</Text>
        <Text style={styles.hint}>{t('buy.loading')}</Text>
      </View>
    );
  }

  if (!data) return null;

  const countryLabel =
    data.country === 'PL' ? t('buy.countryPL') : t('buy.countryUA');
  const empty =
    data.online.length === 0 && data.stationary.length === 0;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>{t('buy.title')}</Text>
        {onOpenSettings ? (
          <Pressable onPress={onOpenSettings} hitSlop={8}>
            <Text style={styles.settingsLink}>{t('buy.changeRegion')}</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.hint}>
        {t('buy.regionLine', {
          country: countryLabel,
          city: data.city ?? t('buy.cityUnknown'),
        })}
        {data.geoUsed
          ? ` · ${t('buy.geoOn', { km: STATIONARY_RADIUS_KM })}`
          : ` · ${t('buy.geoOff')}`}
      </Text>

      {empty ? (
        <Text style={styles.empty}>{t('buy.empty')}</Text>
      ) : (
        <>
          {data.online.length > 0 ? (
            <>
              <Text style={styles.section}>{t('buy.online')}</Text>
              {data.online.map((o) => (
                <OfferRow key={o.id} offer={o} />
              ))}
            </>
          ) : null}
          {data.stationary.length > 0 ? (
            <>
              <Text style={[styles.section, styles.sectionGap]}>
                {t('buy.stationary')}
              </Text>
              {data.stationary.map((o) => (
                <OfferRow key={o.id} offer={o} />
              ))}
            </>
          ) : null}
        </>
      )}

      <View style={styles.demoRow}>
        <Ionicons name="information-circle-outline" size={14} color={brand.mutedSoft} />
        <Text style={styles.demo}>{t('buy.demoHint')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: brand.creamDeep,
    padding: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  settingsLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accent,
  },
  hint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: brand.muted,
  },
  section: {
    marginTop: 12,
    marginBottom: 4,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  sectionGap: { marginTop: 14 },
  offerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  offerCopy: { flex: 1 },
  offerName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  offerMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  open: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accent,
  },
  empty: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 12,
  },
  demo: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: brand.mutedSoft,
  },
});
