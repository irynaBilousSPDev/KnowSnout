import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { AppChromeHeader } from '@/src/components/AppChromeHeader';
import { AppScreen } from '@/src/components/AppScreen';
import { PrimaryButton } from '@/src/components/PrimaryButton';
import { ScrHeader } from '@/src/components/ScrHeader';
import { t } from '@/src/i18n';
import { copyText, shareText } from '@/src/lib/share';
import {
  createInviteToken,
  getLatestInvite,
  type FriendInvite,
} from '@/src/services/friends';
import { brand, fonts } from '@/src/theme/brand';

const PUBLIC_URL = 'knowsnout.app/u/marta_tukan';

/** Screenshot 04.11 */
export default function FriendInviteScreen() {
  const [invite, setInvite] = useState<FriendInvite | null>(null);

  useFocusEffect(
    useCallback(() => {
      void (async () => {
        let latest = await getLatestInvite();
        if (!latest) latest = await createInviteToken();
        setInvite(latest);
      })();
    }, []),
  );

  return (
    <AppScreen edges={['bottom']}>
      <AppChromeHeader />
      <ScrHeader title={t('friends.inviteTitle')} titleSize={19} />
      <View style={styles.pad}>
        <View style={styles.qrCard}>
          <Ionicons name="qr-code-outline" size={120} color={brand.ink} />
        </View>
        <Text style={styles.url}>{PUBLIC_URL}</Text>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={t('friends.inviteCopyShort')}
              variant="secondary"
              onPress={() => void copyText(`https://${PUBLIC_URL}`)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <PrimaryButton
              label={t('friends.inviteShare')}
              onPress={() =>
                void shareText({
                  title: t('friends.inviteTitle'),
                  message: `https://${PUBLIC_URL}`,
                })
              }
            />
          </View>
        </View>
        {invite ? (
          <Text style={styles.hint}>
            {t('friends.inviteCode')}: {invite.token}
          </Text>
        ) : null}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  pad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    alignItems: 'center',
    gap: 16,
  },
  qrCard: {
    width: 180,
    height: 180,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 2,
  },
  url: {
    fontFamily: fonts.bodyBold,
    fontSize: 13.5,
    color: brand.ink,
    textAlign: 'center',
  },
  row: { flexDirection: 'row', gap: 10, width: '100%' },
  hint: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: brand.mutedSoft,
  },
});
