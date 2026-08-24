import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

export type ChipOption<T extends string> = {
  id: T;
  label: string;
};

type Props<T extends string> = {
  options: ChipOption<T>[];
  value: T | T[];
  onChange: (id: T) => void;
  multi?: boolean;
};

/** Horizontal filter chips — PDF soft grey / sage active. */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  const selected = Array.isArray(value) ? value : [value];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: brand.radius.pill,
    backgroundColor: brand.creamDeep,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: brand.accentTint,
    borderColor: brand.accentBorder,
  },
  label: {
    fontFamily: fonts.bodySemi,
    fontSize: 13,
    color: brand.muted,
  },
  labelActive: {
    color: brand.accent,
  },
});
