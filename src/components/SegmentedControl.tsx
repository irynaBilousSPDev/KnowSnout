import { Pressable, StyleSheet, Text, View } from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

export type SegmentOption<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (id: T) => void;
};

/** PDF segmented control — sage active pill on soft track. */
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
    padding: 4,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    gap: 2,
  },
  item: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: brand.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  itemActive: {
    backgroundColor: brand.sage,
  },
  label: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: brand.muted,
  },
  labelActive: {
    color: '#FFFFFF',
  },
});
