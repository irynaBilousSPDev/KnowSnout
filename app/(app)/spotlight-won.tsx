import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { shareText } from '@/src/lib/share';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.23 — win celebration, no chrome header */
export default function SpotlightWonScreen() {
  const name = 'Тукан';

  return (
    <AppScreen edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.avatar}>
          <Ionicons name="image-outline" size={32} color={brand.mutedSoft} />
          <Text style={styles.avatarHint}>{name}</Text>
        </View>

        <View style={styles.badge}>
          <Ionicons name="trophy" size={14} color={brand.accent} />
          <Text style={styles.badgeT}>{t('spotlight.weekWinner')}</Text>
        </View>

        <Text style={styles.headline}>{t('spotlight.wonName', { name })}</Text>
        <Text style={styles.meta}>{t('spotlight.wonMeta')}</Text>

        <View style={styles.cta}>
          <PrimaryButton
            label={t('spotlight.shareWin')}
            size="lg"
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
    paddingHorizontal: 28,
    gap: 14,
  },
  avatar: {
    width: 168,
    height: 168,
    borderRadius: 84,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
  },
  avatarHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeT: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accent,
  },
  headline: {
    fontFamily: fonts.title,
    fontSize: 24,
    color: brand.ink,
    textAlign: 'center',
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
    textAlign: 'center',
    marginBottom: 8,
  },
  cta: { width: '100%', marginTop: 8 },
});
