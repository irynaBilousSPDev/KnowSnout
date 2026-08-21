import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { listForumCategories } from '@/src/services/forum';
import { brand } from '@/src/theme/brand';

export default function ForumScreen() {
  const categories = listForumCategories();

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero title={t('forum.title')} lead={t('forum.subtitle')} />
          <PrimaryButton
            label={t('forum.newThread')}
            onPress={() => router.push('/(app)/forum-new' as never)}
          />

          <Text style={styles.section}>{t('forum.title')}</Text>
          {categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() =>
                router.push({
                  pathname: '/(app)/forum-category',
                  params: { id: c.id },
                } as never)
              }
              style={({ pressed }) => [styles.cat, pressed && styles.pressed]}
            >
              <View style={styles.catIcon}>
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color={brand.forest}
                />
              </View>
              <View style={styles.catCopy}>
                <Text style={styles.catTitle}>{c.title}</Text>
                <Text style={styles.catBody}>{c.body}</Text>
                <Text style={styles.catMeta}>
                  {t('forum.threadCount', { count: c.threadCount })}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={brand.mistBorder}
              />
            </Pressable>
          ))}

          <Text style={styles.section}>{t('check.moreSection')}</Text>
          {(
            [
              ['forum.search', '/(app)/forum-search'],
              ['forum.rules', '/(app)/forum-rules'],
              ['forum.notifications', '/(app)/forum-notifications'],
            ] as const
          ).map(([key, href]) => (
            <Pressable
              key={href}
              style={styles.linkRow}
              onPress={() => router.push(href as never)}
            >
              <Text style={styles.linkText}>{t(key)}</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={brand.mutedSoft}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  pressed: { opacity: 0.9 },
  section: {
    marginTop: 22,
    marginBottom: 10,
    fontFamily: 'Figtree_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
  cat: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  catIcon: {
    marginRight: 12,
    height: 40,
    width: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.forestTint,
  },
  catCopy: { flex: 1, paddingRight: 8 },
  catTitle: {
    fontFamily: 'Figtree_700Bold',
    fontSize: 16,
    color: brand.ink,
  },
  catBody: {
    marginTop: 4,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  catMeta: {
    marginTop: 6,
    fontFamily: 'Figtree_500Medium',
    fontSize: 12,
    color: brand.navy,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  linkText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 15,
    color: brand.navy,
  },
});
