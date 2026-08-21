import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';

const VERSIONS = [
  { id: 'v3', title: 'Rules UA v3', meta: 'draft' },
  { id: 'v2', title: 'Rules UA v2', meta: 'published' },
  { id: 'v1', title: 'Rules UA v1', meta: 'archived' },
];

export default function AdminCmsScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('admin.cms')} subtitle={t('admin.cmsBody')} />
          <Text style={styles.hint}>{t('admin.cmsHint')}</Text>
          {VERSIONS.map((v) => (
            <ListRow
              key={v.id}
              title={v.title}
              meta={v.meta}
              showChevron={false}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hint: {
    marginBottom: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#5A6B7D',
  },
});
