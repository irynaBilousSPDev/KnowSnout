import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  castGuestVote,
  getSpotlightContest,
  listEntriesForContest,
  listGuestVotedEntryIds,
  listSpotlightContests,
  type SpotlightContest,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand } from '@/src/theme/brand';

export default function SpotlightGuestVotePublicScreen() {
  const { contestId: contestIdParam } = useLocalSearchParams<{
    contestId?: string;
  }>();
  const contests = listSpotlightContests();
  const initialId =
    (typeof contestIdParam === 'string' && contestIdParam) ||
    contests.find((c) => c.status === 'active')?.id ||
    contests[0]?.id ||
    '';

  const [contestId, setContestId] = useState(initialId);
  const [entries, setEntries] = useState<SpotlightEntry[]>([]);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [votingId, setVotingId] = useState<string | null>(null);

  const contest: SpotlightContest | null = contestId
    ? getSpotlightContest(contestId)
    : null;

  const load = useCallback(async () => {
    if (!contestId) {
      setEntries([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [list, ids] = await Promise.all([
        listEntriesForContest(contestId),
        listGuestVotedEntryIds(contestId),
      ]);
      setEntries(list);
      setVoted(ids);
    } finally {
      setLoading(false);
    }
  }, [contestId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onVote = async (entryId: string) => {
    setVotingId(entryId);
    try {
      const ok = await castGuestVote(entryId);
      notify(
        t('common.ok'),
        ok ? t('spotlight.guestVoteDone') : t('spotlight.guestVoteAlready'),
      );
      await load();
    } finally {
      setVotingId(null);
    }
  };

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.pad}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.brand}>KnowSnout</Text>
        <Text style={styles.title}>{t('spotlight.guestVoteTitle')}</Text>
        <Text style={styles.subtitle}>{t('spotlight.guestVoteSubtitle')}</Text>

        <Text style={styles.section}>{t('spotlight.pickContest')}</Text>
        <View style={styles.chips}>
          {contests.map((c) => {
            const active = c.id === contestId;
            return (
              <Pressable
                key={c.id}
                onPress={() => setContestId(c.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {c.title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {contest ? (
          <Text style={styles.brief}>{contest.brief}</Text>
        ) : null}

        {loading ? (
          <LoadingState message={t('spotlight.guestVoteLoading')} />
        ) : entries.length === 0 ? (
          <Text style={styles.empty}>{t('spotlight.rankingEmpty')}</Text>
        ) : (
          entries.map((e, i) => {
            const already = voted.has(e.id);
            return (
              <View key={e.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <Ionicons name="heart" size={20} color={brand.rose} />
                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>
                      #{i + 1} {e.petName}
                    </Text>
                    <Text style={styles.cardCaption}>{e.caption}</Text>
                    <Text style={styles.cardMeta}>
                      {e.author} · {e.votes} {t('spotlight.votes')}
                    </Text>
                  </View>
                </View>
                <PrimaryButton
                  label={
                    already
                      ? t('spotlight.guestVoted')
                      : t('spotlight.guestVoteCta')
                  }
                  size="sm"
                  variant={already ? 'secondary' : 'primary'}
                  loading={votingId === e.id}
                  disabled={already}
                  onPress={() => void onVote(e.id)}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: brand.surface },
  pad: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 48 },
  brand: {
    fontFamily: 'Caprasimo_400Regular',
    fontSize: 22,
    color: brand.navy,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 24,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: brand.forest,
  },
  section: {
    marginBottom: 8,
    fontFamily: 'Figtree_700Bold',
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.forest,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: brand.mist,
  },
  chipActive: { backgroundColor: brand.navy },
  chipText: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 13,
    color: brand.ink,
  },
  chipTextActive: { color: '#FFFFFF' },
  brief: {
    marginBottom: 16,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#5A6B7D',
  },
  empty: {
    marginTop: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: brand.forest,
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    gap: 12,
  },
  cardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  cardBody: { flex: 1 },
  cardTitle: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 16,
    color: brand.ink,
  },
  cardCaption: {
    marginTop: 4,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#5A6B7D',
  },
  cardMeta: {
    marginTop: 6,
    fontFamily: 'Figtree_400Regular',
    fontSize: 12,
    color: brand.forest,
  },
});
