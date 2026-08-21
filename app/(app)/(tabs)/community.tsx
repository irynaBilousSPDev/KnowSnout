import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

/** PDF 04 Спільнота: Квіз-хаб · Форум · Блог (+ рейтинг / досягнення / акаунт) */
const PRIMARY = [
  {
    key: 'quiz',
    titleKey: 'community.quizHub',
    bodyKey: 'community.quizHubBody',
    icon: 'help-circle-outline' as const,
    href: '/(app)/(tabs)/quiz',
    color: brand.navy,
  },
  {
    key: 'forum',
    titleKey: 'community.forum',
    bodyKey: 'community.forumBody',
    icon: 'chatbubbles-outline' as const,
    href: '/(app)/forum',
    color: brand.forest,
  },
  {
    key: 'blog',
    titleKey: 'community.blog',
    bodyKey: 'community.blogBody',
    icon: 'newspaper-outline' as const,
    href: '/(app)/blog',
    color: brand.rose,
  },
];

const SECONDARY = [
  {
    titleKey: 'community.leaderboard',
    href: '/(app)/quiz-leaderboard',
  },
  {
    titleKey: 'community.achievements',
    href: '/(app)/achievements',
  },
  {
    titleKey: 'me.title',
    href: '/(app)/my-data',
  },
];

export default function CommunityHubScreen() {
  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{t('tabs.community')}</Text>
            <ProfileEntry />
          </View>
          <Text style={styles.lead}>{t('community.lead')}</Text>

          {PRIMARY.map((p) => (
            <Pressable
              key={p.key}
              onPress={() => router.push(p.href as never)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.icon, { backgroundColor: p.color }]}>
                <Ionicons name={p.icon} size={22} color="#FFFFFF" />
              </View>
              <View style={styles.copy}>
                <Text style={styles.cardTitle}>{t(p.titleKey)}</Text>
                <Text style={styles.cardBody}>{t(p.bodyKey)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={brand.mistBorder}
              />
            </Pressable>
          ))}

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
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    color: brand.ink,
    letterSpacing: -0.5,
  },
  lead: {
    marginBottom: 16,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: brand.muted,
  },
  card: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  pressed: { opacity: 0.9 },
  icon: {
    marginRight: 12,
    height: 44,
    width: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, paddingRight: 8 },
  cardTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  section: {
    marginTop: 18,
    marginBottom: 6,
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
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
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: brand.navy,
  },
});
