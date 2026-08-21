import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { ErrorState } from '@/src/components/ErrorState';
import { LoadingState } from '@/src/components/LoadingState';
import { PetAvatar } from '@/src/components/PetAvatar';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { t } from '@/src/i18n';
import {
  careProgress,
  listCareTodayForPets,
} from '@/src/services/care';
import { hasFedToday } from '@/src/services/feeding';
import { listPets } from '@/src/services/pets';
import { brand, fonts } from '@/src/theme/brand';
import type { CareDayLog } from '@/src/types/care';
import type { PetRow } from '@/src/types/pet';

type HubRow = {
  pet: PetRow;
  log: CareDayLog;
  fedFromLogs: boolean;
};

/** HTML kit · 14 Догляд сьогодні — pet picker hub. */
export default function CareHubScreen() {
  const [rows, setRows] = useState<HubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const pets = await listPets();
      const logs = await listCareTodayForPets(pets.map((p) => p.id));
      const fedFlags = await Promise.all(
        pets.map(async (p) => ({ id: p.id, fed: await hasFedToday(p.id) })),
      );
      const fedMap = Object.fromEntries(fedFlags.map((f) => [f.id, f.fed]));
      setRows(
        pets.map((pet) => ({
          pet,
          log: logs[pet.id]!,
          fedFromLogs: Boolean(fedMap[pet.id]),
        })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('care.loadError'));
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

  if (loading) {
    return <LoadingState message={t('care.loading')} />;
  }

  return (
    <AppScreen edges={['bottom']}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void load(true)}
            tintColor={brand.accent}
          />
        }
        contentContainerStyle={styles.scroll}
      >
        <Text style={styles.title}>{t('care.hubTitle')}</Text>
        <Text style={styles.subtitle}>{t('care.hubSubtitle')}</Text>

        {error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : rows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('care.hubEmptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('care.hubEmptyBody')}</Text>
            <PrimaryButton
              label={t('pets.add')}
              onPress={() => router.push('/(app)/pet-form')}
              style={styles.emptyBtn}
            />
          </View>
        ) : (
          <>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pickerRow}
            >
              {rows.map((item) => {
                const progress = careProgress(item.log, {
                  fedFromLogs: item.fedFromLogs,
                });
                return (
                  <Pressable
                    key={item.pet.id}
                    onPress={() =>
                      router.push({
                        pathname: '/(app)/pet-care',
                        params: { petId: item.pet.id },
                      })
                    }
                    style={({ pressed }) => [
                      styles.petPick,
                      pressed && styles.pressed,
                    ]}
                  >
                    <PetAvatar
                      avatarKey={item.pet.avatar_key}
                      avatarUri={item.pet.avatar_uri}
                      species={item.pet.species}
                      size={56}
                      name={item.pet.name}
                    />
                    <Text style={styles.petPickName} numberOfLines={1}>
                      {item.pet.name}
                    </Text>
                    <Text style={styles.petPickMeta}>
                      {progress.done}/{progress.total}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Text style={styles.pickHint}>{t('care.hubPickPet')}</Text>
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  title: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  pickerRow: { flexDirection: 'row', gap: 14, paddingBottom: 4 },
  petPick: { width: 72, alignItems: 'center', gap: 6 },
  petPickName: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: brand.ink,
    textAlign: 'center',
  },
  petPickMeta: {
    fontFamily: fonts.body,
    fontSize: 10,
    color: brand.muted,
  },
  pickHint: {
    marginTop: 16,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.muted,
  },
  pressed: { opacity: 0.85 },
  emptyCard: {
    marginTop: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    padding: 20,
  },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: brand.ink,
  },
  emptyBody: {
    marginTop: 8,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: brand.muted,
  },
  emptyBtn: { marginTop: 16 },
});
