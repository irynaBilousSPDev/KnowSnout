import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  SPOTLIGHT_PARTICIPANT_COUNT,
  getSpotlightContest,
  getSpotlightRules,
  listSpotlightContests,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

function daysLeft(endsAt: string): number {
  const ms = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Screenshot 04.18 — cover + overlay back, no app chrome */
export default function SpotlightRulesScreen() {
  const insets = useSafeAreaInsets();
  const { contestId } = useLocalSearchParams<{ contestId?: string }>();
  const contest =
    (contestId ? getSpotlightContest(contestId) : null) ??
    listSpotlightContests()[0] ??
    null;
  const left = contest ? daysLeft(contest.endsAt) : 2;

  return (
    <AppScreen edges={['bottom']}>
      <View style={styles.hero}>
        <Text style={styles.coverHint}>{t('spotlight.coverHint')}</Text>
        <Pressable
          onPress={() => router.back()}
          style={[styles.back, { top: Math.max(insets.top, 12) + 8 }]}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="chevron-back" size={18} color={brand.ink} />
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {contest?.title ?? t('spotlight.title')}
        </Text>
        <View style={styles.metaRow}>
          <View style={styles.warnChip}>
            <Text style={styles.warnT}>
              {t('spotlight.endsIn', { days: String(left || 2) })}
            </Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillT}>
              {t('spotlight.participants', {
                n: String(SPOTLIGHT_PARTICIPANT_COUNT),
              })}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('spotlight.rulesHeading')}</Text>
          <Text style={styles.body}>{getSpotlightRules()}</Text>
        </View>

        <View style={styles.prize}>
          <Text style={styles.prizeLabel}>{t('spotlight.prizeLabel')}</Text>
          <Text style={styles.prizeValue}>{t('spotlight.prizeValue')}</Text>
        </View>

        <View style={styles.cta}>
          <PrimaryButton
            label={t('spotlight.submitApplication')}
            onPress={() =>
              router.push({
                pathname: '/(app)/spotlight-apply',
                params: { contestId: contest?.id ?? '' },
              } as never)
            }
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 180,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverHint: { fontFamily: fonts.body, fontSize: 13, color: brand.mutedSoft },
  back: {
    position: 'absolute',
    left: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 28, gap: 12 },
  title: { fontFamily: fonts.title, fontSize: 20, color: brand.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  warnChip: {
    borderRadius: 999,
    backgroundColor: '#FFF6E5',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  warnT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.accent },
  pill: {
    borderRadius: 999,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pillT: { fontFamily: fonts.bodyMedium, fontSize: 12, color: brand.muted },
  card: {
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    padding: 16,
    gap: 6,
  },
  cardTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  body: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    lineHeight: 20,
    color: brand.muted,
  },
  prize: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  prizeLabel: { fontFamily: fonts.body, fontSize: 13, color: brand.muted },
  prizeValue: { fontFamily: fonts.bodyBold, fontSize: 13, color: brand.ink },
  cta: { marginTop: 8 },
});
