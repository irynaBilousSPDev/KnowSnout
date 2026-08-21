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

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { Section } from '@/src/components/Section';
import { t } from '@/src/i18n';
import { confirmAction } from '@/src/lib/confirm';
import { petAgeLabel, speciesLabel } from '@/src/lib/petMeta';
import { deletePet, listPets } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

function petMeta(pet: PetRow) {
  const parts: string[] = [];
  if (pet.breed?.trim()) parts.push(pet.breed.trim());
  else parts.push(speciesLabel(pet.species));
  const age = petAgeLabel(pet.birth_date);
  if (age) parts.push(age);
  else if (pet.breed?.trim()) parts.push(speciesLabel(pet.species));
  return parts.join(' · ');
}

/** HTML phone “12 · Список тварин”. */
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
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.header}>
        <Text style={styles.title}>{t('pets.title')}</Text>
        <Pressable
          onPress={() => router.push('/(app)/pet-form')}
          style={styles.addCircle}
          accessibilityRole="button"
          accessibilityLabel={t('pets.add')}
        >
          <Text style={styles.addPlus}>+</Text>
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
              style={styles.addBtn}
              accessibilityRole="button"
              accessibilityLabel={t('pets.add')}
            >
              <Text style={styles.addBtnText}>+ {t('pets.add')}</Text>
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
                size={16}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
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
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlus: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 22,
    color: brand.ink,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 12,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.muted,
  },
  petCard: {
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
  addBtn: {
    marginTop: 6,
    marginBottom: 16,
    minHeight: 46,
    borderRadius: brand.radius.md,
    borderWidth: 1,
    borderColor: brand.divider,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.ink,
  },
});
