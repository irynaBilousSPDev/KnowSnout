import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getGamification,
  type Badge,
  type GamificationState,
} from '@/src/services/gamification';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.10 — 2×2 tall achievement cards */
export default function AchievementsScreen() {
  const [state, setState] = useState<GamificationState | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getGamification().then(setState);
    }, []),
  );

  const badges = state?.badges ?? [];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('achievements.title')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.grid}>
          {badges.map((b) => (
            <BadgeCard key={b.id} badge={b} />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const locked = !badge.unlocked;
  return (
    <View style={[styles.card, locked && styles.cardLocked]}>
      <View style={styles.iconWrap}>
        {badge.icon === 'scans' ? (
          <View style={[styles.scanCircle, locked && styles.scanCircleLocked]}>
            <Text style={[styles.scanNum, locked && styles.textLocked]}>
              {badge.progressLabel ?? '0'}
            </Text>
          </View>
        ) : (
          <View style={[styles.iconCircle, locked && styles.iconCircleLocked]}>
            <Ionicons
              name={
                badge.icon === 'ribbon'
                  ? 'ribbon'
                  : badge.icon === 'chat'
                    ? 'chatbubble-ellipses-outline'
                    : 'trophy-outline'
              }
              size={badge.icon === 'ribbon' ? 22 : 24}
              color={locked ? brand.mutedSoft : brand.accent}
            />
          </View>
        )}
      </View>
      <Text style={[styles.cardTitle, locked && styles.textLocked]}>
        {badge.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47%',
    flexGrow: 1,
    minHeight: 168,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  cardLocked: {
    opacity: 0.55,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: brand.mist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleLocked: {
    backgroundColor: brand.creamDeep,
  },
  scanCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: brand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanCircleLocked: {
    backgroundColor: brand.mutedSoft,
  },
  scanNum: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: '#FFFFFF',
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
    textAlign: 'center',
  },
  textLocked: {
    color: brand.muted,
  },
});
