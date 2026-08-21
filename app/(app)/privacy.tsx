import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

export default function PrivacyScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('privacy.title')}
            subtitle={t('privacy.subtitle')}
          />
          <Text style={styles.body}>{t('privacy.body')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
});
