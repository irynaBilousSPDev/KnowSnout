import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import {
  searchGlobal,
  type SearchSectionId,
} from '@/src/services/globalSearch';
import { brand } from '@/src/theme/brand';

const SECTIONS: { id: SearchSectionId; titleKey: string; icon: keyof typeof Ionicons.glyphMap }[] =
  [
    { id: 'people', titleKey: 'search.people', icon: 'people-outline' },
    { id: 'pets', titleKey: 'search.pets', icon: 'paw-outline' },
    { id: 'articles', titleKey: 'search.articles', icon: 'newspaper-outline' },
    { id: 'food', titleKey: 'search.food', icon: 'nutrition-outline' },
  ];

export default function GlobalSearchScreen() {
  const [query, setQuery] = useState('');
  const results = useMemo(() => searchGlobal(query), [query]);

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('search.title')} subtitle={t('search.subtitle')} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search.placeholder')}
            placeholderTextColor="#8AA8A0"
            style={styles.input}
            autoCapitalize="none"
          />
          {SECTIONS.map((sec) => {
            const hits = results[sec.id];
            if (hits.length === 0) return null;
            return (
              <View key={sec.id}>
                <Text style={styles.section}>{t(sec.titleKey)}</Text>
                {hits.map((h) => (
                  <ListRow
                    key={h.id}
                    title={h.title}
                    subtitle={h.subtitle}
                    leading={
                      <Ionicons name={sec.icon} size={22} color={brand.navy} />
                    }
                    showChevron={false}
                  />
                ))}
              </View>
            );
          })}
          {SECTIONS.every((s) => results[s.id].length === 0) ? (
            <Text style={styles.empty}>{t('search.empty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  input: {
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: brand.ink,
  },
  section: {
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: '#5A6B7D',
  },
  empty: {
    marginTop: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#5A6B7D',
  },
});
