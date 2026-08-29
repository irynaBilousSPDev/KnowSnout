import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  FORUM_SEARCH_TAGS,
  searchForum,
  type ForumThread,
} from '@/src/services/forum';
import { brand, fonts } from '@/src/theme/brand';

/** Screenshot 05.15 — search pill + tags + result cards */
export default function ForumSearchScreen() {
  const [query, setQuery] = useState('');
  const [tag, setTag] = useState<string>(FORUM_SEARCH_TAGS[0]);
  const [results, setResults] = useState<ForumThread[]>([]);

  const run = useCallback(async (q: string, activeTag?: string) => {
    setResults(await searchForum(q, activeTag));
  }, []);

  useEffect(() => {
    void run('', FORUM_SEARCH_TAGS[0]);
  }, [run]);

  const onChange = (q: string) => {
    setQuery(q);
    void run(q, tag);
  };

  const onTag = (next: string) => {
    setTag(next);
    void run(query, next);
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('forum.searchTitle')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color={brand.mutedSoft} />
            <TextInput
              value={query}
              onChangeText={onChange}
              onFocus={() => {
                if (results.length === 0) void run(query, tag);
              }}
              placeholder={t('forum.searchPlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.searchInput}
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tags}
          >
            {FORUM_SEARCH_TAGS.map((tg) => {
              const active = tg === tag;
              return (
                <Pressable
                  key={tg}
                  onPress={() => onTag(tg)}
                  style={[styles.tag, active && styles.tagActive]}
                >
                  <Text style={[styles.tagText, active && styles.tagTextActive]}>
                    #{tg}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {results.map((th) => (
            <Pressable
              key={th.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-thread',
                  params: { id: th.id },
                } as never)
              }
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Text style={styles.cardTitle} numberOfLines={2}>
                {th.title}
              </Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {t('forum.repliesShort', { count: th.replies })}
                </Text>
              </View>
            </Pressable>
          ))}

          {results.length === 0 && (query.trim() || tag) ? (
            <Text style={styles.empty}>{t('forum.searchEmpty')}</Text>
          ) : null}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 12,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    padding: 0,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  tag: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tagActive: {
    backgroundColor: brand.mist,
  },
  tagText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.ink,
  },
  tagTextActive: {
    fontFamily: fonts.bodyBold,
    color: brand.accent,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  pressed: { opacity: 0.88 },
  cardTitle: {
    flex: 1,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 20,
    color: brand.ink,
  },
  badge: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
});
