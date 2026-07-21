import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { SharePhotoSheet } from '@/src/components/SharePhotoSheet';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { buildContestShareMessage } from '@/src/lib/share';
import {
  getContestEntry,
  listHeartedIds,
  toggleContestHeart,
} from '@/src/services/contests';
import { brand } from '@/src/theme/brand';
import type { ContestEntry } from '@/src/types/contest';
import type {
  CoatType,
  PetOrigin,
  PetSex,
  SizeCategory,
} from '@/src/types/pet';

function sexLabel(sex?: PetSex | null) {
  if (sex === 'female') return t('pets.sexFemale');
  if (sex === 'male') return t('pets.sexMale');
  if (sex === 'unknown') return t('pets.sexUnknown');
  return null;
}

function coatLabel(value?: CoatType | null) {
  if (value === 'short') return t('pets.coatShort');
  if (value === 'long') return t('pets.coatLong');
  if (value === 'wire') return t('pets.coatWire');
  if (value === 'curly') return t('pets.coatCurly');
  if (value === 'hairless') return t('pets.coatHairless');
  return null;
}

function sizeLabel(value?: SizeCategory | null) {
  if (value === 'toy') return t('pets.sizeToy');
  if (value === 'small') return t('pets.sizeSmall');
  if (value === 'medium') return t('pets.sizeMedium');
  if (value === 'large') return t('pets.sizeLarge');
  if (value === 'giant') return t('pets.sizeGiant');
  return null;
}

function originLabel(value?: PetOrigin | null) {
  if (value === 'home') return t('pets.originHome');
  if (value === 'shelter') return t('pets.originShelter');
  return null;
}

function ageLabel(birthDate?: string | null) {
  if (!birthDate) return null;
  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;
  const now = new Date();
  let years = now.getFullYear() - born.getFullYear();
  const m = now.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < born.getDate())) years -= 1;
  if (years < 0) return null;
  if (years === 0) {
    const months =
      (now.getFullYear() - born.getFullYear()) * 12 +
      now.getMonth() -
      born.getMonth();
    const ageMonths = Math.max(1, months);
    return t('contests.ageMonths', { n: ageMonths });
  }
  return t('contests.ageYears', { n: years });
}

function Fact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="mb-3 w-[48%]">
      <Text className="font-body-medium text-[11px] uppercase tracking-wide text-forest-500">
        {label}
      </Text>
      <Text className="mt-1 font-body text-sm text-forest-900">{value}</Text>
    </View>
  );
}

