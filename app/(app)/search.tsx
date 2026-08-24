import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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

/** Screenshot 04.07 · Глобальний пошук */
export default function GlobalSearchScreen() {
  const [query, setQuery] = useState('корги');
  const results = useMemo(() => searchGlobal(query), [query]);

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.backRow}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel="Назад"
        >
          <Ionicons name="chevron-back" size={18} color={brand.ink} />
        </Pressable>
      </View>
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
                        <Text style={[styles.title, { flex: 1 }]}>
                          {h.title}
                        </Text>
                        <View style={styles.tag}>
                          <Text style={styles.tagT}>
                            {t('search.contains', { q: query || 'корги' })}
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={14}
                            color={brand.mutedSoft}
                          />
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
  backRow: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
  },
  back: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pad: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 40, gap: 16 },
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
  title: { fontFamily: fonts.bodySemi, fontSize: 14, color: brand.ink },
  sub: { fontFamily: fonts.body, fontSize: 12, color: brand.muted, marginTop: 2 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: brand.chipTrack,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    maxWidth: 130,
  },
  tagT: { fontFamily: fonts.body, fontSize: 10, color: brand.muted, flexShrink: 1 },
});
