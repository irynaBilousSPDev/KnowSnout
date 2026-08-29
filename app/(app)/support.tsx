import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { submitSupportTicket } from '@/src/services/supportTickets';
import { brand, fonts } from '@/src/theme/brand';

/** 07.11 · Звернення в підтримку */
export default function SupportScreen() {
  const [subject, setSubject] = useState('Проблема зі скануванням');
  const [message, setMessage] = useState(
    'Штрихкод не розпізнається на упаковці Brit Care…',
  );
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!subject.trim() || !message.trim()) {
      notify(t('common.error'), t('support.required'));
      return;
    }
    setBusy(true);
    try {
      await submitSupportTicket({ subject, message, email: '' });
      notify(t('common.ok'), t('support.saved'));
      router.back();
    } catch {
      notify(t('common.error'), t('support.error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.actionBar}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.barTitle}>{t('support.title')}</Text>
        <Pressable onPress={() => void submit()} disabled={busy}>
          <Text style={styles.send}>{t('support.send')}</Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.label}>{t('support.subject')}</Text>
          <TextInput
            value={subject}
            onChangeText={setSubject}
            style={styles.input}
            placeholderTextColor={brand.mutedSoft}
          />

          <Text style={styles.label}>{t('support.message')}</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            multiline
            style={[styles.input, styles.area]}
            placeholderTextColor={brand.mutedSoft}
          />

          <PrimaryButton
            label={t('support.addScreenshot')}
            variant="secondary"
            icon={<Ionicons name="image-outline" size={18} color={brand.ink} />}
            onPress={() =>
              Alert.alert(t('support.addScreenshot'), t('support.screenshotSoon'))
            }
            style={styles.attachBtn}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cancel: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.muted,
    width: 80,
  },
  barTitle: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
  },
  send: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.accentDark,
    width: 80,
    textAlign: 'right',
  },
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 8,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  area: { minHeight: 120, textAlignVertical: 'top' },
  attachBtn: { marginTop: 8 },
});
