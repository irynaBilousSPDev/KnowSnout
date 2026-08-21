import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { listSpotlightWinners } from '@/src/services/spotlight';
import { brand } from '@/src/theme/brand';

export default function SpotlightWinnersScreen() {
  const winners = listSpotlightWinners();

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('spotlight.winnersTitle')}
            subtitle={t('spotlight.winnersSubtitle')}
          />
          {winners.map((w) => (
            <ListRow
              key={w.contestId}
              title={w.petName}
              subtitle={w.contestTitle}
              meta={`${w.author} · ${w.votes} ${t('spotlight.votes')}`}
              leading={
                <Ionicons name="trophy-outline" size={22} color={brand.navy} />
              }
            />
          ))}
          {winners.length === 0 ? (
            <Text style={styles.empty}>{t('spotlight.winnersEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  empty: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
