import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { HELP_TOPICS } from '@/src/services/helpContent';
import { brand } from '@/src/theme/brand';

export default function HelpScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('help.title')}
            subtitle={t('help.subtitle')}
          />
          {HELP_TOPICS.map((topic) => (
            <ListRow
              key={topic.id}
              title={t(topic.titleKey)}
              leading={
                <Ionicons
                  name="help-circle-outline"
                  size={22}
                  color={brand.tealPressed}
                />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/help-article',
                  params: { id: topic.id },
                } as never)
              }
            />
          ))}
          <View style={styles.gap} />
          <PrimaryButton
            label={t('help.openSupport')}
            variant="secondary"
            onPress={() => router.push('/(app)/support' as never)}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  gap: { height: 12 },
});
