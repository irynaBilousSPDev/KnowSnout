import { Link, Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthShell } from '@/src/components/AuthShell';
import { AuthTextField } from '@/src/components/AuthTextField';
import { GradientButton } from '@/src/components/GradientButton';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { env } from '@/src/lib/env';
import { brand } from '@/src/theme/brand';

export default function LoginScreen() {
  const { user, loading: authLoading, signIn } = useAuth();
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
    if (!password) {
      setError(t('auth.passwordRequired'));
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(app)/(tabs)');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.signInError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      headline={t('auth.loginHeadline')}
      subtitle={t('auth.loginSubtitle')}
      badge={env.isDemoMode ? t('auth.demoModeShort') : null}
      footer={
        <View>
          <GradientButton
            label={t('auth.signIn')}
            onPress={() => void onSubmit()}
            loading={loading}
          />
          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.linkWrap} accessibilityRole="link">
              <Text style={styles.linkMuted}>
                {t('auth.noAccount')}{' '}
                <Text style={styles.linkStrong}>{t('auth.createAccount')}</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      }
    >
      <AuthTextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        placeholder="you@email.com"
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

      {env.isDemoMode ? (
        <Text style={styles.demoHint}>{t('auth.demoMode')}</Text>
      ) : null}
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  linkWrap: {
    marginTop: 16,
    paddingVertical: 4,
  },
  linkMuted: {
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#3A5A54',
  },
  linkStrong: {
    fontFamily: 'DMSans_700Bold',
    color: brand.tealPressed,
  },
  errorBox: {
    marginTop: 4,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: 'rgba(196, 92, 62, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(196, 92, 62, 0.25)',
  },
  errorText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 13,
    lineHeight: 18,
    color: brand.score.poor,
  },
  demoHint: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#5A7A72',
  },
});
