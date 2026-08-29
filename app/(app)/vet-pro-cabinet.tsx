import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  loadProProfile,
  PRO_CABINET_STATS,
  type ProProfileDraft,
} from '@/src/services/vetDirectory';
import { brand, fonts } from '@/src/theme/brand';

type MenuItem = {
  id: string;
  labelKey: string;
  vars?: Record<string, string | number>;
  badgeKey?: string;
  badgeVars?: Record<string, string | number>;
  badgeTone?: 'warn';
  dimmed?: boolean;
  href?: string;
};

const CYNOLOGIST_MENU: MenuItem[] = [
  { id: 'profile', labelKey: 'specialist.cabinetProfile' },
  { id: 'services', labelKey: 'specialist.cabinetServices' },
  {
    id: 'tariffs',
    labelKey: 'specialist.tariff.screenTitle',
    href: '/(app)/specialist-tariffs',
  },
  {
    id: 'search',
    labelKey: 'specialist.cabinetVisibility',
    href: '/(app)/specialist-search',
  },
  {
    id: 'reviews',
    labelKey: 'vets.cabinetReviews',
    vars: { count: 12 },
    badgeKey: 'vets.cabinetNewReviews',
    badgeVars: { count: 1 },
    badgeTone: 'warn',
  },
];

const MENU_ITEMS: MenuItem[] = [
  { id: 'profile', labelKey: 'vets.cabinetProfile' },
  { id: 'specs', labelKey: 'vets.cabinetSpecs', vars: { count: 2 } },
  { id: 'species', labelKey: 'vets.cabinetSpecies', vars: { count: 3 } },
  { id: 'clinics', labelKey: 'vets.cabinetClinics', vars: { count: 2 } },
  {
    id: 'reviews',
    labelKey: 'vets.cabinetReviews',
    vars: { count: 63 },
    badgeKey: 'vets.cabinetNewReviews',
    badgeVars: { count: 2 },
    badgeTone: 'warn',
  },
  {
    id: 'verify',
    labelKey: 'vets.cabinetVerify',
    badgeKey: 'vets.cabinetVerifyProgress',
    badgeVars: { done: 2, total: 3 },
  },
  {
    id: 'services',
    labelKey: 'vets.cabinetServices',
    badgeKey: 'vets.cabinetServices',
    dimmed: true,
  },
  {
    id: 'calendar',
    labelKey: 'vets.cabinetCalendar',
    badgeKey: 'vets.cabinetCalendar',
    dimmed: true,
  },
];

