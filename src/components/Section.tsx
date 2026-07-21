import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { brand } from '@/src/theme/brand';

type Tone = 'elevated' | 'mist' | 'plain';

type Props = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  tone?: Tone;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Section({
  children,
  title,
  subtitle,
  tone = 'elevated',
  action,
  style,
}: Props) {
  return (
    <View
      style={[
        styles.base,
        tone === 'elevated' && styles.elevated,
        tone === 'mist' && styles.mist,
        tone === 'plain' && styles.plain,
        style,
      ]}
    >
      {title || action ? (
        <View style={styles.header}>
          <View style={styles.headerText}>
            {title ? <Text style={styles.title}>{title}</Text> : null}
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
          {action}
        </View>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  elevated: {
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
  },
  mist: {
    backgroundColor: brand.mist,
  },
  plain: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 4,
  },
  header: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerText: { flex: 1 },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 4,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#5A7A72',
  },
});
