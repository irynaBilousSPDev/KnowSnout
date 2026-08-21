import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
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

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { TextField } from '@/src/components/TextField';
import {
  avatarsForSpecies,
  defaultAvatarKey,
  pickUniqueAvatarKey,
  usedAvatarKeysFromPets,
  type AvatarKey,
} from '@/src/constants/avatars';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { persistPickerAsset } from '@/src/lib/image';
import {
  createPet,
  deletePet,
  getPet,
  listPets,
  updatePet,
} from '@/src/services/pets';
import type {
  ActivityLevel,
  CoatType,
  CompanionSpecies,
  DietType,
  IndoorOutdoor,
  LifeStage,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';

type ChipOption<T extends string> = { id: T; label: string };

function SectionTitle({ children }: { children: string }) {
  return (
    <Text className="mb-3 mt-2 font-body-bold text-lg text-forest-800">
      {children}
    </Text>
  );
}

function OptionChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: ChipOption<T>[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View className="mb-4 flex-row flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            className={`rounded-2xl px-4 py-2.5 ${
              active ? 'bg-forest-700' : 'bg-forest-100'
            }`}
          >
            <Text
              className={`font-body-bold text-sm ${
                active ? 'text-sand-50' : 'text-forest-700'
              }`}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function parseWeight(raw: string): number | null {
  const cleaned = raw.replace(',', '.').trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function isValidDate(raw: string) {
  if (!raw.trim()) return true;
  return /^\d{4}-\d{2}-\d{2}$/.test(raw.trim());
}

type SterilizedChoice = 'yes' | 'no' | 'unknown';

export default function PetFormScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const petId = typeof params.id === 'string' ? params.id : undefined;
  const isEdit = Boolean(petId);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<CompanionSpecies>('dog');
  const [breed, setBreed] = useState('');
  const [sex, setSex] = useState<PetSex>('unknown');
  const [birthDate, setBirthDate] = useState('');
  const [weight, setWeight] = useState('');
  const [idealWeight, setIdealWeight] = useState('');
  const [chipCode, setChipCode] = useState('');
  const [notes, setNotes] = useState('');
  const [favoriteFood, setFavoriteFood] = useState('');
  const [colorCoat, setColorCoat] = useState('');
  const [coatType, setCoatType] = useState<CoatType>('unknown');
  const [sizeCategory, setSizeCategory] = useState<SizeCategory>('unknown');
  const [sterilized, setSterilized] = useState<SterilizedChoice>('unknown');
  const [allergies, setAllergies] = useState('');
  const [conditions, setConditions] = useState('');
  const [medications, setMedications] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('unknown');
  const [dietType, setDietType] = useState<DietType>('unknown');
  const [lifeStage, setLifeStage] = useState<LifeStage>('unknown');
  const [indoorOutdoor, setIndoorOutdoor] = useState<IndoorOutdoor>('unknown');
  const [personality, setPersonality] = useState('');
  const [marks, setMarks] = useState('');
  const [acquiredDate, setAcquiredDate] = useState('');
  const [passport, setPassport] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(defaultAvatarKey('dog'));
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [usedKeys, setUsedKeys] = useState<string[]>([]);

  const avatarChoices = useMemo(() => avatarsForSpecies(species), [species]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: isEdit ? t('pets.formEditTitle') : t('pets.formAddTitle'),
    });
  }, [isEdit, navigation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pets = await listPets();
        if (cancelled) return;
        const used = usedAvatarKeysFromPets(pets, { exceptPetId: petId });
        setUsedKeys(used);
        if (!petId) setAvatarKey(pickUniqueAvatarKey('dog', used));
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [petId]);

  useEffect(() => {
    if (!petId) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const pet = await getPet(petId);
        if (cancelled) return;
        if (!pet) {
          setError(t('pets.notFound'));
          return;
        }
        setName(pet.name);
        setSpecies(pet.species);
        setBreed(pet.breed ?? '');
        setSex(pet.sex ?? 'unknown');
        setBirthDate(pet.birth_date ?? '');
        setWeight(pet.weight_kg != null ? String(pet.weight_kg) : '');
        setIdealWeight(
          pet.ideal_weight_kg != null ? String(pet.ideal_weight_kg) : '',
        );
        setChipCode(pet.chip_code ?? '');
        setNotes(pet.notes ?? '');
        setFavoriteFood(pet.favorite_food ?? '');
        setColorCoat(pet.color_coat ?? '');
        setCoatType(pet.coat_type ?? 'unknown');
        setSizeCategory(pet.size_category ?? 'unknown');
        setSterilized(
          pet.sterilized === true
            ? 'yes'
            : pet.sterilized === false
              ? 'no'
              : 'unknown',
        );
        setAllergies(pet.allergies ?? '');
        setConditions(pet.conditions ?? '');
        setMedications(pet.medications ?? '');
        setActivity(pet.activity_level ?? 'unknown');
        setDietType(pet.diet_type ?? 'unknown');
        setLifeStage(pet.life_stage ?? 'unknown');
        setIndoorOutdoor(pet.indoor_outdoor ?? 'unknown');
        setPersonality(pet.personality ?? '');
        setMarks(pet.distinctive_marks ?? '');
        setAcquiredDate(pet.acquired_date ?? '');
        setPassport(pet.passport_number ?? '');
        setVetName(pet.vet_name ?? '');
        setVetPhone(pet.vet_phone ?? '');
        setAvatarKey(
          (pet.avatar_key as AvatarKey | null) ?? defaultAvatarKey(pet.species),
        );
        setAvatarUri(pet.avatar_uri ?? null);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : t('pets.loadError'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [petId]);

  const onPickAvatarPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setError(t('pets.galleryPermission'));
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
        'pet-avatar',
      );
      setAvatarUri(stableUri);
    } catch (err) {
      setError(
        err instanceof Error && err.message === 'IMAGE_PERSIST_FAILED'
          ? t('photo.persistFailed')
          : err instanceof Error
            ? err.message
            : t('common.error'),
      );
    }
  };

  const onSave = async () => {
    setError(null);
    if (!name.trim()) {
      setError(t('pets.nameRequired'));
      return;
    }
    if (!isValidDate(birthDate) || !isValidDate(acquiredDate)) {
      setError(t('pets.dateInvalid'));
      return;
    }

    const weightKg = parseWeight(weight);
    const idealKg = parseWeight(idealWeight);
    if ((weight.trim() && weightKg === null) || (idealWeight.trim() && idealKg === null)) {
      setError(t('pets.weightInvalid'));
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        species,
        breed,
        sex,
        birth_date: birthDate,
        weight_kg: weightKg,
        ideal_weight_kg: idealKg,
        chip_code: chipCode,
        notes,
        favorite_food: favoriteFood,
        avatar_key: avatarUri ? null : avatarKey,
        avatar_uri: avatarUri,
        color_coat: colorCoat,
        coat_type: coatType === 'unknown' ? null : coatType,
        size_category: sizeCategory === 'unknown' ? null : sizeCategory,
        sterilized:
          sterilized === 'yes' ? true : sterilized === 'no' ? false : null,
        allergies,
        conditions,
        medications,
        activity_level: activity === 'unknown' ? null : activity,
        diet_type: dietType === 'unknown' ? null : dietType,
        life_stage: lifeStage === 'unknown' ? null : lifeStage,
        indoor_outdoor: indoorOutdoor === 'unknown' ? null : indoorOutdoor,
        personality,
        distinctive_marks: marks,
        acquired_date: acquiredDate,
        passport_number: passport,
        vet_name: vetName,
        vet_phone: vetPhone,
      };
      if (isEdit && petId) {
        await updatePet(petId, payload);
        router.replace({
          pathname: '/(app)/pet-profile',
          params: { id: petId },
        });
      } else {
        const created = await createPet(payload);
        router.replace({
          pathname: '/(app)/pet-profile',
          params: { id: created.id },
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pets.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!petId) return;
    const ok = await confirmAction({
      title: t('pets.deleteTitle'),
      message: t('pets.deleteMessage', { name: name || '…' }),
      confirmLabel: t('pets.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;

    setSaving(true);
    try {
      await deletePet(petId);
      router.replace('/(app)/(tabs)/pets');
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'NOT_OWNED'
          ? t('pets.deleteNotOwned')
          : err instanceof Error
            ? err.message
            : t('common.error');
      Alert.alert(t('pets.deleteFailed'), message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('pets.loading')} />;
  }

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="px-5 pb-10 pt-2"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-4 items-center">
            <PetAvatar
              avatarKey={avatarKey}
              avatarUri={avatarUri}
              species={species}
              size={88}
              name={name}
            />
            <Text className="mt-3 font-body-medium text-sm text-forest-700">
              {t('pets.avatar')}
            </Text>
            <Text className="mt-1 text-center font-body text-xs text-forest-500">
              {t('pets.avatarHint')}
            </Text>
          </View>

          <View className="mb-3 flex-row flex-wrap justify-center gap-3">
            {avatarChoices.map((option) => {
              const taken =
                usedKeys.includes(option.key) && option.key !== avatarKey;
              const active = !avatarUri && avatarKey === option.key;
              return (
                <Pressable
                  key={option.key}
                  disabled={taken}
                  onPress={() => {
                    setAvatarUri(null);
                    setAvatarKey(option.key);
                  }}
                  className={`rounded-full p-1 ${
                    active
                      ? 'border-2 border-forest-700'
                      : 'border-2 border-transparent'
                  } ${taken ? 'opacity-35' : ''}`}
                >
                  <PetAvatar
                    avatarKey={option.key}
                    species={species}
                    size={48}
                  />
                </Pressable>
              );
            })}
          </View>

          <PrimaryButton
            label={t('pets.avatarPhoto')}
            variant="secondary"
            onPress={() => void onPickAvatarPhoto()}
          />
          {avatarUri ? (
            <View className="mt-2">
              <PrimaryButton
                label={t('pets.avatarClearPhoto')}
                variant="ghost"
                onPress={() => setAvatarUri(null)}
              />
            </View>
          ) : null}

          <SectionTitle>{t('pets.sectionBasics')}</SectionTitle>
          <TextField
            label={t('pets.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('pets.namePlaceholder')}
            autoCapitalize="words"
          />
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.species')}
          </Text>
          <OptionChips
            value={species}
            onChange={(next) => {
              setSpecies(next);
              if (!avatarUri) {
                setAvatarKey(pickUniqueAvatarKey(next, usedKeys));
              }
              setLifeStage((prev) => {
                if (next === 'cat' && prev === 'puppy') return 'kitten';
                if (next === 'dog' && prev === 'kitten') return 'puppy';
                return prev;
              });
            }}
            options={[
              { id: 'dog', label: t('pets.speciesDog') },
              { id: 'cat', label: t('pets.speciesCat') },
              { id: 'bird', label: t('pets.speciesBird') },
              { id: 'other', label: t('pets.speciesOther') },
            ]}
          />
          <TextField
            label={t('pets.breed')}
            value={breed}
            onChangeText={setBreed}
            placeholder={t('pets.breedPlaceholder')}
            autoCapitalize="words"
          />
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.sex')}
          </Text>
          <OptionChips
            value={sex}
            onChange={setSex}
            options={[
              { id: 'female', label: t('pets.sexFemale') },
              { id: 'male', label: t('pets.sexMale') },
              { id: 'unknown', label: t('pets.sexUnknown') },
            ]}
          />
          <TextField
            label={t('pets.birthDate')}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder={t('pets.birthDatePlaceholder')}
            keyboardType="numbers-and-punctuation"
          />
          <TextField
            label={t('pets.acquiredDate')}
            value={acquiredDate}
            onChangeText={setAcquiredDate}
            placeholder={t('pets.birthDatePlaceholder')}
            keyboardType="numbers-and-punctuation"
          />
          <TextField
            label={t('pets.weight')}
            value={weight}
            onChangeText={setWeight}
            placeholder={t('pets.weightPlaceholder')}
            keyboardType="decimal-pad"
          />
          <TextField
            label={t('pets.idealWeight')}
            value={idealWeight}
            onChangeText={setIdealWeight}
            placeholder={t('pets.weightPlaceholder')}
            keyboardType="decimal-pad"
          />

          <SectionTitle>{t('pets.sectionLook')}</SectionTitle>
          <TextField
            label={t('pets.colorCoat')}
            value={colorCoat}
            onChangeText={setColorCoat}
            placeholder={t('pets.colorCoatPlaceholder')}
            autoCapitalize="sentences"
          />
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.coatType')}
          </Text>
          <OptionChips
            value={coatType}
            onChange={setCoatType}
            options={[
              { id: 'short', label: t('pets.coatShort') },
              { id: 'long', label: t('pets.coatLong') },
              { id: 'wire', label: t('pets.coatWire') },
              { id: 'curly', label: t('pets.coatCurly') },
              { id: 'hairless', label: t('pets.coatHairless') },
              { id: 'unknown', label: t('pets.unknown') },
            ]}
          />
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.sizeCategory')}
          </Text>
          <OptionChips
            value={sizeCategory}
            onChange={setSizeCategory}
            options={[
              { id: 'toy', label: t('pets.sizeToy') },
              { id: 'small', label: t('pets.sizeSmall') },
              { id: 'medium', label: t('pets.sizeMedium') },
              { id: 'large', label: t('pets.sizeLarge') },
              { id: 'giant', label: t('pets.sizeGiant') },
              { id: 'unknown', label: t('pets.unknown') },
            ]}
          />
          <TextField
            label={t('pets.marks')}
            value={marks}
            onChangeText={setMarks}
            placeholder={t('pets.marksPlaceholder')}
            autoCapitalize="sentences"
          />
          <TextField
            label={t('pets.personality')}
            value={personality}
            onChangeText={setPersonality}
            placeholder={t('pets.personalityPlaceholder')}
            autoCapitalize="sentences"
          />

          <SectionTitle>{t('pets.sectionHealth')}</SectionTitle>
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.sterilized')}
          </Text>
          <OptionChips
            value={sterilized}
            onChange={setSterilized}
            options={[
              { id: 'yes', label: t('pets.sterilizedYes') },
              { id: 'no', label: t('pets.sterilizedNo') },
              { id: 'unknown', label: t('pets.sterilizedUnknown') },
            ]}
          />
          <TextField
            label={t('pets.allergies')}
            value={allergies}
            onChangeText={setAllergies}
            placeholder={t('pets.allergiesPlaceholder')}
            autoCapitalize="sentences"
            multiline
          />
          <TextField
            label={t('pets.conditions')}
            value={conditions}
            onChangeText={setConditions}
            placeholder={t('pets.conditionsPlaceholder')}
            autoCapitalize="sentences"
            multiline
          />
          <TextField
            label={t('pets.medications')}
            value={medications}
            onChangeText={setMedications}
            placeholder={t('pets.medicationsPlaceholder')}
            autoCapitalize="sentences"
            multiline
          />

          <SectionTitle>{t('pets.sectionLifestyle')}</SectionTitle>
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.activity')}
          </Text>
          <OptionChips
            value={activity}
            onChange={setActivity}
            options={[
              { id: 'low', label: t('pets.activityLow') },
              { id: 'medium', label: t('pets.activityMedium') },
              { id: 'high', label: t('pets.activityHigh') },
              { id: 'unknown', label: t('pets.unknown') },
            ]}
          />
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.dietType')}
          </Text>
          <OptionChips
            value={dietType}
            onChange={setDietType}
            options={[
              { id: 'dry', label: t('pets.dietDry') },
              { id: 'wet', label: t('pets.dietWet') },
              { id: 'mixed', label: t('pets.dietMixed') },
              { id: 'raw', label: t('pets.dietRaw') },
              { id: 'homemade', label: t('pets.dietHomemade') },
              { id: 'unknown', label: t('pets.unknown') },
            ]}
          />
          <Text className="mb-2 font-body-medium text-sm text-forest-700">
            {t('pets.lifeStage')}
          </Text>
          <OptionChips
            value={lifeStage}
            onChange={setLifeStage}
            options={[
              ...(species === 'dog'
                ? [{ id: 'puppy' as const, label: t('pets.lifePuppy') }]
                : []),
              ...(species === 'cat'
                ? [{ id: 'kitten' as const, label: t('pets.lifeKitten') }]
                : []),
              { id: 'adult', label: t('pets.lifeAdult') },
              { id: 'senior', label: t('pets.lifeSenior') },
              { id: 'unknown', label: t('pets.unknown') },
            ]}
          />
          <TextField
            label={t('pets.favoriteFood')}
            value={favoriteFood}
            onChangeText={setFavoriteFood}
            placeholder={t('pets.favoriteFoodEmpty')}
            autoCapitalize="sentences"
          />
          {species === 'cat' || species === 'bird' || species === 'other' ? (
            <>
              <Text className="mb-2 font-body-medium text-sm text-forest-700">
                {t('pets.indoorOutdoor')}
              </Text>
              <OptionChips
                value={indoorOutdoor}
                onChange={setIndoorOutdoor}
                options={[
                  { id: 'indoor', label: t('pets.indoor') },
                  { id: 'outdoor', label: t('pets.outdoor') },
                  { id: 'both', label: t('pets.both') },
                  { id: 'unknown', label: t('pets.unknown') },
                ]}
              />
            </>
          ) : null}

          <SectionTitle>{t('pets.sectionDocs')}</SectionTitle>
          <TextField
            label={t('pets.chip')}
            value={chipCode}
            onChangeText={setChipCode}
            placeholder={t('pets.chipPlaceholder')}
          />
          <Text className="-mt-2 mb-4 font-body text-xs leading-5 text-forest-500">
            {t('pets.chipHint')}
          </Text>
          <TextField
            label={t('pets.passport')}
            value={passport}
            onChangeText={setPassport}
            placeholder={t('pets.passportPlaceholder')}
          />
          <TextField
            label={t('pets.vetName')}
            value={vetName}
            onChangeText={setVetName}
            autoCapitalize="words"
          />
          <TextField
            label={t('pets.vetPhone')}
            value={vetPhone}
            onChangeText={setVetPhone}
            keyboardType="numbers-and-punctuation"
          />
          <TextField
            label={t('pets.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('pets.notesPlaceholder')}
            autoCapitalize="sentences"
            multiline
          />

          {error ? (
            <View className="mb-4">
              <ErrorState message={error} />
            </View>
          ) : null}

          <PrimaryButton
            label={t('pets.save')}
            onPress={onSave}
            loading={saving}
            disabled={!name.trim()}
          />
          {isEdit ? (
            <View className="mt-3">
              <PrimaryButton
                label={t('pets.delete')}
                variant="ghost"
                onPress={onDelete}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
