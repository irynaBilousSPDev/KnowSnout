import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  getSpotlightContest,
  listSpotlightEntries,
  voteSpotlightEntry,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand } from '@/src/theme/brand';

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
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={contest?.title ?? t('spotlight.rankingTitle')}
            subtitle={t('spotlight.rankingSubtitle')}
          />
          {entries.length === 0 ? (
            <Text style={styles.empty}>{t('spotlight.rankingEmpty')}</Text>
          ) : (
            entries.map((e, i) => (
              <ListRow
                key={e.id}
                title={`#${i + 1} ${e.petName}`}
                subtitle={e.caption}
                meta={`${e.author} · ${e.votes} ${t('spotlight.votes')}`}
                leading={
                  <Ionicons name="heart-outline" size={22} color={brand.navy} />
                }
                trailing={
                  <PrimaryButton
                    label={t('spotlight.vote')}
                    size="sm"
                    variant="secondary"
                    block={false}
                    onPress={() => void onVote(e.id)}
                  />
                }
                showChevron={false}
              />
            ))
          )}
          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.guestVoteLink')}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/spotlight-guest-vote',
                params: contestId ? { contestId } : {},
              } as never)
            }
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.applyCta')}
            onPress={() => router.push('/(app)/spotlight-apply' as never)}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  empty: {
    marginTop: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
  gap: { height: 12 },
});
