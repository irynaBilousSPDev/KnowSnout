import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
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
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { UserAvatar } from '@/src/components/UserAvatar';
import {
  defaultAvatarKeyForGender,
  userAvatarsForGender,
  type UserGender,
} from '@/src/constants/userAvatars';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { persistPickerAsset } from '@/src/lib/image';
import { notify } from '@/src/lib/notify';
import { getUserProfile, saveUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { UserProfile } from '@/src/types/userProfile';

const GENDERS: { id: UserGender; labelKey: string }[] = [
  { id: 'woman', labelKey: 'me.genderWoman' },
  { id: 'man', labelKey: 'me.genderMan' },
  { id: 'unspecified', labelKey: 'me.genderUnspecified' },
];

/** HTML · Редагування акаунта + фото / іконка. */
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
          setDisplayName(p?.display_name ?? '');
          setCity(p?.city ?? '');
        })
        .finally(() => setLoading(false));
    }, []),
  );

  const persist = async (
    patch: Parameters<typeof saveUserProfile>[0],
    opts?: { silent?: boolean; goBack?: boolean },
  ) => {
    setBusy(true);
    try {
      const next = await saveUserProfile(patch);
      setProfile(next);
      if (patch.display_name !== undefined) {
        setDisplayName(next.display_name ?? '');
      }
      if (patch.city !== undefined) {
        setCity(next.city ?? '');
      }
      if (!opts?.silent) {
        notify(t('me.savedTitle'), t('editAccount.saved'));
      }
      if (opts?.goBack) router.back();
      return next;
    } catch (err) {
      notify(
        t('common.error'),
        err instanceof Error ? err.message : t('me.saveError'),
      );
      return null;
    } finally {
      setBusy(false);
    }
  };

  const saveBasics = async () => {
    const name = displayName.trim();
    if (!name) {
      notify(t('common.error'), t('me.displayNameRequired'));
      return;
    }
    await persist(
      {
        display_name: name,
        city: city.trim() || null,
      },
      { goBack: true },
    );
  };

  const onPickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.error'), t('me.galleryPermission'));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });
    if (picked.canceled || !picked.assets[0]?.uri) return;
    try {
      const stableUri = await persistPickerAsset(
        picked.assets[0],
        'user-avatar',
      );
      await persist({ avatar_uri: stableUri }, { silent: true });
      notify(t('me.savedTitle'), t('me.photoSavedBody'));
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error && err.message === 'IMAGE_PERSIST_FAILED'
          ? t('photo.persistFailed')
          : err instanceof Error
            ? err.message
            : t('common.error'),
      );
    }
  };

  if (loading || !profile) {
    return <LoadingState message={t('common.loading')} />;
  }

  const pack = userAvatarsForGender(profile.gender);
  const shownName = profile.display_name?.trim() || t('me.title');

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
            <UserAvatar
              avatarKey={profile.avatar_key}
              avatarUri={profile.avatar_uri}
              gender={profile.gender}
              size={88}
              name={shownName}
            />
            <PrimaryButton
              label={t('me.addPhoto')}
              variant="secondary"
              onPress={() => void onPickPhoto()}
              style={styles.photoBtn}
            />
            {profile.avatar_uri ? (
              <Pressable
                onPress={() =>
                  void persist({ avatar_uri: null }, { silent: true })
                }
              >
                <Text style={styles.clearPhoto}>{t('me.clearPhoto')}</Text>
              </Pressable>
            ) : null}
          </View>

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

          <Text style={[styles.label, styles.section]}>
            {t('me.genderTitle')}
          </Text>
          <Text style={styles.hint}>{t('me.genderHint')}</Text>
          <View style={styles.genderRow}>
            {GENDERS.map((g) => {
              const active = profile.gender === g.id;
              return (
                <Pressable
                  key={g.id}
                  onPress={() =>
                    void persist(
                      {
                        gender: g.id,
                        avatar_key: defaultAvatarKeyForGender(g.id),
                        avatar_uri: profile.avatar_uri,
                      },
                      { silent: true },
                    )
                  }
                  style={[styles.genderChip, active && styles.genderChipOn]}
                >
                  <Text
                    style={[
                      styles.genderChipText,
                      active && styles.genderChipTextOn,
                    ]}
                  >
                    {t(g.labelKey)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {!profile.avatar_uri ? (
            <>
              <Text style={[styles.label, styles.section]}>
                {t('me.pickAvatar')}
              </Text>
              <View style={styles.avatarRow}>
                {pack.map((opt) => {
                  const active = profile.avatar_key === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() =>
                        void persist(
                          { avatar_key: opt.key },
                          { silent: true },
                        )
                      }
                      style={[
                        styles.avatarRing,
                        active && styles.avatarRingOn,
                      ]}
                    >
                      <UserAvatar
                        avatarKey={opt.key}
                        gender={profile.gender}
                        size={52}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}
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
  avatarBlock: { alignItems: 'center', gap: 10, marginBottom: 8 },
  photoBtn: { alignSelf: 'stretch' },
  clearPhoto: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.terracotta,
    paddingVertical: 4,
  },
  label: {
    marginTop: 12,
    marginBottom: 6,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  section: { marginTop: 20 },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
    marginBottom: 8,
    marginTop: -2,
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
  genderRow: { flexDirection: 'row', gap: 8 },
  genderChip: {
    flex: 1,
    alignItems: 'center',
    borderRadius: brand.radius.md,
    backgroundColor: brand.chipTrack,
    paddingVertical: 12,
  },
  genderChipOn: { backgroundColor: brand.accent },
  genderChipText: {
    textAlign: 'center',
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.ink,
  },
  genderChipTextOn: { color: '#FFFFFF' },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarRing: {
    borderRadius: 999,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarRingOn: { borderColor: brand.accent },
});
