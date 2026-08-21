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

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { LoadingState } from '@/src/components/LoadingState';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { getUserProfile, saveUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';

/** HTML · Редагування акаунта. */
export default function EditAccountScreen() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void getUserProfile()
        .then((p) => {
          setDisplayName(p?.display_name ?? '');
          setCity(p?.city ?? '');
        })
        .finally(() => setLoading(false));
    }, []),
  );

  const save = async () => {
    const name = displayName.trim();
    if (!name) {
      notify(t('common.error'), t('me.displayNameRequired'));
      return;
    }
    setBusy(true);
    try {
      await saveUserProfile({
        display_name: name,
        city: city.trim() || null,
      });
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

  if (loading) {
    return <LoadingState message={t('common.loading')} />;
  }

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.hd}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.hdSide}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.hdTitle}>{t('editAccount.title')}</Text>
        <Pressable onPress={() => void save()} disabled={busy}>
          <Text style={styles.hdSave}>{t('common.save')}</Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.label}>{t('me.displayName')}</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder={t('me.displayNamePlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            autoCapitalize="words"
            style={styles.input}
          />
          <Text style={styles.label}>{t('me.account')}</Text>
          <View style={[styles.input, styles.inputReadonly]}>
            <Text style={styles.readonlyText}>{user?.email ?? '—'}</Text>
          </View>
          <Text style={styles.label}>{t('me.city')}</Text>
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder={t('me.cityPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            autoCapitalize="words"
            style={styles.input}
          />
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
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
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
    fontSize: 15,
    color: brand.ink,
  },
  inputReadonly: { justifyContent: 'center' },
  readonlyText: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.muted,
  },
});
