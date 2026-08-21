import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { IconButton } from '@/src/components/IconButton';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
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
        <ScreenHeader
          title={t('pets.title')}
          subtitle={t('pets.subtitle')}
        />
        <View style={styles.cta}>
          <PrimaryButton
            label={t('care.hubOpen')}
            size="lg"
            variant="secondary"
            onPress={() => router.push('/(app)/care-hub')}
          />
        </View>
        <View style={styles.cta}>
          <PrimaryButton
            label={t('pets.add')}
            size="lg"
            onPress={() => router.push('/(app)/pet-form')}
          />
        </View>
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
              tintColor={brand.tealDeep}
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('pets.emptyTitle')}>
              <Text style={styles.emptyBody}>{t('pets.emptyBody')}</Text>
            </Section>
          }
          renderItem={({ item }) => (
            <ListRow
              title={item.name}
              subtitle={petMeta(item)}
              meta={
                item.favorite_food
                  ? `${t('pets.favoriteFood')}: ${item.favorite_food}`
                  : null
              }
              leading={
                <PetAvatar
                  avatarKey={item.avatar_key}
                  avatarUri={item.avatar_uri}
                  species={item.species}
                  size={56}
                  name={item.name}
                />
              }
              trailing={
                <View style={styles.actions}>
                  <IconButton
                    name="create-outline"
                    accessibilityLabel={t('pets.edit')}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/pet-form',
                        params: { id: item.id },
                      })
                    }
                  />
                  <IconButton
                    name="trash-outline"
                    color={brand.score.poor}
                    accessibilityLabel={t('pets.delete')}
                    disabled={deletingId === item.id}
                    onPress={() => void onDelete(item)}
                  />
                </View>
              }
              showChevron={false}
              onPress={() =>
                router.push({
                  pathname: '/(app)/pet-hub',
                  params: { petId: item.id },
                } as never)
              }
            />
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
  cta: {
    marginTop: 12,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  emptyBody: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#5A7A72',
  },
});
