import AsyncStorage from '@react-native-async-storage/async-storage';
import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

const SEEN_KEY = 'knowsnout.onboarding.seen';

const STEPS = [
  { titleKey: 'onboarding.step1Title', bodyKey: 'onboarding.step1Body' },
  { titleKey: 'onboarding.step2Title', bodyKey: 'onboarding.step2Body' },
  { titleKey: 'onboarding.step3Title', bodyKey: 'onboarding.step3Body' },
] as const;

async function markSeen() {
  await AsyncStorage.setItem(SEEN_KEY, 'true');
}

/** Screenshots 01.01–01.03 · Онбординг. */
export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const last = step >= STEPS.length - 1;
  const current = STEPS[step]!;

  const dots = useMemo(
    () =>
      STEPS.map((_, index) => (
        <View
          key={index}
          style={[styles.dot, index === step && styles.dotActive]}
        />
      )),
    [step],
  );

  if (user) {
    return <Redirect href="/(app)/(tabs)" />;
  }

  const finish = async () => {
    setSaving(true);
    try {
      await markSeen();
      router.replace('/(auth)/login');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <AppChromeHeader
          trailing="bell"
          bellCount={3}
          onBrandPress={() => undefined}
          onBellPress={() => undefined}
        />
        <View style={styles.skipRow}>
          <Pressable onPress={() => void finish()} disabled={saving}>
            <Text style={styles.skip}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.center}>
          <View style={styles.illustration}>
            <Ionicons name="image-outline" size={36} color={brand.mutedSoft} />
            <Text style={styles.illustrationLabel}>
              {t('onboarding.illustration')}
            </Text>
          </View>
          <Text style={styles.title}>{t(current.titleKey)}</Text>
          <Text style={styles.body}>{t(current.bodyKey)}</Text>
          <View style={styles.dots}>{dots}</View>
        </View>

        <View style={styles.footer}>
          {last ? (
            <PrimaryButton
              label={t('onboarding.done')}
              onPress={() => void finish()}
              loading={saving}
              size="lg"
            />
          ) : (
            <PrimaryButton
              label={t('onboarding.next')}
              onPress={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
              size="lg"
            />
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.canvas },
  safe: { flex: 1 },
  skipRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    alignItems: 'flex-end',
  },
  skip: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20,
  },
  illustration: {
    height: 220,
    width: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  illustrationLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 24,
    lineHeight: 30,
    color: brand.ink,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: brand.muted,
    textAlign: 'center',
    maxWidth: 280,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.mistBorder,
  },
  dotActive: {
    width: 22,
    borderRadius: 999,
    backgroundColor: brand.accent,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
});
