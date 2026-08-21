import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { listLeaderboard } from '@/src/services/gamification';
import { brand } from '@/src/theme/brand';

export default function QuizLeaderboardScreen() {
  const rows = listLeaderboard();

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('leaderboard.title')}
            subtitle={t('leaderboard.subtitle')}
          />
          {rows.map((row) => (
            <ListRow
              key={row.id}
              title={`#${row.rank} ${row.name}`}
              subtitle={t('leaderboard.xp', { xp: row.xp })}
              meta={row.me ? t('leaderboard.you') : undefined}
              leading={
                <Ionicons
                  name={row.rank <= 3 ? 'trophy' : 'medal-outline'}
                  size={22}
                  color={brand.tealPressed}
                />
              }
              showChevron={false}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
});
