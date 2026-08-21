import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

const ROWS = [
  { title: 'KnowSnout Plus', meta: 'Free / Plus' },
  { title: 'AI-скани ліміт', meta: 'мок' },
];

/** HTML kit · Admin monetization. */
export default function MonetizationScreen() {
  return (
    <AppScreen edges={['bottom', 'top']}>
      <AppChromeHeader />
      <ScrHeader title={t('admin.monetization')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.lead}>{t('admin.stubBody')}</Text>
          {ROWS.map((row) => (
            <View key={row.title} style={styles.card}>
              <Text style={styles.title}>{row.title}</Text>
              <Text style={styles.meta}>{row.meta}</Text>
            </View>
          ))}
          <Text style={styles.hint}>{t('admin.stubHint')}</Text>
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
  lead: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
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
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  meta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  hint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
});
