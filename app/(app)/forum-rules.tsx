import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { FORUM_RULES } from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.18 — 4 numbered community rule cards */
export default function ForumRulesScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('forum.rulesTitle')} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {FORUM_RULES.map((rule, i) => (
            <View key={rule} style={styles.card}>
              <Text style={styles.text}>
                {i + 1}. {rule}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 10,
  },
  card: {
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  text: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.ink,
  },
});