/** 09.07 · Кабінет лікаря / кінолога */
export default function VetProCabinetScreen() {
  const [mode, setMode] = useState<'personal' | 'pro'>('pro');
  const [profile, setProfile] = useState<ProProfileDraft | null>(null);

  useEffect(() => {
    void loadProProfile().then(setProfile);
  }, []);

  const isCynologist = profile?.role === 'cynologist';
  const menuItems = isCynologist ? CYNOLOGIST_MENU : MENU_ITEMS;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.segment}>
            {(['personal', 'pro'] as const).map((key) => {
              const on = mode === key;
              return (
                <Pressable
                  key={key}
                  onPress={() => {
                    setMode(key);
                    if (key === 'personal') {
                      router.push('/(app)/my-profile' as never);
                    }
                  }}
                  style={[styles.segBtn, on && styles.segBtnOn]}
                >
                  <Text style={[styles.segText, on && styles.segTextOn]}>
                    {t(key === 'personal' ? 'vets.modePersonal' : 'vets.modePro')}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.title}>
            {t(isCynologist ? 'specialist.cabinetTitle' : 'vets.cabinetTitle')}
          </Text>
          <Text style={styles.sub}>
            {t(isCynologist ? 'specialist.cabinetSub' : 'vets.cabinetSub')}
          </Text>

          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{PRO_CABINET_STATS.views}</Text>
              <Text style={styles.statLbl}>{t('vets.statViews')}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{PRO_CABINET_STATS.opens}</Text>
              <Text style={styles.statLbl}>{t('vets.statOpens')}</Text>
            </View>
            <View style={[styles.stat, styles.statGood]}>
              <Text style={[styles.statNum, styles.statNumGood]}>
                {PRO_CABINET_STATS.rating.toFixed(1)}
              </Text>
              <Text style={[styles.statLbl, styles.statLblGood]}>
                {t('directories.ratingLabel')}
              </Text>
            </View>
          </View>

          {menuItems.map((item) => (
            <Pressable
              key={item.id}
              style={styles.menuRow}
              onPress={() => {
                if (item.href) {
                  router.push(item.href as never);
                }
              }}
            >
              <Text style={[styles.menuText, item.dimmed && styles.menuDim]}>
                {t(item.labelKey, item.vars)}
              </Text>
              <View style={styles.menuRight}>
                {item.badgeKey ? (
                  <View
                    style={[
                      styles.menuBadge,
                      item.badgeTone === 'warn' && styles.menuBadgeWarn,
                    ]}
                  >
                    <Text
                      style={[
                        styles.menuBadgeText,
                        item.badgeTone === 'warn' && styles.menuBadgeTextWarn,
                        item.id === 'services' || item.id === 'calendar'
                          ? styles.menuBadgePlan
                          : null,
                      ]}
                    >
                      {item.id === 'services'
                        ? 'PRO'
                        : item.id === 'calendar'
                          ? 'PREMIUM'
                          : t(item.badgeKey, item.badgeVars)}
                    </Text>
                  </View>
                ) : null}
                <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
              </View>
            </Pressable>
          ))}

          <View style={styles.promo}>
            <Text style={styles.promoTitle}>{t('vets.expandProfile')}</Text>
            <Text style={styles.promoBody}>{t('vets.expandProfileBody')}</Text>
            <View style={styles.promoActions}>
              <PrimaryButton
                label={t('vets.comparePlans')}
                onPress={() => router.push('/(app)/specialist-tariffs' as never)}
                style={styles.promoBtn}
              />
              <PrimaryButton
                label={t('vets.promotion')}
                variant="secondary"
                onPress={() =>
                  router.push('/(app)/specialist-tariffs' as never)
                }
                style={styles.promoBtn}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    padding: 4,
    marginBottom: 4,
  },
  segBtn: {
    flex: 1,
    borderRadius: brand.radius.pill,
    paddingVertical: 8,
    alignItems: 'center',
  },
  segBtnOn: {
    backgroundColor: brand.surfaceElevated,
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
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
  },
  sub: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    marginTop: -4,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  stat: {
    flex: 1,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  statGood: {
    backgroundColor: brand.successTint,
    borderColor: brand.successTint,
  },
  statNum: {
    fontFamily: fonts.bodyBold,
    fontSize: 18,
    color: brand.ink,
  },
  statNumGood: { color: brand.successDark },
  statLbl: {
    fontFamily: fonts.body,
    fontSize: 10.5,
    color: brand.muted,
    marginTop: 2,
  },
  statLblGood: { color: brand.successDark },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  menuText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.ink,
  },
  menuDim: { color: brand.mutedSoft },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  menuBadge: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  menuBadgeWarn: { backgroundColor: '#FCEEE8' },
  menuBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: brand.muted,
  },
  menuBadgeTextWarn: { color: brand.terracotta },
  menuBadgePlan: { letterSpacing: 0.4 },
  promo: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 16,
    gap: 10,
    marginTop: 6,
  },
  promoTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.accentDark,
  },
  promoBody: {
    fontFamily: fonts.body,
    fontSize: 11.5,
    lineHeight: 16,
    color: brand.accentDark,
  },
  promoActions: { flexDirection: 'row', gap: 8 },
  promoBtn: { flex: 1 },
});
