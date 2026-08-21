import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { HELP_TOPICS } from '@/src/services/helpContent';
import { brand, fonts } from '@/src/theme/brand';

/** HTML phone “46 · Довідка і підтримка”. */
export default function HelpScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('help.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          {HELP_TOPICS.map((topic) => (
            <Pressable
              key={topic.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/help-article',
                  params: { id: topic.id },
                } as never)
              }
              style={({ pressed }) => [styles.row, pressed && styles.pressed]}
            >
              <Text style={styles.label}>{t(topic.titleKey)}</Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={brand.mutedSoft}
              />
            </Pressable>
          ))}
          <PrimaryButton
            label={t('help.openSupport')}
            variant="secondary"
            onPress={() => router.push('/(app)/support' as never)}
            style={styles.supportBtn}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  label: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  supportBtn: { marginTop: 6 },
});
