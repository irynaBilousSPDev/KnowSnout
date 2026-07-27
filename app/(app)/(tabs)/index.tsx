import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

type CheckKind = 'food' | 'plant' | 'breed' | 'quiz';

function CheckCard({
  kind,
  icon,
  onPress,
}: {
  kind: CheckKind;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.cardIcon}>
        <Ionicons name={icon} size={26} color={brand.tealPressed} />
      </View>
      <View style={styles.cardCopy}>
        <Text style={styles.cardTitle}>{t(`check.${kind}Title`)}</Text>
        <Text style={styles.cardBody}>{t(`check.${kind}Body`)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#7FD9C9" />
    </Pressable>
  );
}

export default function CheckHubScreen() {
  const { user } = useAuth();

  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          subtitle={`${t('scan.signedInAs')} ${user?.email ?? ''}`}
        />

        <Text style={styles.lead}>{t('check.lead')}</Text>

        <CheckCard
          kind="food"
          icon="nutrition-outline"
          onPress={() => router.push('/(app)/scan-food')}
        />
        <CheckCard
          kind="plant"
          icon="leaf-outline"
          onPress={() => router.push('/(app)/plant-safety')}
        />
        <CheckCard
          kind="breed"
          icon="paw-outline"
          onPress={() => router.push('/(app)/breed-scan')}
        />
        <CheckCard
          kind="quiz"
          icon="help-circle-outline"
          onPress={() => router.push('/(app)/breed-quiz')}
        />

        <Text style={styles.hint}>{t('check.journalHint')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  lead: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#3A5A54',
  },
  card: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  cardPressed: {
    opacity: 0.88,
  },
  cardIcon: {
    marginRight: 12,
    height: 48,
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: brand.mist,
  },
  cardCopy: {
    flex: 1,
    paddingRight: 8,
  },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#3A5A54',
  },
  hint: {
    marginTop: 8,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#7A9A92',
  },
});
