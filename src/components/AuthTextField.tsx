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

/** HTML kit auth field — Inter label, pill input. */
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
  wrap: { marginBottom: 12 },
  label: {
    marginBottom: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: brand.label,
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(21,34,51,0.12)',
    backgroundColor: brand.surfaceElevated,
    borderRadius: brand.radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.ink,
    minHeight: 48,
  },
});
