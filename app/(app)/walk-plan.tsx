import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { SegmentedControl } from '@/src/components/SegmentedControl';
import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { googleCalendarUrl } from '@/src/lib/deviceCalendar';
import { notify } from '@/src/lib/notify';
import { createWalkPlan } from '@/src/services/walks';
import { brand, fonts } from '@/src/theme/brand';

const DEFAULT_WHEN = 'Субота, 2 серпня · 10:00';
const DEFAULT_PLACE = 'Парк на Оболоні';

/** Screenshot 04.15 — pill inputs, text bar Cancel/Create */
export default function WalkPlanScreen() {
  const [kind, setKind] = useState<'walk' | 'trip'>('walk');
  const [whenLabel, setWhenLabel] = useState(DEFAULT_WHEN);
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [invited, setInvited] = useState<string[]>(['fu-1', 'fu-2']);
  const [busy, setBusy] = useState(false);
  const friends = useMemo(() => listFriendsSyncFallback(), []);

  const submit = async () => {
    const friendId = invited[0] ?? friends[0]?.id;
    if (!friendId) {
      notify(t('common.error'), t('walks.friendRequired'));
      return;
    }
    setBusy(true);
    try {
      await createWalkPlan({
        friendId,
        whenIso: '2026-08-02T10:00:00.000Z',
        place,
        note: whenLabel,
      });
      notify(t('common.ok'), t('walks.created'));
      router.back();
    } catch {
      notify(t('common.error'), t('walks.createError'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.barSide}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.barTitle}>{t('walks.title')}</Text>
        <Pressable
          onPress={() => void submit()}
          disabled={busy}
          hitSlop={8}
          style={styles.barSide}
        >
          <Text style={[styles.create, busy && styles.dim]}>
            {t('walks.create')}
          </Text>
        </Pressable>
      </View>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.pad}>
          <Text style={styles.label}>{t('walks.what')}</Text>
          <SegmentedControl
            options={[
              { id: 'walk', label: t('walks.kindWalk') },
              { id: 'trip', label: t('walks.kindTrip') },
            ]}
            value={kind}
            onChange={setKind}
          />

          <Text style={styles.label}>{t('walks.dateTime')}</Text>
          <TextInput
            value={whenLabel}
            onChangeText={setWhenLabel}
            style={styles.input}
          />

          <Text style={styles.label}>{t('walks.place')}</Text>
          <TextInput
            value={place}
            onChangeText={setPlace}
            placeholder={t('walks.placePlaceholder')}
            placeholderTextColor={brand.mutedSoft}
            style={styles.input}
          />

          <Text style={styles.label}>{t('walks.inviteFriends')}</Text>
          <View style={styles.avatars}>
            {friends.map((f) => {
              const on = invited.includes(f.id);
              return (
                <Pressable
                  key={f.id}
                  onPress={() =>
                    setInvited((cur) =>
                      on ? cur.filter((id) => id !== f.id) : [...cur, f.id],
                    )
                  }
                  style={styles.person}
                >
                  <View style={[styles.ring, on && styles.ringOn]}>
                    <UserAvatar avatarKey={f.avatarKey} name={f.name} size={48} />
                  </View>
                  <Text style={styles.personName} numberOfLines={1}>
                    {f.name.split(' ')[0]}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => router.push('/(app)/friend-search' as never)}
              style={styles.addWrap}
            >
              <View style={styles.addDash}>
                <Ionicons name="add" size={22} color={brand.accent} />
              </View>
            </Pressable>
          </View>

          <Pressable
            onPress={() => {
              const url = googleCalendarUrl({
                title:
                  kind === 'trip' ? t('walks.kindTrip') : t('walks.kindWalk'),
                dateIso: '2026-08-02',
                details: place,
              });
              void Linking.openURL(url);
            }}
            style={styles.calBtn}
          >
            <Ionicons name="calendar-outline" size={17} color={brand.ink} />
            <Text style={styles.calT}>{t('walks.addCalendar')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </AppScreen>
  );
}

function listFriendsSyncFallback() {
  return [
    { id: 'fu-1', name: 'Оксана', avatarKey: 'woman-1' },
    { id: 'fu-2', name: 'Ігор', avatarKey: 'man-1' },
  ];
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  barSide: { width: 88 },
  cancel: {
    fontFamily: fonts.bodySemi,
    fontSize: 14,
    color: brand.muted,
  },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: fonts.title,
    fontSize: 18,
    color: brand.ink,
  },
  create: {
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: brand.accent,
  },
  dim: { opacity: 0.4 },
  pad: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 40, gap: 8 },
  label: {
    marginTop: 10,
    marginBottom: 2,
    fontFamily: fonts.body,
    fontSize: 12.5,
    color: brand.mutedSoft,
  },
  input: {
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  avatars: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginTop: 4,
  },
  person: { width: 56, alignItems: 'center', gap: 6 },
  ring: {
    borderRadius: 999,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ringOn: { borderColor: brand.accent },
  personName: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.ink,
  },
  addWrap: { paddingTop: 2 },
  addDash: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: brand.accentSoft,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calBtn: {
    marginTop: 18,
    height: 48,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1.5,
    borderColor: brand.mistBorder,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  calT: { fontFamily: fonts.bodySemi, fontSize: 14, color: brand.ink },
});
