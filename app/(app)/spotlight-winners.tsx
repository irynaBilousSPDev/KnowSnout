import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { listSpotlightWinners } from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Spotlight · Історія переможців. */
export default function SpotlightWinnersScreen() {
  const winners = listSpotlightWinners();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.titlePad}>
        <Text style={styles.title}>{t('spotlight.winnersTitle')}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {winners.map((w) => (
            <View key={w.contestId} style={styles.card}>
              <View style={styles.avatar}>
                <Ionicons name="trophy" size={22} color={brand.accentDark} />
              </View>
              <View style={styles.copy}>
                <Text style={styles.name}>
                  {w.petName} — «{w.contestTitle}»
                </Text>
                <Text style={styles.meta}>
                  {w.author} · {w.votes} {t('spotlight.votes')}
                </Text>
              </View>
            </View>
          ))}
          {winners.length === 0 ? (
            <Text style={styles.empty}>{t('spotlight.winnersEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titlePad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 20,
    lineHeight: 26,
    color: brand.ink,
  },
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  meta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
