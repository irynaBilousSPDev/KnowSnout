import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { UserProfile } from '@/src/types/userProfile';

const logoEmerald = require('../../assets/images/logo_emerald.png');

type Props = {
  onBrandPress?: () => void;
  onAvatarPress?: () => void;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * HTML `.app-hd` — logo + Know/Snout + real user avatar (or icon pack).
 */
export function AppChromeHeader({
  onBrandPress,
  onAvatarPress,
  showAvatar = true,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useFocusEffect(
    useCallback(() => {
      void getUserProfile().then(setProfile);
    }, []),
  );

  return (
    <View style={[styles.hd, { paddingTop: Math.max(insets.top, 12) }, style]}>
      <Pressable
        onPress={
          onBrandPress ?? (() => router.push('/(app)/(tabs)' as never))
        }
        style={styles.brand}
        accessibilityRole="button"
        accessibilityLabel="KnowSnout"
      >
        <Image source={logoEmerald} style={styles.logo} resizeMode="contain" />
        <Text style={styles.word}>
          <Text style={styles.know}>Know</Text>
          <Text style={styles.snout}>Snout</Text>
        </Text>
      </Pressable>
      {showAvatar ? (
        <Pressable
          onPress={
            onAvatarPress ?? (() => router.push('/(app)/my-data' as never))
          }
          style={styles.avatarBtn}
          accessibilityRole="button"
          accessibilityLabel={t('me.title')}
        >
          <UserAvatar
            avatarKey={profile?.avatar_key}
            avatarUri={profile?.avatar_uri}
            gender={profile?.gender}
            size={36}
            name={profile?.display_name ?? t('me.title')}
          />
        </Pressable>
      ) : (
        <View style={styles.avatarSpacer} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hd: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 12,
    backgroundColor: brand.canvas,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.creamDeep,
    zIndex: 2,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 0,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: -4,
  },
  word: {
    fontFamily: fonts.titleExtra,
    fontSize: 19,
    lineHeight: 22,
    letterSpacing: -0.5,
  },
  know: {
    fontFamily: fonts.titleExtra,
    color: brand.ink,
  },
  snout: {
    fontFamily: fonts.titleExtra,
    color: brand.logoGreen,
  },
  avatarBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  avatarSpacer: {
    width: 36,
    height: 36,
  },
});
