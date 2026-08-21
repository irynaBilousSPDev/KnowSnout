import { router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Видалення акаунта. */
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
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('deleteAccount.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.sub}>{t('deleteAccount.subtitle')}</Text>
          <View style={styles.card}>
            <Text style={styles.body}>{t('deleteAccount.lead')}</Text>
          </View>
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
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  sub: {
    marginBottom: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
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
  gap: { height: 16 },
});
