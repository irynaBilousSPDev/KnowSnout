import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import {
  ProblemRow,
  SpecialistPetCard,
} from '@/src/components/specialists/SpecialistUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  BEHAVIOR_PROBLEMS,
  DEMO_PETS,
} from '@/src/services/specialistDirectory';
import { brand, fonts } from '@/src/theme/brand';

/** 10.01 · Поведінка й навчання */
export default function SpecialistBehaviorScreen() {
  const [petId, setPetId] = useState('tukan');

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('specialist.behaviorTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.lbl}>{t('specialist.forPet')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.petRow}>
              {DEMO_PETS.map((pet) => (
                <SpecialistPetCard
                  key={pet.id}
                  name={t(pet.nameKey)}
                  meta={t(pet.metaKey)}
                  selected={petId === pet.id}
                  onPress={() => setPetId(pet.id)}
                />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.lbl}>{t('specialist.helpQuestion')}</Text>
          <View style={styles.list}>
            {BEHAVIOR_PROBLEMS.map((problem) => (
              <ProblemRow
                key={problem.id}
                title={t(problem.titleKey)}
                subtitle={t(problem.subtitleKey)}
                iconTint={problem.iconTint}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/specialist-search',
                    params: { problem: problem.id, petId },
                  } as never)
                }
              />
            ))}
          </View>

          <View style={styles.note}>
            <Text style={styles.noteText}>{t('specialist.problemNote')}</Text>
          </View>
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
    gap: 12,
  },
  lbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  petRow: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  list: { gap: 10 },
  note: {
    marginTop: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
  },
  noteText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.accentDark,
  },
});
