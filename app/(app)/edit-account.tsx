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

import { AccountDashedAvatar } from '@/src/components/account/AccountUi';
import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { getUserProfile, saveUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { UserProfile } from '@/src/types/userProfile';

/** 07.07 · Редагування акаунта */
export default function EditAccountScreen() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void getUserProfile()
        .then((p) => {
          setProfile(p);
          setDisplayName(p?.display_name?.trim() || t('account.demoName'));
          setCity(p?.city?.trim() || t('account.demoCity'));
        })
        .finally(() => setLoading(false));
    }, []),
  );

  const saveBasics = async () => {
    const name = displayName.trim();
    if (!name) {
      notify(t('common.error'), t('me.displayNameRequired'));
      return;
    }
    setBusy(true);
    try {
      const next = await saveUserProfile({
        display_name: name,
        city: city.trim() || null,
      });
      setProfile(next);
      notify(t('me.savedTitle'), t('editAccount.saved'));
      router.back();
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('me.saveError'),
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading || !profile) {
    return <LoadingState message={t('common.loading')} />;
  }

  const email = user?.email ?? t('account.demoEmail');

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.hd}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.hdSide}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.hdTitle}>{t('editAccount.title')}</Text>
        <Pressable onPress={() => void saveBasics()} disabled={busy}>
          <Text style={styles.hdSave}>{t('common.save')}</Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.avatarBlock}>
            <AccountDashedAvatar size={96} />
          </View>

          <Text style={styles.label}>{t('account.nameLabel')}</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            style={styles.input}
            placeholderTextColor={brand.mutedSoft}
          />

          <Text style={styles.label}>{t('account.emailLabel')}</Text>
          <TextInput
            value={email}
            editable={false}
            style={[styles.input, styles.inputReadonly]}
          />

          <Text style={styles.label}>{t('account.cityLabel')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            style={styles.input}
            placeholderTextColor={brand.mutedSoft}
          />

          <Text style={styles.section}>{t('account.linkedAccounts')}</Text>
          <View style={styles.linkCard}>
            <View style={styles.linkRow}>
              <Text style={styles.linkName}>Google</Text>
              <View style={styles.linkBadgeGood}>
                <Text style={styles.linkBadgeGoodText}>
                  {t('account.connected')}
                </Text>
              </View>
            </View>
            <View style={[styles.linkRow, styles.linkRowBorder]}>
              <Text style={styles.linkName}>Apple</Text>
              <View style={styles.linkBadge}>
                <Text style={styles.linkBadgeText}>{t('account.connect')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  hd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  hdSide: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
    minWidth: 72,
  },
  hdTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  hdSave: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accentDark,
    minWidth: 72,
    textAlign: 'right',
  },
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  avatarBlock: { alignItems: 'center', marginBottom: 12 },
  label: {
    marginTop: 10,
    marginBottom: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.muted,
  },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  inputReadonly: { color: brand.muted },
  section: {
    marginTop: 20,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
  linkCard: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  linkRowBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
  },
  linkName: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: brand.ink,
  },
  linkBadgeGood: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.successTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  linkBadgeGoodText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: brand.successDark,
  },
  linkBadge: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  linkBadgeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: brand.ink,
  },
});
