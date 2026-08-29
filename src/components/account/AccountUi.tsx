import { StyleSheet, Text, View } from 'react-native';

import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** 07.08 / 07.07 — dashed avatar slot. */
export function AccountDashedAvatar({ size = 96 }: { size?: number }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={styles.label}>{t('account.avatarLabel')}</Text>
      <Text style={styles.browse}>{t('account.browseFiles')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    backgroundColor: brand.surfaceElevated,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.muted,
    textAlign: 'center',
  },
  browse: {
    fontFamily: fonts.body,
    fontSize: 9,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
});
