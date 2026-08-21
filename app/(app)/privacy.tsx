import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “45 · Приватність і джерела даних”. */
export default function PrivacyScreen() {
  const rows = [
    {
      key: 'policy',
      title: t('privacy.policy'),
      danger: false,
      onPress: () =>
        Alert.alert(t('privacy.policy'), t('privacy.body')),
    },
    {
      key: 'sources',
      title: t('sources.open'),
      danger: false,
      onPress: () => router.push('/(app)/data-sources' as never),
    },
    {
      key: 'export',
      title: t('privacy.downloadData'),
      danger: false,
      onPress: () =>
        Alert.alert(t('privacy.downloadData'), t('privacy.downloadSoon')),
    },
    {
      key: 'blocked',
      title: t('settings.blocked'),
      danger: false,
      onPress: () => router.push('/(app)/blocked-users' as never),
    },
    {
      key: 'delete',
      title: t('settings.deleteAccount'),
      danger: true,
      onPress: () => router.push('/(app)/delete-account' as never),
    },
  ];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('privacy.title')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {rows.map((row) => (
            <Pressable
              key={row.key}
              onPress={row.onPress}
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={[styles.label, row.danger && styles.danger]}>
                {row.title}
              </Text>
              {!row.danger ? (
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={brand.mutedSoft}
                />
              ) : null}
            </Pressable>
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
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  label: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  danger: {
    fontFamily: fonts.bodySemi,
    color: brand.terracotta,
  },
});
