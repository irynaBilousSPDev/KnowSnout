import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as Notifications from 'expo-notifications';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
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

/** 08.01 · Сповіщення */
export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<SettingsPrefs | null>(null);
  const [needsOsPermission, setNeedsOsPermission] = useState(false);

  const load = useCallback(async () => {
    const next = await getSettingsPrefs();
    setPrefs(next);
    if (Platform.OS === 'web') {
      setNeedsOsPermission(false);
      return;
    }
    const perm = await Notifications.getPermissionsAsync();
    setNeedsOsPermission(perm.status !== 'granted');
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
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
          {needsOsPermission ? (
            <View style={styles.banner}>
              <Text style={styles.bannerTitle}>{t('permission.notifyTitle')}</Text>
              <Text style={styles.bannerBody}>{t('permission.notifyBody')}</Text>
              <PrimaryButton
                label={t('permission.enableNotify')}
                size="sm"
                onPress={() =>
                  router.push('/(app)/notification-permission' as never)
                }
              />
            </View>
          ) : null}

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

          <Pressable
            onPress={() => router.push('/(app)/blocked-users' as never)}
            style={styles.linkRow}
          >
            <Text style={styles.linkLabel}>{t('blocked.title')}</Text>
            <Text style={styles.linkChevron}>›</Text>
          </Pressable>
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
  banner: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 8,
  },
  bannerTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  bannerBody: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 18,
    color: brand.muted,
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
    marginTop: 4,
  },
  linkLabel: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  linkChevron: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: brand.mutedSoft,
  },
});
