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

/** Screenshot 04.17 */
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
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('spotlight.title')}</Text>

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
              <View style={styles.activeChipWrap}>
                <Text style={styles.activeChip}>
                  {t('spotlight.activeContest')}
                </Text>
              </View>
              <View style={styles.activeTitleRow}>
                <Text style={styles.activeTitle}>{active.title}</Text>
                <Ionicons name="paw" size={16} color={brand.accent} />
              </View>
              <Text style={styles.activeMeta}>
                {t('spotlight.hubMeta', {
                  days: String(left || 2),
                  count: String(SPOTLIGHT_PARTICIPANT_COUNT),
                })}
              </Text>
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
                <Ionicons name="image-outline" size={26} color={brand.mutedSoft} />
                <Text style={styles.gridLabel}>{t('spotlight.participantSlot')}</Text>
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            label={t('spotlight.applyCta')}
            onPress={() =>
              router.push({
                pathname: '/(app)/spotlight-rules',
                params: { contestId: active?.id ?? '' },
              } as never)
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 16 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  activeCard: {
    borderRadius: 16,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 6,
  },
  activeChipWrap: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FFF6E5',
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeChip: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accent,
  },
  activeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  activeTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accent,
  },
  activeMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.accent,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '47.8%',
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  gridLabel: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
});
