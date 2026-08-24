import * as ImagePicker from 'expo-image-picker';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
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
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import { petProfileMeta } from '@/src/lib/petMeta';
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
import {
  foodMatchHitKey,
  lifeStageLabelKey,
  matchFoodToPet,
} from '@/src/services/foodMatch';
import { listScans } from '@/src/services/scans';
import {
  listPetVaccines,
  vaccineDueStatus,
} from '@/src/services/vaccines';
import { listPetVetLogs } from '@/src/services/vetLogs';
import {
  careProgress,
  getCareToday,
} from '@/src/services/care';
import { vaccineLabel } from '@/src/constants/vaccines';
import { brand, fonts } from '@/src/theme/brand';
import type {
  ActivityLevel,
  CoatType,
  DietType,
  IndoorOutdoor,
  LifeStage,
  PetPhotoRow,
  PetRow,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';
import type { CareDayLog } from '@/src/types/care';
import type { FeedingLogRow, ScanRow } from '@/src/types/scan';
import type { PetVaccineRow } from '@/src/types/vaccine';
import type { PetVetLogRow } from '@/src/types/vetLog';

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

function lifeStageLabel(value: LifeStage | null) {
  const key = lifeStageLabelKey(value);
  return key ? t(key) : null;
}

function matchToneStyle(level: 'ok' | 'caution' | 'alert' | 'unknown') {
  if (level === 'alert') return styles.matchAlert;
  if (level === 'caution') return styles.matchCaution;
  if (level === 'ok') return styles.matchOk;
  return styles.matchUnknown;
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
    <View style={styles.fact}>
      <Text style={styles.factLabel}>{label}</Text>
      <Text style={styles.factValue}>{value}</Text>
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
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
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
  const [vetLogs, setVetLogs] = useState<PetVetLogRow[]>([]);
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
      const [
        nextPet,
        nextPhotos,
        nextFeeds,
        nextScans,
        nextVaccines,
        nextVetLogs,
        nextCare,
      ] = await Promise.all([
        getPet(petId),
        listPetPhotos(petId),
        listFeedingLogs(petId),
        listScans(),
        listPetVaccines(petId),
        listPetVetLogs(petId),
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
      setVetLogs(nextVetLogs);
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

  const favoriteMatch = useMemo(() => {
    if (!pet?.favorite_food?.trim()) return null;
    const scan =
      (pet.favorite_product_id
        ? scans.find((s) => s.product_id === pet.favorite_product_id)
        : undefined) ??
      scans.find((s) => s.product_name === pet.favorite_food);
    return matchFoodToPet(pet, {
      productName: scan?.product_name ?? pet.favorite_food,
      summary: scan?.summary ?? '',
      pros: scan?.pros ?? [],
      cons: scan?.cons ?? [],
      species: scan?.species ?? null,
    });
  }, [pet, scans]);

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
      <AppScreen edges={['bottom']}>
        <ErrorState
          message={error ?? t('pets.notFound')}
          onRetry={() => void load()}
        />
      </AppScreen>
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

  const aboutText = [pet.notes?.trim(), pet.personality?.trim()]
    .filter(Boolean)
    .join('\n\n');
  const isShelter = pet.origin === 'shelter';
  const isBreeder = pet.origin === 'breeder';
  const wingspan =
    pet.extras?.wingspan_cm != null
      ? String(pet.extras.wingspan_cm)
      : null;
  const cageSize =
    pet.extras?.cage_size != null ? String(pet.extras.cage_size) : null;
  const isBird = pet.species === 'bird';

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader
        trailing="bell"
        bellCount={3}
        onBellPress={() => router.push('/(app)/notifications' as never)}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="chevron-back" size={18} color={brand.ink} />
          </Pressable>
          <Text style={styles.topTitle} numberOfLines={1}>
            {pet.name}
          </Text>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-form',
                params: { id: pet.id },
              })
            }
            style={styles.editPill}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={t('pets.edit')}
          >
            <Text style={styles.editLink}>{t('pets.editShort')}</Text>
          </Pressable>
        </View>

        <View style={styles.hero}>
          <PetAvatar
            avatarKey={pet.avatar_key}
            avatarUri={pet.avatar_uri}
            species={pet.species}
            size={104}
            name={pet.name}
          />
          <Text style={styles.heroName}>{pet.name}</Text>
          <Text style={styles.heroMeta}>{petProfileMeta(pet)}</Text>
        </View>

        {aboutText ? (
          <View style={styles.card}>
            <Text style={styles.aboutTitle}>
              {t('pets.about', { name: pet.name })}
            </Text>
            <Text style={styles.aboutBody}>{aboutText}</Text>
          </View>
        ) : null}

        <View style={styles.rowCard}>
          <Text style={styles.rowLabel}>{t('pets.favoriteFood')}</Text>
          <Text style={styles.rowValue} numberOfLines={2}>
            {pet.favorite_food?.trim()
              ? pet.favorite_food
              : t('pets.favoriteFoodEmptyShort')}
          </Text>
        </View>

        <View style={styles.rowCard}>
          <Text style={styles.rowLabel}>{t('pets.origin')}</Text>
          <View
            style={[
              styles.chip,
              isShelter || isBreeder ? styles.chipGood : styles.chipNeutral,
            ]}
          >
            <Text
              style={[
                styles.chipText,
                isShelter || isBreeder ? styles.chipTextGood : null,
              ]}
            >
              {isShelter
                ? t('pets.originShelter')
                : isBreeder
                  ? t('pets.originBreeder')
                  : t('pets.originHome')}
            </Text>
          </View>
        </View>

        {isBird && wingspan ? (
          <View style={styles.rowCard}>
            <Text style={styles.rowLabel}>{t('pets.wingspan')}</Text>
            <Text style={styles.rowValue}>{wingspan}</Text>
          </View>
        ) : null}
        {isBird && cageSize ? (
          <View style={styles.rowCard}>
            <Text style={styles.rowLabel}>{t('pets.cage')}</Text>
            <Text style={styles.rowValue}>{cageSize}</Text>
          </View>
        ) : null}

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
            label={t('pets.lifeStage')}
            value={lifeStageLabel(pet.life_stage)}
          />
          <Fact
            label={t('pets.favoriteFood')}
            value={pet.favorite_food || t('pets.favoriteFoodEmpty')}
          />
          {favoriteMatch && favoriteMatch.level !== 'unknown' ? (
            <View
              style={[styles.matchBox, matchToneStyle(favoriteMatch.level)]}
            >
              <Text style={styles.matchTitle}>{t('foodMatch.title')}</Text>
              {favoriteMatch.hits.map((hit, index) => (
                <Text
                  key={`${hit.kind}-${hit.detail}-${index}`}
                  style={styles.matchHit}
                >
                  {t(foodMatchHitKey(hit), {
                    detail: hit.detail,
                    stage: lifeStageLabel(hit.detail as LifeStage) ?? hit.detail,
                  })}
                </Text>
              ))}
              <Text style={styles.matchDisclaimer}>
                {t('foodMatch.disclaimer')}
              </Text>
            </View>
          ) : null}
          <View style={styles.btnStack}>
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
          <View style={styles.factSpacer}>
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
            <Text style={styles.emptyText}>{t('pets.feedingEmpty')}</Text>
          ) : (
            feeds.slice(0, 8).map((feed) => (
              <View key={feed.id} style={styles.feedItem}>
                <Text style={styles.feedName}>{feed.product_name}</Text>
                <Text style={styles.feedMeta}>
                  {new Date(feed.fed_at).toLocaleString('uk-UA')}
                  {feed.ate_fully === true
                    ? ` · ${t('pets.feedingAteYes')}`
                    : feed.ate_fully === false
                      ? ` · ${t('pets.feedingAteNo')}`
                      : ''}
                </Text>
                {feed.note ? (
                  <Text style={styles.feedNote}>{feed.note}</Text>
                ) : null}
              </View>
            ))
          )}
        </Section>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('care.waterTitle')}</Text>
          {todayCare ? (
            <Text style={styles.bodyLead}>
              {t('care.progress', {
                done: todayCare.done,
                total: todayCare.total,
              })}
              {todayCare.water ? ` · ${t('care.waterDoneShort')}` : ''}
              {todayCare.play ? ` · ${t('care.playDoneShort')}` : ''}
              {todayCare.feed ? ` · ${t('care.feedDoneShort')}` : ''}
            </Text>
          ) : (
            <Text style={styles.bodyLead}>{t('care.cardHint')}</Text>
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
          <View style={styles.btnGap}>
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
          <View style={styles.btnGap}>
            <PrimaryButton
              label={t('play.open')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/play-guides',
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
          <View style={styles.btnStack}>
            <PrimaryButton
              label={t('passport.open')}
              variant="secondary"
              onPress={() =>
                router.push({
                  pathname: '/(app)/pet-passport',
                  params: { petId: pet.id },
                })
              }
            />
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

        <Section title={t('habits.title')}>
          <ListRow
            variant="flat"
            title={t('habits.open')}
            subtitle={t('habits.subtitle')}
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-habits',
                params: { petId: pet.id },
              } as never)
            }
          />
          <ListRow
            variant="flat"
            title={t('calendar.open')}
            subtitle={t('calendar.subtitle')}
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-calendar',
                params: { petId: pet.id },
              } as never)
            }
          />
          <ListRow
            variant="flat"
            title={t('travelWizard.open')}
            subtitle={t('travelWizard.subtitle')}
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-travel-wizard',
                params: { petId: pet.id },
              } as never)
            }
          />
        </Section>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('pets.vaccines')}</Text>
          {vaccines.length === 0 ? (
            <Text style={styles.bodyLead}>{t('pets.vaccinesEmpty')}</Text>
          ) : (
            <View style={styles.summaryBlock}>
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
                  <Text key={v.id} style={styles.summaryLine}>
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

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('pets.vetLog')}</Text>
          {vetLogs.length === 0 ? (
            <Text style={styles.bodyLead}>{t('pets.vetLogEmpty')}</Text>
          ) : (
            <View style={styles.summaryBlock}>
              {vetLogs.slice(0, 3).map((row) => (
                <Text key={row.id} style={styles.summaryLine}>
                  {row.logged_on} · {row.title}
                  {row.next_due_on
                    ? ` · ${t('vetLog.nextDue')}: ${row.next_due_on}`
                    : ''}
                </Text>
              ))}
            </View>
          )}
          <PrimaryButton
            label={t('pets.vetLogOpen')}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-vet-log',
                params: { petId: pet.id },
              })
            }
          />
        </View>

        <View style={styles.card}>
          <View style={styles.albumHeader}>
            <Text style={styles.cardTitleTight}>{t('pets.album')}</Text>
            <Pressable onPress={() => void onAddPhoto()} disabled={addingPhoto}>
              <Text style={styles.albumAdd}>
                {addingPhoto ? '…' : t('pets.albumAdd')}
              </Text>
            </Pressable>
          </View>
          {photos.length === 0 ? (
            <Text style={styles.emptyText}>{t('pets.albumEmpty')}</Text>
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
                  <Image source={{ uri }} style={styles.albumThumb} />
                );
              }}
            />
          )}
        </View>
      </ScrollView>

      <Modal visible={pickerOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>{t('pets.pickFavoriteFood')}</Text>
            <FlatList
              data={scans}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => void onPickFavorite(item)}
                  style={({ pressed }) => [
                    styles.scanRow,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text style={styles.scanName}>{item.product_name}</Text>
                  <Text style={styles.scanMeta}>
                    {new Date(item.created_at).toLocaleString('uk-UA')}
                  </Text>
                </Pressable>
              )}
            />
            <View style={styles.btnGap}>
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheetCompact}>
            <Text style={styles.modalTitle}>{t('pets.feedingAdd')}</Text>
            <Text style={styles.modalLead}>{pet.favorite_food}</Text>
            <View style={styles.ateRow}>
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
                    style={[styles.ateChip, active && styles.ateChipOn]}
                  >
                    <Text
                      style={[styles.ateChipText, active && styles.ateChipTextOn]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.inputLabel}>{t('pets.feedingNote')}</Text>
            <TextInput
              value={feedNote}
              onChangeText={setFeedNote}
              placeholder={t('pets.feedingNotePlaceholder')}
              placeholderTextColor={brand.mutedSoft}
              multiline
              style={styles.noteInput}
            />
            <PrimaryButton
              label={t('common.save')}
              onPress={() => void onSaveFeed()}
              loading={savingFeed}
            />
            <View style={styles.btnGap}>
              <PrimaryButton
                label={t('common.cancel')}
                variant="ghost"
                onPress={() => setFeedOpen(false)}
              />
            </View>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 14,
  },
  backBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  editPill: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  editLink: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.accentDark,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    paddingBottom: 2,
  },
  heroName: {
    fontFamily: fonts.title,
    fontSize: 19,
    lineHeight: 24,
    color: brand.ink,
  },
  heroMeta: {
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.muted,
    textAlign: 'center',
  },
  card: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 16,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  cardTitle: {
    marginBottom: 12,
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  cardTitleTight: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  aboutTitle: {
    marginBottom: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
  },
  aboutBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 20,
    color: brand.label,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  rowLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
    flexShrink: 0,
  },
  rowValue: {
    flex: 1,
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  chip: {
    borderRadius: brand.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipGood: { backgroundColor: brand.successTint },
  chipNeutral: { backgroundColor: brand.chipTrack },
  chipText: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: brand.muted,
  },
  chipTextGood: { color: brand.successDark },
  fact: { marginBottom: 12 },
  factLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.mutedSoft,
  },
  factValue: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  factSpacer: { marginTop: 4 },
  matchBox: {
    marginTop: 8,
    marginBottom: 8,
    borderRadius: brand.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  matchOk: {
    borderColor: brand.success,
    backgroundColor: brand.successTint,
  },
  matchCaution: {
    borderColor: brand.score.fair,
    backgroundColor: '#FBF6E8',
  },
  matchAlert: {
    borderColor: brand.terracotta,
    backgroundColor: brand.terracottaTint,
  },
  matchUnknown: {
    borderColor: brand.mistBorder,
    backgroundColor: brand.accentTint,
  },
  matchTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  matchHit: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.label,
  },
  matchDisclaimer: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.muted,
  },
  btnStack: { marginTop: 4, gap: 8 },
  btnGap: { marginTop: 10 },
  emptyText: {
    marginTop: 12,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  bodyLead: {
    marginBottom: 14,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.label,
  },
  feedItem: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: brand.mistBorder,
    paddingTop: 12,
  },
  feedName: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  feedMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  feedNote: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.label,
  },
  summaryBlock: { marginBottom: 14 },
  summaryLine: {
    marginBottom: 4,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.label,
  },
  albumHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumAdd: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accent,
  },
  albumThumb: {
    marginRight: 10,
    height: 112,
    width: 112,
    borderRadius: brand.radius.sm,
    backgroundColor: brand.chipTrack,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(21,34,51,0.4)',
  },
  modalSheet: {
    maxHeight: '70%',
    borderTopLeftRadius: brand.radius.xl,
    borderTopRightRadius: brand.radius.xl,
    backgroundColor: brand.canvas,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  modalSheetCompact: {
    borderTopLeftRadius: brand.radius.xl,
    borderTopRightRadius: brand.radius.xl,
    backgroundColor: brand.canvas,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 28,
  },
  modalTitle: {
    marginBottom: 12,
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  modalLead: {
    marginBottom: 12,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  scanRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
    paddingVertical: 12,
  },
  scanName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  scanMeta: {
    marginTop: 4,
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
  },
  ateRow: {
    marginBottom: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ateChip: {
    borderRadius: brand.radius.sm,
    backgroundColor: brand.chipTrack,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ateChipOn: { backgroundColor: brand.accent },
  ateChipText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.ink,
  },
  ateChipTextOn: { color: '#FFFFFF' },
  inputLabel: {
    marginBottom: 8,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: brand.label,
  },
  noteInput: {
    marginBottom: 14,
    minHeight: 80,
    borderRadius: brand.radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
    textAlignVertical: 'top',
  },
  pressed: { opacity: 0.7 },
});
