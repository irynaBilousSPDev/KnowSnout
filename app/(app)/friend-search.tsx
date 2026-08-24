import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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

const FILTERS: { id: Filter; labelKey: string }[] = [
  { id: 'contacts', labelKey: 'friends.filterContacts' },
  { id: 'nearby', labelKey: 'friends.filterNearby' },
  { id: 'breeds', labelKey: 'friends.filterSameBreeds' },
];

/** Screenshot 04.09 · Пошук людей */
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
          <View style={styles.searchRow}>
            <Pressable
              onPress={() => router.back()}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel="Назад"
            >
              <Ionicons name="chevron-back" size={18} color={brand.ink} />
            </Pressable>
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
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <Pressable
                  key={f.id}
                  onPress={() => setFilter(f.id)}
                  style={[styles.chip, active && styles.chipOn]}
                >
                  <Text style={[styles.chipT, active && styles.chipTOn]}>
                    {t(f.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

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
                  <Text style={styles.meta}>{row.user.handle}</Text>
                </View>
                {row.relation === 'friends' ? (
                  <Text style={styles.friendLabel}>{t('friends.already')}</Text>
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
  pad: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40, gap: 10 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flex: 1,
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
  chips: { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.creamDeep,
  },
  chipOn: { backgroundColor: brand.accent },
  chipT: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  chipTOn: { color: '#FFFFFF' },
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
  friendLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.accent,
  },
  invited: {
    borderRadius: brand.radius.pill,
    borderWidth: 1.5,
    borderColor: brand.accent,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  invitedT: { fontFamily: fonts.bodySemi, fontSize: 12, color: brand.accent },
  add: {
    backgroundColor: brand.accent,
    borderRadius: brand.radius.pill,
    height: 34,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addT: { fontFamily: fonts.bodySemi, fontSize: 12, color: '#fff' },
});
