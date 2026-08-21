import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand, fonts } from '@/src/theme/brand';

type Props = {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  variant?: 'card' | 'flat';
};

/** HTML kit list row — white card r14, soft shadow. */
export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  onPress,
  showChevron = true,
  variant = 'card',
}: Props) {
  const body = (
    <View style={styles.row}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}
      <View style={styles.textCol}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text style={styles.meta} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </View>
      {trailing ? <View style={styles.trailing}>{trailing}</View> : null}
      {onPress && showChevron && !trailing ? (
        <Ionicons name="chevron-forward" size={18} color={brand.mutedSoft} />
      ) : null}
    </View>
  );

  const shellStyle = variant === 'flat' ? styles.shellFlat : styles.shell;

  if (!onPress) {
    return <View style={shellStyle}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [shellStyle, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: brand.radius.md,
    backgroundColor: brand.surfaceElevated,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  shellFlat: {
    borderRadius: 0,
    backgroundColor: 'transparent',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: brand.mistBorder,
    paddingHorizontal: 4,
    paddingVertical: 14,
    marginBottom: 0,
  },
  pressed: { opacity: 0.88 },
  row: { flexDirection: 'row', alignItems: 'center' },
  leading: { marginRight: 12 },
  textCol: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 3,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: brand.muted,
  },
  meta: {
    marginTop: 3,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: brand.accentDark,
  },
  trailing: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
