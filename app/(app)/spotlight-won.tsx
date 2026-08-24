import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { shareText } from '@/src/lib/share';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.23 — centered win, no chrome */
export default function SpotlightWonScreen() {
  const name = 'Тукан';

  return (
    <AppScreen edges={['bottom']}>
      <View style={styles.body}>
        <View style={styles.avatar} />
        <View style={styles.badge}>
          <Text style={styles.badgeT}>{t('spotlight.weekWinner')}</Text>
        </View>
        <Text style={styles.headline}>
          {t('spotlight.wonName', { name })}
        </Text>
        <Text style={styles.meta}>{t('spotlight.wonMeta')}</Text>
        <View style={styles.cta}>
          <PrimaryButton
            label={t('spotlight.shareWin')}
            onPress={() =>
              void shareText({
                title: name,
                message: t('spotlight.shareWinMessage', { name }),
              })
            }
          />
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  avatar: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: brand.creamDeep,
  },
  badge: {
    borderRadius: 999,
    backgroundColor: brand.successTint,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  badgeT: { fontFamily: fonts.bodySemi, fontSize: 13, color: brand.successDark },
  headline: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    textAlign: 'center',
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.muted,
    textAlign: 'center',
  },
  cta: { width: '100%', marginTop: 4 },
});
