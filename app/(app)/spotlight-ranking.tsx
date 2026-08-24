import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  getSpotlightContest,
  listSpotlightEntries,
  voteSpotlightEntry,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Spotlight · Повний рейтинг. */
export default function SpotlightRankingScreen() {
  const { contestId } = useLocalSearchParams<{ contestId?: string }>();
  const contest = contestId ? getSpotlightContest(contestId) : null;
  const [entries, setEntries] = useState<SpotlightEntry[]>([]);

  const load = useCallback(async () => {
    if (!contestId) return;
    setEntries(await listSpotlightEntries(contestId));
  }, [contestId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onVote = async (id: string) => {
    const ok = await voteSpotlightEntry(id);
    notify(
      t('common.ok'),
      ok ? t('spotlight.voteDone') : t('spotlight.voteAlready'),
    );
    await load();
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.rankingTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {contest ? (
            <Text style={styles.contestMeta}>{contest.title}</Text>
          ) : null}

          {entries.length === 0 ? (
            <Text style={styles.empty}>{t('spotlight.rankingEmpty')}</Text>
          ) : (
            entries.map((e, i) => {
              const rank = i + 1;
              const top = rank === 1;
              return (
                <Pressable
                  key={e.id}
                  onPress={() => void onVote(e.id)}
                  style={[styles.card, top && styles.cardTop]}
                >
                  <Text style={[styles.rank, top && styles.rankTop]}>
                    {rank}
                  </Text>
                  <View style={styles.avatar}>
                    <Ionicons
                      name="paw"
                      size={18}
                      color={top ? brand.accentDark : brand.muted}
                    />
                  </View>
                  <View style={styles.copy}>
                    <Text style={styles.name} numberOfLines={1}>
                      {e.petName}
                    </Text>
                    <Text style={styles.caption} numberOfLines={1}>
                      {e.author}
                    </Text>
                  </View>
                  <Text style={[styles.votes, top && styles.votesTop]}>
                    {e.votes} {t('spotlight.votes')}
                  </Text>
                </Pressable>
              );
            })
          )}

          <PrimaryButton
            label={t('spotlight.applyCta')}
            variant="secondary"
            onPress={() => router.push('/(app)/spotlight-apply' as never)}
            style={styles.cta}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  contestMeta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    marginBottom: 4,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
    marginTop: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  cardTop: {
    backgroundColor: brand.accentTint,
  },
  rank: {
    width: 22,
    fontFamily: fonts.title,
    fontSize: 15,
    color: brand.muted,
    textAlign: 'center',
  },
  rankTop: {
    color: brand.accentDark,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, minWidth: 0 },
  name: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  caption: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  votes: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  votesTop: {
    color: brand.accentDark,
  },
  cta: { marginTop: 8 },
});
