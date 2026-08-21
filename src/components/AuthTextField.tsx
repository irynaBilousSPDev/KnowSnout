import { StyleSheet, Text, TextInput, View } from 'react-native';

import { brand } from '@/src/theme/brand';

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

/** Auth-focused field with reliable StyleSheet (visible borders on all platforms). */
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
  wrap: {
    marginBottom: 14,
  },
  label: {
    marginBottom: 8,
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: brand.ink,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: brand.mistBorder,
    backgroundColor: brand.surfaceElevated,
    borderRadius: brand.radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Figtree_400Regular',
    fontSize: 16,
    color: brand.ink,
    minHeight: 52,
  },
});
