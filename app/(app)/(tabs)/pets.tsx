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
import { PrimaryButton } from '@/src/components/PrimaryButton';
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
  return parts.join(' · ');
}

function goAdd() {
  router.push('/(app)/pet-species' as never);
}

/** 03.01 list · 03.02 empty — tap opens hub. */
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
      setPets(await listPets());
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
        {pets.length > 0 ? (
          <Pressable
            onPress={goAdd}
            style={styles.addCircle}
            accessibilityRole="button"
            accessibilityLabel={t('pets.add')}
          >
            <Text style={styles.addPlus}>+</Text>
          </Pressable>
        ) : (
          <View style={styles.addSpacer} />
        )}
      </View>

      {error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : pets.length === 0 ? (
        <View style={styles.emptyWrap}>
          <View style={styles.emptyHero}>
            <Ionicons name="paw-outline" size={40} color={brand.mutedSoft} />
            <Text style={styles.emptyHeroHint}>{t('pets.emptyIllustration')}</Text>
          </View>
          <Text style={styles.emptyTitle}>{t('pets.emptyTitle')}</Text>
          <Text style={styles.emptyBody}>{t('pets.emptyBody')}</Text>
          <PrimaryButton
            label={`+ ${t('pets.add')}`}
            onPress={goAdd}
            style={styles.emptyCta}
          />
        </View>
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
          ListFooterComponent={
            <PrimaryButton
              label={`+ ${t('pets.add')}`}
              variant="secondary"
              onPress={goAdd}
              style={styles.addBtn}
            />
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
  addSpacer: { width: 34, height: 34 },
  addPlus: {
    fontFamily: fonts.body,
    fontSize: 20,
    lineHeight: 22,
    color: brand.ink,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    flexGrow: 1,
    gap: 12,
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingBottom: 80,
  },
  emptyHero: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyHeroHint: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: brand.mutedSoft,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  emptyTitle: {
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
    textAlign: 'center',
    margin: 0,
  },
  emptyBody: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
    textAlign: 'center',
  },
  emptyCta: { alignSelf: 'stretch', marginTop: 4 },
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
  addBtn: { marginTop: 6, marginBottom: 16 },
});
