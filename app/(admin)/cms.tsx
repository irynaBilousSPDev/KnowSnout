import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

const VERSIONS = [
  {
    id: 'schengen',
    title: 'Чек-лист Шенген (собаки/коти)',
    version: 'v4',
    status: 'published' as const,
    review: '07.2026',
  },
  {
    id: 'eu-passport',
    title: 'Чек-лист паспорта ЄС',
    version: 'v3',
    status: 'review' as const,
    review: '01.2026',
  },
  {
    id: 'f1',
    title: 'Ветсертифікат Ф1 (UA виїзд)',
    version: 'v2',
    status: 'published' as const,
    review: '05.2026',
  },
  {
    id: 'border',
    title: 'Вимоги перетину — Угринів/Рава-Руська',
    version: 'v1',
    status: 'draft' as const,
    review: '—',
  },
];

/** HTML · Контент-CMS — версії правил. */
export default function AdminCmsScreen() {
  return (
    <AppScreen edges={['bottom', 'top']}>
      <AppChromeHeader />
      <ScrHeader title={t('admin.cms')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.hint}>{t('admin.cmsHint')}</Text>
          {VERSIONS.map((v) => (
            <View key={v.id} style={styles.card}>
              <Text style={styles.title}>{v.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{v.version}</Text>
                </View>
                <View
                  style={[
                    styles.chip,
                    v.status === 'published' && styles.chipGood,
                    v.status === 'review' && styles.chipWarn,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      v.status === 'published' && styles.chipTextGood,
                      v.status === 'review' && styles.chipTextWarn,
                    ]}
                  >
                    {t(`admin.cmsStatus.${v.status}`)}
                  </Text>
                </View>
              </View>
              <Text style={styles.review}>
                {t('admin.cmsLastReview')}: {v.review}
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
    paddingTop: 4,
    paddingBottom: 40,
    gap: 10,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  metaRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  chip: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipWarn: { backgroundColor: brand.terracottaTint },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.ink,
  },
  chipTextGood: {
    fontFamily: fonts.bodyBold,
    color: brand.successDark,
  },
  chipTextWarn: {
    fontFamily: fonts.bodyBold,
    color: brand.terracotta,
  },
  review: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
});
