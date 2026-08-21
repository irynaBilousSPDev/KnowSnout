import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  getGamification,
  type GamificationState,
} from '@/src/services/gamification';
import { brand, fonts } from '@/src/theme/brand';

export default function AchievementsScreen() {
  const [state, setState] = useState<GamificationState | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getGamification().then(setState);
    }, []),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('achievements.title')}
            subtitle={t('achievements.subtitle')}
          />
          <View style={styles.xpCard}>
            <Text style={styles.xpLabel}>{t('achievements.xp')}</Text>
            <Text style={styles.xpValue}>{state?.xp ?? '—'}</Text>
          </View>
          <Text style={styles.section}>{t('achievements.badges')}</Text>
          {(state?.badges ?? []).map((b) => (
            <ListRow
              key={b.id}
              title={b.title}
              subtitle={b.body}
              meta={
                b.unlocked
                  ? t('achievements.unlocked')
                  : t('achievements.locked')
              }
              leading={
                <Ionicons
                  name={b.unlocked ? 'ribbon' : 'lock-closed-outline'}
                  size={22}
                  color={b.unlocked ? brand.accent : brand.mutedSoft}
                />
              }
              showChevron={false}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  xpCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.mist,
    padding: 18,
    marginBottom: 8,
  },
  xpLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.accentDark,
  },
  xpValue: {
    marginTop: 6,
    fontFamily: fonts.title,
    fontSize: 32,
    lineHeight: 38,
    color: brand.ink,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.muted,
  },
});
