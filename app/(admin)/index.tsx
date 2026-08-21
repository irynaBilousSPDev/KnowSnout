import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** HTML kit · Admin — Manrope 22, accent numbered badges. */
const LINKS: { n: string; href: string; titleKey: string; bodyKey: string }[] = [
  {
    n: '1',
    href: '/(admin)/moderation',
    titleKey: 'admin.moderation',
    bodyKey: 'admin.moderationBody',
  },
  { n: '2', href: '/(admin)/cms', titleKey: 'admin.cms', bodyKey: 'admin.cmsBody' },
  {
    n: '3',
    href: '/(admin)/spotlight-admin',
    titleKey: 'admin.spotlight',
    bodyKey: 'admin.stubBody',
  },
  {
    n: '4',
    href: '/(admin)/blog-admin',
    titleKey: 'admin.blog',
    bodyKey: 'admin.stubBody',
  },
  {
    n: '5',
    href: '/(admin)/products-admin',
    titleKey: 'admin.products',
    bodyKey: 'admin.stubBody',
  },
  {
    n: '6',
    href: '/(admin)/quiz-bank',
    titleKey: 'admin.quizBank',
    bodyKey: 'admin.stubBody',
  },
  {
    n: '7',
    href: '/(admin)/monetization',
    titleKey: 'admin.monetization',
    bodyKey: 'admin.stubBody',
  },
  { n: '8', href: '/(admin)/team', titleKey: 'admin.team', bodyKey: 'admin.stubBody' },
];

export default function AdminDashboardScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.kicker}>{t('admin.softGate')}</Text>
          <Text style={styles.title}>{t('admin.title')}</Text>
          <Text style={styles.lead}>{t('admin.subtitle')}</Text>

          {LINKS.map((link) => (
            <View key={link.href} style={styles.row}>
              <View style={styles.num}>
                <Text style={styles.numText}>{link.n}</Text>
              </View>
              <View style={styles.rowBody}>
                <ListRow
                  title={t(link.titleKey)}
                  subtitle={t(link.bodyKey)}
                  onPress={() => router.push(link.href as never)}
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
    marginBottom: 8,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    marginBottom: 8,
  },
  lead: {
    marginBottom: 20,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  num: {
    marginTop: 18,
    height: 28,
    width: 28,
    borderRadius: 14,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  rowBody: { flex: 1 },
});
