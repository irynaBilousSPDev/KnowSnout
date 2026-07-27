import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  addFeedingLog,
  listFeedingLogs,
} from '@/src/services/feeding';
import {
  addPetPhoto,
  clearPetFavoriteFood,
  getPet,
  listPetPhotos,
  setPetFavoriteFood,
} from '@/src/services/pets';
import { listScans } from '@/src/services/scans';
import {
  listPetVaccines,
  vaccineDueStatus,
} from '@/src/services/vaccines';
import {
  careProgress,
  getCareToday,
} from '@/src/services/care';
import { vaccineLabel } from '@/src/constants/vaccines';
import type {
  ActivityLevel,
  CoatType,
  CompanionSpecies,
  DietType,
  IndoorOutdoor,
  PetPhotoRow,
  PetRow,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';
import type { CareDayLog } from '@/src/types/care';
import type { FeedingLogRow, ScanRow } from '@/src/types/scan';
import type { PetVaccineRow } from '@/src/types/vaccine';

function speciesLabel(species: CompanionSpecies) {
  if (species === 'dog') return t('pets.speciesDog');
  if (species === 'cat') return t('pets.speciesCat');
  return t('pets.speciesOther');
}

function sexLabel(sex: PetSex | null) {
  if (sex === 'female') return t('pets.sexFemale');
  if (sex === 'male') return t('pets.sexMale');
  if (sex === 'unknown') return t('pets.sexUnknown');
  return null;
}

function coatLabel(value: CoatType | null) {
  if (value === 'short') return t('pets.coatShort');
  if (value === 'long') return t('pets.coatLong');
  if (value === 'wire') return t('pets.coatWire');
  if (value === 'curly') return t('pets.coatCurly');
  if (value === 'hairless') return t('pets.coatHairless');
  return null;
}

function sizeLabel(value: SizeCategory | null) {
  if (value === 'toy') return t('pets.sizeToy');
  if (value === 'small') return t('pets.sizeSmall');
  if (value === 'medium') return t('pets.sizeMedium');
  if (value === 'large') return t('pets.sizeLarge');
  if (value === 'giant') return t('pets.sizeGiant');
  return null;
}

function activityLabel(value: ActivityLevel | null) {
  if (value === 'low') return t('pets.activityLow');
  if (value === 'medium') return t('pets.activityMedium');
  if (value === 'high') return t('pets.activityHigh');
  return null;
}

function dietLabel(value: DietType | null) {
  if (value === 'dry') return t('pets.dietDry');
  if (value === 'wet') return t('pets.dietWet');
  if (value === 'mixed') return t('pets.dietMixed');
  if (value === 'raw') return t('pets.dietRaw');
  if (value === 'homemade') return t('pets.dietHomemade');
  return null;
}

function indoorLabel(value: IndoorOutdoor | null) {
  if (value === 'indoor') return t('pets.indoor');
  if (value === 'outdoor') return t('pets.outdoor');
  if (value === 'both') return t('pets.both');
  return null;
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="mb-3">
      <Text className="font-body-medium text-xs uppercase tracking-wide text-forest-500">
        {label}
      </Text>
      <Text className="mt-1 font-body text-base text-forest-900">{value}</Text>
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View className="mt-4 rounded-3xl bg-white px-5 py-5">
      <Text className="mb-4 font-body-bold text-lg text-forest-800">{title}</Text>
      {children}
    </View>
  );
}

