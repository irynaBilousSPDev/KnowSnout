import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { PetAvatar } from '@/src/components/PetAvatar';
import { PhotoAttachField } from '@/src/components/PhotoAttachField';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { CONTEST_PERIODS } from '@/src/types/contest';
import type { ContestEntry, ContestPeriod } from '@/src/types/contest';
import type { PetRow } from '@/src/types/pet';
import { t } from '@/src/i18n';
import { buildContestShareMessage } from '@/src/lib/share';
import {
  addContestEntry,
  buildContestPublicOwner,
  buildContestPublicPet,
  listContestEntries,
  listHeartedIds,
  toggleContestHeart,
} from '@/src/services/contests';
import { listPetPhotos, listPets } from '@/src/services/pets';
import { getUserProfile } from '@/src/services/userProfile';
import { brand } from '@/src/theme/brand';

export default function ContestsScreen() {
  const [period, setPeriod] = useState<ContestPeriod>('day');
  const [entries, setEntries] = useState<ContestEntry[]>([]);
  const [hearted, setHearted] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [pets, setPets] = useState<PetRow[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [species, setSpecies] = useState<'dog' | 'cat'>('cat');
  const [shareEntry, setShareEntry] = useState<ContestEntry | null>(null);

  const load = useCallback(async () => {
    const [list, hearts] = await Promise.all([
      listContestEntries(period),
      listHeartedIds(),
    ]);
    setEntries(list);
    setHearted(hearts);
  }, [period]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const openCompose = async () => {
    const myPets = await listPets();
    setPets(myPets);
    const first = myPets[0] ?? null;
    if (first && (first.species === 'cat' || first.species === 'dog')) {
      setSelectedPetId(first.id);
      setPetName(first.name);
      setSpecies(first.species);
    } else {
      setSelectedPetId(null);
    }
    setComposeOpen(true);
  };

  const selectPet = (pet: PetRow | null) => {
    if (!pet) {
      setSelectedPetId(null);
      return;
    }
    if (pet.species !== 'cat' && pet.species !== 'dog') {
      Alert.alert(t('common.error'), t('contests.pickPetDogsCats'));
      return;
    }
    setSelectedPetId(pet.id);
    setPetName(pet.name);
    setSpecies(pet.species);
  };

  const winner = entries[0] ?? null;

  const openEntry = (id: string) => {
    router.push({ pathname: '/(app)/contest-entry', params: { id } });
  };

  const onHeart = async (id: string) => {
    const result = await toggleContestHeart(id);
    setHearted((prev) => {
      const next = new Set(prev);
      if (result.hearted) next.add(id);
      else next.delete(id);
      return next;
    });
    setEntries((prev) =>
      [...prev]
        .map((e) => (e.id === id ? { ...e, hearts: result.hearts } : e))
        .sort((a, b) => b.hearts - a.hearts),
    );
  };

  const onSubmit = async () => {
    if (!imageUri) {
      Alert.alert(t('common.error'), t('contests.photoRequired'));
      return;
    }
    if (!petName.trim()) {
      Alert.alert(t('common.error'), t('contests.petNameRequired'));
      return;
    }

    const profile = await getUserProfile();
    const owner = buildContestPublicOwner(profile);
    let publicPet = null;
    let avatarKey = species === 'cat' ? 'cat-1' : 'dog-1';
    let petId: string | null = selectedPetId;

    if (selectedPetId) {
      const pet = pets.find((p) => p.id === selectedPetId);
      if (pet) {
        const photos = await listPetPhotos(pet.id);
        publicPet = buildContestPublicPet(pet, photos);
        avatarKey = pet.avatar_key || avatarKey;
        petId = pet.id;
      }
    }

    await addContestEntry({
      period,
      petName,
      caption,
      species,
      avatarKey,
      imageUri,
      petId,
      publicPet,
      owner,
    });
    setComposeOpen(false);
    setPetName('');
    setCaption('');
    setImageUri(null);
    setSelectedPetId(null);
    await load();
  };

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <View className="px-5 pb-2 pt-2">
        <ScreenHeader
          logo="none"
          showProfile={false}
          title={t('contests.title')}
          subtitle={t('contests.subtitle')}
        />
        <View className="mt-3 rounded-2xl bg-forest-100 px-4 py-3">
          <Text className="font-body text-xs leading-5 text-forest-700">
            {t('contests.disclaimer')}
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          {CONTEST_PERIODS.map((p) => {
            const active = period === p.id;
            return (
              <Pressable
                key={p.id}
                onPress={() => setPeriod(p.id)}
                className={`rounded-2xl px-3 py-2 ${
                  active ? 'bg-forest-700' : 'bg-forest-100'
                }`}
              >
                <Text
                  className={`font-body-bold text-xs ${
                    active ? 'text-sand-50' : 'text-forest-800'
                  }`}
                >
                  {t(p.titleKey)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <Text className="mt-2 font-body text-xs text-forest-500">
          {t(CONTEST_PERIODS.find((p) => p.id === period)?.hintKey ?? '')}
        </Text>
      </View>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-5 pb-10"
        ListHeaderComponent={
          winner ? (
            <Pressable
              onPress={() => openEntry(winner.id)}
              className="mb-4 overflow-hidden rounded-3xl border border-forest-100 bg-white active:opacity-95"
            >
              <View className="bg-forest-700 px-4 py-2">
                <Text className="font-body-bold text-xs uppercase tracking-wide text-sand-50">
                  {t('contests.winnerBadge')}
                </Text>
              </View>
              {winner.imageUri ? (
                <Image
                  source={{ uri: winner.imageUri }}
                  style={styles.winnerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.winnerFallback}>
                  <PetAvatar
                    avatarKey={winner.avatarKey}
                    species={winner.species}
                    size={100}
                    name={winner.petName}
                  />
                </View>
              )}
              <View className="px-4 py-4">
                <Text className="font-display text-2xl text-forest-900">
                  {winner.petName}
                </Text>
                <Text className="mt-1 font-body text-sm text-forest-600">
                  {winner.caption}
                </Text>
                {winner.owner?.displayName ? (
                  <Text className="mt-2 font-body text-xs text-forest-500">
                    {t('contests.ownerTitle')}: {winner.owner.displayName}
                  </Text>
                ) : null}
                <View className="mt-3 flex-row items-center justify-between">
                  <Text className="font-body-medium text-sm text-forest-700">
                    {winner.hearts} {t('contests.hearts')}
                  </Text>
                  <View className="flex-row items-center gap-4">
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation?.();
                        setShareEntry(winner);
                      }}
                      className="flex-row items-center gap-1.5 active:opacity-70"
                    >
                      <Ionicons
                        name="share-outline"
                        size={18}
                        color={brand.tealPressed}
                      />
                      <Text className="font-body-medium text-sm text-forest-700">
                        {t('share.button')}
                      </Text>
                    </Pressable>
                    <Text className="font-body-medium text-sm text-forest-700">
                      {t('contests.openDetails')} →
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          ) : (
            <Text className="mb-4 font-body text-sm text-forest-600">
              {t('contests.empty')}
            </Text>
          )
        }
        ListFooterComponent={
          <View className="mt-2">
            <PrimaryButton
              label={t('contests.join')}
              onPress={() => void openCompose()}
            />
            <PrimaryButton
              label={t('contests.backFeed')}
              variant="ghost"
              onPress={() => router.back()}
            />
          </View>
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() => openEntry(item.id)}
            className="mb-3 overflow-hidden rounded-3xl border border-forest-100 bg-white active:opacity-95"
          >
            {item.imageUri ? (
              <Image
                source={{ uri: item.imageUri }}
                style={styles.entryImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.entryFallback}>
                <PetAvatar
                  avatarKey={item.avatarKey}
                  species={item.species}
                  size={64}
                  name={item.petName}
                />
              </View>
            )}
            <View className="flex-row items-center px-4 py-3">
              <Text className="mr-3 w-6 font-body-bold text-sm text-forest-500">
                {index + 1}
              </Text>
              <View className="flex-1">
                <Text className="font-body-bold text-sm text-forest-900">
                  {item.petName}
                  {item.mine ? ` · ${t('contests.you')}` : ''}
                </Text>
                <Text
                  numberOfLines={1}
                  className="font-body text-xs text-forest-500"
                >
                  {item.caption}
                </Text>
                {item.owner?.displayName ? (
                  <Text
                    numberOfLines={1}
                    className="mt-0.5 font-body text-[11px] text-forest-400"
                  >
                    {item.owner.displayName}
                  </Text>
                ) : null}
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  setShareEntry(item);
                }}
                className="mr-3 items-center active:opacity-70"
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={brand.tealPressed}
                />
              </Pressable>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation?.();
                  void onHeart(item.id);
                }}
                className="items-center active:opacity-70"
              >
                <Ionicons
                  name={hearted.has(item.id) ? 'heart' : 'heart-outline'}
                  size={22}
                  color={
                    hearted.has(item.id) ? brand.score.poor : brand.tealPressed
                  }
                />
                <Text className="mt-0.5 font-body text-[11px] text-forest-600">
                  {item.hearts}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      <Modal visible={composeOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[92%] rounded-t-3xl bg-sand-50 px-5 pb-10 pt-5">
            <ScrollView keyboardShouldPersistTaps="handled">
              <Text className="font-display text-2xl text-forest-900">
                {t('contests.join')}
              </Text>

              <Text className="mt-4 font-body-medium text-sm text-forest-700">
                {t('contests.pickPet')}
              </Text>
              <Text className="mt-1 font-body text-xs text-forest-500">
                {t('contests.pickPetHint')}
              </Text>
              {pets.length === 0 ? (
                <Text className="mt-2 font-body text-sm text-forest-500">
                  {t('contests.pickPetEmpty')}
                </Text>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                  contentContainerStyle={{ gap: 10 }}
                >
                  <Pressable
                    onPress={() => selectPet(null)}
                    className={`min-w-[88px] items-center rounded-2xl px-3 py-3 ${
                      !selectedPetId ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`text-center font-body-bold text-xs ${
                        !selectedPetId ? 'text-sand-50' : 'text-forest-800'
                      }`}
                    >
                      {t('contests.pickPetNone')}
                    </Text>
                  </Pressable>
                  {pets.map((pet) => {
                    const active = selectedPetId === pet.id;
                    return (
                      <Pressable
                        key={pet.id}
                        onPress={() => selectPet(pet)}
                        className={`min-w-[88px] items-center rounded-2xl px-3 py-3 ${
                          active ? 'bg-forest-700' : 'bg-forest-100'
                        }`}
                      >
                        <PetAvatar
                          avatarKey={pet.avatar_key}
                          avatarUri={pet.avatar_uri}
                          species={pet.species}
                          size={40}
                          name={pet.name}
                        />
                        <Text
                          numberOfLines={1}
                          className={`mt-2 text-center font-body-bold text-xs ${
                            active ? 'text-sand-50' : 'text-forest-800'
                          }`}
                        >
                          {pet.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              <View className="mt-4">
                <PhotoAttachField
                  label={t('contests.photo')}
                  uri={imageUri}
                  onChange={setImageUri}
                  emptyHint={t('contests.photoHint')}
                  filePrefix="contest"
                  aspect={[1, 1]}
                  height={260}
                />
              </View>

              {!selectedPetId ? (
                <>
                  <View className="mt-4 flex-row gap-2">
                    {(['cat', 'dog'] as const).map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => setSpecies(s)}
                        className={`flex-1 items-center rounded-2xl py-3 ${
                          species === s ? 'bg-forest-700' : 'bg-forest-100'
                        }`}
                      >
                        <Text
                          className={`font-body-bold text-sm ${
                            species === s ? 'text-sand-50' : 'text-forest-800'
                          }`}
                        >
                          {s === 'cat'
                            ? t('stories.filterCats')
                            : t('stories.filterDogs')}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text className="mt-4 font-body-medium text-sm text-forest-700">
                    {t('contests.petName')}
                  </Text>
                  <TextInput
                    value={petName}
                    onChangeText={setPetName}
                    placeholder={t('contests.petNamePlaceholder')}
                    className="mt-2 rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
                    placeholderTextColor="#7FD9C9"
                  />
                </>
              ) : null}

              <Text className="mt-3 font-body-medium text-sm text-forest-700">
                {t('contests.caption')}
              </Text>
              <TextInput
                value={caption}
                onChangeText={setCaption}
                placeholder={t('contests.captionPlaceholder')}
                className="mt-2 rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
                placeholderTextColor="#7FD9C9"
              />
              <View className="mt-5 gap-3">
                <PrimaryButton
                  label={t('contests.submit')}
                  onPress={() => void onSubmit()}
                />
                <PrimaryButton
                  label={t('common.cancel')}
                  variant="ghost"
                  onPress={() => {
                    setComposeOpen(false);
                    setImageUri(null);
                  }}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <SharePhotoSheet
        visible={Boolean(shareEntry)}
        onClose={() => setShareEntry(null)}
        imageUri={shareEntry?.imageUri}
        title={t('share.dialogTitle')}
        message={
          shareEntry
            ? buildContestShareMessage({
                petName: shareEntry.petName,
                caption: shareEntry.caption,
              })
            : ''
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  winnerImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.mist,
  },
  winnerFallback: {
    width: '100%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.mist,
  },
  entryImage: {
    width: '100%',
    aspectRatio: 4 / 5,
    backgroundColor: brand.mist,
  },
  entryFallback: {
    width: '100%',
    aspectRatio: 4 / 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.mist,
  },
});
