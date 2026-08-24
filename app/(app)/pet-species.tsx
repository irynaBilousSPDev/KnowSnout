import { router } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';
import type { CompanionSpecies } from '@/src/types/pet';

type SpeciesPick = {
  id: CompanionSpecies;
  /** Stored in extras.profile_kind for other */
  kind?: 'rodent' | 'rabbit' | 'other';
  titleKey: string;
  supportKey: string;
  full: boolean;
};

const OPTIONS: SpeciesPick[] = [
  {
    id: 'dog',
    titleKey: 'pets.pickDog',
    supportKey: 'pets.supportFull',
    full: true,
  },
  {
    id: 'cat',
    titleKey: 'pets.pickCat',
    supportKey: 'pets.supportFull',
    full: true,
  },
  {
    id: 'bird',
    titleKey: 'pets.pickBird',
    supportKey: 'pets.supportProfile',
    full: false,
  },
  {
    id: 'other',
    kind: 'rodent',
    titleKey: 'pets.pickRodent',
    supportKey: 'pets.supportProfile',
    full: false,
  },
  {
    id: 'other',
    kind: 'rabbit',
    titleKey: 'pets.pickRabbit',
    supportKey: 'pets.supportProfile',
    full: false,
  },
  {
    id: 'other',
    kind: 'other',
    titleKey: 'pets.pickOther',
    supportKey: 'pets.supportCustom',
    full: false,
  },
];

/** 03.03 — Add pet step 1: species (fields depend on species). */
export default function PetSpeciesScreen() {
  const [selected, setSelected] = useState(0);

  const onNext = () => {
    const opt = OPTIONS[selected]!;
    router.push({
      pathname: '/(app)/pet-form',
      params: {
        species: opt.id,
        ...(opt.kind ? { profileKind: opt.kind } : {}),
      },
    } as never);
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader
        trailing="bell"
        bellCount={3}
        onBellPress={() => router.push('/(app)/notifications' as never)}
      />
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.step}>{t('pets.speciesStep', { n: 1, total: 3 })}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>{t('pets.speciesAsk')}</Text>
        <Text style={styles.lead}>{t('pets.speciesLead')}</Text>

        <View style={styles.grid}>
          {OPTIONS.map((opt, index) => {
            const active = selected === index;
            return (
              <Pressable
                key={`${opt.id}-${opt.kind ?? 'main'}-${index}`}
                onPress={() => setSelected(index)}
                style={[styles.card, active && styles.cardActive]}
              >
                <Text style={styles.cardTitle}>{t(opt.titleKey)}</Text>
                <Text style={styles.cardMeta}>{t(opt.supportKey)}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.info}>
          <Text style={styles.infoText}>{t('pets.speciesInfo')}</Text>
        </View>

        <PrimaryButton
          label={t('pets.speciesNext')}
          onPress={onNext}
          style={styles.cta}
        />
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  cancel: {
    fontFamily: fonts.bodySemi,
    fontSize: 15,
    color: brand.ink,
  },
  step: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  title: {
    marginTop: 8,
    fontFamily: fonts.title,
    fontSize: 26,
    color: brand.ink,
  },
  lead: {
    marginTop: 8,
    marginBottom: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '47.5%',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    minHeight: 88,
  },
  cardActive: {
    borderColor: brand.logoGreen,
    backgroundColor: brand.successTint,
  },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  cardMeta: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: brand.muted,
  },
  info: {
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: brand.successTint,
    padding: 14,
  },
  infoText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brand.ink,
  },
  cta: { marginTop: 18 },
});
