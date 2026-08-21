import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  listSpotlightContests,
  type SpotlightContest,
} from '@/src/services/spotlight';
import { brand } from '@/src/theme/brand';

export default function SpotlightHubScreen() {
  const [contests, setContests] = useState<SpotlightContest[]>([]);

  useFocusEffect(
    useCallback(() => {
      setContests(listSpotlightContests());
    }, []),
  );

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('spotlight.title')}
            lead={t('spotlight.lead')}
          />

          <PrimaryButton
            label={t('spotlight.applyCta')}
            onPress={() => router.push('/(app)/spotlight-apply' as never)}
          />

          <Text style={styles.section}>{t('spotlight.active')}</Text>
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
                <Ionicons name="sparkles" size={20} color={brand.rose} />
              </View>
              <View style={styles.contestCopy}>
                <Text style={styles.contestTitle}>{c.title}</Text>
                <Text style={styles.contestBrief} numberOfLines={2}>
                  {c.brief}
                </Text>
                <Text style={styles.contestMeta}>
                  {c.status === 'active'
                    ? t('spotlight.statusActive')
                    : t('spotlight.statusClosed')}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={brand.mistBorder}
              />
            </Pressable>
          ))}

          <Text style={styles.section}>{t('check.moreSection')}</Text>
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
            <Text style={styles.linkText}>{t('spotlight.openWinners')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>
          <Pressable
            style={styles.linkRow}
            onPress={() => router.push('/(app)/spotlight-guest-vote' as never)}
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
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  pressed: { opacity: 0.9 },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
  contest: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: brand.roseTint,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  contestIcon: {
    marginRight: 12,
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.roseTint,
  },
  contestCopy: { flex: 1, paddingRight: 8 },
  contestTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: brand.ink,
  },
  contestBrief: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  contestMeta: {
    marginTop: 6,
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: brand.forest,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  linkText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: brand.navy,
  },
});
