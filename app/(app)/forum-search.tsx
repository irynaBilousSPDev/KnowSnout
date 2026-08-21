import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { searchForum, type ForumThread } from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

export default function ForumSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ForumThread[]>([]);

  const run = useCallback(async (q: string) => {
    setResults(await searchForum(q));
  }, []);

  const onChange = (q: string) => {
    setQuery(q);
    void run(q);
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('forum.searchTitle')}
            subtitle={t('forum.searchSubtitle')}
          />
          <TextInput
            value={query}
            onChangeText={onChange}
            onFocus={() => {
              if (results.length === 0) void run(query);
            }}
            placeholder={t('forum.searchPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          {results.map((th) => (
            <ListRow
              key={th.id}
              title={th.title}
              subtitle={th.preview}
              meta={th.author}
              leading={
                <Ionicons name="search-outline" size={22} color={brand.navy} />
              }
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-thread',
                  params: { id: th.id },
                } as never)
              }
            />
          ))}
          {results.length === 0 && query.trim() ? (
            <Text style={styles.empty}>{t('forum.searchEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  input: {
    marginBottom: 14,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
