import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/src/components/AuthShell';
import { AuthTextField } from '@/src/components/AuthTextField';
import { GradientButton } from '@/src/components/GradientButton';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { env } from '@/src/lib/env';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “2 · Реєстрація”. */
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
      router.replace('/(app)/onboarding' as never);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={t('auth.registerTitle')}
      badge={env.isDemoMode ? t('auth.demoModeShort') : null}
      onBack={() => router.replace('/(auth)/login')}
      footer={
        <View style={styles.footer}>
          <Text style={styles.legal}>
            {t('auth.legalPrefix')}
            <Text
              style={styles.legalLink}
              onPress={() => router.push('/(app)/data-sources' as never)}
            >
              {t('auth.legalTerms')}
            </Text>
            {t('auth.legalAnd')}
            <Text
              style={styles.legalLink}
              onPress={() => router.push('/(app)/privacy' as never)}
            >
              {t('auth.legalPrivacy')}
            </Text>
          </Text>
          <GradientButton
            label={t('auth.register')}
            onPress={() => void onSubmit()}
            loading={loading}
          />
          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.linkWrap} accessibilityRole="link">
              <Text style={styles.linkMuted}>
                {t('auth.haveAccount')}{' '}
                <Text style={styles.linkStrong}>{t('auth.signIn')}</Text>
              </Text>
            </Pressable>
          </Link>
          {env.isDemoMode ? (
            <Text style={styles.demoHint}>{t('auth.demoMode')}</Text>
          ) : null}
        </View>
      }
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

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  footer: { gap: 12 },
  linkWrap: { paddingVertical: 4 },
  linkMuted: {
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  linkStrong: {
    fontFamily: fonts.bodyBold,
    color: brand.accent,
  },
  legal: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 18,
    color: brand.muted,
  },
  legalLink: {
    fontFamily: fonts.bodySemi,
    color: brand.accent,
  },
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
  demoHint: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.muted,
  },
});
