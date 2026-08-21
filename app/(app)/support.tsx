import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { submitSupportTicket } from '@/src/services/supportTickets';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Підтримка — soft inputs, accent CTA. */
export default function SupportScreen() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      notify(t('common.error'), t('support.required'));
      return;
    }
    setBusy(true);
    try {
      await submitSupportTicket({ subject, message, email });
      setSubject('');
      setMessage('');
      setEmail('');
      notify(t('common.ok'), t('support.saved'));
    } catch {
      notify(t('common.error'), t('support.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('support.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.sub}>{t('support.subtitle')}</Text>
          <Text style={styles.label}>{t('support.email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('support.emailPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.label}>{t('support.subject')}</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t('support.subjectPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          <Text style={styles.label}>{t('support.message')}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('support.messagePlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={[styles.input, styles.area]}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('support.submit')}
            loading={busy}
            onPress={() => void submit()}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  sub: {
    marginBottom: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 120, textAlignVertical: 'top' },
  gap: { height: 16 },
});
