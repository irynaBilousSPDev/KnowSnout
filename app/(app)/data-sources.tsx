import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DATA_SOURCES,
  dataSourcesUpdatedNote,
  type DataSourceEntry,
} from '@/src/data/dataSources';
import { t } from '@/src/i18n';

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

export default function DataSourcesScreen() {
  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
        <Text className="font-body text-base leading-6 text-forest-600">
          {t('sources.lead')}
        </Text>
        <Text className="mt-2 font-body text-xs text-forest-500">
          {t('sources.updated', { date: dataSourcesUpdatedNote() })}
        </Text>

        {DATA_SOURCES.map((src) => (
          <View
            key={src.id}
            className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-5"
          >
            <Text className="font-body text-xs uppercase tracking-wide text-forest-500">
              {kindLabel(src.kind)}
            </Text>
            <Text className="mt-1 font-body-bold text-lg text-forest-900">
              {src.name}
            </Text>
            <Text className="mt-2 font-body text-sm leading-5 text-forest-700">
              {src.usedForUk}
            </Text>
            <Text className="mt-3 font-body text-sm leading-5 text-forest-600">
              {src.attributionUk}
            </Text>
            <Text className="mt-2 font-body text-xs leading-5 text-forest-500">
              {src.licenseOrTerms}
            </Text>
            <Pressable
              onPress={() => void Linking.openURL(src.homepage)}
              className="mt-3"
            >
              <Text className="font-body-bold text-sm text-forest-700">
                {t('sources.openLink')}
              </Text>
            </Pressable>
          </View>
        ))}

        <Text className="mt-6 font-body text-xs leading-5 text-forest-500">
          {t('sources.footer')}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
