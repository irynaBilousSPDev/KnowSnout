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
import Ionicons from '@expo/vector-icons/Ionicons';

import { UserAvatar } from '@/src/components/UserAvatar';
import { t } from '@/src/i18n';
import { getUserProfile } from '@/src/services/userProfile';
import { brand, fonts } from '@/src/theme/brand';
import type { UserProfile } from '@/src/types/userProfile';

const logoEmerald = require('../../assets/images/logo_emerald.png');

type Trailing = 'avatar' | 'bell' | 'none';

type Props = {
  onBrandPress?: () => void;
  onAvatarPress?: () => void;
  onBellPress?: () => void;
  /** @deprecated prefer trailing="avatar" | "bell" | "none" */
  showAvatar?: boolean;
  trailing?: Trailing;
  bellCount?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * HTML `.app-hd` — logo + Know/Snout + avatar | bell+badge | none.
 * Default trailing is avatar (HTML frames). Bell opens the activity inbox
 * (likes / comments / follows) — not settings prefs.
 */
export function AppChromeHeader({
  onBrandPress,
  onAvatarPress,
  onBellPress,
  showAvatar,
  trailing,
  bellCount = 0,
  style,
}: Props) {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const mode: Trailing =
    trailing ?? (showAvatar === false ? 'none' : 'avatar');

  useFocusEffect(
    useCallback(() => {
      if (mode !== 'avatar') return;
      void getUserProfile().then(setProfile);
    }, [mode]),
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

      {mode === 'avatar' ? (
        <Pressable
          onPress={
            onAvatarPress ?? (() => router.push('/(app)/my-profile' as never))
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
      ) : mode === 'bell' ? (
        <Pressable
          onPress={
            onBellPress ??
            (() => router.push('/(app)/activity' as never))
          }
          style={styles.bellBtn}
          accessibilityRole="button"
          accessibilityLabel={t('activity.title')}
        >
          <Ionicons
            name="notifications-outline"
            size={18}
            color={brand.label}
          />
          {bellCount > 0 ? (
            <View style={styles.dot}>
              <Text style={styles.dotText}>
                {bellCount > 99 ? '99' : String(bellCount)}
              </Text>
            </View>
          ) : null}
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
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  dot: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 5,
    borderRadius: 9,
    backgroundColor: brand.successDark,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.canvas,
  },
  dotText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10.5,
    lineHeight: 14,
    color: '#FFFFFF',
  },
  avatarSpacer: {
    width: 36,
    height: 36,
  },
});
