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

/** PDF onboarding 1–3: skip, dashed illustration, Caprasimo title, sage pill CTA. */
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
          <Text style={styles.kicker}>
            {step + 1}/{STEPS.length}
          </Text>
          <Pressable
            onPress={() => void finish()}
            disabled={saving}
            accessibilityRole="button"
          >
            <Text style={styles.skip}>{t('onboarding.skip')}</Text>
          </Pressable>
        </View>

        <View style={styles.illustration}>
          <Ionicons name="image-outline" size={36} color={brand.mutedSoft} />
          <Text style={styles.illustrationLabel}>{t('check.illustration')}</Text>
          <Text style={styles.browse}>{t('check.browseFiles')}</Text>
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
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  kicker: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  skip: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: brand.muted,
  },
  illustration: {
    alignSelf: 'center',
    height: 200,
    width: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illustrationLabel: {
    marginTop: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  browse: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.sage,
    textDecorationLine: 'underline',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 28,
    lineHeight: 34,
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
    backgroundColor: brand.creamDeep,
  },
  dotActive: {
    width: 28,
    backgroundColor: brand.sage,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 24,
  },
});
