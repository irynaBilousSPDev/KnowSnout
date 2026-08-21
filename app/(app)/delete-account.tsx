import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { brand } from '@/src/theme/brand';

export default function DeleteAccountScreen() {
  const confirmDelete = () => {
    Alert.alert(t('deleteAccount.confirmTitle'), t('deleteAccount.confirmBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('deleteAccount.confirmAction'),
        style: 'destructive',
        onPress: () => {
          notify(t('deleteAccount.doneTitle'), t('deleteAccount.doneBody'));
          router.back();
        },
      },
    ]);
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('deleteAccount.title')}
            subtitle={t('deleteAccount.subtitle')}
          />
          <Text style={styles.body}>{t('deleteAccount.lead')}</Text>
          <View style={styles.gap} />
          <PrimaryButton
            label={t('deleteAccount.confirmAction')}
            variant="danger"
            onPress={confirmDelete}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  body: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  gap: { height: 16 },
});
