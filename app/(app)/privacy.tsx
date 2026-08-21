import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Приватність. */
export default function PrivacyScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('privacy.title')}
            lead={t('privacy.subtitle')}
          />
          <View style={styles.card}>
            <Text style={styles.body}>{t('privacy.body')}</Text>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    borderRadius: brand.radius.lg,
    backgroundColor: brand.surfaceElevated,
    padding: 16,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
});
