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

/** Screenshot 04.18 — cover + overlay back (no AppChromeHeader) */
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
      <View style={[styles.hero, { paddingTop: Math.max(insets.top, 8) }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={t('common.back')}
        >
          <Ionicons name="chevron-back" size={18} color={brand.ink} />
        </Pressable>
        <View style={styles.coverInner}>
          <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
          <Text style={styles.coverHint}>{t('spotlight.coverHint')}</Text>
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>
          {contest?.title ?? 'Найкумедніша поза тижня'}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.endsText}>
            {t('spotlight.endsIn', { days: String(left || 2) })}
          </Text>
          <View style={styles.countPill}>
            <Text style={styles.countPillT}>
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
            size="lg"
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
    marginHorizontal: 20,
    marginTop: 8,
    minHeight: 168,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.mistBorder,
    backgroundColor: brand.creamDeep,
    overflow: 'hidden',
  },
  back: {
    position: 'absolute',
    zIndex: 2,
    left: 12,
    top: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 36,
  },
  coverHint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.mutedSoft,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 32,
    gap: 12,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  endsText: {
    flex: 1,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accent,
  },
  countPill: {
    borderRadius: 999,
    backgroundColor: brand.roseTint,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countPillT: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.ink,
  },
  card: {
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 13,
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
    paddingVertical: 16,
  },
  prizeLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  prizeValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  cta: { marginTop: 8 },
});
