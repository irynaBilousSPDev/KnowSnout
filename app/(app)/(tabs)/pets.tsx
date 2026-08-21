import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { HubHero } from '@/src/components/HubHero';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { Section } from '@/src/components/Section';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { deletePet, listPets } from '@/src/services/pets';
import { brand } from '@/src/theme/brand';
import type { CompanionSpecies, PetRow } from '@/src/types/pet';

function speciesLabel(species: CompanionSpecies) {
  if (species === 'dog') return t('pets.speciesDog');
  if (species === 'cat') return t('pets.speciesCat');
  if (species === 'bird') return t('pets.speciesBird');
  return t('pets.speciesOther');
}

function petMeta(pet: PetRow) {
  const parts = [speciesLabel(pet.species)];
  if (pet.breed) parts.push(pet.breed);
  if (pet.weight_kg != null) parts.push(`${pet.weight_kg} ${t('pets.kg')}`);
  return parts.join(' · ');
}

export default function PetsScreen() {
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const data = await listPets();
      setPets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pets.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onDelete = async (pet: PetRow) => {
    const ok = await confirmAction({
      title: t('pets.deleteTitle'),
      message: t('pets.deleteMessage', { name: pet.name }),
      confirmLabel: t('pets.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;

    setDeletingId(pet.id);
    try {
      await deletePet(pet.id);
      setPets((prev) => prev.filter((p) => p.id !== pet.id));
    } catch (err) {
      const message =
        err instanceof Error && err.message === 'NOT_OWNED'
          ? t('pets.deleteNotOwned')
          : err instanceof Error
            ? err.message
            : t('common.error');
      Alert.alert(t('pets.deleteFailed'), message);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingState message={t('pets.loading')} />;
  }

  return (
    <AppScreen>
      <View style={styles.header}>
        <HubHero
          brandMark
          title={t('pets.title')}
          lead={t('pets.subtitle')}
          right={<ProfileEntry />}
        />
        <PrimaryButton
          label={t('pets.add')}
          size="lg"
          onPress={() => router.push('/(app)/pet-form')}
        />
        <Pressable
          onPress={() => router.push('/(app)/care-hub')}
          style={styles.careLink}
        >
          <Text style={styles.careLinkText}>{t('care.hubOpen')}</Text>
          <Ionicons name="chevron-forward" size={16} color={brand.navy} />
        </Pressable>
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void load(true)}
              tintColor={brand.navy}
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('pets.emptyTitle')}>
              <Text style={styles.emptyBody}>{t('pets.emptyBody')}</Text>
            </Section>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/pet-hub',
                  params: { petId: item.id },
                } as never)
              }
              style={({ pressed }) => [styles.petCard, pressed && styles.pressed]}
            >
              <PetAvatar
                avatarKey={item.avatar_key}
                avatarUri={item.avatar_uri}
                species={item.species}
                size={64}
                name={item.name}
              />
              <View style={styles.petCopy}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petMeta}>{petMeta(item)}</Text>
                {item.favorite_food ? (
                  <Text style={styles.petFav} numberOfLines={1}>
                    {t('pets.favoriteFood')}: {item.favorite_food}
                  </Text>
                ) : null}
              </View>
              <View style={styles.petActions}>
                <Pressable
                  accessibilityLabel={t('pets.edit')}
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/pet-form',
                      params: { id: item.id },
                    })
                  }
                  hitSlop={8}
                >
                  <Ionicons name="create-outline" size={20} color={brand.navy} />
                </Pressable>
                <Pressable
                  accessibilityLabel={t('pets.delete')}
                  disabled={deletingId === item.id}
                  onPress={() => void onDelete(item)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={brand.score.poor}
                  />
                </Pressable>
              </View>
            </Pressable>
          )}
        />
      )}
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  careLink: {
    marginTop: 12,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  careLinkText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: brand.navy,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  petCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
  },
  pressed: { opacity: 0.9 },
  petCopy: { flex: 1, marginLeft: 12, minWidth: 0 },
  petName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 17,
    color: brand.ink,
  },
  petMeta: {
    marginTop: 3,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    color: brand.muted,
  },
  petFav: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: brand.forest,
  },
  petActions: {
    marginLeft: 8,
    gap: 12,
    alignItems: 'center',
  },
});
