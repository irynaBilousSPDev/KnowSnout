import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import {
  listSpotlightContests,
  listSpotlightEntries,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.21 — top 2 + your row at #47 */
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
      <View style={styles.titlePad}>
        <Text style={styles.title}>{t('spotlight.rankingTitle')}</Text>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {rows.map((row) => {
            const mine = Boolean(row.entry.mine);
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
                  row.rank === 1 && styles.cardTop,
                  mine && styles.cardMine,
                ]}
              >
                <Text style={styles.rank}>{row.rank}</Text>
                <View style={styles.avatar} />
                <Text style={styles.name} numberOfLines={1}>
                  {row.entry.petName}
                  {mine ? t('spotlight.youSuffix') : ''}
                </Text>
                <Text
                  style={[styles.votes, row.rank === 1 && styles.votesTop]}
                >
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
  titlePad: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 8 },
  title: { fontFamily: fonts.title, fontSize: 20, color: brand.ink },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  cardTop: { backgroundColor: brand.accentTint },
  cardMine: {
    borderWidth: 2,
    borderColor: brand.accentBorder,
    backgroundColor: brand.surfaceElevated,
  },
  rank: {
    width: 28,
    fontFamily: fonts.title,
    fontSize: 16,
    color: brand.ink,
    textAlign: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.creamDeep,
  },
  name: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.ink,
  },
  votes: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  votesTop: { color: brand.accent },
});
