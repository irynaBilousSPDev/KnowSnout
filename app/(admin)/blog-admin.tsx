import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';

export default function BlogAdminScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('admin.blog')} subtitle={t('admin.stubBody')} />
          <ListRow title="Draft article" meta="stub" showChevron={false} />
          <ListRow title="Scheduled post" meta="stub" showChevron={false} />
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
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#5A6B7D',
  },
});
