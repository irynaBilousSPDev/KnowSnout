import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { HubHero } from '@/src/components/HubHero';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { t } from '@/src/i18n';
import { brand } from '@/src/theme/brand';

type Pillar = {
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  tone: 'navy' | 'forest' | 'rose';
};

export default function CommunityHubScreen() {
  const pillars: Pillar[] = [
    {
      title: t('community.quizHub'),
      body: t('community.quizHubBody'),
      icon: 'help-circle-outline',
      href: '/(app)/(tabs)/quiz',
      tone: 'navy',
    },
    {
      title: t('community.forum'),
      body: t('community.forumBody'),
      icon: 'chatbubbles-outline',
      href: '/(app)/forum',
      tone: 'forest',
    },
    {
      title: t('community.blog'),
      body: t('community.blogBody'),
      icon: 'newspaper-outline',
      href: '/(app)/blog',
      tone: 'rose',
    },
  ];

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            brandMark
            title={t('tabs.community')}
            lead={t('community.lead')}
            right={<ProfileEntry />}
          />

          {pillars.map((p) => (
            <Pressable
              key={p.href}
              onPress={() => router.push(p.href as never)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <View
                style={[
                  styles.pillar,
                  p.tone === 'navy' && styles.pillarNavy,
                  p.tone === 'forest' && styles.pillarForest,
                  p.tone === 'rose' && styles.pillarRose,
                ]}
              >
                <View
                  style={[
                    styles.iconWrap,
                    p.tone === 'navy' && { backgroundColor: brand.navy },
                    p.tone === 'forest' && { backgroundColor: brand.forest },
                    p.tone === 'rose' && { backgroundColor: brand.rose },
                  ]}
                >
                  <Ionicons name={p.icon} size={22} color="#FFFFFF" />
                </View>
                <View style={styles.copy}>
                  <Text style={styles.pillarTitle}>{p.title}</Text>
                  <Text style={styles.pillarBody}>{p.body}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={brand.mistBorder}
                />
              </View>
            </Pressable>
          ))}

          <Text style={styles.section}>{t('community.sectionQuiz')}</Text>
          <Pressable
            onPress={() => router.push('/(app)/quiz-leaderboard' as never)}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>{t('community.leaderboard')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(app)/achievements' as never)}
            style={styles.linkRow}
          >
            <Text style={styles.linkText}>{t('community.achievements')}</Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  pressed: { opacity: 0.9 },
  pillar: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  pillarNavy: { borderColor: '#D5DCE6' },
  pillarForest: { borderColor: brand.mistBorder },
  pillarRose: { borderColor: brand.roseTint },
  iconWrap: {
    marginRight: 12,
    height: 44,
    width: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, paddingRight: 8 },
  pillarTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  pillarBody: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  section: {
    marginTop: 20,
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
