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

/** HTML kit segment — track #EAE7E2, active white pill + accent text. */
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
    backgroundColor: brand.chipTrack,
    gap: 2,
  },
  item: {
    flex: 1,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: brand.radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  itemActive: {
    backgroundColor: brand.surfaceElevated,
    shadowColor: brand.shadow.color,
    shadowOpacity: brand.shadow.opacity,
    shadowRadius: brand.shadow.radius,
    shadowOffset: brand.shadow.offset,
    elevation: 1,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  labelActive: {
    color: brand.accentDark,
    fontFamily: fonts.bodyBold,
  },
});
