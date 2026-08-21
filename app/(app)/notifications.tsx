import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getSettingsPrefs,
  saveSettingsPrefs,
  type SettingsPrefs,
} from '@/src/services/settingsPrefs';
import { brand, fonts } from '@/src/theme/brand';

type ToggleKey =
  | 'notifyVaccines'
  | 'notifyCare'
  | 'notifyQuiz'
  | 'notifyFeed';

const TOGGLES: { key: ToggleKey; titleKey: string }[] = [
  { key: 'notifyVaccines', titleKey: 'notifications.toggleVaccines' },
  { key: 'notifyCare', titleKey: 'notifications.toggleCare' },
  { key: 'notifyQuiz', titleKey: 'notifications.toggleQuiz' },
  { key: 'notifyFeed', titleKey: 'notifications.toggleFeed' },
];

/** HTML phone “43 · Сповіщення”. */
export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<SettingsPrefs | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getSettingsPrefs().then(setPrefs);
    }, []),
  );

  const setToggle = async (key: ToggleKey, value: boolean) => {
    const next = await saveSettingsPrefs({ [key]: value });
    setPrefs(next);
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('notifications.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {TOGGLES.map((item) => (
            <View key={item.key} style={styles.row}>
              <Text style={styles.label}>{t(item.titleKey)}</Text>
              <Switch
                value={prefs?.[item.key] ?? false}
                onValueChange={(v) => void setToggle(item.key, v)}
                trackColor={{
                  false: brand.creamDeep,
                  true: brand.accent,
                }}
                thumbColor="#FFFFFF"
              />
            </View>
          ))}
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
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  label: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
});
