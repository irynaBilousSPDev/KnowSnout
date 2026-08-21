import { StyleSheet, Text, TextInput, View } from 'react-native';

import { brand, fonts } from '@/src/theme/brand';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?:
    | 'default'
    | 'email-address'
    | 'numeric'
    | 'decimal-pad'
    | 'numbers-and-punctuation';
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
};

/** HTML `.field-lbl` + `.input` — radius-md 14, not pill. */
export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType,
  onSubmitEditing,
}: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={brand.mutedSoft}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={false}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  label: {
    marginBottom: 6,
    fontFamily: fonts.bodySemi,
    fontSize: 12,
    color: brand.label,
  },
  input: {
    borderWidth: 1,
    borderColor: brand.divider,
    backgroundColor: brand.surfaceElevated,
    borderRadius: brand.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
    minHeight: 42,
  },
});
