import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { SPECIALIST_TARIFFS } from '@/src/services/specialistDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 10.05 · Тарифи для спеціалістів */
export default function SpecialistTariffsScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('specialist.tariff.screenTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {SPECIALIST_TARIFFS.map((tariff) => (
            <View
              key={tariff.id}
              style={[styles.card, tariff.current && styles.cardCurrent]}
            >
              <View style={styles.cardTop}>
                <Text style={styles.cardTitle}>{t(tariff.titleKey)}</Text>
                {tariff.current ? (
                  <Text style={styles.currentBadge}>{t('specialist.tariff.current')}</Text>
                ) : (
                  <Text style={styles.price}>{t(tariff.priceKey)}</Text>
                )}
              </View>
              {tariff.current ? (
                <>
                  <Text style={styles.body}>{t(tariff.bodyKey)}</Text>
                  <Text style={styles.priceBig}>{t(tariff.priceKey)}</Text>
                </>
              ) : (
                <>
                  {tariff.features.map((key) => (
                    <View key={key} style={styles.featureRow}>
                      <Ionicons name="checkmark" size={14} color={brand.accent} />
                      <Text style={styles.feature}>{t(key)}</Text>
                    </View>
                  ))}
                </>
              )}
            </View>
          ))}

          <View style={styles.promoCard}>
            <View style={styles.promoHead}>
              <Text style={styles.promoTitle}>{t('specialist.tariff.promoTitle')}</Text>
              <Text style={styles.promoTag}>{t('specialist.tariff.promoTag')}</Text>
            </View>
            <Text style={styles.promoBody}>{t('specialist.tariff.promoBody')}</Text>
          </View>

          <View style={styles.verifyNote}>
            <Text style={styles.verifyNoteText}>{t('specialist.tariff.verifyNote')}</Text>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    padding: 14,
    gap: 8,
  },
  cardCurrent: {
    borderColor: brand.accent,
    backgroundColor: brand.accentTint,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  currentBadge: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.accentDark,
    backgroundColor: brand.surfaceElevated,
    borderRadius: brand.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  priceBig: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.muted,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feature: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
  },
  promoCard: {
    borderRadius: brand.radius.md,
    backgroundColor: '#F3E0D8',
    padding: 14,
    gap: 8,
  },
  promoHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  promoTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: '#6B3F2E',
  },
  promoTag: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: '#6B3F2E',
    letterSpacing: 0.5,
  },
  promoBody: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B3F2E',
  },
  verifyNote: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  verifyNoteText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.accentDark,
  },
});
