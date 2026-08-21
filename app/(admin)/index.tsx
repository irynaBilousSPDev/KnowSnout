import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';

const LINKS: { href: string; titleKey: string; bodyKey: string }[] = [
  {
    href: '/(admin)/moderation',
    titleKey: 'admin.moderation',
    bodyKey: 'admin.moderationBody',
  },
  { href: '/(admin)/cms', titleKey: 'admin.cms', bodyKey: 'admin.cmsBody' },
  {
    href: '/(admin)/spotlight-admin',
    titleKey: 'admin.spotlight',
    bodyKey: 'admin.stubBody',
  },
  {
    href: '/(admin)/blog-admin',
    titleKey: 'admin.blog',
    bodyKey: 'admin.stubBody',
  },
  {
    href: '/(admin)/products-admin',
    titleKey: 'admin.products',
    bodyKey: 'admin.stubBody',
  },
  {
    href: '/(admin)/quiz-bank',
    titleKey: 'admin.quizBank',
    bodyKey: 'admin.stubBody',
  },
  {
    href: '/(admin)/monetization',
    titleKey: 'admin.monetization',
    bodyKey: 'admin.stubBody',
  },
  { href: '/(admin)/team', titleKey: 'admin.team', bodyKey: 'admin.stubBody' },
];

export default function AdminDashboardScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('admin.title')}
            subtitle={t('admin.subtitle')}
          />
          <Text style={styles.hint}>{t('admin.softGate')}</Text>
          {LINKS.map((link) => (
            <ListRow
              key={link.href}
              title={t(link.titleKey)}
              subtitle={t(link.bodyKey)}
              onPress={() => router.push(link.href as never)}
            />
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hint: {
    marginBottom: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#5A7A72',
  },
});
