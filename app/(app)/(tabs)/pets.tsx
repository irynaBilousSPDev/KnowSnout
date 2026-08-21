import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
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
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { ProfileEntry } from '@/src/components/ProfileEntry';
import { Section } from '@/src/components/Section';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { deletePet, listPets } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
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

/** HTML kit · Список тварин — Manrope 22, + circle, white r14 cards, add pill. */
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
      setError(err instanceof Error ? err.message : t('common.error'));
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
        <View style={styles.headerRow}>
          <Text style={styles.title}>{t('pets.title')}</Text>
          <View style={styles.headerActions}>
            <ProfileEntry />
            <Pressable
              onPress={() => router.push('/(app)/pet-form')}
              style={styles.addCircle}
              accessibilityRole="button"
              accessibilityLabel={t('pets.add')}
            >
              <Ionicons name="add" size={22} color={brand.ink} />
            </Pressable>
          </View>
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
              tintColor={brand.accent}
            />
          }
          ListEmptyComponent={
            <Section tone="mist" title={t('pets.emptyTitle')}>
              <Text style={styles.emptyBody}>{t('pets.emptyBody')}</Text>
            </Section>
          }
          ListFooterComponent={
            <Pressable
              onPress={() => router.push('/(app)/pet-form')}
              style={styles.addPill}
              accessibilityRole="button"
              accessibilityLabel={t('pets.add')}
            >
              <Text style={styles.addPillText}>+ {t('pets.add')}</Text>
            </Pressable>
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(app)/pet-hub',
                  params: { petId: item.id },
                } as never)
              }
              onLongPress={() => void onDelete(item)}
              disabled={deletingId === item.id}
              style={({ pressed }) => [styles.petCard, pressed && styles.pressed]}
            >
              <PetAvatar
                avatarKey={item.avatar_key}
                avatarUri={item.avatar_uri}
                species={item.species}
                size={56}
                name={item.name}
              />
              <View style={styles.petCopy}>
                <Text style={styles.petName}>{item.name}</Text>
                <Text style={styles.petMeta}>{petMeta(item)}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={brand.mutedSoft}
              />
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  addCircle: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: brand.chipTrack,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  petCard: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    padding: 14,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  pressed: { opacity: 0.9 },
  petCopy: { flex: 1, minWidth: 0 },
  petName: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  petMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  addPill: {
    marginTop: 6,
    marginBottom: 16,
    minHeight: 46,
    borderRadius: brand.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPillText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
});
