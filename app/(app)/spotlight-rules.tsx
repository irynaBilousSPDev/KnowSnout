import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { getSpotlightRules } from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Spotlight · Умови конкурсу. */
export default function SpotlightRulesScreen() {
  const rules = getSpotlightRules();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.rulesTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.card}>
            <Text style={styles.body}>{rules}</Text>
          </View>
          <View style={styles.prize}>
            <Text style={styles.prizeLabel}>{t('spotlight.prizeLabel')}</Text>
            <Text style={styles.prizeValue}>{t('spotlight.prizeValue')}</Text>
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
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    lineHeight: 21,
    color: brand.ink,
  },
  prize: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  prizeLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  prizeValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
});
