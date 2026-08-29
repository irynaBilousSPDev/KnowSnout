import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import {
  ProblemRow,
  SpecialistPetCard,
} from '@/src/components/specialists/SpecialistUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { petAgeLabel, speciesLabel } from '@/src/lib/petMeta';
import { listPets } from '@/src/services/pets';
import { BEHAVIOR_PROBLEMS } from '@/src/services/specialistDirectory';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

function petMetaLine(pet: PetRow) {
  const parts: string[] = [speciesLabel(pet.species)];
  const age = petAgeLabel(pet.birth_date);
  if (age) parts.push(age);
  return parts.join(' · ');
}

/** 10.01 · Поведінка й навчання */
export default function SpecialistBehaviorScreen() {
  const [pets, setPets] = useState<PetRow[]>([]);
  const [petId, setPetId] = useState('');

  useFocusEffect(
    useCallback(() => {
      void listPets().then((rows) => {
        setPets(rows);
        setPetId((prev) => {
          if (prev && rows.some((p) => p.id === prev)) return prev;
          return rows[0]?.id ?? '';
        });
      });
    }, []),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('specialist.behaviorTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.lbl}>{t('specialist.forPet')}</Text>
          {pets.length === 0 ? (
            <Pressable
              onPress={() => router.push('/(app)/pet-species' as never)}
              style={styles.emptyPet}
            >
              <Text style={styles.emptyPetText}>{t('pets.emptyTitle')}</Text>
              <Text style={styles.emptyPetLink}>{t('pets.add')}</Text>
            </Pressable>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.petRow}>
                {pets.map((pet) => (
                  <SpecialistPetCard
                    key={pet.id}
                    name={pet.name}
                    meta={petMetaLine(pet)}
                    selected={petId === pet.id}
                    onPress={() => setPetId(pet.id)}
                  />
                ))}
              </View>
            </ScrollView>
          )}

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
  petRow: { flexDirection: 'row', gap: 10 },
  emptyPet: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.creamDeep,
    padding: 14,
    gap: 4,
  },
  emptyPetText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.ink,
  },
  emptyPetLink: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  list: { gap: 8 },
  note: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.creamDeep,
    padding: 12,
    marginTop: 4,
  },
  noteText: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    lineHeight: 17,
  },
});
