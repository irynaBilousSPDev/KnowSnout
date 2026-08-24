import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/src/components/AuthShell';
import { AuthTextField } from '@/src/components/AuthTextField';
import { t } from '@/src/i18n';
import { requestPasswordReset } from '@/src/services/auth';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 01.06 · Відновлення пароля. */
export default function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(
    typeof params.email === 'string' ? params.email : '',
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSend = async () => {
    setError(null);
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }
    setLoading(true);
    try {
      await requestPasswordReset(email.trim());
      router.push({
        pathname: '/(auth)/verify-code',
        params: { email: email.trim() },
      } as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.resetError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={t('auth.resetTitle')}
      headlineSize={18}
      subtitle={t('auth.resetBody')}
      onBack={() => router.replace('/(auth)/login')}
      footer={
        <Pressable
          onPress={() => router.replace('/(auth)/login')}
          style={styles.footerLink}
        >
          <Text style={styles.footerMuted}>
            {t('auth.rememberPassword')}{' '}
            <Text style={styles.footerStrong}>{t('auth.signIn')}</Text>
          </Text>
        </Pressable>
      }
    >
      <AuthTextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder="marta.k@mail.com"
        keyboardType="email-address"
        returnKeyType="go"
        onSubmitEditing={() => void onSend()}
      />

      <Pressable
        onPress={() => void onSend()}
        disabled={loading}
        style={styles.textCta}
        accessibilityRole="button"
      >
        <Text style={styles.textCtaLabel}>
          {loading ? t('common.loading') : t('auth.sendCode')}
        </Text>
      </Pressable>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>{t('auth.resetOauthHint')}</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  textCta: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  textCtaLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  infoBox: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  infoText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 18,
    color: brand.accentDark,
  },
  footerLink: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerMuted: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.muted,
  },
  footerStrong: {
    fontFamily: fonts.bodyBold,
    color: brand.accentDark,
  },
  errorBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: brand.radius.md,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.error,
  },
});
