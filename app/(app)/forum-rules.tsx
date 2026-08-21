import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { FORUM_RULES_UA } from '@/src/services/forum';
import { brand } from '@/src/theme/brand';

export default function ForumRulesScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('forum.rulesTitle')}
            subtitle={t('forum.rulesSubtitle')}
          />
          <View style={styles.card}>
            <Text style={styles.body}>{FORUM_RULES_UA}</Text>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 16,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 24,
    color: brand.ink,
  },
});
