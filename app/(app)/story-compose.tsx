import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { setStoryTagPhoto, getStoryTagResult } from '@/src/lib/storyTagDraft';
import { listFriends, type FriendUser } from '@/src/services/friends';
import { listPets } from '@/src/services/pets';
import { createStoryPost } from '@/src/services/stories';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';
import type { StoryPrivacy, StorySpecies } from '@/src/types/story';
import type { UserProfile } from '@/src/types/userProfile';

/** HTML 04.03 · Новий пост */
export default function StoryComposeScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [caption, setCaption] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [privacy, setPrivacy] = useState<StoryPrivacy>('public');
  const [petId, setPetId] = useState<string | null>(null);
  const [taggedPetIds, setTaggedPetIds] = useState<string[]>([]);
  const [taggedFriendIds, setTaggedFriendIds] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [spotlight, setSpotlight] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      void Promise.all([
        getUserProfile(),
        listPets().catch(() => [] as PetRow[]),
        listFriends().catch(() => [] as FriendUser[]),
      ]).then(([me, nextPets, nextFriends]) => {
        setProfile(me);
        setPets(nextPets);
        setFriends(nextFriends);
        setPetId((cur) => cur ?? nextPets[0]?.id ?? null);
        const tagged = getStoryTagResult().map((x) => x.name);
        const petIds = nextPets
          .filter((p) => tagged.includes(p.name))
          .map((p) => p.id);
        const friendIds = nextFriends
          .filter((f) => tagged.includes(f.name.split(' ')[0]))
          .map((f) => f.id);
        if (petIds.length) setTaggedPetIds(petIds);
        if (friendIds.length) setTaggedFriendIds(friendIds);
      });
    }, []),
  );

  const setPhotoAt = (index: number, uri: string | null) => {
    setPhotos((prev) => {
      const next = [...prev];
      if (!uri) {
        next.splice(index, 1);
        return next;
      }
      next[index] = uri;
      return next;
    });
    if (uri) setError(null);
  };

  const publish = async () => {
    const text = caption.trim();
    const imageUri = photos[0] ?? null;
    if (!imageUri) {
      setError(t('stories.photoRequired'));
      return;
    }
    if (!text) {
      setError(t('stories.captionRequired'));
      return;
    }
    setPublishing(true);
    try {
      const pet = pets.find((p) => p.id === petId) ?? null;
      const species: StorySpecies =
        pet?.species === 'dog' || pet?.species === 'cat' ? pet.species : 'dog';
      const taggedPetNames = taggedPetIds
        .map((id) => pets.find((p) => p.id === id)?.name)
        .filter((n): n is string => Boolean(n));
      const taggedFriendNames = taggedFriendIds
        .map((id) => friends.find((f) => f.id === id)?.name)
        .filter((n): n is string => Boolean(n));
      const captionWithLoc = location.trim()
        ? `${text}\n📍 ${location.trim()}`
        : text;
      await createStoryPost({
        caption: captionWithLoc,
        imageUri,
        species,
        privacy,
        petId: pet?.id ?? null,
        petName: pet?.name ?? null,
        avatarKey: pet?.avatar_key ?? null,
        taggedPetIds,
        taggedFriendIds,
        taggedPetNames,
        taggedFriendNames,
      });
      if (spotlight) {
        router.replace('/(app)/spotlight-apply' as never);
        return;
      }
      router.replace('/(app)/(tabs)/stories' as never);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('stories.publishError');
      setError(message);
      notify(t('common.error'), message);
    } finally {
      setPublishing(false);
    }
  };

  const displayName = profile?.display_name?.trim() || t('me.title');
  const companionPets = pets.filter(
    (p) => p.species === 'dog' || p.species === 'cat' || p.species === 'bird',
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.barTitle}>{t('stories.composeTitle')}</Text>
        <Pressable onPress={() => void publish()} disabled={publishing} hitSlop={8}>
          <Text style={[styles.publish, publishing && styles.dim]}>
            {t('stories.publish')}
          </Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <View style={styles.who}>
            <UserAvatar
              avatarKey={profile?.avatar_key}
              avatarUri={profile?.avatar_uri}
              gender={profile?.gender}
              size={40}
              name={displayName}
            />
            <Text style={styles.whoName}>{displayName}</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chips}
          >
            <Pressable
              onPress={() => setPetId(null)}
              style={[styles.chip, !petId && styles.chipOn]}
            >
              <View style={styles.dot} />
              <Text style={[styles.chipText, !petId && styles.chipTextOn]}>
                {t('stories.filterAll')}
              </Text>
            </Pressable>
            {companionPets.map((p) => {
              const on = petId === p.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => {
                    setPetId(p.id);
                    setTaggedPetIds((ids) =>
                      ids.includes(p.id) ? ids : [...ids, p.id],
                    );
                  }}
                  style={[styles.chip, on && styles.chipOn]}
                >
                  <Ionicons
                    name={p.species === 'cat' ? 'paw' : 'paw-outline'}
                    size={12}
                    color={on ? brand.accentDark : brand.muted}
                  />
                  <Text style={[styles.chipText, on && styles.chipTextOn]}>
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <TextInput
            value={caption}
            onChangeText={(v) => {
              setCaption(v);
              if (v.trim()) setError(null);
            }}
            placeholder={t('stories.captionPlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            multiline
            style={styles.caption}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photos}
          >
            {photos.map((uri, i) => (
              <View key={`${uri}-${i}`} style={styles.photoSlot}>
                <PhotoAttachField
                  label=""
                  uri={uri}
                  onChange={(next) => setPhotoAt(i, next)}
                  height={112}
                  aspect={[1, 1]}
                  filePrefix="story"
                />
              </View>
            ))}
            {photos.length < 4 ? (
              <View style={styles.photoSlot}>
                <PhotoAttachField
                  label={t('stories.addPhoto')}
                  uri={null}
                  onChange={(uri) => {
                    if (uri) setPhotos((prev) => [...prev, uri].slice(0, 4));
                  }}
                  emptyHint={t('stories.addPhoto')}
                  height={112}
                  aspect={[1, 1]}
                  filePrefix="story"
                />
              </View>
            ) : null}
          </ScrollView>

          <Pressable
            style={styles.row}
            onPress={() => {
              setStoryTagPhoto(photos[0] ?? null);
              router.push('/(app)/story-tag' as never);
            }}
          >
            <Ionicons name="paw-outline" size={18} color={brand.accent} />
            <Text style={styles.rowLabel}>{t('stories.tagPets')}</Text>
            <Text style={styles.rowValue} numberOfLines={1}>
              {taggedPetIds
                .map((id) => pets.find((p) => p.id === id)?.name)
                .filter(Boolean)
                .join(', ') || '—'}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={brand.mutedSoft} />
          </Pressable>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={18} color={brand.accent} />
            <Text style={styles.rowLabel}>{t('stories.location')}</Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder={t('stories.locationPlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              style={styles.rowInput}
            />
          </View>

          <View style={styles.row}>
            <Ionicons name="star-outline" size={18} color={brand.accent} />
            <Text style={[styles.rowLabel, { flex: 1 }]}>
              {t('stories.submitSpotlight')}
            </Text>
            <Switch
              value={spotlight}
              onValueChange={setSpotlight}
              trackColor={{ false: brand.chipTrack, true: brand.accentSoft }}
              thumbColor={spotlight ? brand.accent : brand.surfaceElevated}
            />
          </View>

          <Text style={styles.label}>{t('stories.privacy')}</Text>
          <View style={styles.chips}>
            {(
              [
                { id: 'public' as const, label: t('stories.privacyPublic') },
                { id: 'private' as const, label: t('stories.privacyPrivate') },
              ] as const
            ).map((item) => (
              <Pressable
                key={item.id}
                onPress={() => setPrivacy(item.id)}
                style={[styles.chip, privacy === item.id && styles.chipOn]}
              >
                <Text
                  style={[
                    styles.chipText,
                    privacy === item.id && styles.chipTextOn,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {friends.length > 0 ? (
            <>
              <Text style={styles.label}>{t('stories.tagFriends')}</Text>
              <View style={styles.chips}>
                {friends.map((f) => {
                  const on = taggedFriendIds.includes(f.id);
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() =>
                        setTaggedFriendIds((prev) =>
                          prev.includes(f.id)
                            ? prev.filter((x) => x !== f.id)
                            : [...prev, f.id],
                        )
                      }
                      style={[styles.chip, on && styles.chipOn]}
                    >
                      <Text style={[styles.chipText, on && styles.chipTextOn]}>
                        {f.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Text style={styles.disclaimer}>{t('stories.composeDisclaimer')}</Text>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  cancel: { fontFamily: fonts.body, fontSize: 14, color: brand.muted, width: 88 },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 16,
    color: brand.ink,
  },
  publish: {
    width: 88,
    textAlign: 'right',
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accent,
    textDecorationLine: 'underline',
  },
  dim: { opacity: 0.45 },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  who: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 },
  whoName: { fontFamily: fonts.bodySemi, fontSize: 14, color: brand.ink },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipOn: { backgroundColor: brand.accentTint },
  chipText: { fontFamily: fonts.bodyMedium, fontSize: 12, color: brand.muted },
  chipTextOn: { color: brand.accentDark, fontFamily: fonts.bodySemi },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  caption: {
    minHeight: 92,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: brand.accentBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  photos: { gap: 10, paddingVertical: 4 },
  photoSlot: { width: 124 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: brand.surfaceElevated,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.ink,
    width: 150,
  },
  rowValue: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    textAlign: 'right',
  },
  rowInput: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
    textAlign: 'right',
    padding: 0,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.muted,
    marginTop: 4,
  },
  error: { fontFamily: fonts.bodyMedium, fontSize: 13, color: brand.error },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 16,
    color: brand.mutedSoft,
    marginTop: 8,
  },
});
