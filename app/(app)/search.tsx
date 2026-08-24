import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PetAvatar } from '@/src/components/PetAvatar';
import { t } from '@/src/i18n';
import {
  searchGlobal,
  type SearchSectionId,
} from '@/src/services/globalSearch';
import { brand, fonts } from '@/src/theme/brand';

const SECTIONS: {
  id: SearchSectionId;
  titleKey: string;
}[] = [
  { id: 'people', titleKey: 'search.people' },
  { id: 'articles', titleKey: 'search.articles' },
  { id: 'quizzes', titleKey: 'search.quizzes' },
];

/** HTML 04.07 · Глобальний пошук */
export default function GlobalSearchScreen() {
  const [query, setQuery] = useState('корги');
  const results = useMemo(() => searchGlobal(query), [query]);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.search}>
            <Ionicons name="search" size={16} color={brand.muted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={t('search.placeholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
          {SECTIONS.map((sec) => {
            const hits = results[sec.id];
            if (hits.length === 0) return null;
            return (
              <View key={sec.id} style={styles.block}>
                <Text style={styles.section}>{t(sec.titleKey)}</Text>
                {hits.map((h) => (
                  <Pressable
                    key={h.id}
                    onPress={() => {
                      if (sec.id === 'people') {
                        router.push({
                          pathname: '/(app)/user-profile',
                          params: { userId: h.id },
                        } as never);
                      } else if (sec.id === 'articles') {
                        router.push('/(app)/blog' as never);
                      } else {
                        router.push('/(app)/(tabs)/quiz' as never);
                      }
                    }}
                    style={styles.card}
                  >
                    {sec.id === 'people' ? (
                      <>
                        <PetAvatar
                          avatarKey="woman-1"
                          species="dog"
                          size={36}
                          name={h.title}
                        />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.title}>{h.title}</Text>
                          <Text style={styles.sub}>{h.subtitle}</Text>
                        </View>
                      </>
                    ) : sec.id === 'articles' ? (
                      <Text style={styles.title}>{h.title}</Text>
                    ) : (
                      <>
                        <Text style={[styles.title, { flex: 1 }]}>{h.title}</Text>
                        <View style={styles.tag}>
                          <Text style={styles.tagT}>
                            {t('search.contains', { q: query || 'корги' })}
                          </Text>
                        </View>
                      </>
                    )}
                  </Pressable>
                ))}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40, gap: 16 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  block: { gap: 8 },
  section: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: brand.muted,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 14,
    padding: 12,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontFamily: fonts.bodySemi, fontSize: 14, color: brand.ink },
  sub: { fontFamily: fonts.body, fontSize: 12, color: brand.muted, marginTop: 2 },
  tag: {
    backgroundColor: brand.chipTrack,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 110,
  },
  tagT: { fontFamily: fonts.body, fontSize: 10, color: brand.muted },
});
