import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Адмінка · Монетизація. */
export default function MonetizationScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('admin.monetization')}
            lead={t('admin.stubBody')}
          />
          <ListRow title="Plus plan" meta="mock" showChevron={false} />
          <ListRow title="Pro plan" meta="mock" showChevron={false} />
          <Text style={styles.hint}>{t('admin.stubHint')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hint: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
});
