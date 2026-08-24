import { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand, fonts } from '@/src/theme/brand';

type Props = {
  unreadCount: number;
};

/** Spec green for paw badge */
const PAW_GREEN = '#0F6D38';

/**
 * Spec: paw on avatar when unreadCount > 0; numeric counter only when > 1.
 * Wave + pop-in; respects prefers-reduced-motion.
 */
export function AvatarNotifyBadge({ unreadCount }: Props) {
  const wave = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (unreadCount <= 0) {
      loopRef.current?.stop();
      wave.setValue(0);
      pop.setValue(0);
      return;
    }

    let cancelled = false;

    const run = async () => {
      const reduce =
        Platform.OS === 'web'
          ? typeof window !== 'undefined' &&
            Boolean(
              window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
            )
          : await AccessibilityInfo.isReduceMotionEnabled();

      if (cancelled) return;

      pop.setValue(0);
      Animated.timing(pop, {
        toValue: 1,
        duration: reduce ? 0 : 420,
        easing: Easing.bezier(0.34, 1.56, 0.64, 1),
        useNativeDriver: true,
      }).start();

      if (reduce) {
        wave.setValue(0);
        return;
      }

      const to = (v: number, ms: number) =>
        Animated.timing(wave, {
          toValue: v,
          duration: ms,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        });

      // 0 → -13 → 11 → -9 → 7 → 0 (~1.1s), pause to 6s cycle
      const waveSeq = Animated.sequence([
        to(-13, 180),
        to(11, 240),
        to(-9, 220),
        to(7, 220),
        to(0, 240),
        Animated.delay(4900),
      ]);

      loopRef.current = Animated.loop(waveSeq);
      loopRef.current.start();
    };

    void run();
    return () => {
      cancelled = true;
      loopRef.current?.stop();
    };
  }, [unreadCount, pop, wave]);

  if (unreadCount <= 0) return null;

  const scale = pop.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 1.25, 1],
  });

  const rotate = wave.interpolate({
    inputRange: [-13, 0, 11],
    outputRange: ['-13deg', '0deg', '11deg'],
  });

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.paw,
          {
            transform: [{ scale }, { rotate }],
          },
        ]}
      >
        <Ionicons name="paw" size={12} color="#FFFFFF" />
      </Animated.View>
      {unreadCount > 1 ? (
        <View style={styles.counter}>
          <Text style={styles.counterT}>
            {unreadCount > 99 ? '99' : String(unreadCount)}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  paw: {
    position: 'absolute',
    bottom: -3,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PAW_GREEN,
    borderWidth: 2.5,
    borderColor: brand.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: brand.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: brand.canvas,
  },
  counterT: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    lineHeight: 12,
    color: '#FFFFFF',
  },
});
