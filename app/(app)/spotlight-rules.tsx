import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { getSpotlightRules } from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

export default function SpotlightRulesScreen() {
  const rules = getSpotlightRules();

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('spotlight.rulesTitle')}
            subtitle={t('spotlight.rulesSubtitle')}
          />
          <View style={styles.card}>
            <Text style={styles.body}>{rules}</Text>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
        backgroundColor: brand.surfaceElevated,
    padding: 16,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 24,
    color: brand.ink,
  },
});
