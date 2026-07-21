import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand } from '@/src/theme/brand';

type Props = {
  title: string;
  subtitle?: string | null;
  meta?: string | null;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
};

export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  onPress,
  showChevron = true,
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
        <Ionicons name="chevron-forward" size={18} color="#B7EBE0" />
      ) : null}
    </View>
  );

  if (!onPress) {
    return <View style={styles.shell}>{body}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.shell, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 16,
    backgroundColor: brand.surfaceElevated,
    borderWidth: 1,
    borderColor: brand.mistBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  pressed: { opacity: 0.85 },
  row: { flexDirection: 'row', alignItems: 'center' },
  leading: { marginRight: 12 },
  textCol: { flex: 1, minWidth: 0 },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: brand.ink,
  },
  subtitle: {
    marginTop: 2,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#5A7A72',
  },
  meta: {
    marginTop: 3,
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: brand.tealPressed,
  },
  trailing: {
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
