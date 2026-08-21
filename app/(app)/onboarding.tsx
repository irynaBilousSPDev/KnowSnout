import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

const SEEN_KEY = 'knowsnout.onboarding.seen';

const STEPS = [
  { titleKey: 'onboarding.step1Title', bodyKey: 'onboarding.step1Body' },
  { titleKey: 'onboarding.step2Title', bodyKey: 'onboarding.step2Body' },
  { titleKey: 'onboarding.step3Title', bodyKey: 'onboarding.step3Body' },
] as const;

async function markSeen() {
  await AsyncStorage.setItem(SEEN_KEY, 'true');
}

export default function OnboardingScreen() {
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

  const finish = async () => {
    setSaving(true);
    try {
      await markSeen();
      router.replace('/(app)/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <View style={styles.pad}>
        <View style={styles.topRow}>
          <Text style={styles.kicker}>
            {step + 1} / {STEPS.length}
          </Text>
          <Pressable
            onPress={() => void finish()}
            disabled={saving}
            style={({ pressed }) => pressed && styles.pressed}
            accessibilityRole="button"
          >
            <Text style={styles.skip}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t(current.titleKey)}</Text>
          <Text style={styles.body}>{t(current.bodyKey)}</Text>
        </View>

        <View style={styles.dots}>{dots}</View>

        <View style={styles.actions}>
          {last ? (
            <PrimaryButton
              label={t('onboarding.done')}
              onPress={() => void finish()}
              loading={saving}
            />
          ) : (
            <PrimaryButton
              label={t('onboarding.next')}
              onPress={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
            />
          )}
          {step > 0 ? (
            <View style={styles.backWrap}>
              <PrimaryButton
                label={t('common.back')}
                variant="ghost"
                onPress={() => setStep((s) => Math.max(0, s - 1))}
              />
            </View>
          ) : null}
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  kicker: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#8A9AAB',
  },
  skip: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: brand.navy,
  },
  pressed: { opacity: 0.75 },
  card: {
    flex: 1,
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 22,
    paddingVertical: 28,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    lineHeight: 34,
    color: brand.ink,
    letterSpacing: -0.4,
  },
  body: {
    marginTop: 14,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: brand.muted,
  },
  dots: {
    marginTop: 20,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: brand.mistBorder,
  },
  dotActive: {
    width: 22,
    backgroundColor: brand.navy,
  },
  actions: { gap: 8 },
  backWrap: { marginTop: 4 },
});
