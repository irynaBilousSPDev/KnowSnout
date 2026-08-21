import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  searchUsers,
  sendFriendRequest,
  type FriendUser,
} from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

export default function FriendSearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendUser[]>([]);

  const run = useCallback(async (q: string) => {
    setResults(await searchUsers(q));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void run('');
    }, [run]),
  );

  const onChange = (q: string) => {
    setQuery(q);
    void run(q);
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader
            title={t('friends.searchTitle')}
            subtitle={t('friends.searchSubtitle')}
          />
          <TextInput
            value={query}
            onChangeText={onChange}
            placeholder={t('friends.searchPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
            autoCapitalize="none"
          />
          {results.map((u) => (
            <ListRow
              key={u.id}
              title={u.name}
              subtitle={u.bio}
              meta={u.handle}
              leading={
                <Ionicons name="search-outline" size={22} color={brand.navy} />
              }
              trailing={
                <PrimaryButton
                  label={t('friends.add')}
                  size="sm"
                  block={false}
                  onPress={() =>
                    void sendFriendRequest(u.id).then((ok) => {
                      notify(
                        t('common.ok'),
                        ok ? t('friends.addDone') : t('friends.addSkip'),
                      );
                      void run(query);
                    })
                  }
                />
              }
              showChevron={false}
            />
          ))}
          {results.length === 0 ? (
            <Text style={styles.empty}>{t('friends.searchEmpty')}</Text>
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
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
