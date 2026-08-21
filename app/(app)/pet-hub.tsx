import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { HubHero } from '@/src/components/HubHero';
import { ListRow } from '@/src/components/ListRow';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { t } from '@/src/i18n';
import { listPets } from '@/src/services/pets';
import { brand } from '@/src/theme/brand';
import type { CompanionSpecies, PetRow } from '@/src/types/pet';

function speciesLabel(species: CompanionSpecies) {
  if (species === 'dog') return t('pets.speciesDog');
  if (species === 'cat') return t('pets.speciesCat');
  if (species === 'bird') return t('pets.speciesBird');
  return t('pets.speciesOther');
}

export default function PetHubScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const paramPetId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pets, setPets] = useState<PetRow[]>([]);
  const [petId, setPetId] = useState<string | undefined>(paramPetId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await listPets();
      setPets(list);
      setPetId((prev) => {
        if (paramPetId && list.some((p) => p.id === paramPetId)) return paramPetId;
        if (prev && list.some((p) => p.id === prev)) return prev;
        return list[0]?.id;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('pets.loadError'));
    } finally {
      setLoading(false);
    }
  }, [paramPetId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const pet = pets.find((p) => p.id === petId) ?? null;
  const isBird = pet?.species === 'bird';

  if (loading) {
    return <LoadingState message={t('petHub.loading')} />;
  }

  if (error) {
    return (
      <AppScreen>
        <ErrorState message={error} onRetry={() => void load()} />
      </AppScreen>
    );
  }

  if (!pet) {
    return (
      <AppScreen>
        <View style={styles.pad}>
          <HubHero title={t('petHub.title')} lead={t('petHub.empty')} />
        </View>
      </AppScreen>
    );
  }

  const go = (pathname: string, extra?: Record<string, string>) => {
    router.push({
      pathname: pathname as never,
      params: { petId: pet.id, ...extra },
    } as never);
  };

  return (
    <AppScreen>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <HubHero
            title={t('petHub.title')}
            lead={
              isBird
                ? t('petHub.birdSubtitle', { name: pet.name })
                : t('petHub.subtitle', { name: pet.name })
            }
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.switcher}
          >
            {pets.map((p) => {
              const active = p.id === pet.id;
              return (
                <Pressable
                  key={p.id}
                  onPress={() => setPetId(p.id)}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={p.name}
                >
                  <PetAvatar
                    avatarKey={p.avatar_key}
                    avatarUri={p.avatar_uri}
                    species={p.species}
                    size={36}
                    name={p.name}
                  />
                  <Text
                    style={[styles.chipText, active && styles.chipTextActive]}
                    numberOfLines={1}
                  >
                    {p.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {isBird ? (
            <View style={styles.birdNote}>
              <Text style={styles.birdNoteText}>{t('petHub.birdHint')}</Text>
            </View>
          ) : null}

          <Text style={styles.meta}>
            {speciesLabel(pet.species)}
            {pet.breed ? ` · ${pet.breed}` : ''}
          </Text>

          <ListRow
            title={t('care.hubOpen')}
            subtitle={
              isBird ? t('petHub.careBird') : t('care.cardHint')
            }
            leading={
              <Ionicons name="water-outline" size={22} color={brand.navy} />
            }
            onPress={() => go('/(app)/pet-care')}
          />
          <ListRow
            title={t('pets.profileTitle')}
            subtitle={t('petHub.profileHint')}
            leading={
              <Ionicons name="paw-outline" size={22} color={brand.navy} />
            }
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-profile',
                params: { id: pet.id },
              } as never)
            }
          />
          <ListRow
            title={t('vaccines.title')}
            subtitle={t('vaccines.subtitle')}
            leading={
              <Ionicons
                name="medkit-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/pet-vaccines')}
          />
          <ListRow
            title={t('vetLog.title')}
            subtitle={t('vetLog.subtitle')}
            leading={
              <Ionicons
                name="clipboard-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/pet-vet-log')}
          />
          <ListRow
            title={t('play.title')}
            subtitle={
              isBird ? t('petHub.playBird') : t('play.subtitle')
            }
            leading={
              <Ionicons
                name="game-controller-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/play-guides')}
          />
          <ListRow
            title={t('habits.title')}
            subtitle={t('habits.subtitle')}
            leading={
              <Ionicons
                name="sparkles-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/pet-habits')}
          />
          <ListRow
            title={t('calendar.title')}
            subtitle={t('calendar.subtitle')}
            leading={
              <Ionicons
                name="calendar-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/pet-calendar')}
          />
          <ListRow
            title={t('travel.title')}
            subtitle={
              isBird ? t('petHub.travelBird') : t('travel.subtitle')
            }
            leading={
              <Ionicons
                name="airplane-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/pet-travel')}
          />
          <ListRow
            title={t('passport.title')}
            subtitle={t('passport.subtitle')}
            leading={
              <Ionicons
                name="document-text-outline"
                size={22}
                color={brand.navy}
              />
            }
            onPress={() => go('/(app)/pet-passport')}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: 140,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  chipActive: {
    backgroundColor: brand.mist,
    borderColor: brand.navy,
  },
  chipText: {
    flexShrink: 1,
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: brand.ink,
  },
  chipTextActive: {
    fontFamily: 'Figtree_700Bold',
    color: brand.navy,
  },
  birdNote: {
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: brand.roseTint,
    borderWidth: 1,
    borderColor: brand.rose,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  birdNoteText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: brand.ink,
  },
  meta: {
    marginBottom: 12,
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: brand.muted,
  },
});
