import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { getSpotlightContest } from '@/src/services/spotlight';
import { brand, fonts } from '@/src/theme/brand';

export default function SpotlightWonScreen() {
  const { contestId } = useLocalSearchParams<{ contestId?: string }>();
  const contest = contestId ? getSpotlightContest(contestId) : null;

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('spotlight.wonTitle')}
            subtitle={t('spotlight.wonSubtitle')}
          />
          <View style={styles.card}>
            <Text style={styles.body}>
              {t('spotlight.wonBody', {
                contest: contest?.title ?? t('spotlight.title'),
              })}
            </Text>
          </View>
          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.openRanking')}
            onPress={() =>
              router.replace({
                pathname: '/(app)/spotlight-ranking',
                params: { contestId: contestId ?? '' },
              } as never)
            }
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('spotlight.backHub')}
            variant="secondary"
            onPress={() => router.replace('/(app)/spotlight-hub' as never)}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
        backgroundColor: brand.mist,
    padding: 16,
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
  gap: { height: 10 },
});
