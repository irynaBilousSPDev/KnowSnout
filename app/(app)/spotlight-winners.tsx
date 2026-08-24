import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { listSpotlightWinners } from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.22 */
export default function SpotlightWinnersScreen() {
  const winners = listSpotlightWinners();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.titlePad}>
        <Text style={styles.title}>{t('spotlight.winnersShort')}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {winners.map((w) => (
            <Pressable
              key={w.contestId}
              onPress={() => router.push('/(app)/spotlight-won' as never)}
              style={styles.card}
            >
              <View style={styles.avatar} />
              <View style={styles.copy}>
                <Text style={styles.name}>
                  {w.petName} — «{w.contestTitle}»
                </Text>
                <Text style={styles.meta}>
                  {w.votes === 402
                    ? t('spotlight.winnerRexMeta')
                    : t('spotlight.winnerSonyaMeta')}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titlePad: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  title: { fontFamily: fonts.title, fontSize: 20, color: brand.ink },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.creamDeep,
  },
  copy: { flex: 1 },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: brand.ink },
  meta: { marginTop: 4, fontFamily: fonts.body, fontSize: 12, color: brand.muted },
});
