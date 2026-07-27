import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LoadingState } from '@/src/components/LoadingState';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { TextField } from '@/src/components/TextField';
import { UserAvatar } from '@/src/components/UserAvatar';
import {
  defaultAvatarKeyForGender,
  userAvatarsForGender,
  type UserGender,
} from '@/src/constants/userAvatars';
import { useAuth } from '@/src/hooks/useAuth';
import { t } from '@/src/i18n';
import { persistPickerAsset } from '@/src/lib/image';
import { getUserProfile, saveUserProfile } from '@/src/services/userProfile';
import type { UserProfile } from '@/src/types/userProfile';

const GENDERS: { id: UserGender; labelKey: string }[] = [
  { id: 'woman', labelKey: 'me.genderWoman' },
  { id: 'man', labelKey: 'me.genderMan' },
  { id: 'unspecified', labelKey: 'me.genderUnspecified' },
];

export default function MyDataScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getUserProfile();
      setProfile(next);
      setDisplayName(next?.display_name ?? '');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const persist = async (
    patch: Parameters<typeof saveUserProfile>[0],
    opts?: { silent?: boolean },
  ) => {
    setSaving(true);
    try {
      const next = await saveUserProfile(patch);
      setProfile(next);
      if (patch.display_name !== undefined) {
        setDisplayName(next.display_name ?? '');
      }
      if (!opts?.silent) {
        Alert.alert(t('me.savedTitle'), t('me.savedBody'));
      }
      return next;
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('me.saveError'),
      );
      return null;
    } finally {
      setSaving(false);
    }
  };

  const onSaveName = async () => {
    const name = displayName.trim();
    if (!name) {
      Alert.alert(t('common.error'), t('me.displayNameRequired'));
      return;
    }
    await persist({ display_name: name });
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
      Alert.alert(t('me.savedTitle'), t('me.photoSavedBody'));
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

  const onClearPhoto = async () => {
    await persist({ avatar_uri: null }, { silent: true });
  };

  if (loading || !profile) {
    return <LoadingState message={t('common.loading')} />;
  }

  const pack = userAvatarsForGender(profile.gender);
  const shownName = profile.display_name?.trim() || null;

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerClassName="px-5 pb-16 pt-2"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View className="items-center pb-6 pt-2">
            <UserAvatar
              avatarKey={profile.avatar_key}
              avatarUri={profile.avatar_uri}
              gender={profile.gender}
              size={104}
              name={shownName ?? t('me.title')}
            />
            <Text className="mt-4 font-display text-3xl text-forest-900">
              {shownName ?? t('me.title')}
            </Text>
            <Text className="mt-1 text-center font-body text-sm text-forest-600">
              {t('me.subtitle')}
            </Text>
          </View>

          <View className="mb-4 rounded-2xl bg-forest-100 px-4 py-3">
            <Text className="font-body text-xs leading-5 text-forest-700">
              {t('me.localOnlyHint')}
            </Text>
          </View>

          <View className="rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="font-body-medium text-xs uppercase tracking-wide text-forest-500">
              {t('me.account')}
            </Text>
            <Text className="mt-2 font-body text-base text-forest-900">
              {user?.email ?? '—'}
            </Text>
          </View>

          <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <TextField
              label={t('me.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('me.displayNamePlaceholder')}
              autoCapitalize="words"
            />
            <View className="mt-1">
              <PrimaryButton
                label={t('me.saveName')}
                loading={saving}
                onPress={() => void onSaveName()}
              />
            </View>
          </View>

          <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="font-body-bold text-base text-forest-900">
              {t('me.genderTitle')}
            </Text>
            <Text className="mt-1 font-body text-xs text-forest-500">
              {t('me.genderHint')}
            </Text>
            <View className="mt-3 flex-row gap-2">
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
                    className={`flex-1 items-center rounded-2xl py-3 ${
                      active ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-body-bold text-xs ${
                        active ? 'text-sand-50' : 'text-forest-800'
                      }`}
                    >
                      {t(g.labelKey)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {!profile.avatar_uri ? (
              <>
                <Text className="mt-5 font-body-bold text-base text-forest-900">
                  {t('me.pickAvatar')}
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-3">
                  {pack.map((opt) => {
                    const active = profile.avatar_key === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() =>
                          void persist({ avatar_key: opt.key }, { silent: true })
                        }
                        className={`rounded-full p-1 ${
                          active
                            ? 'border-2 border-forest-700'
                            : 'border-2 border-transparent'
                        }`}
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

            <View className="mt-5 gap-3">
              <PrimaryButton
                label={t('me.addPhoto')}
                variant="secondary"
                onPress={() => void onPickPhoto()}
              />
              {profile.avatar_uri ? (
                <PrimaryButton
                  label={t('me.clearPhoto')}
                  variant="ghost"
                  onPress={() => void onClearPhoto()}
                />
              ) : null}
            </View>
          </View>

          <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="font-body-bold text-lg text-forest-900">
              {t('me.privacyTitle')}
            </Text>
            <Text className="mt-2 font-body text-sm leading-5 text-forest-600">
              {t('me.privacyBody')}
            </Text>
          </View>

          <View className="mt-4">
            <PrimaryButton
              label={t('sources.open')}
              variant="secondary"
              onPress={() => router.push('/(app)/data-sources')}
            />
          </View>

          <View className="mt-6">
            <PrimaryButton
              label={t('common.signOut')}
              variant="ghost"
              onPress={() => signOut()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
