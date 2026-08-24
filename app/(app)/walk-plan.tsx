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

/** Screenshot 04.15 */
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
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.barTitle}>{t('walks.title')}</Text>
        <Pressable onPress={() => void submit()} disabled={busy} hitSlop={8}>
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
                    <UserAvatar avatarKey={f.avatarKey} name={f.name} size={44} />
                  </View>
                  <Text style={styles.personName} numberOfLines={1}>
                    {f.name.split(' ')[0]}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => router.push('/(app)/friend-search' as never)}
              style={styles.addDash}
            >
              <Text style={styles.plus}>+</Text>
            </Pressable>
          </View>

          <View style={{ height: 4 }} />
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
            <Ionicons name="calendar-outline" size={16} color={brand.ink} />
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
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  cancel: {
    width: 88,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
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
    width: 88,
    textAlign: 'right',
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.accent,
  },
  dim: { opacity: 0.4 },
  pad: { paddingHorizontal: 20, paddingBottom: 40, gap: 10 },
  label: {
    marginTop: 6,
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.ink,
  },
  input: {
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: fonts.body,
    fontSize: 15,
    color: brand.ink,
  },
  avatars: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  person: { width: 52, alignItems: 'center', gap: 4 },
  ring: { borderRadius: 999 },
  ringOn: {},
  personName: { fontFamily: fonts.body, fontSize: 10.5, color: brand.ink },
  addDash: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: brand.mutedSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: { fontSize: 20, color: brand.muted, lineHeight: 22 },
  calBtn: {
    marginTop: 4,
    height: 44,
    borderRadius: 14,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  calT: { fontFamily: fonts.bodySemi, fontSize: 14, color: brand.ink },
});
