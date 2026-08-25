import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { listLeaderboard } from '@/src/services/gamification';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.09 — Рейтинг */
export default function QuizLeaderboardScreen() {
  const [tab, setTab] = useState<'friends' | 'global'>('friends');
  const rows = listLeaderboard();

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView contentContainerStyle={styles.pad}>
        <Text style={styles.title}>{t('leaderboard.title')}</Text>
        <View style={styles.seg}>
          <Pressable
            onPress={() => setTab('friends')}
            style={[styles.segBtn, tab === 'friends' && styles.segOn]}
          >
            <Text style={[styles.segT, tab === 'friends' && styles.segTOn]}>
              {t('leaderboard.friends')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('global')}
            style={[styles.segBtn, tab === 'global' && styles.segOn]}
          >
            <Text style={[styles.segT, tab === 'global' && styles.segTOn]}>
              {t('leaderboard.global')}
            </Text>
          </Pressable>
        </View>

        {rows.map((row) => (
          <View
            key={row.id}
            style={[styles.card, (row.rank === 1 || row.me) && styles.cardHi]}
          >
            <Text style={styles.rank}>{row.rank}</Text>
            <UserAvatar size={40} name={row.name} />
            <View style={styles.meta}>
              <Text style={styles.name}>
                {row.me ? t('leaderboard.youName', { name: row.name }) : row.name}
              </Text>
              <Text style={styles.streak}>
                {t('leaderboard.streak', {
                  count: row.streakDays ?? (row.rank === 1 ? 21 : 9),
                })}
              </Text>
            </View>
            <Text style={styles.xp}>
              {row.xp.toLocaleString('uk-UA')} XP
            </Text>
          </View>
        ))}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 },
  title: {
    fontFamily: fonts.titleExtra,
    fontSize: 26,
    color: brand.ink,
    marginBottom: 14,
  },
  seg: {
    flexDirection: 'row',
    backgroundColor: brand.creamDeep,
    borderRadius: 999,
    padding: 4,
    marginBottom: 16,
  },
  segBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  segOn: {
    backgroundColor: brand.surfaceElevated,
    shadowColor: brand.shadow.color,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segT: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.muted,
  },
  segTOn: { color: brand.ink },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  },
  cardHi: { backgroundColor: brand.accentTint },
  rank: {
    width: 20,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
    textAlign: 'center',
  },
  meta: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  streak: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  xp: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.accent,
  },
});
