import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
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
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import {
  listCareTodayForPets,
  updateCareToday,
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

/** 03.08 Догляд сьогодні — pet picker + water / play / feed toggles. */
export default function CareHubScreen() {
  const [rows, setRows] = useState<HubRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState(false);
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
      const next = pets.map((pet) => ({
        pet,
        log: logs[pet.id]!,
        fedFromLogs: Boolean(fedMap[pet.id]),
      }));
      setRows(next);
      setSelectedId((prev) => {
        if (prev && next.some((r) => r.pet.id === prev)) return prev;
        return next[0]?.pet.id ?? null;
      });
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

  const selected = useMemo(
    () => rows.find((r) => r.pet.id === selectedId) ?? null,
    [rows, selectedId],
  );

  const toggle = async (
    field: 'water_done' | 'play_done' | 'feed_done',
    value: boolean,
  ) => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const updated = await updateCareToday(selected.pet.id, {
        [field]: value,
      });
      setRows((prev) =>
        prev.map((r) =>
          r.pet.id === selected.pet.id ? { ...r, log: updated } : r,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : t('care.loadError'));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <LoadingState message={t('care.loading')} />;
  }

  const waterDone = selected?.log.water_done ?? false;
  const playDone = selected?.log.play_done ?? false;
  const feedDone =
    (selected?.log.feed_done || selected?.fedFromLogs) ?? false;

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader
        trailing="bell"
        bellCount={3}
        onBellPress={() => router.push('/(app)/notifications' as never)}
      />
      <ScrHeader title={t('care.hubTitle')} titleSize={22} showBack={false} />
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
        {error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : rows.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('care.hubEmptyTitle')}</Text>
            <Text style={styles.emptyBody}>{t('care.hubEmptyBody')}</Text>
            <PrimaryButton
              label={t('pets.add')}
              onPress={() => router.push('/(app)/pet-species' as never)}
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
                const active = item.pet.id === selectedId;
                return (
                  <Pressable
                    key={item.pet.id}
                    onPress={() => setSelectedId(item.pet.id)}
                    style={[styles.petPick, active && styles.petPickActive]}
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
                  </Pressable>
                );
              })}
            </ScrollView>

            {selected ? (
              <View style={styles.tasks}>
                {(
                  [
                    {
                      key: 'water' as const,
                      label: t('care.waterAction'),
                      icon: 'water-outline' as const,
                      done: waterDone,
                      onToggle: () => void toggle('water_done', !waterDone),
                    },
                    {
                      key: 'play' as const,
                      label: t('care.playAction'),
                      icon: 'football-outline' as const,
                      done: playDone,
                      onToggle: () => void toggle('play_done', !playDone),
                    },
                    {
                      key: 'feed' as const,
                      label: t('care.feedAction'),
                      icon: 'restaurant-outline' as const,
                      done: feedDone,
                      onToggle: () => void toggle('feed_done', !feedDone),
                    },
                  ] as const
                ).map((row) => (
                  <View key={row.key} style={styles.taskRow}>
                    <View style={styles.taskLeft}>
                      <View style={styles.taskIcon}>
                        <Ionicons
                          name={row.icon}
                          size={20}
                          color={brand.accentDark}
                        />
                      </View>
                      <Text style={styles.taskLabel}>{row.label}</Text>
                    </View>
                    <Pressable
                      onPress={row.onToggle}
                      disabled={busy}
                      style={[
                        styles.statusChip,
                        row.done ? styles.statusDone : styles.statusPending,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          row.done && styles.statusTextDone,
                        ]}
                      >
                        {row.done
                          ? t('care.chipDone')
                          : t('care.chipPending')}
                      </Text>
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/(app)/pet-care',
                      params: { petId: selected.pet.id },
                    } as never)
                  }
                  style={styles.detailLink}
                >
                  <Text style={styles.detailLinkText}>
                    {t('care.openDetail')}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40 },
  pickerRow: { flexDirection: 'row', gap: 14, paddingBottom: 16 },
  petPick: {
    width: 72,
    alignItems: 'center',
    gap: 6,
    opacity: 0.72,
  },
  petPickActive: { opacity: 1 },
  petPickName: {
    fontFamily: fonts.bodySemi,
    fontSize: 11,
    color: brand.ink,
    textAlign: 'center',
  },
  tasks: { gap: 10 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  taskLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: brand.accentTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusDone: { backgroundColor: brand.successTint },
  statusPending: { backgroundColor: brand.creamDeep },
  statusText: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.muted,
  },
  statusTextDone: { color: brand.successDark },
  detailLink: { marginTop: 8, alignItems: 'center', paddingVertical: 8 },
  detailLinkText: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.accent,
  },
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
