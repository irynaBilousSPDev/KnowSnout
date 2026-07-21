import { Pressable, StyleSheet, Text, View } from 'react-native';

import { brand } from '@/src/theme/brand';

export type SegmentOption<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
};

/** Minimal segmented control. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.track}>
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[styles.item, active && styles.itemActive]}
          >
            <Text
              style={[styles.label, active && styles.labelActive]}
              numberOfLines={1}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: 14,
    backgroundColor: brand.mist,
    gap: 2,
  },
  item: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  itemActive: {
    backgroundColor: brand.surfaceElevated,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: brand.tealPressed,
  },
  labelActive: {
    color: brand.ink,
  },
});
