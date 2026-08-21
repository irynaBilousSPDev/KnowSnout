import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { copyText, shareText } from '@/src/lib/share';
import { notify } from '@/src/lib/notify';
import {
  buildInviteLink,
  createInviteToken,
  getLatestInvite,
  type FriendInvite,
} from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

export default function FriendInviteScreen() {
  const [invite, setInvite] = useState<FriendInvite | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    let latest = await getLatestInvite();
    if (!latest) {
      latest = await createInviteToken();
    }
    setInvite(latest);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const onRefreshCode = async () => {
    setBusy(true);
    try {
      const next = await createInviteToken();
      setInvite(next);
      notify(t('common.ok'), t('friends.inviteCreated'));
    } finally {
      setBusy(false);
    }
  };

  const link = invite ? buildInviteLink(invite.token) : '';
  const shareMessage = invite
    ? t('friends.inviteShareMessage', { code: invite.token, link })
    : '';

  return (
    <AppScreen>
      <View style={styles.pad}>
        <ScreenHeader
          title={t('friends.inviteTitle')}
          subtitle={t('friends.inviteSubtitle')}
        />

        <Text style={styles.hint}>{t('friends.inviteHint')}</Text>

        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{t('friends.inviteCode')}</Text>
          <Text style={styles.code}>{invite?.token ?? '········'}</Text>
          <Text style={styles.link}>{link || '—'}</Text>
        </View>

        <View style={styles.gap} />
        <PrimaryButton
          label={t('friends.inviteCopy')}
          variant="secondary"
          disabled={!invite}
          onPress={() => {
            if (!invite) return;
            void copyText(link || invite.token);
          }}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t('friends.inviteShare')}
          disabled={!invite}
          onPress={() => {
            if (!shareMessage) return;
            void shareText({
              title: t('friends.inviteTitle'),
              message: shareMessage,
            });
          }}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t('friends.inviteNew')}
          variant="ghost"
          loading={busy}
          onPress={() => void onRefreshCode()}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  hint: {
    marginBottom: 16,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    color: brand.forest,
  },
  codeCard: {
    borderRadius: brand.radius.md,
        backgroundColor: brand.surfaceElevated,
    paddingVertical: 28,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  codeLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: brand.forest,
    marginBottom: 10,
  },
  code: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 36,
    letterSpacing: 4,
    color: brand.navy,
  },
  link: {
    marginTop: 14,
    fontFamily: fonts.body,
    fontSize: 13,
    color: brand.ink,
    textAlign: 'center',
  },
  gap: { height: 10 },
});
