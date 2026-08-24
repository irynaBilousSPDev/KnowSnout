import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { listSpotlightWinners } from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.22 — Переможці */
export default function SpotlightWinnersScreen() {
  const winners = listSpotlightWinners();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.winnersShort')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {winners.map((w) => (
            <Pressable
              key={w.contestId}
              onPress={() => router.push('/(app)/spotlight-won' as never)}
              style={styles.card}
            >
              <View style={styles.avatar}>
                <Ionicons name="paw-outline" size={18} color={brand.mutedSoft} />
              </View>
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
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 3 },
  name: { fontFamily: fonts.bodyBold, fontSize: 14, color: brand.ink },
  meta: { fontFamily: fonts.body, fontSize: 12.5, color: brand.muted },
});
