import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Text, IconButton } from 'react-native-paper';
import { COLORS } from '../../utils/constants';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  left?: any;
  right?: any;
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  style?: any;
  placeholder?: string;
  maxLength?: number;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType,
  left,
  right,
  multiline = false,
  numberOfLines,
  disabled = false,
  style,
  placeholder,
  maxLength,
  autoCapitalize,
}) => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const isPassword = secureTextEntry;
  const shouldHideText = isPassword && !passwordVisible;

  const passwordToggle = isPassword ? (
    <TextInput.Icon
      icon={passwordVisible ? 'eye-off' : 'eye'}
      onPress={() => setPasswordVisible(!passwordVisible)}
      forceTextInputFocus={false}
    />
  ) : undefined;

  return (
    <View style={[styles.container, style]}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={shouldHideText}
        keyboardType={keyboardType}
        left={left}
        right={right || passwordToggle}
        multiline={multiline}
        numberOfLines={numberOfLines}
        disabled={disabled}
        error={!!error}
        outlineColor={COLORS.textSecondary}
        activeOutlineColor={COLORS.primary}
        textColor={COLORS.text}
        placeholder={placeholder}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        style={styles.input}
        outlineStyle={styles.outline}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.background,
    fontSize: 15,
  },
  outline: {
    borderRadius: 8,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default Input;