export default function PetProfileScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const petId = typeof params.id === 'string' ? params.id : undefined;

  const [pet, setPet] = useState<PetRow | null>(null);
  const [photos, setPhotos] = useState<PetPhotoRow[]>([]);
  const [feeds, setFeeds] = useState<FeedingLogRow[]>([]);
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [vaccines, setVaccines] = useState<PetVaccineRow[]>([]);
  const [care, setCare] = useState<CareDayLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPhoto, setAddingPhoto] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [feedNote, setFeedNote] = useState('');
  const [ateFully, setAteFully] = useState<boolean | null>(null);
  const [savingFeed, setSavingFeed] = useState(false);

  const load = useCallback(async () => {
    if (!petId) {
      setError(t('pets.notFound'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [nextPet, nextPhotos, nextFeeds, nextScans, nextVaccines, nextCare] =
        await Promise.all([
          getPet(petId),
          listPetPhotos(petId),
          listFeedingLogs(petId),
          listScans(),
          listPetVaccines(petId),
          getCareToday(petId),
        ]);
      if (!nextPet) {
        setError(t('pets.notFound'));
        setPet(null);
        return;
      }
      setPet(nextPet);
      setPhotos(nextPhotos);
      setFeeds(nextFeeds);
      setScans(nextScans);
      setVaccines(nextVaccines);
      setCare(nextCare);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pets.loadError'));
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onAddPhoto = async () => {
    if (!petId) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('common.error'), t('pets.galleryPermission'));
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
    });
    if (picked.canceled || !picked.assets[0]?.uri) return;

    setAddingPhoto(true);
    try {
      const { persistPickerAsset } = await import('@/src/lib/image');
      const stable = await persistPickerAsset(picked.assets[0], `pet-${petId}`);
      const photo = await addPetPhoto(petId, stable);
      setPhotos((prev) => [photo, ...prev]);
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error && err.message === 'IMAGE_PERSIST_FAILED'
          ? t('photo.persistFailed')
          : err instanceof Error
            ? err.message
            : t('common.error'),
      );
    } finally {
      setAddingPhoto(false);
    }
  };

  const onPickFavorite = async (scan: ScanRow) => {
    if (!petId) return;
    try {
      const updated = await setPetFavoriteFood(petId, {
        productName: scan.product_name,
        productId: scan.product_id ?? null,
      });
      setPet(updated);
      setPickerOpen(false);
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onClearFavorite = async () => {
    if (!petId) return;
    try {
      const updated = await clearPetFavoriteFood(petId);
      setPet(updated);
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    }
  };

  const onSaveFeed = async () => {
    if (!petId || !pet) return;
    const productName = pet.favorite_food?.trim();
    if (!productName) {
      Alert.alert(t('common.error'), t('pets.noScansForFavorite'));
      return;
    }
    setSavingFeed(true);
    try {
      const row = await addFeedingLog({
        petId,
        productName,
        productId: pet.favorite_product_id,
        ateFully,
        note: feedNote,
      });
      setFeeds((prev) => [row, ...prev]);
      setFeedOpen(false);
      setFeedNote('');
      setAteFully(null);
      Alert.alert(t('pets.feedingSaved'));
    } catch (err) {
      Alert.alert(
        t('common.error'),
        err instanceof Error ? err.message : t('common.error'),
      );
    } finally {
      setSavingFeed(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('pets.loading')} />;
  }

  if (error || !pet) {
    return (
      <SafeAreaView className="flex-1 bg-sand-50">
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </SafeAreaView>
    );
  }

  const fedToday = feeds.some((f) => {
    const d = new Date(f.fed_at);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  });
  const todayCare = care
    ? careProgress(care, { fedFromLogs: fedToday })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="px-5 pb-12 pt-2">
        <View className="items-center pb-6 pt-2">
          <PetAvatar
            avatarKey={pet.avatar_key}
            avatarUri={pet.avatar_uri}
            species={pet.species}
            size={112}
            name={pet.name}
          />
          <Text className="mt-4 font-display text-3xl text-forest-900">
            {pet.name}
          </Text>
          <Text className="mt-1 font-body text-base text-forest-600">
            {speciesLabel(pet.species)}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </Text>
          <Text className="mt-2 font-body text-sm text-forest-500">
            {pet.origin === 'shelter'
              ? t('pets.originShelter')
              : t('pets.originHome')}
          </Text>
        </View>

        <PrimaryButton
          label={t('pets.edit')}
          variant="secondary"
          onPress={() =>
            router.push({
              pathname: '/(app)/pet-form',
              params: { id: pet.id },
            })
          }
        />

        <Section title={t('pets.sectionBasics')}>
          <Fact label={t('pets.sex')} value={sexLabel(pet.sex)} />
          <Fact label={t('pets.birthDate')} value={pet.birth_date} />
          <Fact label={t('pets.acquiredDate')} value={pet.acquired_date} />
          <Fact
            label={t('pets.weight')}
            value={
              pet.weight_kg != null ? `${pet.weight_kg} ${t('pets.kg')}` : null
            }
          />
          <Fact
            label={t('pets.idealWeight')}
            value={
              pet.ideal_weight_kg != null
                ? `${pet.ideal_weight_kg} ${t('pets.kg')}`
                : null
            }
          />
          <Fact label={t('pets.notes')} value={pet.notes} />
        </Section>

        <Section title={t('pets.sectionLook')}>
          <Fact label={t('pets.colorCoat')} value={pet.color_coat} />
          <Fact label={t('pets.coatType')} value={coatLabel(pet.coat_type)} />
          <Fact
            label={t('pets.sizeCategory')}
            value={sizeLabel(pet.size_category)}
          />
          <Fact label={t('pets.marks')} value={pet.distinctive_marks} />
          <Fact label={t('pets.personality')} value={pet.personality} />
        </Section>

        <Section title={t('pets.sectionHealth')}>
          <Fact
            label={t('pets.sterilized')}
            value={
              pet.sterilized === true
                ? t('pets.sterilizedYes')
                : pet.sterilized === false
                  ? t('pets.sterilizedNo')
                  : null
            }
          />
          <Fact label={t('pets.allergies')} value={pet.allergies} />
          <Fact label={t('pets.conditions')} value={pet.conditions} />
          <Fact label={t('pets.medications')} value={pet.medications} />
        </Section>

        <Section title={t('pets.sectionLifestyle')}>
          <Fact
            label={t('pets.activity')}
            value={activityLabel(pet.activity_level)}
          />
          <Fact label={t('pets.dietType')} value={dietLabel(pet.diet_type)} />
          <Fact
            label={t('pets.favoriteFood')}
            value={pet.favorite_food || t('pets.favoriteFoodEmpty')}
          />
          <View className="mt-1 gap-2">
            <PrimaryButton
              label={t('pets.pickFavoriteFood')}
              variant="secondary"
              onPress={() => {
                if (scans.length === 0) {
                  Alert.alert(t('common.error'), t('pets.noScansForFavorite'));
                  return;
                }
                setPickerOpen(true);
              }}
            />
            {pet.favorite_food ? (
              <PrimaryButton
                label={t('pets.clearFavoriteFood')}
                variant="ghost"
                onPress={() => void onClearFavorite()}
              />
            ) : null}
          </View>
          <View className="mt-3">
            <Fact
              label={t('pets.indoorOutdoor')}
              value={indoorLabel(pet.indoor_outdoor)}
            />
          </View>
        </Section>

        <Section title={t('pets.feeding')}>
          <PrimaryButton
            label={t('pets.feedingAdd')}
            variant="secondary"
            onPress={() => {
              if (!pet.favorite_food) {
                Alert.alert(t('common.error'), t('pets.noScansForFavorite'));
                return;
              }
              setFeedOpen(true);
            }}
          />
          {feeds.length === 0 ? (
            <Text className="mt-3 font-body text-base text-forest-600">
              {t('pets.feedingEmpty')}
            </Text>
          ) : (
            feeds.slice(0, 8).map((feed) => (
              <View
                key={feed.id}
                className="mt-3 border-t border-forest-100 pt-3"
              >
                <Text className="font-body-bold text-sm text-forest-900">
                  {feed.product_name}
                </Text>
                <Text className="mt-1 font-body text-xs text-forest-500">
                  {new Date(feed.fed_at).toLocaleString('uk-UA')}
                  {feed.ate_fully === true
                    ? ` · ${t('pets.feedingAteYes')}`
                    : feed.ate_fully === false
                      ? ` · ${t('pets.feedingAteNo')}`
                      : ''}
                </Text>
                {feed.note ? (
                  <Text className="mt-1 font-body text-sm text-forest-700">
                    {feed.note}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </Section>

        <View className="mt-4 rounded-3xl bg-forest-100 px-5 py-5">
          <Text className="mb-2 font-body-bold text-lg text-forest-800">
            {t('care.waterTitle')}
          </Text>
          {todayCare ? (
            <Text className="mb-4 font-body text-base leading-6 text-forest-700">
              {t('care.progress', {
                done: todayCare.done,
                total: todayCare.total,
              })}
              {todayCare.water ? ` · ${t('care.waterDoneShort')}` : ''}
              {todayCare.play ? ` · ${t('care.playDoneShort')}` : ''}
              {todayCare.feed ? ` · ${t('care.feedDoneShort')}` : ''}
            </Text>
          ) : (
            <Text className="mb-4 font-body text-base leading-6 text-forest-700">
              {t('care.cardHint')}
            </Text>
          )}
          <PrimaryButton
            label={t('care.open')}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-care',
                params: { petId: pet.id },
              })
            }
          />
          <View className="mt-3">
            <PrimaryButton
              label={t('plants.open')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/plant-safety',
                  params: { petId: pet.id },
                })
              }
            />
          </View>
        </View>

        <Section title={t('pets.sectionDocs')}>
          <Fact label={t('pets.chip')} value={pet.chip_code} />
          <Fact label={t('pets.passport')} value={pet.passport_number} />
          <Fact label={t('pets.vetName')} value={pet.vet_name} />
          <Fact label={t('pets.vetPhone')} value={pet.vet_phone} />
          <View className="mt-2">
            <PrimaryButton
              label={t('travel.open')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/pet-travel',
                  params: { petId: pet.id },
                })
              }
            />
          </View>
        </Section>

        <View className="mt-4 rounded-3xl bg-white px-5 py-5">
          <Text className="mb-2 font-body-bold text-lg text-forest-800">
            {t('pets.vaccines')}
          </Text>
          {vaccines.length === 0 ? (
            <Text className="mb-4 font-body text-base leading-6 text-forest-600">
              {t('pets.vaccinesEmpty')}
            </Text>
          ) : (
            <View className="mb-4">
              {vaccines.slice(0, 3).map((v) => {
                const status = vaccineDueStatus(v.next_due_on);
                const name =
                  vaccineLabel(v.vaccine_key) ??
                  v.custom_name ??
                  v.vaccine_key ??
                  '—';
                const hint =
                  status === 'overdue'
                    ? t('vaccines.statusOverdue')
                    : status === 'soon'
                      ? t('vaccines.statusSoon')
                      : v.next_due_on
                        ? `${t('vaccines.nextDue')}: ${v.next_due_on}`
                        : t('vaccines.statusNone');
                return (
                  <Text
                    key={v.id}
                    className="mb-1 font-body text-sm text-forest-700"
                  >
                    {name} — {hint}
                  </Text>
                );
              })}
            </View>
          )}
          <PrimaryButton
            label={t('pets.vaccinesOpen')}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-vaccines',
                params: { petId: pet.id },
              })
            }
          />
        </View>

        <View className="mt-4 rounded-3xl bg-white px-5 py-5">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-body-bold text-lg text-forest-800">
              {t('pets.album')}
            </Text>
            <Pressable onPress={() => void onAddPhoto()} disabled={addingPhoto}>
              <Text className="font-body-bold text-sm text-forest-700">
                {addingPhoto ? '…' : t('pets.albumAdd')}
              </Text>
            </Pressable>
          </View>
          {photos.length === 0 ? (
            <Text className="font-body text-base text-forest-600">
              {t('pets.albumEmpty')}
            </Text>
          ) : (
            <FlatList
              data={photos}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              scrollEnabled={photos.length > 2}
              renderItem={({ item }) => {
                const uri = item.local_uri;
                if (!uri) return null;
                return (
                  <Image
                    source={{ uri }}
                    className="mr-3 h-28 w-28 rounded-2xl bg-forest-100"
                  />
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="max-h-[70%] rounded-t-3xl bg-sand-50 px-5 pb-8 pt-4">
            <Text className="mb-3 font-body-bold text-lg text-forest-800">
              {t('pets.pickFavoriteFood')}
            </Text>
            <FlatList
              data={scans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => void onPickFavorite(item)}
                  className="border-b border-forest-100 py-3 active:opacity-70"
                >
                  <Text className="font-body-bold text-base text-forest-900">
                    {item.product_name}
                  </Text>
                  <Text className="mt-1 font-body text-xs text-forest-500">
                    {new Date(item.created_at).toLocaleString('uk-UA')}
                  </Text>
                </Pressable>
              )}
            />
            <View className="mt-3">
              <PrimaryButton
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => setPickerOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={feedOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-3xl bg-sand-50 px-5 pb-8 pt-4">
            <Text className="mb-2 font-body-bold text-lg text-forest-800">
              {t('pets.feedingAdd')}
            </Text>
            <Text className="mb-3 font-body text-sm text-forest-600">
              {pet.favorite_food}
            </Text>
            <View className="mb-3 flex-row flex-wrap gap-2">
              {(
                [
                  [true, t('pets.feedingAteYes')],
                  [false, t('pets.feedingAteNo')],
                  [null, t('pets.feedingAteUnknown')],
                ] as const
              ).map(([value, label]) => {
                const active = ateFully === value;
                return (
                  <Pressable
                    key={String(value)}
                    onPress={() => setAteFully(value)}
                    className={`rounded-2xl px-4 py-2.5 ${
                      active ? 'bg-forest-700' : 'bg-forest-100'
                    }`}
                  >
                    <Text
                      className={`font-body-bold text-sm ${
                        active ? 'text-sand-50' : 'text-forest-700'
                      }`}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mb-2 font-body-medium text-sm text-forest-700">
              {t('pets.feedingNote')}
            </Text>
            <TextInput
              value={feedNote}
              onChangeText={setFeedNote}
              placeholder={t('pets.feedingNotePlaceholder')}
              placeholderTextColor="#9bbba5"
              multiline
              className="mb-4 min-h-[80px] rounded-2xl border border-forest-200 bg-white px-4 py-3 font-body text-base text-forest-900"
            />
            <PrimaryButton
              label={t('common.save')}
              onPress={() => void onSaveFeed()}
              loading={savingFeed}
            />
            <View className="mt-2">
              <PrimaryButton
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => setFeedOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
