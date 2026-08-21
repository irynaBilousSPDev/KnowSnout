import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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

/** HTML onboarding 1–3: skip, 220 circle, Manrope H2, teal page dots. */
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
    <AppScreen edges={['top', 'bottom']}>
      <View style={styles.pad}>
        <View style={styles.topRow}>
          <View />
          <Pressable onPress={() => void finish()} disabled={saving}>
            <Text style={styles.skip}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.illustration}>
          <Ionicons name="image-outline" size={36} color={brand.mutedSoft} />
          <Text style={styles.illustrationLabel}>{t('check.illustration')}</Text>
        </View>

        <Text style={styles.title}>{t(current.titleKey)}</Text>
        <Text style={styles.body}>{t(current.bodyKey)}</Text>

        <View style={styles.dots}>{dots}</View>

        <View style={styles.footer}>
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
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 24,
  },
  skip: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  illustration: {
    alignSelf: 'center',
    height: 220,
    width: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  illustrationLabel: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 24,
    lineHeight: 30,
    color: brand.ink,
    textAlign: 'center',
    marginBottom: 10,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  dots: {
    marginTop: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: brand.mistBorder,
  },
  dotActive: {
    width: 28,
    backgroundColor: brand.accent,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
});
