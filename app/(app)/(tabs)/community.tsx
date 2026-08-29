import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { t } from '@/src/i18n';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Спільнота hub — квизи / форум / блог. */
const PRIMARY = [
  {
    key: 'spotlight',
    titleKey: 'spotlight.title',
    bodyKey: 'contests.teaserBody',
    icon: 'sparkles-outline' as const,
    href: '/(app)/spotlight-hub',
    tone: 'accent' as const,
  },
  {
    key: 'quiz',
    titleKey: 'community.quizHub',
    bodyKey: 'community.quizHubBody',
    icon: 'help-circle-outline' as const,
    href: '/(app)/(tabs)/quiz',
    tone: 'accent' as const,
  },
  {
    key: 'forum',
    titleKey: 'community.forum',
    bodyKey: 'community.forumBody',
    icon: 'chatbubbles-outline' as const,
    href: '/(app)/forum',
    tone: 'success' as const,
  },
  {
    key: 'blog',
    titleKey: 'community.blog',
    bodyKey: 'community.blogBody',
    icon: 'newspaper-outline' as const,
    href: '/(app)/blog',
    tone: 'neutral' as const,
  },
];

const SECONDARY = [
  { titleKey: 'community.leaderboard', href: '/(app)/quiz-leaderboard' },
  { titleKey: 'community.achievements', href: '/(app)/achievements' },
  { titleKey: 'friends.title', href: '/(app)/friends' },
  { titleKey: 'forum.search', href: '/(app)/forum-search' },
  { titleKey: 'forum.rules', href: '/(app)/forum-rules' },
  { titleKey: 'forum.notifications', href: '/(app)/forum-notifications' },
  { titleKey: 'blog.bookmarks', href: '/(app)/blog-bookmarks' },
];

export default function CommunityHubScreen() {
  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('tabs.community')}</Text>
          <Text style={styles.lead}>{t('community.lead')}</Text>

          {PRIMARY.map((p) => {
            const bg =
              p.tone === 'accent'
                ? brand.accentTint
                : p.tone === 'success'
                  ? brand.successTint
                  : brand.creamDeep;
            const fg =
              p.tone === 'accent'
                ? brand.accentDark
                : p.tone === 'success'
                  ? brand.successDark
                  : brand.ink;
            return (
              <Pressable
                key={p.key}
                onPress={() => router.push(p.href as never)}
                style={({ pressed }) => [styles.card, pressed && styles.pressed]}
              >
                <View style={[styles.icon, { backgroundColor: bg }]}>
                  <Ionicons name={p.icon} size={22} color={fg} />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.cardTitle}>{t(p.titleKey)}</Text>
                  <Text style={styles.cardBody}>{t(p.bodyKey)}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={brand.mutedSoft}
                />
              </Pressable>
            );
          })}

          <Text style={styles.section}>{t('check.moreSection')}</Text>
          {SECONDARY.map((item) => (
            <Pressable
              key={item.href}
              onPress={() => router.push(item.href as never)}
              style={styles.linkRow}
            >
              <Text style={styles.linkText}>{t(item.titleKey)}</Text>
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
  pad: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 40,
    gap: 10,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
    marginBottom: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.88 },
  icon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1 },
  cardTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  section: {
    marginTop: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.muted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  linkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accentDark,
  },
});
