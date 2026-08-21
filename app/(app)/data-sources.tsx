import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ScrHeader } from '@/src/components/ScrHeader';
import {
  DATA_SOURCES,
  dataSourcesUpdatedNote,
  type DataSourceEntry,
} from '@/src/data/dataSources';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

function kindLabel(kind: DataSourceEntry['kind']) {
  switch (kind) {
    case 'api':
      return t('sources.kindApi');
    case 'database':
      return t('sources.kindDatabase');
    case 'ai':
      return t('sources.kindAi');
    case 'catalog':
      return t('sources.kindCatalog');
    default:
      return t('sources.kindInfra');
  }
}

/** HTML kit · Джерела даних — soft white cards, Manrope titles. */
export default function DataSourcesScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('sources.title')} titleSize={20} />
      <ScrollView
        contentContainerStyle={styles.pad}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sub}>{t('sources.lead')}</Text>
        <Text style={styles.updated}>
          {t('sources.updated', { date: dataSourcesUpdatedNote() })}
        </Text>

        {DATA_SOURCES.map((src) => (
          <View key={src.id} style={styles.card}>
            <Text style={styles.kind}>{kindLabel(src.kind)}</Text>
            <Text style={styles.name}>{src.name}</Text>
            <Text style={styles.body}>{src.usedForUk}</Text>
            <Text style={styles.attr}>{src.attributionUk}</Text>
            <Text style={styles.license}>{src.licenseOrTerms}</Text>
            <Pressable
              onPress={() => void Linking.openURL(src.homepage)}
              style={styles.linkBtn}
            >
              <Text style={styles.link}>{t('sources.openLink')}</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.footer}>{t('sources.footer')}</Text>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  sub: {
    marginBottom: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
  },
  updated: {
    marginBottom: 14,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  card: {
    marginBottom: 12,
    borderRadius: brand.radius.lg,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  kind: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
  name: {
    marginTop: 4,
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
  },
  body: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  attr: {
    marginTop: 10,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
  },
  license: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.mutedSoft,
  },
  linkBtn: { marginTop: 12 },
  link: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.accent,
  },
  footer: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.mutedSoft,
  },
});
