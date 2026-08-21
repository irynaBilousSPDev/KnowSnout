import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { ListRow } from '@/src/components/ListRow';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { listFriends, type FriendUser } from '@/src/services/friends';
import {
  cancelWalkPlan,
  createWalkPlan,
  listWalkPlans,
  suggestedWalkSlots,
  type WalkPlan,
} from '@/src/services/walks';
import { brand, fonts } from '@/src/theme/brand';

export default function WalkPlanScreen() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [plans, setPlans] = useState<WalkPlan[]>([]);
  const [friendId, setFriendId] = useState<string | null>(null);
  const [whenIso, setWhenIso] = useState(suggestedWalkSlots()[0]?.whenIso ?? '');
  const [place, setPlace] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const slots = suggestedWalkSlots();

  const load = useCallback(async () => {
    const [f, p] = await Promise.all([listFriends(), listWalkPlans()]);
    setFriends(f);
    setPlans(p);
    if (!friendId && f[0]) setFriendId(f[0].id);
  }, [friendId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const submit = async () => {
    if (!friendId) {
      notify(t('common.error'), t('walks.friendRequired'));
      return;
    }
    setBusy(true);
    try {
      await createWalkPlan({ friendId, whenIso, place, note });
      notify(t('common.ok'), t('walks.created'));
      setPlace('');
      setNote('');
      await load();
    } catch {
      notify(t('common.error'), t('walks.createError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <ScreenHeader title={t('walks.title')} subtitle={t('walks.subtitle')} />

          <Text style={styles.label}>{t('walks.friend')}</Text>
          {friends.map((f) => {
            const active = f.id === friendId;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFriendId(f.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {f.name}
                </Text>
              </Pressable>
            );
          })}
          {friends.length === 0 ? (
            <Text style={styles.empty}>{t('walks.noFriends')}</Text>
          ) : null}

          <Text style={styles.label}>{t('walks.when')}</Text>
          {slots.map((s) => {
            const active = s.whenIso === whenIso;
            return (
              <Pressable
                key={s.whenIso}
                onPress={() => setWhenIso(s.whenIso)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}

          <Text style={styles.label}>{t('walks.place')}</Text>
          <TextInput
            value={place}
            onChangeText={setPlace}
            placeholder={t('walks.placePlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />
          <Text style={styles.label}>{t('walks.note')}</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={t('walks.notePlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />

          <View style={styles.gap} />
          <PrimaryButton
            label={t('walks.submit')}
            loading={busy}
            onPress={() => void submit()}
          />

          <Text style={styles.section}>{t('walks.upcoming')}</Text>
          {plans.length === 0 ? (
            <Text style={styles.empty}>{t('walks.empty')}</Text>
          ) : (
            plans.map((p) => (
              <ListRow
                key={p.id}
                title={p.friendName}
                subtitle={p.place}
                meta={new Date(p.whenIso).toLocaleString('uk-UA')}
                trailing={
                  <PrimaryButton
                    label={t('walks.cancel')}
                    size="sm"
                    variant="ghost"
                    block={false}
                    onPress={() => void cancelWalkPlan(p.id).then(load)}
                  />
                }
                showChevron={false}
              />
            ))
          )}
        </View>
      </ScrollView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.muted,
  },
  chip: {
    marginBottom: 8,
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  chipActive: {
    backgroundColor: brand.mist,
    borderColor: brand.navy,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: brand.ink,
  },
  chipTextActive: { color: brand.navy },
  input: {
    borderRadius: 14,
        backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  section: {
    marginTop: 22,
    marginBottom: 8,
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: brand.muted,
  },
  empty: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.muted,
  },
  gap: { height: 12 },
});
