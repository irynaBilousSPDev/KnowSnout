import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
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
import { petHubMeta } from '@/src/lib/petMeta';
import { getPassportPack } from '@/src/constants/passportChecklists';
import {
  getPassportProgress,
  passportProgressCount,
} from '@/src/services/passportDocs';
import { listPets } from '@/src/services/pets';
import {
  listPetVaccines,
  vaccineDueStatus,
} from '@/src/services/vaccines';
import { brand, fonts } from '@/src/theme/brand';
import type { PetRow } from '@/src/types/pet';

type IconCircleTone = 'accent' | 'success' | 'neutral';

function IconCircle({
  name,
  tone,
}: {
  name: keyof typeof Ionicons.glyphMap;
  tone: IconCircleTone;
}) {
  const bg =
    tone === 'accent'
      ? brand.accentTint
      : tone === 'success'
        ? brand.successTint
        : brand.chipTrack;
  const color =
    tone === 'accent'
      ? brand.accentDark
      : tone === 'success'
        ? brand.successDark
        : brand.ink;
  return (
    <View style={[styles.iconCircle, { backgroundColor: bg }]}>
      <Ionicons name={name} size={19} color={color} />
    </View>
  );
}

/** HTML kit · 13 Хаб тварини — avatar header, circle switcher, soft cards. */
export default function PetHubScreen() {
  const params = useLocalSearchParams<{ petId?: string }>();
  const paramPetId = typeof params.petId === 'string' ? params.petId : undefined;

  const [pets, setPets] = useState<PetRow[]>([]);
  const [petId, setPetId] = useState<string | undefined>(paramPetId);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vaxHint, setVaxHint] = useState(t('petHub.vaccinesOk'));
  const [docsHint, setDocsHint] = useState(t('petHub.docsProgress', { done: 0, total: 0 }));

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

  const loadHints = useCallback(async (id: string) => {
    try {
      const pack = getPassportPack('home');
      const [vax, passport] = await Promise.all([
        listPetVaccines(id),
        getPassportProgress(id, 'home'),
      ]);
      const statuses = vax.map((v) => vaccineDueStatus(v.next_due_on));
      setVaxHint(
        statuses.some((s) => s === 'overdue' || s === 'soon')
          ? t('petHub.vaccinesSoon')
          : t('petHub.vaccinesOk'),
      );
      const counts = passportProgressCount(passport, pack.items.length);
      setDocsHint(
        t('petHub.docsProgress', {
          done: counts.done,
          total: counts.total,
        }),
      );
    } catch {
      setVaxHint(t('petHub.vaccinesOk'));
      setDocsHint(t('petHub.docsProgress', { done: 0, total: 0 }));
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => {
    if (petId) void loadHints(petId);
  }, [petId, loadHints]);

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
          <Text style={styles.pageTitle}>{t('petHub.title')}</Text>
          <Text style={styles.emptyLead}>{t('petHub.empty')}</Text>
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
    <AppScreen edges={['bottom']}>
      <AppChromeHeader
        trailing="bell"
        bellCount={3}
        onBellPress={() => router.push('/(app)/notifications' as never)}
      />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
          >
            <Ionicons name="chevron-back" size={18} color={brand.ink} />
          </Pressable>
          <Text style={styles.topLabel}>{t('pets.title')}</Text>
          <View style={styles.backSpacer} />
        </View>

        <View style={styles.hero}>
          <PetAvatar
            avatarKey={pet.avatar_key}
            avatarUri={pet.avatar_uri}
            species={pet.species}
            size={56}
            name={pet.name}
          />
          <View style={styles.heroCopy}>
            <Text style={styles.heroName}>{pet.name}</Text>
            <Text style={styles.heroMeta}>{petHubMeta(pet)}</Text>
          </View>
        </View>

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
                style={[styles.switchAvatar, active && styles.switchAvatarActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={p.name}
              >
                <PetAvatar
                  avatarKey={p.avatar_key}
                  avatarUri={p.avatar_uri}
                  species={p.species}
                  size={active ? 30 : 34}
                  name={p.name}
                />
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => router.push('/(app)/pet-species' as never)}
            style={styles.switchAdd}
            accessibilityRole="button"
            accessibilityLabel={t('pets.add')}
          >
            <Text style={styles.switchAddText}>+</Text>
          </Pressable>
        </ScrollView>

        {isBird ? (
          <View style={styles.birdNote}>
            <Text style={styles.birdNoteText}>{t('petHub.birdHint')}</Text>
          </View>
        ) : null}

        <View style={styles.pad}>
          <ListRow
            title={t('petHub.favoriteFood')}
            subtitle={
              pet.favorite_food?.trim() || t('pets.favoriteFoodEmptyShort')
            }
            leading={<IconCircle name="nutrition-outline" tone="accent" />}
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-profile',
                params: { id: pet.id },
              } as never)
            }
          />
          <ListRow
            title={t('vaccines.title')}
            subtitle={vaxHint}
            leading={<IconCircle name="checkmark" tone="success" />}
            onPress={() => go('/(app)/pet-vaccines')}
          />
          <ListRow
            title={t('care.hubOpen')}
            subtitle={isBird ? t('petHub.careBird') : t('care.cardHint')}
            leading={<IconCircle name="sunny-outline" tone="success" />}
            onPress={() => go('/(app)/pet-care')}
          />
          <ListRow
            title={t('petHub.docsTravel')}
            subtitle={docsHint}
            leading={<IconCircle name="document-text-outline" tone="neutral" />}
            onPress={() => go('/(app)/pet-passport')}
          />

          <PrimaryButton
            label={t('petHub.viewProfile')}
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(app)/pet-profile',
                params: { id: pet.id },
              } as never)
            }
            style={styles.profileBtn}
          />

          <Text style={styles.moreLabel}>{t('petHub.more')}</Text>
          <ListRow
            title={t('vetLog.title')}
            subtitle={t('vetLog.subtitle')}
            leading={<IconCircle name="medkit-outline" tone="accent" />}
            onPress={() => go('/(app)/pet-vet-log')}
          />
          <ListRow
            title={t('play.title')}
            subtitle={isBird ? t('petHub.playBird') : t('play.subtitle')}
            leading={<IconCircle name="game-controller-outline" tone="success" />}
            onPress={() => go('/(app)/play-guides')}
          />
          <ListRow
            title={t('habits.title')}
            subtitle={t('habits.subtitle')}
            leading={<IconCircle name="sparkles-outline" tone="accent" />}
            onPress={() => go('/(app)/pet-habits')}
          />
          <ListRow
            title={t('calendar.title')}
            subtitle={t('calendar.subtitle')}
            leading={<IconCircle name="calendar-outline" tone="neutral" />}
            onPress={() => go('/(app)/pet-calendar')}
          />
          <ListRow
            title={t('travel.title')}
            subtitle={isBird ? t('petHub.travelBird') : t('travel.subtitle')}
            leading={<IconCircle name="airplane-outline" tone="accent" />}
            onPress={() => go('/(app)/pet-travel')}
          />
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingBottom: 40 },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    backgroundColor: brand.creamDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backSpacer: { width: 34 },
  topLabel: {
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.mutedSoft,
  },
  pageTitle: {
    fontFamily: fonts.title,
    fontSize: 22,
    color: brand.ink,
    marginBottom: 8,
  },
  emptyLead: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  hero: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroCopy: { flex: 1, minWidth: 0 },
  heroName: {
    fontFamily: fonts.title,
    fontSize: 22,
    lineHeight: 28,
    color: brand.ink,
    margin: 0,
  },
  heroMeta: {
    marginTop: 2,
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.muted,
  },
  switcher: {
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    opacity: 0.6,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchAvatarActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: brand.accent,
    padding: 1,
  },
  switchAdd: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: brand.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchAddText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: brand.mutedSoft,
  },
  birdNote: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: brand.radius.md,
    backgroundColor: brand.accentTint,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  birdNoteText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brand.ink,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtn: { marginTop: 6, marginBottom: 18 },
  moreLabel: {
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: brand.mutedSoft,
    letterSpacing: 0.4,
  },
});
