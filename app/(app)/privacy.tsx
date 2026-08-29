import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { DeleteAccountModal } from '@/src/components/account/DeleteAccountModal';
import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** 07.03 · Приватність */
export default function PrivacyScreen() {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const rows = [
    {
      key: 'policy',
      title: t('privacy.policy'),
      danger: false,
      onPress: () => Alert.alert(t('privacy.policy'), t('privacy.body')),
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
      key: 'delete',
      title: t('settings.deleteAccount'),
      danger: true,
      onPress: () => setDeleteOpen(true),
    },
  ];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('privacy.title')} titleSize={20} />
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

      <DeleteAccountModal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
      />
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
    borderWidth: 1,
    borderColor: brand.mistBorder,
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