export default function ContestEntryScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === 'string' ? params.id : undefined;

  const [entry, setEntry] = useState<ContestEntry | null>(null);
  const [hearted, setHearted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError(t('contests.entryMissing'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [row, hearts] = await Promise.all([
        getContestEntry(id),
        listHeartedIds(),
      ]);
      if (!row) {
        setError(t('contests.entryMissing'));
        setEntry(null);
      } else {
        setEntry(row);
        setHearted(hearts.has(row.id));
      }
    } catch {
      setError(t('contests.entryLoadError'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onHeart = async () => {
    if (!entry) return;
    const result = await toggleContestHeart(entry.id);
    setHearted(result.hearted);
    setEntry({ ...entry, hearts: result.hearts });
  };

  if (loading) return <LoadingState />;
  if (error || !entry) {
    return (
      <ErrorState
        message={error ?? t('contests.entryMissing')}
        onRetry={() => (id ? void load() : router.back())}
      />
    );
  }

  const pub = entry.publicPet;
  const gallery = [
    ...(entry.imageUri ? [entry.imageUri] : []),
    ...((pub?.galleryUris ?? []).filter((u) => u && u !== entry.imageUri)),
  ];
  const speciesLabel =
    entry.species === 'cat' ? t('pets.speciesCat') : t('pets.speciesDog');

  return (
    <SafeAreaView className="flex-1 bg-sand-50" edges={['bottom']}>
      <ScrollView contentContainerClassName="pb-12">
        <View style={styles.hero}>
          {entry.imageUri ? (
            <Pressable onPress={() => setLightbox(entry.imageUri!)}>
              <Image
                source={{ uri: entry.imageUri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </Pressable>
          ) : (
            <View style={styles.heroFallback}>
              <PetAvatar
                avatarKey={entry.avatarKey}
                species={entry.species}
                size={120}
                name={entry.petName}
              />
            </View>
          )}
        </View>

        <View className="px-5 pt-5">
          <Text className="font-display text-3xl text-forest-900">
            {entry.petName}
          </Text>
          <Text className="mt-1 font-body text-sm text-forest-500">
            {speciesLabel}
            {entry.mine ? ` · ${t('contests.you')}` : ''}
          </Text>
          {entry.caption ? (
            <Text className="mt-3 font-body text-base leading-6 text-forest-700">
              {entry.caption}
            </Text>
          ) : null}

          <View className="mt-4 flex-row items-center gap-4">
            <Pressable
              onPress={() => void onHeart()}
              className="flex-row items-center gap-2 active:opacity-70"
            >
              <Ionicons
                name={hearted ? 'heart' : 'heart-outline'}
                size={26}
                color={hearted ? brand.score.poor : brand.tealPressed}
              />
              <Text className="font-body-medium text-sm text-forest-800">
                {entry.hearts} {t('contests.hearts')}
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShareOpen(true)}
              className="flex-row items-center gap-2 active:opacity-70"
            >
              <Ionicons
                name="share-outline"
                size={24}
                color={brand.tealPressed}
              />
              <Text className="font-body-medium text-sm text-forest-800">
                {t('share.button')}
              </Text>
            </Pressable>
          </View>

          <View className="mt-6 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="font-body-bold text-lg text-forest-900">
              {t('contests.publicPetTitle')}
            </Text>
            <Text className="mt-1 font-body text-xs text-forest-500">
              {t('contests.publicPetHint')}
            </Text>
            <View className="mt-4 flex-row flex-wrap justify-between">
              <Fact label={t('pets.species')} value={speciesLabel} />
              <Fact label={t('pets.breed')} value={pub?.breed} />
              <Fact label={t('pets.sex')} value={sexLabel(pub?.sex)} />
              <Fact label={t('contests.age')} value={ageLabel(pub?.birthDate)} />
              <Fact label={t('pets.colorCoat')} value={pub?.colorCoat} />
              <Fact label={t('pets.coatType')} value={coatLabel(pub?.coatType)} />
              <Fact
                label={t('pets.sizeCategory')}
                value={sizeLabel(pub?.sizeCategory)}
              />
              <Fact label={t('pets.origin')} value={originLabel(pub?.origin)} />
              <Fact label={t('pets.marks')} value={pub?.distinctiveMarks} />
            </View>
            {pub?.personality ? (
              <View className="mt-1">
                <Text className="font-body-medium text-[11px] uppercase tracking-wide text-forest-500">
                  {t('pets.personality')}
                </Text>
                <Text className="mt-1 font-body text-sm leading-5 text-forest-800">
                  {pub.personality}
                </Text>
              </View>
            ) : null}
            {!pub?.breed &&
            !pub?.personality &&
            !pub?.colorCoat &&
            !pub?.sex ? (
              <Text className="mt-3 font-body text-sm text-forest-500">
                {t('contests.publicPetEmpty')}
              </Text>
            ) : null}
          </View>

          <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="font-body-bold text-lg text-forest-900">
              {t('contests.ownerTitle')}
            </Text>
            <View className="mt-4 flex-row items-center">
              <UserAvatar
                avatarKey={entry.owner?.avatarKey}
                avatarUri={entry.owner?.avatarUri}
                gender={entry.owner?.gender}
                size={56}
                name={entry.owner?.displayName}
              />
              <View className="ml-3 flex-1">
                <Text className="font-body-bold text-base text-forest-900">
                  {entry.owner?.displayName ?? t('contests.ownerUnknown')}
                </Text>
                <Text className="mt-0.5 font-body text-xs text-forest-500">
                  {t('contests.ownerHint')}
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-4 rounded-3xl border border-forest-100 bg-white px-5 py-5">
            <Text className="mb-3 font-body-bold text-lg text-forest-900">
              {t('contests.galleryTitle')}
            </Text>
            {gallery.length === 0 ? (
              <Text className="font-body text-sm text-forest-500">
                {t('contests.galleryEmpty')}
              </Text>
            ) : (
              <FlatList
                data={gallery}
                keyExtractor={(uri, i) => `${uri}-${i}`}
                numColumns={2}
                scrollEnabled={false}
                columnWrapperStyle={styles.galleryRow}
                renderItem={({ item: uri }) => (
                  <Pressable
                    onPress={() => setLightbox(uri)}
                    style={styles.galleryCell}
                  >
                    <Image
                      source={{ uri }}
                      style={styles.galleryImage}
                      resizeMode="cover"
                    />
                  </Pressable>
                )}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {lightbox ? (
        <Pressable
          style={styles.lightbox}
          onPress={() => setLightbox(null)}
        >
          <Image
            source={{ uri: lightbox }}
            style={styles.lightboxImage}
            resizeMode="contain"
          />
        </Pressable>
      ) : null}

      <SharePhotoSheet
        visible={shareOpen}
        onClose={() => setShareOpen(false)}
        imageUri={entry.imageUri}
        title={t('share.dialogTitle')}
        message={buildContestShareMessage({
          petName: entry.petName,
          caption: entry.caption,
        })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: brand.mist,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },
  galleryRow: {
    gap: 10,
    marginBottom: 10,
  },
  galleryCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: brand.mist,
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  lightbox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  lightboxImage: {
    width: '100%',
    height: '80%',
  },
});
