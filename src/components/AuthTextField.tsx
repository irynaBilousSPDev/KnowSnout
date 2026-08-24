import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type ReturnKeyTypeOptions,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { brand, fonts } from '@/src/theme/brand';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  returnKeyType?: ReturnKeyTypeOptions;
  onSubmitEditing?: () => void;
};

/** Screenshot field: label + bordered input (optional eye toggle). */
export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  showPasswordToggle,
  autoCapitalize = 'none',
  keyboardType = 'default',
  returnKeyType,
  onSubmitEditing,
}: Props) {
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));
  const isSecure = Boolean(secureTextEntry) && hidden;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={brand.mutedSoft}
          secureTextEntry={isSecure}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={styles.input}
        />
        {showPasswordToggle && secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((v) => !v)}
            hitSlop={8}
            accessibilityRole="button"
            style={styles.eye}
          >
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={17}
              color={brand.mutedSoft}
            />
          </Pressable>
        ) : null}
      </View>
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: brand.divider,
    backgroundColor: brand.surfaceElevated,
    borderRadius: brand.radius.md,
    minHeight: 42,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontFamily: fonts.body,
    fontSize: 14,
    color: brand.ink,
  },
  eye: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
});
