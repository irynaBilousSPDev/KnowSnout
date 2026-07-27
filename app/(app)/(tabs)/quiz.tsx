import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

type QuizCategoryCard = {
  id: 'breed' | 'breed_origin' | 'animal_group';
  icon: keyof typeof Ionicons.glyphMap;
  titleKey: string;
  bodyKey: string;
  href: string;
};

const CATEGORIES: QuizCategoryCard[] = [
  {
    id: 'breed',
    icon: 'camera-outline',
    titleKey: 'quizHub.breedTitle',
    bodyKey: 'quizHub.breedBody',
    href: '/(app)/breed-quiz',
  },
  {
    id: 'breed_origin',
    icon: 'globe-outline',
    titleKey: 'quizHub.originTitle',
    bodyKey: 'quizHub.originBody',
    href: '/(app)/wiki-quiz?category=breed_origin',
  },
  {
    id: 'animal_group',
    icon: 'leaf-outline',
    titleKey: 'quizHub.groupTitle',
    bodyKey: 'quizHub.groupBody',
    href: '/(app)/wiki-quiz?category=animal_group',
  },
];

export default function QuizHubScreen() {
  return (
    <AppScreen>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenHeader
          title={t('quizHub.title')}
          subtitle={t('quizHub.subtitle')}
        />

        <Text style={styles.lead}>{t('quizHub.lead')}</Text>

        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            onPress={() => router.push(cat.href as never)}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.cardIcon}>
              <Ionicons name={cat.icon} size={26} color={brand.tealPressed} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.cardTitle}>{t(cat.titleKey)}</Text>
              <Text style={styles.cardBody}>{t(cat.bodyKey)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#7FD9C9" />
          </Pressable>
        ))}

        <Text style={styles.hint}>{t('quizHub.wikidataNote')}</Text>
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
