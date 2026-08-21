import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  getSettingsPrefs,
  saveSettingsPrefs,
  type AppLanguage,
  type SettingsPrefs,
  type ThemePref,
} from '@/src/services/settingsPrefs';
import { brand } from '@/src/theme/brand';

const LANGS: { id: AppLanguage; label: string }[] = [
  { id: 'uk', label: 'Українська' },
  { id: 'pl', label: 'Polski' },
  { id: 'en', label: 'English' },
];

export default function SettingsScreen() {
  const [prefs, setPrefs] = useState<SettingsPrefs | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getSettingsPrefs().then(setPrefs);
    }, []),
  );

  const setLanguage = async (language: AppLanguage) => {
    const next = await saveSettingsPrefs({ language });
    setPrefs(next);
  };

  const toggleTheme = async () => {
    if (!prefs) return;
    const theme: ThemePref = prefs.theme === 'dark' ? 'light' : 'dark';
    const next = await saveSettingsPrefs({ theme });
    setPrefs(next);
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('settings.title')}
            subtitle={t('settings.subtitle')}
          />

          <Text style={styles.section}>{t('settings.language')}</Text>
          <Text style={styles.hint}>{t('settings.languageHint')}</Text>
          <View style={styles.row}>
            {LANGS.map((lang) => {
              const active = prefs?.language === lang.id;
              return (
                <Pressable
                  key={lang.id}
                  onPress={() => void setLanguage(lang.id)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                  >
                    {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.section}>{t('settings.theme')}</Text>
          <ListRow
            title={t('settings.themeToggle')}
            subtitle={t('settings.themeHint')}
            meta={
              prefs?.theme === 'dark'
                ? t('settings.themeDark')
                : t('settings.themeLight')
            }
            leading={
              <Ionicons
                name="moon-outline"
                size={22}
                color={brand.tealPressed}
              />
            }
            onPress={() => void toggleTheme()}
            showChevron={false}
          />

          <Text style={styles.section}>{t('settings.links')}</Text>
          <ListRow
            title={t('settings.notifications')}
            onPress={() => router.push('/(app)/notifications' as never)}
          />
          <ListRow
            title={t('settings.help')}
            onPress={() => router.push('/(app)/help' as never)}
          />
          <ListRow
            title={t('settings.privacy')}
            onPress={() => router.push('/(app)/privacy' as never)}
          />
          <ListRow
            title={t('settings.subscription')}
            onPress={() => router.push('/(app)/subscription' as never)}
          />
          <ListRow
            title={t('settings.editAccount')}
            onPress={() => router.push('/(app)/edit-account' as never)}
          />
          <ListRow
            title={t('settings.blocked')}
            onPress={() => router.push('/(app)/blocked-users' as never)}
          />
          <ListRow
            title={t('settings.deleteAccount')}
            onPress={() => router.push('/(app)/delete-account' as never)}
          />
          <ListRow
            title={t('settings.adminLink')}
            subtitle={t('settings.adminHint')}
            onPress={() => router.push('/(admin)' as never)}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A7A72',
  },
  hint: {
    marginBottom: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: '#5A7A72',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: brand.tealPressed,
    borderColor: brand.tealPressed,
  },
  chipText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: brand.ink,
  },
  chipTextActive: { color: brand.surface },
});
