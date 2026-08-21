import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { listForumCategories } from '@/src/services/forum';
import { brand } from '@/src/theme/brand';

export default function ForumScreen() {
  const categories = listForumCategories();

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('forum.title')} subtitle={t('forum.subtitle')} />
          <PrimaryButton
            label={t('forum.rules')}
            variant="secondary"
            onPress={() => router.push('/(app)/forum-rules' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('forum.search')}
            variant="secondary"
            onPress={() => router.push('/(app)/forum-search' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('forum.newThread')}
            onPress={() => router.push('/(app)/forum-new' as never)}
          />
          <View style={styles.gap} />
          <PrimaryButton
            label={t('forum.notifications')}
            variant="secondary"
            onPress={() => router.push('/(app)/forum-notifications' as never)}
          />

          {categories.map((c) => (
            <ListRow
              key={c.id}
              title={c.title}
              subtitle={c.body}
              meta={t('forum.threadCount', { count: c.threadCount })}
              leading={
                <Ionicons
                  name="chatbubbles-outline"
                  size={22}
                  color={brand.tealPressed}
                />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-category',
                  params: { id: c.id },
                } as never)
              }
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  gap: { height: 10 },
});
