import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { shareText } from '@/src/lib/share';
import {
  getSpotlightEntry,
  listSpotlightEntries,
  voteSpotlightEntry,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 04.20 — Учасник */
export default function SpotlightEntryScreen() {
  const { id: rawId } = useLocalSearchParams<{ id?: string }>();
  const id = typeof rawId === 'string' && rawId.trim() ? rawId : 'se-tukan';
  const [entry, setEntry] = useState<SpotlightEntry | null>(null);
  const [rank, setRank] = useState(47);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const next = await getSpotlightEntry(id);
    setEntry(next);
    if (next) {
      const ranked = await listSpotlightEntries(next.contestId);
      const idx = ranked.findIndex((e) => e.id === next.id);
      setRank(next.displayRank ?? (idx >= 0 ? idx + 1 : 47));
    }
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  if (loading) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <LoadingState />
      </AppScreen>
    );
  }

  if (!entry) {
    return (
      <AppScreen>
        <AppChromeHeader />
        <ErrorState
          message={t('spotlight.rankingEmpty')}
          onRetry={() => void load()}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.participantTitle')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.photo}>
            {entry.photoUri ? (
              <Image source={{ uri: entry.photoUri }} style={styles.img} />
            ) : (
              <>
                <Ionicons
                  name="image-outline"
                  size={30}
                  color={brand.mutedSoft}
                />
                <Text style={styles.photoHint}>{t('spotlight.entryPhoto')}</Text>
              </>
            )}
          </View>

          <Text style={styles.headline}>
            {t('spotlight.participating', { name: entry.petName })}
          </Text>
          <Text style={styles.meta}>
            {t('spotlight.entryMeta', {
              votes: String(entry.votes),
              rank: String(rank),
            })}
          </Text>

          <PrimaryButton
            label={t('spotlight.shareVotes')}
            size="lg"
            icon={
              <Ionicons name="share-social-outline" size={17} color="#FFFFFF" />
            }
            onPress={() =>
              void shareText({
                title: entry.petName,
                message: t('spotlight.shareVotesMessage', {
                  name: entry.petName,
                }),
              })
            }
          />
          <View style={{ height: 10 }} />
          <PrimaryButton
            label={t('spotlight.guestVoteCta')}
            variant="secondary"
            size="lg"
            onPress={() => {
              void voteSpotlightEntry(entry.id).then((ok) => {
                notify(
                  t('common.ok'),
                  ok ? t('spotlight.voteDone') : t('spotlight.voteAlready'),
                );
                void load();
              });
            }}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 8,
  },
  photo: {
    height: 280,
    borderRadius: 18,
    backgroundColor: brand.creamDeep,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  img: { width: '100%', height: '100%' },
  photoHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  headline: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  meta: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    marginBottom: 12,
  },
});
