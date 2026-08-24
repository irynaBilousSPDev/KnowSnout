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

/** HTML phone “25 · SnoutSpotlight, хаб конкурсів”. */
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
        <View style={styles.titlePad}>
          <Text style={styles.title}>{t('spotlight.title')}</Text>
        </View>

        <View style={styles.pad}>
          {active ? (
            <View style={styles.activeCard}>
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>
                  {t('spotlight.activeContest')}
                </Text>
              </View>
              <Text style={styles.activeTitle}>{active.title}</Text>
              <Text style={styles.activeMeta}>
                {t('spotlight.hubMeta', {
                  days: String(left),
                  count: String(preview.length || 214),
                })}
              </Text>
            </View>
          ) : null}

          <View style={styles.grid}>
            {slots.map((entry, i) => (
              <Pressable
                key={entry?.id ?? `slot-${i}`}
                style={styles.gridCell}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/spotlight-ranking',
                    params: { contestId: active?.id ?? '' },
                  } as never)
                }
              >
                {entry ? (
                  <View style={styles.gridFill}>
                    <Ionicons name="paw" size={28} color={brand.accentSoft} />
                    <Text style={styles.gridName} numberOfLines={1}>
                      {entry.petName}
                    </Text>
                  </View>
                ) : (
                  <Ionicons
                    name="image-outline"
                    size={28}
                    color={brand.mutedSoft}
                  />
                )}
              </Pressable>
            ))}
          </View>

          <PrimaryButton
            label={t('spotlight.applyCta')}
            onPress={() => router.push('/(app)/spotlight-apply' as never)}
          />

          <View style={styles.links}>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/(app)/spotlight-rules' as never)}
            >
              <Text style={styles.linkText}>{t('spotlight.openRules')}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() =>
                router.push({
                  pathname: '/(app)/spotlight-ranking',
                  params: { contestId: active?.id ?? '' },
                } as never)
              }
            >
              <Text style={styles.linkText}>{t('spotlight.rankingTitle')}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/(app)/spotlight-winners' as never)}
            >
              <Text style={styles.linkText}>{t('spotlight.winnersTitle')}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
            <Pressable
              style={styles.linkRow}
              onPress={() => router.push('/spotlight-vote' as never)}
            >
              <Text style={styles.linkText}>
                {t('spotlight.guestVoteLink')}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  titlePad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  pad: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 14,
  },
  activeCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 6,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  activeChip: {
    alignSelf: 'flex-start',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeChipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  activeTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.accentDark,
  },
  activeMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.accentDark,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '47.5%',
    aspectRatio: 1.35,
    borderRadius: 16,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridFill: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 10,
  },
  gridName: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.ink,
  },
  links: {
    marginTop: 4,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.divider,
  },
  linkText: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
});
