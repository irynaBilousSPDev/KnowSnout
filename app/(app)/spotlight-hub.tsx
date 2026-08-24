import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  SPOTLIGHT_PARTICIPANT_COUNT,
  listEntriesForContest,
  listSpotlightContests,
  type SpotlightContest,
  type SpotlightEntry,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

function daysLeft(endsAt: string): number {
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Screenshot 04.17 — SnoutSpotlight hub */
export default function SpotlightHubScreen() {
  const [contests, setContests] = useState<SpotlightContest[]>([]);
  const [preview, setPreview] = useState<SpotlightEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      const next = listSpotlightContests();
      setContests(next);
      const active = next.find((c) => c.status === 'active') ?? next[0];
      if (!active) {
        setPreview([]);
        return;
      }
      void listEntriesForContest(active.id).then((rows) =>
        setPreview(rows.slice(0, 4)),
      );
    }, []),
  );

  const active = contests.find((c) => c.status === 'active') ?? contests[0];
  const left = active ? daysLeft(active.endsAt) : 0;
  const slots = [0, 1, 2, 3].map((i) => preview[i] ?? null);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('spotlight.title')} titleSize={18} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {active ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/spotlight-rules',
                  params: { contestId: active.id },
                } as never)
              }
              style={styles.activeCard}
            >
              <Text style={styles.activeChip}>
                {t('spotlight.activeContest')}
              </Text>
              <Text style={styles.activeTitle}>
                {active.title.includes('🐶')
                  ? active.title
                  : `${active.title} 🐶`}
              </Text>
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={brand.accent} />
                <Text style={styles.activeMeta}>
                  {t('spotlight.hubMeta', {
                    days: String(left || 2),
                    count: String(SPOTLIGHT_PARTICIPANT_COUNT),
                  })}
                </Text>
              </View>
            </Pressable>
          ) : null}

          <View style={styles.grid}>
            {slots.map((entry, i) => (
              <Pressable
                key={entry?.id ?? `slot-${i}`}
                style={styles.gridCell}
                onPress={() => {
                  if (entry) {
                    router.push({
                      pathname: '/(app)/spotlight-entry',
                      params: { id: entry.id },
                    } as never);
                    return;
                  }
                  router.push({
                    pathname: '/(app)/spotlight-ranking',
                    params: { contestId: active?.id ?? '' },
                  } as never);
                }}
              >
                <Ionicons
                  name="image-outline"
                  size={28}
                  color={brand.mutedSoft}
                />
                <Text style={styles.gridLabel}>
                  {t('spotlight.participantSlot')}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.cta}>
            <PrimaryButton
              label={t('spotlight.applyCta')}
              size="lg"
              onPress={() =>
                router.push({
                  pathname: '/(app)/spotlight-rules',
                  params: { contestId: active?.id ?? '' },
                } as never)
              }
            />
          </View>
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
    gap: 16,
  },
  activeCard: {
    borderRadius: 18,
    backgroundColor: brand.accentTint,
    padding: 16,
    gap: 8,
  },
  activeChip: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accent,
  },
  activeTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    lineHeight: 24,
    color: brand.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  activeMeta: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridCell: {
    width: '47.2%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  gridLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  cta: { marginTop: 4 },
});
