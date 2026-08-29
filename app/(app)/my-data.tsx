import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AccountDashedAvatar } from '@/src/components/account/AccountUi';
import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { ScrHeader } from '@/src/components/ScrHeader';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { listPets } from '@/src/services/pets';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { UserProfile } from '@/src/types/userProfile';

/** 07.08 · Мій акаунт */
export default function MyDataScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [petCount, setPetCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void Promise.all([getUserProfile(), listPets().catch(() => [])])
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

  const shownName =
    profile.display_name?.trim() || t('account.demoName');
  const email = user?.email ?? t('account.demoEmail');
  const city = profile.city?.trim() || t('account.demoCity');
  const meta = `${city} · ${email}`;

  const rows = [
    {
      key: 'pets',
      title: t('account.myPets'),
      icon: 'paw-outline' as const,
      href: '/(app)/(tabs)/pets',
      meta: String(petCount || 2),
    },
    {
      key: 'notifications',
      title: t('notifications.title'),
      icon: 'notifications-outline' as const,
      href: '/(app)/notifications',
    },
    {
      key: 'lang',
      title: t('settings.langAndPlan'),
      icon: 'globe-outline' as const,
      href: '/(app)/settings',
      meta: t('settings.langPlanMeta'),
    },
    {
      key: 'appearance',
      title: t('appearance.title'),
      icon: 'color-palette-outline' as const,
      href: '/(app)/appearance',
    },
    {
      key: 'payments',
      title: t('payments.title'),
      icon: 'card-outline' as const,
      href: '/(app)/payments',
    },
    {
      key: 'blocked',
      title: t('blocked.title'),
      icon: 'ban-outline' as const,
      href: '/(app)/blocked-users',
    },
    {
      key: 'privacy',
      title: t('privacy.titleAndData'),
      icon: 'lock-closed-outline' as const,
      href: '/(app)/privacy',
    },
    {
      key: 'help',
      title: t('help.titleAndSupport'),
      icon: 'chatbubble-ellipses-outline' as const,
      href: '/(app)/help',
    },
  ];

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('me.title')} titleSize={20} />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Pressable
            onPress={() => router.push('/(app)/edit-account' as never)}
            style={styles.hero}
          >
            <AccountDashedAvatar size={96} />
            <Text style={styles.heroName}>{shownName}</Text>
            <Text style={styles.heroMeta}>{meta}</Text>
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
                  <Text style={styles.menuTitle}>{row.title}</Text>
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
    paddingTop: 4,
    paddingBottom: 40,
    gap: 16,
  },
  hero: { alignItems: 'center', gap: 8 },
  heroName: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  heroMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
  },
  menu: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: brand.mistBorder,
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
