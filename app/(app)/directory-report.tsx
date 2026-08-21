import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { queueFraudReport } from '@/src/services/directoryReviews';
import { brand } from '@/src/theme/brand';

export default function DirectoryReportScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!id) return;
    if (!reason.trim()) {
      notify(t('common.error'), t('directories.reportRequired'));
      return;
    }
    setBusy(true);
    try {
      await queueFraudReport({ placeId: id, reason, details });
      notify(t('common.ok'), t('directories.reportSaved'));
      router.back();
    } catch {
      notify(t('common.error'), t('directories.reportError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('directories.reportTitle')}
            subtitle={t('directories.reportSubtitle')}
          />
          <Text style={styles.label}>{t('directories.reportReason')}</Text>
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder={t('directories.reportReasonPlaceholder')}
            placeholderTextColor="#8AA8A0"
            style={styles.input}
          />
          <Text style={styles.label}>{t('directories.reportDetails')}</Text>
          <TextInput
            value={details}
            onChangeText={setDetails}
            placeholder={t('directories.reportDetailsPlaceholder')}
            placeholderTextColor="#8AA8A0"
            multiline
            style={[styles.input, styles.area]}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('directories.submitReport')}
            loading={busy}
            onPress={() => void submit()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#5A6B7D',
  },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 110, textAlignVertical: 'top' },
  gap: { height: 16 },
});
