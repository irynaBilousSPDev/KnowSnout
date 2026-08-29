import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getSettingsPrefs,
  saveSettingsPrefs,
  type ThemeMode,
} from '@/src/services/settingsPrefs';
import { useAppTheme } from '@/src/theme/AppThemeProvider';
import { brand, fonts } from '@/src/theme/brand';

const MODES: ThemeMode[] = ['light', 'dark', 'system'];

/** 07.05 · Вигляд — перемикач теми */
export default function AppearanceScreen() {
  const { refreshTheme } = useAppTheme();
  const [mode, setMode] = useState<ThemeMode>('light');

  useFocusEffect(
    useCallback(() => {
      void getSettingsPrefs().then((p) => setMode(p.themeMode));
    }, []),
  );

  const pick = async (next: ThemeMode) => {
    setMode(next);
    await saveSettingsPrefs({ themeMode: next, theme: next === 'dark' ? 'dark' : 'light' });
    await refreshTheme();
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('appearance.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.segment}>
            {MODES.map((m) => {
              const on = mode === m;
              return (
                <Pressable
                  key={m}
                  onPress={() => void pick(m)}
                  style={[styles.segBtn, on && styles.segBtnOn]}
                >
                  <Text style={[styles.segText, on && styles.segTextOn]}>
                    {t(`appearance.mode.${m}`)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.previews}>
            <View style={[styles.preview, styles.previewLight]} />
            <View style={[styles.preview, styles.previewDark]} />
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
    gap: 16,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    borderRadius: brand.radius.pill,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segBtnOn: {
    backgroundColor: brand.surfaceElevated,
    elevation: 1,
  },
  segText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.muted,
  },
  segTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.ink,
  },
  previews: { flexDirection: 'row', gap: 12 },
  preview: {
    flex: 1,
    height: 120,
    borderRadius: brand.radius.md,
    borderWidth: 2,
  },
  previewLight: {
    backgroundColor: brand.surfaceElevated,
    borderColor: brand.accentDark,
  },
  previewDark: {
    backgroundColor: '#1A222C',
    borderColor: brand.mistBorder,
  },
});
