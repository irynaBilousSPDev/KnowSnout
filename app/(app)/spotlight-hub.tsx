import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
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
          <ScreenHeader
            title={t('spotlight.title')}
            subtitle={t('spotlight.subtitle')}
          />
          <Text style={styles.lead}>{t('spotlight.lead')}</Text>

          <PrimaryButton
            label={t('spotlight.openRules')}
            variant="secondary"
            onPress={() => router.push('/(app)/spotlight-rules' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.openWinners')}
            variant="secondary"
            onPress={() => router.push('/(app)/spotlight-winners' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.guestVoteLink')}
            variant="secondary"
            onPress={() => router.push('/(app)/spotlight-guest-vote' as never)}
          />

          <Text style={styles.section}>{t('spotlight.active')}</Text>
          {contests.map((c) => (
            <ListRow
              key={c.id}
              title={c.title}
              subtitle={c.brief}
              meta={c.status === 'active' ? t('spotlight.statusActive') : t('spotlight.statusClosed')}
              leading={
                <Ionicons name="sparkles-outline" size={22} color={brand.tealPressed} />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/spotlight-ranking',
                  params: { contestId: c.id },
                } as never)
              }
            />
          ))}

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
  lead: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#3A5A54',
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A7A72',
  },
  gap: { height: 10 },
});
