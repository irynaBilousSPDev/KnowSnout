import { router } from 'expo-router';
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

import { brand, fonts } from '@/src/theme/brand';

const logoEmerald = require('../../assets/images/logo_emerald.png');

type Props = {
  /** Navigate home / check hub on brand press */
  onBrandPress?: () => void;
  /** Navigate to profile / my-data on avatar press */
  onAvatarPress?: () => void;
  showAvatar?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * HTML `.app-hd` — global chrome on every phone mock:
 * logo + Know(ink)/Snout(logoGreen) + optional avatar.
 */
export function AppChromeHeader({
  onBrandPress,
  onAvatarPress,
  showAvatar = true,
  style,
}: Props) {
  const insets = useSafeAreaInsets();

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
          style={styles.avatar}
          accessibilityRole="button"
          accessibilityLabel="Мої дані"
        />
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
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: brand.successSoft,
  },
  avatarSpacer: {
    width: 36,
    height: 36,
  },
});
