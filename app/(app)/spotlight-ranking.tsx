import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  listSpotlightContests,
  listSpotlightEntries,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.21 — Рейтинг */
export default function SpotlightRankingScreen() {
  const { contestId } = useLocalSearchParams<{ contestId?: string }>();
  const [entries, setEntries] = useState<SpotlightEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      const id = contestId || listSpotlightContests()[0]?.id;
      if (!id) return;
      void listSpotlightEntries(id).then(setEntries);
    }, [contestId]),
  );

  const rows = useMemo(() => {
    const sorted = [...entries].sort((a, b) => b.votes - a.votes);
    const top = sorted.filter((e) => !e.mine).slice(0, 2);
    const mine = sorted.find((e) => e.mine) ?? sorted[2];
    const out: { entry: SpotlightEntry; rank: number }[] = top.map((e, i) => ({
      entry: e,
      rank: i + 1,
    }));
    if (mine) {
      out.push({ entry: mine, rank: mine.displayRank ?? 47 });
    }
    return out;
  }, [entries]);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.rankingTitle')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {rows.map((row) => {
            const mine = Boolean(row.entry.mine);
            const top = row.rank === 1;
            return (
              <Pressable
                key={row.entry.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/spotlight-entry',
                    params: { id: row.entry.id },
                  } as never)
                }
                style={[
                  styles.card,
                  top && styles.cardTop,
                  mine && styles.cardMine,
                ]}
              >
                <Text style={styles.rank}>{row.rank}</Text>
                <View style={styles.avatar}>
                  <Ionicons
                    name="paw-outline"
                    size={16}
                    color={brand.mutedSoft}
                  />
                </View>
                <Text style={styles.name} numberOfLines={1}>
                  {row.entry.petName}
                  {mine ? t('spotlight.youSuffix') : ''}
                </Text>
                <Text style={[styles.votes, top && styles.votesTop]}>
                  {t('spotlight.votesCount', { n: String(row.entry.votes) })}
                </Text>
              </Pressable>
            );
          })}
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
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardTop: {
    borderColor: brand.accentBorder,
  },
  cardMine: {
    borderColor: brand.accentBorder,
  },
  rank: {
    width: 28,
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
    textAlign: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  votes: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  votesTop: { color: brand.accent, fontFamily: fonts.bodyBold },
});
