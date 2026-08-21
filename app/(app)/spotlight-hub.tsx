import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  listSpotlightContests,
  type SpotlightContest,
} from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “25 · SnoutSpotlight”. */
export default function SpotlightHubScreen() {
  const [contests, setContests] = useState<SpotlightContest[]>([]);

  useFocusEffect(
    useCallback(() => {
      setContests(listSpotlightContests());
    }, []),
  );

  const active = contests.find((c) => c.status === 'active') ?? contests[0];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('spotlight.title')}</Text>

          {active ? (
            <View style={styles.activeCard}>
              <View style={styles.activeChip}>
                <Text style={styles.activeChipText}>
                  {t('spotlight.active')}
                </Text>
              </View>
              <Text style={styles.activeTitle}>{active.title}</Text>
              <Text style={styles.activeMeta} numberOfLines={2}>
                {active.brief}
              </Text>
            </View>
          ) : null}

          <View style={styles.grid}>
            {[0, 1, 2, 3].map((i) => (
              <View key={i} style={styles.gridCell}>
                <Ionicons name="image-outline" size={28} color={brand.mutedSoft} />
              </View>
            ))}
          </View>

          <PrimaryButton
            label={t('spotlight.applyCta')}
            onPress={() => router.push('/(app)/spotlight-apply' as never)}
          />

          <Text style={styles.section}>{t('spotlight.openRules')}</Text>
          {contests.map((c) => (
            <Pressable
              key={c.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/spotlight-ranking',
                  params: { contestId: c.id },
                } as never)
              }
              style={({ pressed }) => [styles.contest, pressed && styles.pressed]}
            >
              <View style={styles.contestIcon}>
                <Ionicons name="sparkles" size={20} color={brand.accentDark} />
              </View>
              <View style={styles.contestCopy}>
                <Text style={styles.contestTitle}>{c.title}</Text>
                <Text style={styles.contestMeta}>
                  {c.status === 'active'
                    ? t('spotlight.statusActive')
                    : t('spotlight.statusClosed')}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
          ))}

          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/(app)/spotlight-rules' as never)}
          >
            <Text style={styles.linkText}>{t('spotlight.openRules')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/(app)/spotlight-winners' as never)}
          >
            <Text style={styles.linkText}>{t('spotlight.winnersTitle')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/spotlight-vote' as never)}
          >
            <Text style={styles.linkText}>{t('spotlight.guestVoteLink')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 14,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  activeCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    gap: 6,
  },
  activeChip: {
    alignSelf: 'flex-start',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.accentTint,
    borderWidth: 1,
    borderColor: brand.accentSoft,
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
    width: '47%',
    flexGrow: 1,
    height: 120,
    borderRadius: 16,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  contest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  contestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contestCopy: { flex: 1 },
  contestTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  contestMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  pressed: { opacity: 0.88 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  linkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accentDark,
  },
});
