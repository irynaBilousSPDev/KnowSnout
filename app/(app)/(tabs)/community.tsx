import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

export default function CommunityHubScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('tabs.community')} subtitle={t('community.lead')} />

          <Text style={styles.section}>{t('community.sectionQuiz')}</Text>
          <ListRow
            title={t('community.quizHub')}
            subtitle={t('community.quizHubBody')}
            leading={<Ionicons name="help-circle-outline" size={22} color={brand.tealPressed} />}
            onPress={() => router.push('/(app)/(tabs)/quiz' as never)}
          />
          <ListRow
            title={t('community.leaderboard')}
            subtitle={t('community.leaderboardBody')}
            leading={<Ionicons name="trophy-outline" size={22} color={brand.tealPressed} />}
            onPress={() => router.push('/(app)/quiz-leaderboard' as never)}
          />
          <ListRow
            title={t('community.achievements')}
            subtitle={t('community.achievementsBody')}
            leading={<Ionicons name="ribbon-outline" size={22} color={brand.tealPressed} />}
            onPress={() => router.push('/(app)/achievements' as never)}
          />

          <Text style={styles.section}>{t('community.sectionForum')}</Text>
          <ListRow
            title={t('community.forum')}
            subtitle={t('community.forumBody')}
            leading={<Ionicons name="chatbubbles-outline" size={22} color={brand.tealPressed} />}
            onPress={() => router.push('/(app)/forum' as never)}
          />

          <Text style={styles.section}>{t('community.sectionBlog')}</Text>
          <ListRow
            title={t('community.blog')}
            subtitle={t('community.blogBody')}
            leading={<Ionicons name="newspaper-outline" size={22} color={brand.tealPressed} />}
            onPress={() => router.push('/(app)/blog' as never)}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  section: {
    marginTop: 18,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A7A72',
  },
});
