import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { UserAvatar } from '@/src/components/UserAvatar';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { listPets } from '@/src/services/pets';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { UserProfile } from '@/src/types/userProfile';

type MenuRow = {
  key: string;
  titleKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  href: string;
  meta?: string;
};

/** HTML phone “41 · Акаунт”. */
export default function MyDataScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [petCount, setPetCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void Promise.all([
        getUserProfile(),
        listPets().catch(() => []),
      ])
        .then(([next, pets]) => {
          setProfile(next);
          setPetCount(pets.length);
        })
        .finally(() => setLoading(false));
    }, []),
  );

  if (loading || !profile) {
    return <LoadingState message={t('common.loading')} />;
  }

  const shownName = profile.display_name?.trim() || t('me.title');
  const metaParts = [
    profile.city?.trim() || null,
    user?.email ?? null,
  ].filter(Boolean);

  const rows: MenuRow[] = [
    {
      key: 'edit',
      titleKey: 'editAccount.title',
      icon: 'create-outline',
      href: '/(app)/edit-account',
    },
    {
      key: 'pets',
      titleKey: 'me.openPets',
      icon: 'paw-outline',
      href: '/(app)/(tabs)/pets',
      meta: String(petCount),
    },
    {
      key: 'notifications',
      titleKey: 'notifications.title',
      icon: 'notifications-outline',
      href: '/(app)/notifications',
    },
    {
      key: 'lang',
      titleKey: 'settings.langAndPlan',
      icon: 'globe-outline',
      href: '/(app)/settings',
      meta: t('settings.langPlanMeta'),
    },
    {
      key: 'privacy',
      titleKey: 'privacy.titleAndData',
      icon: 'lock-closed-outline',
      href: '/(app)/privacy',
    },
    {
      key: 'help',
      titleKey: 'help.titleAndSupport',
      icon: 'chatbubble-ellipses-outline',
      href: '/(app)/help',
    },
  ];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.title}>{t('me.title')}</Text>

          <Pressable
            onPress={() => router.push('/(app)/edit-account' as never)}
            style={styles.hero}
          >
            <UserAvatar
              avatarKey={profile.avatar_key}
              avatarUri={profile.avatar_uri}
              gender={profile.gender}
              size={88}
              name={shownName}
            />
            <Text style={styles.heroName}>{shownName}</Text>
            {metaParts.length > 0 ? (
              <Text style={styles.heroMeta}>{metaParts.join(' · ')}</Text>
            ) : null}
            <Text style={styles.heroEdit}>{t('editAccount.title')}</Text>
          </Pressable>

          <View style={styles.menu}>
            {rows.map((row, i) => (
              <Pressable
                key={row.key}
                onPress={() => router.push(row.href as never)}
                style={[
                  styles.menuRow,
                  i < rows.length - 1 && styles.menuRowBorder,
                ]}
              >
                <View style={styles.menuLeft}>
                  <Ionicons name={row.icon} size={16} color={brand.ink} />
                  <Text style={styles.menuTitle}>{t(row.titleKey)}</Text>
                </View>
                {row.meta ? (
                  <Text style={styles.menuMeta}>{row.meta}</Text>
                ) : (
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={brand.mutedSoft}
                  />
                )}
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => signOut()} style={styles.signOut}>
            <Text style={styles.signOutText}>{t('common.signOut')}</Text>
          </Pressable>
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
    gap: 16,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  hero: { alignItems: 'center', gap: 8 },
  heroName: {
    fontFamily: fonts.title,
    fontSize: 16,
    color: brand.ink,
  },
  heroMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  heroEdit: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
  },
  menu: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  menuTitle: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.ink,
  },
  menuMeta: {
    fontFamily: fonts.body,
    fontSize: 13.5,
    color: brand.mutedSoft,
  },
  signOut: { paddingVertical: 10, alignItems: 'center' },
  signOutText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.terracotta,
  },
});
