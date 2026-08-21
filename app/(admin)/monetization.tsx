import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';

export default function MonetizationScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('admin.monetization')}
            subtitle={t('admin.stubBody')}
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
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#5A7A72',
  },
});
