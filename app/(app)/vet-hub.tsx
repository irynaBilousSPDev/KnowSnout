import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PetAvatar } from '@/src/components/PetAvatar';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { speciesLabel } from '@/src/lib/petMeta';
import { listPets } from '@/src/services/pets';
import {
  findClinicIdForSpecialization,
  VET_SPECIALIZATIONS,
} from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

/** 09.01 · Хаб ветеринарів */
export default function VetHubScreen() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<'clinics' | 'doctors'>('clinics');
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

  const openSearch = (spec?: string) => {
    router.push({
      pathname: '/(app)/vet-doctors-search',
      params: spec ? { spec } : {},
    } as never);
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('vets.hubTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.search}>
            <Ionicons name="search-outline" size={16} color={brand.mutedSoft} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('vets.searchPlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.searchInput}
              returnKeyType="search"
              onSubmitEditing={() => openSearch(query.trim() || undefined)}
            />
          </View>

          <View style={styles.segment}>
            {(['clinics', 'doctors'] as const).map((key) => {
              const on = tab === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => setTab(key)}
                  style={[styles.segBtn, on && styles.segBtnOn]}
                >
                  <Text style={[styles.segText, on && styles.segTextOn]}>
                    {t(key === 'clinics' ? 'vets.tabClinics' : 'vets.tabDoctors')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.sectionLbl}>{t('vets.forPet')}</Text>
          {pets.length === 0 ? (
            <Pressable
              onPress={() => router.push('/(app)/pet-species' as never)}
              style={styles.emptyPet}
            >
              <Text style={styles.emptyPetText}>{t('pets.emptyTitle')}</Text>
              <Text style={styles.emptyPetLink}>{t('pets.add')}</Text>
            </Pressable>
          ) : (
            <View style={styles.petRow}>
              {pets.map((pet) => {
                const on = petId === pet.id;
                return (
                  <Pressable
                    key={pet.id}
                    onPress={() => setPetId(pet.id)}
                    style={[styles.petChip, on && styles.petChipOn]}
                  >
                    <PetAvatar
                      avatarKey={pet.avatar_key}
                      avatarUri={pet.avatar_uri}
                      species={pet.species}
                      size={28}
                      name={pet.name}
                    />
                    <Text style={[styles.petText, on && styles.petTextOn]}>
                      {pet.name} · {speciesLabel(pet.species)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={styles.sectionLbl}>{t('vets.freqSpecs')}</Text>
          <View style={styles.specGrid}>
            {VET_SPECIALIZATIONS.map((spec) => (
              <Pressable
                key={spec.id}
                onPress={() => {
                  if (tab === 'clinics') {
                    router.push({
                      pathname: '/(app)/vet-clinic-profile',
                      params: {
                        id: findClinicIdForSpecialization(spec.label),
                      },
                    } as never);
                  } else {
                    openSearch(spec.label);
                  }
                }}
                style={styles.specChip}
              >
                <Text style={styles.specText}>{spec.label}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => router.push('/(app)/vet-pro-setup' as never)}
            style={styles.cta}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="add" size={20} color={brand.accentDark} />
            </View>
            <View style={styles.ctaCopy}>
              <Text style={styles.ctaTitle}>{t('vets.vetCtaTitle')}</Text>
              <Text style={styles.ctaBody}>{t('vets.vetCtaBody')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={brand.accentDark} />
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
    gap: 12,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13.5,
    color: brand.ink,
    padding: 0,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    padding: 4,
  },
  segBtn: {
    flex: 1,
    borderRadius: brand.radius.pill,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segBtnOn: {
    backgroundColor: brand.surfaceElevated,
    shadowColor: brand.shadow.color,
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  segText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  segTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.ink,
  },
  sectionLbl: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  petRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
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
  petChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  petChipOn: { backgroundColor: brand.accentTint },
  petText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  petTextOn: {
    fontFamily: fonts.bodyBold,
    color: brand.accentDark,
  },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  specChip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  specText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12.5,
    color: brand.ink,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 14,
    marginTop: 8,
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.accentDark,
  },
  ctaBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.accentDark,
    marginTop: 2,
  },
  ctaCopy: { flex: 1 },
});
