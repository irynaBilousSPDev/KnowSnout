import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { getHelpTopic } from '@/src/services/helpContent';
import { brand } from '@/src/theme/brand';

export default function HelpArticleScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const topic = id ? getHelpTopic(id) : null;

  if (!topic) {
    return (
      <AppScreen>
        <View style={styles.pad}>
          <ScreenHeader title={t('help.missing')} />
        </View>
      </AppScreen>
    );
  }

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t(topic.titleKey)} />
          <Text style={styles.body}>{t(topic.bodyKey)}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  body: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
});
