import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
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
import { listPets } from '@/src/services/pets';
import { getUserProfile, saveUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { UserProfile } from '@/src/types/userProfile';

const GENDERS: { id: UserGender; labelKey: string }[] = [
  { id: 'woman', labelKey: 'me.genderWoman' },
  { id: 'man', labelKey: 'me.genderMan' },
  { id: 'unspecified', labelKey: 'me.genderUnspecified' },
];

function speciesLabel(species: PetRow['species']) {
  if (species === 'dog') return t('pets.speciesDog');
  if (species === 'cat') return t('pets.speciesCat');
  return t('pets.speciesOther');
}

/** HTML kit · Профіль — Manrope 22, soft white cards, accent CTAs. */
export default function MyDataScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [next, nextPets] = await Promise.all([
        getUserProfile(),
        listPets().catch(() => [] as PetRow[]),
      ]);
      setProfile(next);
      setDisplayName(next?.display_name ?? '');
      setCity(next?.city ?? '');
      setPets(nextPets);
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
      if (patch.city !== undefined) {
        setCity(next.city ?? '');
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

  const onSaveProfileBasics = async () => {
    const name = displayName.trim();
    if (!name) {
      Alert.alert(t('common.error'), t('me.displayNameRequired'));
      return;
    }
    await persist({
      display_name: name,
      city: city.trim() || null,
    });
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
    <AppScreen edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.pad}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={styles.hero}>
            <UserAvatar
              avatarKey={profile.avatar_key}
              avatarUri={profile.avatar_uri}
              gender={profile.gender}
              size={104}
              name={shownName ?? t('me.title')}
            />
            <Text style={styles.heroTitle}>
              {shownName ?? t('me.title')}
            </Text>
            {profile.city ? (
              <Text style={styles.heroMeta}>{profile.city}</Text>
            ) : null}
            <Text style={styles.heroLead}>{t('me.subtitle')}</Text>
          </View>

          {__DEV__ ? (
            <View style={styles.devHint}>
              <Text style={styles.devHintText}>{t('me.localOnlyHint')}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <Text style={styles.kicker}>{t('me.account')}</Text>
            <Text style={styles.cardBody}>
              {user?.email ?? '—'}
            </Text>
          </View>

          <View style={styles.card}>
            <TextField
              label={t('me.displayName')}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder={t('me.displayNamePlaceholder')}
              autoCapitalize="words"
            />
            <View style={styles.fieldGap}>
              <TextField
                label={t('me.city')}
                value={city}
                onChangeText={setCity}
                placeholder={t('me.cityPlaceholder')}
                autoCapitalize="words"
              />
            </View>
            <View style={styles.btnGap}>
              <PrimaryButton
                label={t('me.saveProfile')}
                loading={saving}
                onPress={() => void onSaveProfileBasics()}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('me.kidsTitle')}</Text>
            <Text style={styles.cardLead}>
              {t('me.kidsCount', { count: String(pets.length) })}
            </Text>
            {pets.length === 0 ? (
              <Text style={styles.cardLead}>{t('me.kidsEmpty')}</Text>
            ) : (
              pets.map((pet) => (
                <Pressable
                  key={pet.id}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/pet-profile',
                      params: { id: pet.id },
                    })
                  }
                  style={styles.petRow}
                >
                  <PetAvatar
                    avatarKey={pet.avatar_key}
                    avatarUri={pet.avatar_uri}
                    species={pet.species}
                    size={44}
                    name={pet.name}
                  />
                  <View style={styles.petText}>
                    <Text style={styles.petName}>{pet.name}</Text>
                    <Text style={styles.petMeta}>
                      {speciesLabel(pet.species)}
                      {pet.breed ? ` · ${pet.breed}` : ''}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
            <View style={styles.btnGap}>
              <PrimaryButton
                label={t('me.openPets')}
                variant="secondary"
                onPress={() => router.push('/(app)/(tabs)/pets')}
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('me.genderTitle')}</Text>
            <Text style={styles.cardHint}>{t('me.genderHint')}</Text>
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
                <Text style={[styles.cardTitle, styles.avatarPickTitle]}>
                  {t('me.pickAvatar')}
                </Text>
                <View style={styles.avatarRow}>
                  {pack.map((opt) => {
                    const active = profile.avatar_key === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() =>
                          void persist({ avatar_key: opt.key }, { silent: true })
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

            <View style={styles.photoActions}>
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

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t('me.privacyTitle')}</Text>
            <Text style={styles.cardLead}>{t('me.privacyBody')}</Text>
          </View>

          <View style={styles.card}>
            <Text style={[styles.cardTitle, styles.systemTitle]}>
              {t('me.systemSection')}
            </Text>
            <ListRow
              title={t('settings.title')}
              subtitle={t('me.linkSettings')}
              onPress={() => router.push('/(app)/settings' as never)}
            />
            <ListRow
              title={t('notifications.title')}
              subtitle={t('me.linkNotifications')}
              onPress={() => router.push('/(app)/notifications' as never)}
            />
            <ListRow
              title={t('subscription.title')}
              subtitle={t('me.linkSubscription')}
              onPress={() => router.push('/(app)/subscription' as never)}
            />
            <ListRow
              title={t('editAccount.title')}
              subtitle={t('me.linkEditAccount')}
              onPress={() => router.push('/(app)/edit-account' as never)}
            />
          </View>

          <View style={styles.footerActions}>
            <PrimaryButton
              label={t('me.openMessages')}
              variant="secondary"
              onPress={() => router.push('/(app)/messages')}
            />
            <PrimaryButton
              label={t('sources.open')}
              variant="secondary"
              onPress={() => router.push('/(app)/data-sources')}
            />
          </View>

          <View style={styles.signOut}>
            <PrimaryButton
              label={t('common.signOut')}
              variant="ghost"
              onPress={() => signOut()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  hero: { alignItems: 'center', paddingBottom: 20, paddingTop: 8 },
  heroTitle: {
    marginTop: 16,
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  heroMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  heroLead: {
    marginTop: 4,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  devHint: {
    marginBottom: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  devHintText: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.accentDark,
  },
  card: {
    marginBottom: 12,
    borderRadius: brand.radius.lg,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  kicker: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
  cardTitle: {
    fontFamily: fonts.title,
    fontSize: 17,
    color: brand.ink,
  },
  cardBody: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  cardLead: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  cardHint: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  fieldGap: { marginTop: 12 },
  btnGap: { marginTop: 12 },
  petRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    paddingTop: 12,
  },
  petText: { marginLeft: 12, flex: 1 },
  petName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  petMeta: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  genderRow: { marginTop: 12, flexDirection: 'row', gap: 8 },
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
  avatarPickTitle: { marginTop: 18 },
  avatarRow: {
    marginTop: 12,
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
  photoActions: { marginTop: 18, gap: 10 },
  systemTitle: { marginBottom: 8 },
  footerActions: { marginTop: 4, gap: 10 },
  signOut: { marginTop: 20 },
});
