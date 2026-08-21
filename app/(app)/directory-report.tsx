import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { queueFraudReport } from '@/src/services/directoryReviews';
import { brand, fonts } from '@/src/theme/brand';

const REASONS = [
  'directories.reportReasonFalse',
  'directories.reportReasonFraud',
  'directories.reportReasonAnimal',
] as const;

/** HTML phone “F6 · Повідомити про шахрайство”. */
export default function DirectoryReportScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [reasonKey, setReasonKey] = useState<string>(REASONS[0]);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      await queueFraudReport({
        placeId: id || 'general',
        reason: t(reasonKey),
        details: '',
      });
      notify(t('common.ok'), t('directories.reportSaved'));
      router.back();
    } catch {
      notify(t('common.error'), t('directories.reportError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('directories.reportProblem')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.hint}>{t('directories.reportSubtitle')}</Text>
          {REASONS.map((key) => {
            const active = reasonKey === key;
            return (
              <Pressable
                key={key}
                onPress={() => setReasonKey(key)}
                style={[styles.row, active && styles.rowActive]}
              >
                <Text style={[styles.rowText, active && styles.rowTextActive]}>
                  {t(key)}
                </Text>
              </Pressable>
            );
          })}
          <PrimaryButton
            label={t('directories.submitReport')}
            loading={busy}
            onPress={() => void submit()}
            style={styles.btn}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    marginBottom: 4,
  },
  row: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  rowActive: {
    backgroundColor: brand.accentTint,
  },
  rowText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  rowTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.accentDark,
  },
  btn: { marginTop: 6 },
});
