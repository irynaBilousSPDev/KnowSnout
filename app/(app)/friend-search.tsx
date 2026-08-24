import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { FilterChips } from '@/src/components/FilterChips';
import { PetAvatar } from '@/src/components/PetAvatar';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import {
  searchPeople,
  sendFriendRequest,
  type FriendUser,
  type PeopleRelation,
} from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

type Filter = 'contacts' | 'nearby' | 'breeds';

/** HTML 04.09 · Пошук людей */
export default function FriendSearchScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('contacts');
  const [rows, setRows] = useState<
    { user: FriendUser; relation: PeopleRelation }[]
  >([]);

  const run = useCallback(async (q: string) => {
    setRows(await searchPeople(q));
  }, []);

  useFocusEffect(
    useCallback(() => {
      void run(query);
    }, [run, query]),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={brand.mutedSoft} />
            <TextInput
              value={query}
              onChangeText={(q) => {
                setQuery(q);
                void run(q);
              }}
              placeholder={t('friends.searchPlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.searchInput}
              autoCapitalize="none"
            />
          </View>
          <FilterChips
            options={[
              { id: 'contacts', label: t('friends.filterContacts') },
              { id: 'nearby', label: t('friends.filterNearby') },
              { id: 'breeds', label: t('friends.filterSameBreeds') },
            ]}
            value={filter}
            onChange={setFilter}
          />
          {rows
            .filter((row) => {
              if (filter === 'breeds') {
                return Boolean(row.user.speciesHint);
              }
              if (filter === 'nearby') {
                return Boolean(row.user.city);
              }
              return true;
            })
            .map((row) => (
              <Pressable
                key={row.user.id}
                onPress={() =>
                  router.push({
                    pathname: '/(app)/user-profile',
                    params: { userId: row.user.id },
                  } as never)
                }
                style={styles.card}
              >
                <PetAvatar
                  avatarKey={row.user.avatarKey}
                  species="dog"
                  size={44}
                  name={row.user.name}
                />
                <View style={styles.copy}>
                  <Text style={styles.name}>{row.user.name}</Text>
                  <Text style={styles.meta}>
                    {row.relation === 'friends'
                      ? row.user.handle
                      : row.user.mutualCount
                        ? `${row.user.handle} · ${t('profile.mutual', { n: String(row.user.mutualCount) })}`
                        : `${row.user.handle}${row.user.bio ? ` · ${row.user.bio}` : ''}`}
                  </Text>
                </View>
                {row.relation === 'friends' ? (
                  <View style={styles.friendChip}>
                    <Text style={styles.friendChipT}>{t('friends.already')}</Text>
                  </View>
                ) : row.relation === 'invited' ? (
                  <View style={styles.invited}>
                    <Text style={styles.invitedT}>{t('friends.invited')}</Text>
                  </View>
                ) : (
                  <Pressable
                    onPress={() =>
                      void sendFriendRequest(row.user.id).then((ok) => {
                        notify(
                          t('common.ok'),
                          ok ? t('friends.addDone') : t('friends.addSkip'),
                        );
                        void run(query);
                      })
                    }
                    style={styles.add}
                  >
                    <Text style={styles.addT}>{t('friends.addPlus')}</Text>
                  </Pressable>
                )}
              </Pressable>
            ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 10 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 14,
    padding: 12,
  },
  copy: { flex: 1, minWidth: 0 },
  name: { fontFamily: fonts.bodySemi, fontSize: 14, color: brand.ink },
  meta: { fontFamily: fonts.body, fontSize: 12, color: brand.muted, marginTop: 2 },
  already: { fontFamily: fonts.bodySemi, fontSize: 13, color: brand.accent },
  friendChip: {
    borderRadius: 999,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  friendChipT: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accent,
  },
  invited: {
    borderRadius: 10,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  invitedT: { fontFamily: fonts.body, fontSize: 12, color: brand.muted },
  add: {
    backgroundColor: brand.accent,
    borderRadius: 10,
    height: 32,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addT: { fontFamily: fonts.bodySemi, fontSize: 12, color: '#fff' },
});
