import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getSettingsPrefs,
  saveSettingsPrefs,
  type AppLanguage,
  type SettingsPrefs,
} from '@/src/services/settingsPrefs';
import { brand, fonts } from '@/src/theme/brand';
import { useAppTheme } from '@/src/theme/AppThemeProvider';

const LANGS: {
  id: AppLanguage | 'de' | 'es';
  label: string;
  soon?: boolean;
}[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'pl', label: 'Polski' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch', soon: true },
  { id: 'es', label: 'Español', soon: true },
];

/** 07.01 · Мова та підписка */
export default function SettingsScreen() {
  const { refreshTheme } = useAppTheme();
  const [prefs, setPrefs] = useState<SettingsPrefs | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getSettingsPrefs().then(setPrefs);
    }, []),
  );

  const setLanguage = async (language: AppLanguage) => {
    const next = await saveSettingsPrefs({ language });
    setPrefs(next);
    await refreshTheme();
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('settings.langAndPlan')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.fieldLbl}>{t('settings.languageUi')}</Text>
          <View style={styles.langCard}>
            {LANGS.map((lang, i) => {
              const active =
                !lang.soon && prefs?.language === (lang.id as AppLanguage);
              return (
                <Pressable
                  key={lang.id}
                  disabled={lang.soon}
                  onPress={() => {
                    if (!lang.soon) void setLanguage(lang.id as AppLanguage);
                  }}
                  style={[
                    styles.langRow,
                    i < LANGS.length - 1 && styles.langRowBorder,
                  ]}
                >
                  <Text style={[styles.langLabel, lang.soon && styles.langSoon]}>
                    {lang.label}
                  </Text>
                  {lang.soon ? (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>{t('settings.soon')}</Text>
                    </View>
                  ) : active ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={brand.successDark}
                    />
                  ) : null}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.plusCard}>
            <Text style={styles.plusTitle}>{t('subscription.plan.plus')}</Text>
            <Text style={styles.plusBody}>{t('subscription.plusPitch')}</Text>
            <PrimaryButton
              label={t('subscription.getPlus')}
              onPress={() => router.push('/(app)/payments' as never)}
            />
          </View>

          <Pressable
            onPress={() => router.push('/(app)/payments' as never)}
            style={styles.linkRow}
          >
            <Text style={styles.linkRowLabel}>{t('payments.title')}</Text>
            <Ionicons name="chevron-forward" size={14} color={brand.mutedSoft} />
          </Pressable>

          <Pressable
            onPress={() => router.push('/(app)/appearance' as never)}
            style={styles.linkRow}
          >
            <Text style={styles.linkRowLabel}>{t('appearance.title')}</Text>
            <Ionicons name="chevron-forward" size={14} color={brand.mutedSoft} />
          </Pressable>

          <View style={styles.planRow}>
            <Text style={styles.planLabel}>{t('subscription.currentPlan')}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>{t('subscription.plan.free')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  fieldLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginBottom: -4,
  },
  langCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  langRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  langLabel: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  langSoon: { color: brand.mutedSoft },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10.5,
    color: brand.ink,
  },
  plusCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 6,
  },
  plusTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.accentDark,
  },
  plusBody: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.accentDark,
    marginBottom: 6,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  planLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  linkRowLabel: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
});
