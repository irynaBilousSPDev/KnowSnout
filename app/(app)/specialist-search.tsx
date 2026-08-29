import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import {
  SpecialistFilterChip,
  SpecialistListCard,
} from '@/src/components/specialists/SpecialistUi';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  getProblemTitleKey,
  listSpecialistsForProblem,
} from '@/src/services/specialistDirectory';
import type { BehaviorProblemId, WorkFormatId } from '@/src/types/specialistDirectory';
import { brand, fonts } from '@/src/theme/brand';

const FORMATS: WorkFormatId[] = ['online', 'home-visit', 'at-specialist'];

/** 10.02 · Підбір спеціалістів під проблему */
export default function SpecialistSearchScreen() {
  const { problem = 'separation-anxiety', petId = 'tukan' } =
    useLocalSearchParams<{ problem?: string; petId?: string }>();
  const problemId = (problem as BehaviorProblemId) || 'separation-anxiety';
  const [format, setFormat] = useState<WorkFormatId>('online');

  const rows = useMemo(
    () => listSpecialistsForProblem(problemId),
    [problemId],
  );

  const petLabel =
    petId === 'pukh'
      ? `${t('specialist.pet.pukhName')} · ${t('specialist.pet.pukhShort')}`
      : `${t('specialist.pet.tukanName')} · ${t('specialist.pet.tukanShort')}`;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader
        title={t(getProblemTitleKey(problemId))}
        titleSize={18}
        right={
          <Pressable style={styles.moreBtn}>
            <Ionicons name="ellipsis-horizontal" size={18} color={brand.ink} />
          </Pressable>
        }
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.filters}>
            <SpecialistFilterChip label={`${petLabel} ✕`} active />
            <SpecialistFilterChip
              label={`${t(getProblemTitleKey(problemId))} ✕`}
              active
            />
            <SpecialistFilterChip label={t('specialist.filter.warsaw')} />
          </View>

          <View style={styles.filters}>
            {FORMATS.map((f) => (
              <SpecialistFilterChip
                key={f}
                label={t(`specialist.format.${f}`)}
                active={format === f}
                onPress={() => setFormat(f)}
              />
            ))}
          </View>

          <View style={styles.list}>
            {rows.map((row) => (
              <SpecialistListCard
                key={row.id}
                name={row.name}
                subtitle={row.subtitleKey ? t(row.subtitleKey) : row.roles.join(' · ')}
                rating={row.rating}
                reviewCount={row.reviewCount}
                sponsored={row.sponsored}
                badges={row.badges?.map((b) => ({
                  label: t(b.labelKey),
                  tint: b.tint === 'green' ? 'green' : 'grey',
                }))}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/specialist-profile',
                    params: { id: row.id, problem: problemId, petId },
                  } as never)
                }
              />
            ))}
          </View>

          <Text style={styles.footnote}>{t('specialist.searchFootnote')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  moreBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 12,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  list: { gap: 10 },
  footnote: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 17,
    color: brand.mutedSoft,
    textAlign: 'center',
  },
});
