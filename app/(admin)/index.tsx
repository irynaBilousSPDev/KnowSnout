import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { listModerationQueue } from '@/src/services/adminModeration';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Admin dashboard (mobile adaptation of desktop shell). */
const NAV: {
  href: string;
  titleKey: string;
  bodyKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    href: '/(admin)/moderation',
    titleKey: 'admin.moderation',
    bodyKey: 'admin.moderationBody',
    icon: 'albums-outline',
  },
  {
    href: '/(admin)/cms',
    titleKey: 'admin.cms',
    bodyKey: 'admin.cmsBody',
    icon: 'document-text-outline',
  },
  {
    href: '/(admin)/spotlight-admin',
    titleKey: 'admin.spotlight',
    bodyKey: 'admin.spotlightBody',
    icon: 'trophy-outline',
  },
  {
    href: '/(admin)/blog-admin',
    titleKey: 'admin.blog',
    bodyKey: 'admin.stubBody',
    icon: 'newspaper-outline',
  },
  {
    href: '/(admin)/products-admin',
    titleKey: 'admin.products',
    bodyKey: 'admin.stubBody',
    icon: 'nutrition-outline',
  },
  {
    href: '/(admin)/quiz-bank',
    titleKey: 'admin.quizBank',
    bodyKey: 'admin.stubBody',
    icon: 'help-circle-outline',
  },
  {
    href: '/(admin)/monetization',
    titleKey: 'admin.monetization',
    bodyKey: 'admin.stubBody',
    icon: 'card-outline',
  },
  {
    href: '/(admin)/team',
    titleKey: 'admin.team',
    bodyKey: 'admin.teamBody',
    icon: 'people-outline',
  },
];

const ACTIVITY = [
  {
    id: 'a1',
    type: 'Заклад F',
    object: 'SaskaVet',
    action: 'Підтверджено ✓',
    who: 'Марта К.',
    when: '2 год тому',
  },
  {
    id: 'a2',
    type: 'Скарга E',
    object: 'Тред «Стоматолог для кота»',
    action: 'Приховано',
    who: 'Олег Т.',
    when: '5 год тому',
  },
  {
    id: 'a3',
    type: 'Контент C',
    object: 'Чек-лист Шенген (v3)',
    action: 'Опубліковано',
    who: 'Марта К.',
    when: 'Вчора',
  },
];

export default function AdminDashboardScreen() {
  const [queueCount, setQueueCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      void listModerationQueue().then((items) =>
        setQueueCount(items.filter((i) => i.status === 'pending').length),
      );
    }, []),
  );

  const stats = [
    { value: String(queueCount || 17), labelKey: 'admin.statQueue' },
    { value: '4', labelKey: 'admin.statComplaints' },
    { value: '62', labelKey: 'admin.statVerified' },
    { value: '3', labelKey: 'admin.statRules' },
  ];

  return (
    <AppScreen edges={['bottom', 'top']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.kicker}>{t('admin.softGate')}</Text>
          <Text style={styles.title}>{t('admin.title')}</Text>
          <Text style={styles.lead}>{t('admin.managerLine')}</Text>

          <View style={styles.stats}>
            {stats.map((s) => (
              <View key={s.labelKey} style={styles.stat}>
                <Text style={styles.statNum}>{s.value}</Text>
                <Text style={styles.statLbl}>{t(s.labelKey)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>{t('admin.sections')}</Text>
          {NAV.map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={({ pressed }) => [styles.nav, pressed && styles.pressed]}
            >
              <View style={styles.navIcon}>
                <Ionicons name={item.icon} size={18} color={brand.accentDark} />
              </View>
              <View style={styles.navCopy}>
                <Text style={styles.navTitle}>{t(item.titleKey)}</Text>
                <Text style={styles.navBody}>{t(item.bodyKey)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
          ))}

          <Text style={styles.section}>{t('admin.recentActions')}</Text>
          {ACTIVITY.map((row) => (
            <View key={row.id} style={styles.act}>
              <Text style={styles.actType}>{row.type}</Text>
              <Text style={styles.actObject}>{row.object}</Text>
              <Text style={styles.actMeta}>
                {row.action} · {row.who} · {row.when}
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
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.mutedSoft,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginTop: -4,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    marginTop: -4,
  },
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  stat: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  statNum: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.accentDark,
  },
  statLbl: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  section: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  navIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navCopy: { flex: 1 },
  navTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  navBody: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  act: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 12,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  actType: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  actObject: {
    marginTop: 2,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  actMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
});
