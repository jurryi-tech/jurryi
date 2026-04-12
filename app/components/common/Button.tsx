import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { COLORS } from '../../utils/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: any;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
}) => {
  const getMode = (): 'contained' | 'outlined' | 'text' => {
    switch (variant) {
      case 'primary':
      case 'secondary':
        return 'contained';
      case 'outline':
        return 'outlined';
      case 'text':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getButtonColor = (): string | undefined => {
    switch (variant) {
      case 'primary':
        return COLORS.primary;
      case 'secondary':
        return COLORS.accent;
      default:
        return undefined;
    }
  };

  const getTextColor = (): string | undefined => {
    switch (variant) {
      case 'primary':
        return '#ffffff';
      case 'secondary':
        return '#ffffff';
      case 'outline':
      case 'text':
        return COLORS.primary;
      default:
        return '#ffffff';
    }
  };

  return (
    <PaperButton
      mode={getMode()}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      buttonColor={getButtonColor()}
      textColor={getTextColor()}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'outline' && styles.outlineButton,
        style,
      ]}
      contentStyle={styles.content}
      labelStyle={styles.label}
    >
      {title}
    </PaperButton>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
  },
  fullWidth: {
    width: '100%',
  },
  outlineButton: {
    borderColor: COLORS.primary,
  },
  content: {
    paddingVertical: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});

export default Button;
