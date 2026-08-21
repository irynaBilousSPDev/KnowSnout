import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScreenHeader } from '@/src/components/ScreenHeader';
import { t } from '@/src/i18n';
import { notify } from '@/src/lib/notify';
import { acceptInviteToken } from '@/src/services/friends';
import { brand } from '@/src/theme/brand';

export default function FriendInviteAcceptScreen() {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const onAccept = async () => {
    setBusy(true);
    try {
      const result = await acceptInviteToken(code);
      if (!result.ok) {
        notify(
          t('common.error'),
          result.reason === 'already'
            ? t('friends.inviteAlready')
            : t('friends.inviteInvalid'),
        );
        return;
      }
      notify(t('common.ok'), t('friends.inviteAccepted'));
      router.replace('/(app)/friends' as never);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppScreen>
      <View style={styles.pad}>
        <ScreenHeader
          title={t('friends.inviteAcceptTitle')}
          subtitle={t('friends.inviteAcceptSubtitle')}
        />
        <Text style={styles.label}>{t('friends.inviteCode')}</Text>
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={t('friends.inviteCodePlaceholder')}
          placeholderTextColor="#7A9A92"
          style={styles.input}
          maxLength={16}
        />
        <View style={styles.gap} />
        <PrimaryButton
          label={t('friends.inviteAcceptCta')}
          loading={busy}
          disabled={code.trim().length < 4}
          onPress={() => void onAccept()}
        />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: { flex: 1, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 },
  label: {
    marginBottom: 8,
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: brand.forest,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    letterSpacing: 3,
    color: brand.navy,
    textAlign: 'center',
  },
  gap: { height: 14 },
});
