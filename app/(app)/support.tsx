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
import { submitSupportTicket } from '@/src/services/supportTickets';
import { brand } from '@/src/theme/brand';

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
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('support.title')}
            subtitle={t('support.subtitle')}
          />
          <Text style={styles.label}>{t('support.email')}</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t('support.emailPlaceholder')}
            placeholderTextColor="#8AA8A0"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Text style={styles.label}>{t('support.subject')}</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder={t('support.subjectPlaceholder')}
            placeholderTextColor="#8AA8A0"
            style={styles.input}
          />
          <Text style={styles.label}>{t('support.message')}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder={t('support.messagePlaceholder')}
            placeholderTextColor="#8AA8A0"
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
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: 'DMSans_500Medium',
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
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  area: { minHeight: 120, textAlignVertical: 'top' },
  gap: { height: 16 },
});
