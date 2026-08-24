import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/src/components/AuthShell';
import { AuthTextField } from '@/src/components/AuthTextField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** 01.04 · Реєстрація. */
export default function RegisterScreen() {
  const { user, loading: authLoading, signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!authLoading && user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const onSubmit = async () => {
    setError(null);
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (password.length < 6) {
      setError(t('auth.passwordShort'));
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={t('auth.registerTitle')}
      onBack={() => router.replace('/(auth)/login')}
    >
      <AuthTextField
        label={t('auth.displayName')}
        value={displayName}
        onChangeText={setDisplayName}
        placeholder="Марта"
        autoCapitalize="words"
        returnKeyType="next"
      />
      <AuthTextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder="marta@пошта.ua"
        keyboardType="email-address"
        returnKeyType="next"
      />
      <AuthTextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        placeholder="••••••••"
        secureTextEntry
        returnKeyType="go"
        onSubmitEditing={() => void onSubmit()}
      />

      <Text style={styles.legal}>
        {t('auth.legalPrefix')}
        <Text style={styles.legalLink}>{t('auth.legalTerms')}</Text>
        {t('auth.legalAnd')}
        <Text style={styles.legalLink}>{t('auth.legalPrivacy')}</Text>
      </Text>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <PrimaryButton
        label={t('auth.register')}
        onPress={() => void onSubmit()}
        loading={loading}
        size="md"
        style={styles.cta}
      />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  legal: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 18,
    color: brand.muted,
  },
  legalLink: {
    fontFamily: fonts.bodySemi,
    color: brand.accentDark,
    textDecorationLine: 'underline',
  },
  cta: { marginTop: 4 },
  errorBox: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: brand.radius.md,
    backgroundColor: 'rgba(217, 83, 79, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.25)',
  },
  errorText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: brand.error,
  },
});
