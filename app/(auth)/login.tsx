import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AuthTextField } from '@/src/components/AuthTextField';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { brand, fonts } from '@/src/theme/brand';

const logoEmerald = require('../../assets/images/logo_emerald.png');
const ONBOARDING_KEY = 'knowsnout.onboarding.seen';

/** Screenshot 01.05 · Вхід — centered logo, no app-hd. */
export default function LoginScreen() {
  const { user, loading: authLoading, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingOnboard, setCheckingOnboard] = useState(true);
  const [needOnboard, setNeedOnboard] = useState(false);

  useEffect(() => {
    void AsyncStorage.getItem(ONBOARDING_KEY).then((v) => {
      setNeedOnboard(v !== 'true');
      setCheckingOnboard(false);
    });
  }, []);

  if (!authLoading && user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  if (!checkingOnboard && needOnboard && !user) {
    return <Redirect href={'/(auth)/onboarding' as never} />;
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

  const soon = () => notify(t('common.soon'), t('auth.socialSoon'));

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.hero}>
              <Image
                source={logoEmerald}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.word}>
                <Text style={styles.know}>Know</Text>
                <Text style={styles.snout}>Snout</Text>
              </Text>
              <Text style={styles.welcome}>{t('auth.welcomeBack')}</Text>
            </View>

            <View style={styles.form}>
              <AuthTextField
                label={t('auth.emailOrPhone')}
                value={email}
                onChangeText={setEmail}
                placeholder="marta.k@mail.com"
                keyboardType="email-address"
                returnKeyType="next"
              />
              <AuthTextField
                label={t('auth.password')}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry
                showPasswordToggle
                returnKeyType="go"
                onSubmitEditing={() => void onSubmit()}
              />

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(auth)/forgot-password',
                    params: { email },
                  } as never)
                }
                style={styles.forgotWrap}
              >
                <Text style={styles.forgot}>{t('auth.forgotPassword')}</Text>
              </Pressable>

              {error ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Pressable
                onPress={() => void onSubmit()}
                disabled={loading}
                style={styles.textCta}
                accessibilityRole="button"
              >
                <Text style={styles.textCtaLabel}>
                  {loading ? t('common.loading') : t('auth.signIn')}
                </Text>
              </Pressable>

              <View style={styles.orRow}>
                <View style={styles.orLine} />
                <Text style={styles.orText}>{t('auth.or')}</Text>
                <View style={styles.orLine} />
              </View>

              <Pressable onPress={soon} style={styles.socialBtn}>
                <Ionicons name="logo-google" size={18} color={brand.ink} />
                <Text style={styles.socialLabel}>{t('auth.continueGoogle')}</Text>
              </Pressable>
              <Pressable onPress={soon} style={styles.socialBtn}>
                <Ionicons name="logo-apple" size={18} color={brand.ink} />
                <Text style={styles.socialLabel}>{t('auth.continueApple')}</Text>
              </Pressable>
            </View>

            <Link href="/(auth)/register" asChild>
              <Pressable style={styles.footerLink} accessibilityRole="link">
                <Text style={styles.footerMuted}>
                  {t('auth.noAccountShort')}{' '}
                  <Text style={styles.footerStrong}>
                    {t('auth.registerLink')}
                  </Text>
                </Text>
              </Pressable>
            </Link>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 28,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 32,
    gap: 10,
  },
  logo: { width: 76, height: 76 },
  word: {
    fontFamily: fonts.titleExtra,
    fontSize: 26,
    lineHeight: 30,
    letterSpacing: -0.5,
  },
  know: { color: brand.ink },
  snout: { color: brand.logoGreen },
  welcome: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  form: { gap: 12 },
  forgotWrap: { alignSelf: 'flex-end', paddingRight: 4 },
  forgot: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accentDark,
  },
  textCta: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 4,
  },
  textCtaLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 6,
  },
  orLine: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: brand.mistBorder },
  orText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11.5,
    color: brand.mutedSoft,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    minHeight: 48,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.divider,
    backgroundColor: brand.surfaceElevated,
  },
  socialLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.ink,
  },
  footerLink: {
    marginTop: 'auto',
    paddingTop: 28,
    alignItems: 'center',
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
