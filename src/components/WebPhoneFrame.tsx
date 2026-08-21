import type { ReactNode } from 'react';
import { Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

const PHONE_WIDTH = 390;
const PHONE_MAX_HEIGHT = 844;
const FRAME_BREAKPOINT = 480;
const NOTCH = 28;

type Props = {
  children: ReactNode;
};

/**
 * On wide desktop web, centers the app in a phone-sized frame.
 * On native / narrow web, renders children full-screen.
 */
export function WebPhoneFrame({ children }: Props) {
  const { width, height } = useWindowDimensions();

  if (Platform.OS !== 'web' || width < FRAME_BREAKPOINT) {
    return <View style={styles.fill}>{children}</View>;
  }

  const frameHeight = Math.min(PHONE_MAX_HEIGHT, Math.max(640, height - 48));
  const contentHeight = frameHeight - NOTCH;

  return (
    <View style={[styles.desk, { minHeight: height }]}>
      <View
        style={[
          styles.phone,
          {
            width: Math.min(PHONE_WIDTH, width - 32),
            height: frameHeight,
          },
        ]}
      >
        <View style={styles.notchBar}>
          <View style={styles.notch} />
        </View>
        <View style={[styles.content, { height: contentHeight }]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  desk: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C1C33',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  phone: {
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#F7F1ED',
    borderWidth: 10,
    borderColor: '#0C1C33',
    ...Platform.select({
      web: {
        boxShadow: '0 24px 64px rgba(0,0,0,0.45)',
      } as object,
      default: {
        shadowColor: '#000',
        shadowOpacity: 0.35,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 16 },
        elevation: 16,
      },
    }),
  },
  notchBar: {
    height: NOTCH,
    backgroundColor: '#F7F1ED',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  notch: {
    width: 96,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#0C1C33',
  },
  content: {
    width: '100%',
    overflow: 'hidden',
  },
});
