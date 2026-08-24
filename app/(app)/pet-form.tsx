import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
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

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
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
import { brand, fonts } from '@/src/theme/brand';
import type {
  ActivityLevel,
  CoatType,
  CompanionSpecies,
  DietType,
  IndoorOutdoor,
  LifeStage,
  PetOrigin,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';

type ChipOption<T extends string> = { id: T; label: string };
type SectionId = 'basics' | 'health' | 'nutrition' | 'docs' | 'origin';

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
    <View style={styles.chipsRow}>
      {options.map((option) => {
        const active = value === option.id;
        return (
          <Pressable
            key={option.id}
            onPress={() => onChange(option.id)}
            style={[styles.chip, active ? styles.chipActive : styles.chipIdle]}
          >
            <Text
              style={[
                styles.chipText,
                active ? styles.chipTextActive : styles.chipTextIdle,
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
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
  const params = useLocalSearchParams<{
    id?: string;
    breed?: string;
    species?: string;
    profileKind?: string;
  }>();
  const petId = typeof params.id === 'string' ? params.id : undefined;
  const isEdit = Boolean(petId);
  const prefillBreed =
    typeof params.breed === 'string' ? params.breed.trim() : '';
  const prefillSpecies: CompanionSpecies | null =
    params.species === 'cat' ||
    params.species === 'dog' ||
    params.species === 'bird' ||
    params.species === 'other'
      ? params.species
      : null;
  const profileKind =
    params.profileKind === 'rodent' ||
    params.profileKind === 'rabbit' ||
    params.profileKind === 'other'
      ? params.profileKind
      : null;

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<SectionId>('basics');

  const [name, setName] = useState('');
  const [species, setSpecies] = useState<CompanionSpecies>(
    prefillSpecies ?? 'dog',
  );
  const [breed, setBreed] = useState(prefillBreed);
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
  const [origin, setOrigin] = useState<PetOrigin>('home');
  const [passport, setPassport] = useState('');
  const [vetName, setVetName] = useState('');
  const [vetPhone, setVetPhone] = useState('');
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(
    defaultAvatarKey(prefillSpecies ?? 'dog'),
  );
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [usedKeys, setUsedKeys] = useState<string[]>([]);
  const [wingspan, setWingspan] = useState('');
  const [cageSize, setCageSize] = useState('');
  const [storedProfileKind, setStoredProfileKind] = useState<string | null>(
    profileKind,
  );

  const avatarChoices = useMemo(() => avatarsForSpecies(species), [species]);

  const sectionComplete = useMemo(() => {
    const basics =
      Boolean(name.trim()) ||
      Boolean(breed.trim()) ||
      Boolean(birthDate.trim()) ||
      sex !== 'unknown' ||
      Boolean(colorCoat.trim()) ||
      coatType !== 'unknown' ||
      sizeCategory !== 'unknown' ||
      Boolean(personality.trim()) ||
      Boolean(marks.trim()) ||
      Boolean(avatarUri);
    const health =
      Boolean(weight.trim()) ||
      Boolean(idealWeight.trim()) ||
      lifeStage !== 'unknown' ||
      sterilized !== 'unknown' ||
      Boolean(allergies.trim()) ||
      Boolean(conditions.trim()) ||
      Boolean(medications.trim()) ||
      activity !== 'unknown' ||
      Boolean(vetName.trim()) ||
      Boolean(vetPhone.trim());
    const nutrition =
      Boolean(favoriteFood.trim()) ||
      dietType !== 'unknown' ||
      indoorOutdoor !== 'unknown';
    const docs =
      Boolean(chipCode.trim()) ||
      Boolean(passport.trim()) ||
      Boolean(notes.trim());
    const originDone =
      Boolean(acquiredDate.trim()) || origin === 'shelter';
    return {
      basics,
      health,
      nutrition,
      docs,
      origin: originDone,
    } as const;
  }, [
    name,
    breed,
    birthDate,
    sex,
    colorCoat,
    coatType,
    sizeCategory,
    personality,
    marks,
    avatarUri,
    weight,
    idealWeight,
    lifeStage,
    sterilized,
    allergies,
    conditions,
    medications,
    activity,
    vetName,
    vetPhone,
    favoriteFood,
    dietType,
    indoorOutdoor,
    chipCode,
    passport,
    notes,
    acquiredDate,
    origin,
  ]);

  const completedCount = useMemo(
    () =>
      (['basics', 'health', 'nutrition', 'docs', 'origin'] as const).filter(
        (id) => sectionComplete[id],
      ).length,
    [sectionComplete],
  );

  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const pets = await listPets();
        if (cancelled) return;
        const used = usedAvatarKeysFromPets(pets, { exceptPetId: petId });
        setUsedKeys(used);
        if (!petId) {
          setAvatarKey(pickUniqueAvatarKey(prefillSpecies ?? 'dog', used));
        }
      } catch {
        // keep defaults
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [petId, prefillSpecies]);

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
        setOrigin(pet.origin ?? 'home');
        setPassport(pet.passport_number ?? '');
        setVetName(pet.vet_name ?? '');
        setVetPhone(pet.vet_phone ?? '');
        setAvatarKey(
          (pet.avatar_key as AvatarKey | null) ?? defaultAvatarKey(pet.species),
        );
        setAvatarUri(pet.avatar_uri ?? null);
        const extras = pet.extras ?? {};
        setWingspan(
          extras.wingspan_cm != null ? String(extras.wingspan_cm) : '',
        );
        setCageSize(
          extras.cage_size != null ? String(extras.cage_size) : '',
        );
        setStoredProfileKind(
          typeof extras.profile_kind === 'string'
            ? extras.profile_kind
            : null,
        );
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
      setOpenSection('basics');
      return;
    }
    if (!isValidDate(birthDate) || !isValidDate(acquiredDate)) {
      setError(t('pets.dateInvalid'));
      return;
    }

    const weightKg = parseWeight(weight);
    const idealKg = parseWeight(idealWeight);
    if (
      (weight.trim() && weightKg === null) ||
      (idealWeight.trim() && idealKg === null)
    ) {
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
        origin,
        passport_number: passport,
        vet_name: vetName,
        vet_phone: vetPhone,
        extras_patch: {
          ...(storedProfileKind
            ? { profile_kind: storedProfileKind }
            : {}),
          ...(species === 'bird'
            ? {
                wingspan_cm: wingspan.trim() || null,
                cage_size: cageSize.trim() || null,
              }
            : {}),
        },
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

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? prev : id));
  };

  if (loading) {
    return <LoadingState message={t('pets.loading')} />;
  }

  const sections: {
    id: SectionId;
    title: string;
    body: ReactNode;
  }[] = [
    {
      id: 'basics',
      title: t('pets.sectionBasics'),
      body: (
        <>
          <View style={styles.avatarBlock}>
            <PetAvatar
              avatarKey={avatarKey}
              avatarUri={avatarUri}
              species={species}
              size={80}
              name={name}
            />
            <Text style={styles.avatarHint}>{t('pets.avatarHint')}</Text>
          </View>
          <View style={styles.avatarChoices}>
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
                  style={[
                    styles.avatarChoice,
                    active && styles.avatarChoiceActive,
                    taken && styles.avatarChoiceTaken,
                  ]}
                >
                  <PetAvatar
                    avatarKey={option.key}
                    species={species}
                    size={44}
                  />
                </Pressable>
              );
            })}
          </View>
          <PrimaryButton
            label={t('pets.avatarPhoto')}
            variant="secondary"
            size="sm"
            onPress={() => void onPickAvatarPhoto()}
          />
          {avatarUri ? (
            <View style={styles.avatarClear}>
              <PrimaryButton
                label={t('pets.avatarClearPhoto')}
                variant="ghost"
                size="sm"
                onPress={() => setAvatarUri(null)}
              />
            </View>
          ) : null}
          <TextField
            label={t('pets.name')}
            value={name}
            onChangeText={setName}
            placeholder={t('pets.namePlaceholder')}
            autoCapitalize="words"
          />
          <FieldLabel>{t('pets.species')}</FieldLabel>
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
          {species === 'bird' ? (
            <>
              <TextField
                label={t('pets.wingspan')}
                value={wingspan}
                onChangeText={setWingspan}
                placeholder={t('pets.wingspanPlaceholder')}
              />
              <TextField
                label={t('pets.cage')}
                value={cageSize}
                onChangeText={setCageSize}
                placeholder={t('pets.cagePlaceholder')}
              />
            </>
          ) : null}
          <FieldLabel>{t('pets.sex')}</FieldLabel>
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
            label={t('pets.colorCoat')}
            value={colorCoat}
            onChangeText={setColorCoat}
            placeholder={t('pets.colorCoatPlaceholder')}
            autoCapitalize="sentences"
          />
          <FieldLabel>{t('pets.coatType')}</FieldLabel>
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
          <FieldLabel>{t('pets.sizeCategory')}</FieldLabel>
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
        </>
      ),
    },
    {
      id: 'health',
      title: t('pets.sectionHealthWeight'),
      body: (
        <>
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
          <FieldLabel>{t('pets.lifeStage')}</FieldLabel>
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
          <FieldLabel>{t('pets.sterilized')}</FieldLabel>
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
          <FieldLabel>{t('pets.activity')}</FieldLabel>
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
          <Text style={styles.hint}>{t('pets.vaccinesSoon')}</Text>
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
        </>
      ),
    },
    {
      id: 'nutrition',
      title: t('pets.sectionNutrition'),
      body: (
        <>
          <TextField
            label={t('pets.favoriteFood')}
            value={favoriteFood}
            onChangeText={setFavoriteFood}
            placeholder={t('pets.favoriteFoodEmpty')}
            autoCapitalize="sentences"
          />
          <FieldLabel>{t('pets.dietType')}</FieldLabel>
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
          {species === 'cat' || species === 'bird' || species === 'other' ? (
            <>
              <FieldLabel>{t('pets.indoorOutdoor')}</FieldLabel>
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
        </>
      ),
    },
    {
      id: 'docs',
      title: t('pets.sectionDocsChip'),
      body: (
        <>
          <TextField
            label={t('pets.chip')}
            value={chipCode}
            onChangeText={setChipCode}
            placeholder={t('pets.chipPlaceholder')}
          />
          <Text style={styles.hint}>{t('pets.chipHint')}</Text>
          <TextField
            label={t('pets.passport')}
            value={passport}
            onChangeText={setPassport}
            placeholder={t('pets.passportPlaceholder')}
          />
          <TextField
            label={t('pets.notes')}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('pets.notesPlaceholder')}
            autoCapitalize="sentences"
            multiline
          />
        </>
      ),
    },
    {
      id: 'origin',
      title: t('pets.sectionOriginShelter'),
      body: (
        <>
          <FieldLabel>{t('pets.origin')}</FieldLabel>
          <OptionChips
            value={origin}
            onChange={setOrigin}
            options={[
              { id: 'home', label: t('pets.originHome') },
              { id: 'shelter', label: t('pets.originShelter') },
              { id: 'breeder', label: t('pets.originBreeder') },
            ]}
          />
          <TextField
            label={t('pets.acquiredDate')}
            value={acquiredDate}
            onChangeText={setAcquiredDate}
            placeholder={t('pets.birthDatePlaceholder')}
            keyboardType="numbers-and-punctuation"
          />
        </>
      ),
    },
  ];

  return (
    <AppScreen edges={['top', 'bottom']}>
      <AppChromeHeader />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text style={styles.topCancel}>{t('common.cancel')}</Text>
          </Pressable>
          <Text style={styles.topTitle}>{t('pets.formEditing')}</Text>
          <Pressable
            onPress={() => void onSave()}
            disabled={saving || !name.trim()}
            hitSlop={8}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.topSave,
                (saving || !name.trim()) && styles.topSaveDisabled,
              ]}
            >
              {t('common.save')}
            </Text>
          </Pressable>
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(completedCount / 5) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {t('pets.sectionProgress', { done: completedCount, total: 5 })}
          </Text>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {sections.map((section) => {
            const open = openSection === section.id;
            const done = sectionComplete[section.id];
            return (
              <View
                key={section.id}
                style={[
                  styles.accordion,
                  done ? styles.accordionDone : styles.accordionIdle,
                  !done && !open && styles.accordionMuted,
                  open && styles.accordionOpen,
                ]}
              >
                <Pressable
                  onPress={() => toggleSection(section.id)}
                  style={styles.accordionHeader}
                  accessibilityRole="button"
                >
                  <View style={styles.accordionTitleRow}>
                    {done ? (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={brand.success}
                      />
                    ) : null}
                    <Text style={styles.accordionTitle}>{section.title}</Text>
                  </View>
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={brand.muted}
                  />
                </Pressable>
                {open ? (
                  <View style={styles.accordionBody}>{section.body}</View>
                ) : null}
              </View>
            );
          })}

          {error ? (
            <View style={styles.errorWrap}>
              <ErrorState message={error} />
            </View>
          ) : null}

          {isEdit ? (
            <View style={styles.deleteWrap}>
              <PrimaryButton
                label={t('pets.delete')}
                variant="ghost"
                onPress={() => void onDelete()}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 6,
  },
  topCancel: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
    minWidth: 72,
  },
  topTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  topSave: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accent,
    textAlign: 'right',
    minWidth: 72,
  },
  topSaveDisabled: {
    opacity: 0.4,
  },
  progressBlock: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    paddingTop: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.chipTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: brand.accent,
    borderRadius: brand.radius.pill,
  },
  progressText: {
    marginTop: 6,
    fontFamily: fonts.body,
    fontSize: 11.5,
    color: brand.muted,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 10,
  },
  accordion: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  accordionDone: {
    borderColor: brand.successSoft,
  },
  accordionIdle: {
    borderColor: 'transparent',
  },
  accordionMuted: {
    opacity: 0.6,
  },
  accordionOpen: {
    borderColor: brand.accent,
    opacity: 1,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  accordionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 8,
  },
  accordionTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  accordionBody: {
    marginTop: 10,
  },
  avatarBlock: {
    alignItems: 'center',
    marginBottom: 10,
  },
  avatarHint: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
    textAlign: 'center',
  },
  avatarChoices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  avatarChoice: {
    borderRadius: brand.radius.pill,
    padding: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarChoiceActive: {
    borderColor: brand.accent,
  },
  avatarChoiceTaken: {
    opacity: 0.35,
  },
  avatarClear: {
    marginTop: 6,
    marginBottom: 4,
  },
  fieldLabel: {
    marginBottom: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.muted,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: brand.accent,
  },
  chipIdle: {
    backgroundColor: brand.chipTrack,
  },
  chipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  chipTextIdle: {
    color: brand.ink,
  },
  hint: {
    marginTop: -8,
    marginBottom: 14,
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 18,
    color: brand.muted,
  },
  errorWrap: {
    marginTop: 8,
  },
  deleteWrap: {
    marginTop: 8,
  },
});
